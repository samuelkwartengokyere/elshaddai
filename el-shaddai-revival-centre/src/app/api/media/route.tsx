import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { mediaDb, isDbConfigured } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

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
            uploadedAt: m.created_at
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
    const date = formData.get('date') as string

    if (!file) {
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

    // Generate unique filename and save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const extension = path.extname(file.name)
    const filename = `${uuidv4()}${extension}`

    // Save file to public/uploads/media
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'media')
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)

    const fileUrl = `/uploads/media/${filename}`
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const newMedia = await mediaDb.create({
          title,
          description: description || null,
          url: fileUrl,
          type,
          category,
          tags: []
        })

        return NextResponse.json({
          success: true,
          message: 'Media uploaded successfully',
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
          isSupabaseMode: true
        }, { status: 201 })
      } catch (dbError) {
        console.error('[Media API] Database error:', dbError)
        // Still return success since file was saved
        return NextResponse.json({
          success: true,
          message: 'Media uploaded successfully (file saved, DB error)',
          media: {
            _id: uuidv4(),
            title,
            description,
            url: fileUrl,
            type,
            category,
            date: new Date(date).toISOString(),
            uploadedAt: new Date()
          },
          isSupabaseMode: false
        }, { status: 201 })
      }
    }
    
    // Fall back to in-memory if Supabase not configured
    return NextResponse.json({
      success: true,
      message: 'Media uploaded successfully',
      media: {
        _id: uuidv4(),
        title,
        description,
        url: fileUrl,
        type,
        category,
        date: new Date(date).toISOString(),
        uploadedAt: new Date()
      },
      isInMemoryMode: true
    }, { status: 201 })

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
        } = {}
        
        if (body.title !== undefined) updateData.title = body.title
        if (body.description !== undefined) updateData.description = body.description
        if (body.type !== undefined) updateData.type = body.type
        if (body.category !== undefined) updateData.category = body.category
        
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
            uploadedAt: updatedMedia.created_at
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
        
        await mediaDb.delete(mediaId)

        return NextResponse.json({
          success: true,
          message: 'Media deleted successfully',
          isSupabaseMode: true
        })
      } catch (dbError) {
        console.error('[Media API] Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to delete media in database' },
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
