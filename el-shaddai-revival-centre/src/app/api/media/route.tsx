import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { mediaDb, isDbConfigured } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import { uploadToBucket, deleteFromBucket, BUCKETS, SUPPORTED_MIME_TYPES, MAX_FILE_SIZES, isBucketPublic } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'date'

    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        let media = await mediaDb.getAll()
        
        // Filter by type (supports multiple types: "image,video")
        if (type) {
          const types = type.split(',').map(t => t.trim())
          media = media.filter(m => types.includes(m.type))
        }
        
        // Filter by category
        if (category) {
          media = media.filter(m => m.category === category)
        }
        
        // Sort
        if (sort === 'date') {
          media = media.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        } else {
          media = media.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }
        
        // Pagination
        const total = media.length
        const skip = (page - 1) * limit
        const paginatedMedia = media.slice(skip, skip + limit)
        const totalPages = Math.ceil(total / limit)

        return NextResponse.json({
          success: true,
        media: paginatedMedia.map(m => ({
            _id: m.id,
            title: m.title,
            description: m.description,
            url: m.url,
            type: m.type,
            category: m.category,
            tags: m.tags,
            date: m.created_at,
            uploadedAt: m.created_at,
            isFeatured: m.is_featured
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          },
          isInMemoryMode: false,
          isSupabaseMode: true
        })
      } catch (dbError) {
        console.error('[Media API] Database error:', dbError)
      }
    }
    
    // Fall back to empty list if Supabase not configured
    return NextResponse.json({
      success: true,
      media: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      isInMemoryMode: true,
      isSupabaseMode: false,
      message: 'Using in-memory storage (no database configured)'
    })

  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const type = formData.get('type') as string
    const category = formData.get('category') as string
    const supabaseConfigured = isDbConfigured()

    const date = formData.get('date') as string

    const url = formData.get('url') as string
    const isMetadataOnly = !file && url

    if (!isMetadataOnly && !file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!title || !type || !category || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (isMetadataOnly) {
      // Metadata only - url already uploaded, save to DB
      if (!supabaseConfigured) {
        return NextResponse.json({ error: 'Database required for metadata' }, { status: 503 })
      }

      
      const newMedia = await mediaDb.create({
        title,
        description: description || null,
        url,
        type,
        category,
        tags: [],
        is_featured: true
      })

      return NextResponse.json({
        success: true,
        message: 'Media metadata saved',
        media: newMedia
      }, { status: 201 })
    }

    // Full file upload flow
    // Validate mime type
    const supportedTypes = (SUPPORTED_MIME_TYPES as any)[type]
    if (!supportedTypes?.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type for ${type}. Supported: ${supportedTypes?.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = (MAX_FILE_SIZES as any)[type]
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large for ${type}. Max: ${(maxSize / 1024 / 1024).toFixed(1)}MB` },
        { status: 400 }
      )
    }

    // Generate unique path in media bucket
    const extension = path.extname(file.name)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${type}s/${uuidv4()}-${safeName}`

    // Check bucket is public before upload
    const bucketPublic = await isBucketPublic(BUCKETS.MEDIA)
    if (!bucketPublic) {
      console.warn(`[Media API] Bucket "${BUCKETS.MEDIA}" is NOT PUBLIC. Images will not display on the website.`)
    }

    // Upload to Supabase Storage
    const publicUrl = await uploadToBucket(file, BUCKETS.MEDIA, filePath)
    console.log(`[Media API] Generated public URL: ${publicUrl}`)
    
    // Save metadata to DB
    if (supabaseConfigured) {

      try {
        const newMedia = await mediaDb.create({
          title,
          description: description || null,
          url: publicUrl,
          type,
          category,
          tags: [],
          is_featured: true
        })

        return NextResponse.json({
          success: true,
          message: 'Media uploaded to Supabase Storage',
          media: {
            _id: newMedia.id,
            title: newMedia.title,
            description: newMedia.description,
            url: newMedia.url,
            type: newMedia.type,
            category: newMedia.category,
            tags: newMedia.tags,
            date: newMedia.created_at,
            uploadedAt: newMedia.created_at
          },
          storage: 'supabase',
          filePath
        }, { status: 201 })
      } catch (dbError) {
        console.error('[Media API] Database error:', dbError)
        // Cleanup storage on DB failure
        await deleteFromBucket(BUCKETS.MEDIA, filePath).catch(console.error)
        return NextResponse.json({
          success: false,
          error: 'File uploaded but DB save failed',
          filePath
        }, { status: 500 })
      }
    }
    
    // No fallback - require Supabase for storage
    return NextResponse.json({
      success: false,
      error: 'Supabase database required for media storage'
    }, { status: 503 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const mediaId = request.nextUrl.searchParams.get('id')
    
    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      )
    }
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const existingMedia = await mediaDb.getById(mediaId)
        
        if (!existingMedia) {
          return NextResponse.json(
            { error: 'Media not found' },
            { status: 404 }
          )
        }
        
        const updateData: {
          title?: string
          description?: string | null
          type?: string
          category?: string
          is_featured?: boolean
        } = {}
        
        if (body.title !== undefined) updateData.title = body.title
        if (body.description !== undefined) updateData.description = body.description
        if (body.type !== undefined) updateData.type = body.type
        if (body.category !== undefined) updateData.category = body.category
        if (body.isFeatured !== undefined) updateData.is_featured = body.isFeatured
        
        const updatedMedia = await mediaDb.update(mediaId, updateData)

        return NextResponse.json({
          success: true,
          media: {
            _id: updatedMedia.id,
            title: updatedMedia.title,
            description: updatedMedia.description,
            url: updatedMedia.url,
            type: updatedMedia.type,
            category: updatedMedia.category,
            date: updatedMedia.created_at,
            uploadedAt: updatedMedia.created_at,
            isFeatured: updatedMedia.is_featured
          },
          message: 'Media updated successfully',
          isSupabaseMode: true
        })
      } catch (dbError) {
        console.error('[Media API] Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to update media in database' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    )

  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const mediaId = request.nextUrl.searchParams.get('id')
    
    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      )
    }
    
    // Delete from DB + Storage
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const existingMedia = await mediaDb.getById(mediaId)
        
        if (!existingMedia) {
          return NextResponse.json(
            { error: 'Media not found' },
            { status: 404 }
          )
        }

        // Extract storage path from URL (supabase or local fallback)
        let storagePath: string | null = null
        if (existingMedia.url?.startsWith('/uploads/media/')) {
          storagePath = existingMedia.url.slice('/uploads/media/'.length)
        } else if (existingMedia.url?.includes('/storage/v1/object/public/media/')) {
          const match = existingMedia.url.match(/\/object\/public\/media\/(.+)/)
          storagePath = match?.[1] || null
        }

        // Delete from storage first (ignore errors)
        if (storagePath) {
          await deleteFromBucket(BUCKETS.MEDIA, storagePath).catch(console.error)
        }
        
        await mediaDb.delete(mediaId)

        return NextResponse.json({
          success: true,
          message: 'Media deleted from DB and Storage',
          deletedPath: storagePath || 'unknown'
        })
      } catch (dbError) {
        console.error('[Media API] Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to delete media from database' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    )

  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}
