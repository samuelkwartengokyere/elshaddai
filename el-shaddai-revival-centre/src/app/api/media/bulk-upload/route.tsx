import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import JSZip from 'jszip'
import { mediaDb, isDbConfigured } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'
import { uploadToBucket, deleteFromBucket, BUCKETS, SUPPORTED_MIME_TYPES, MAX_FILE_SIZES } from '@/lib/storage'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createOptimizedGeneralFile } from '@/lib/image-optimization'

interface UploadResult {
  fileName: string
  success: boolean
  url?: string
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const zipFile = formData.get('zipFile') as File
    const category = formData.get('category') as string

    if (!zipFile) {
      return NextResponse.json(
        { success: false, error: 'No ZIP file uploaded' },
        { status: 400 }
      )
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      )
    }

    // Validate ZIP file type
    if (!zipFile.name.endsWith('.zip') && zipFile.type !== 'application/zip' && zipFile.type !== 'application/x-zip-compressed') {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a ZIP file.' },
        { status: 400 }
      )
    }

    const supabaseConfigured = isDbConfigured()
    if (!supabaseConfigured) {
      return NextResponse.json(
        { success: false, error: 'Database required for bulk upload' },
        { status: 503 }
      )
    }

    // Ensure the media bucket exists before uploading
    const supabase = await getSupabaseAdmin()
    if (supabase) {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === BUCKETS.MEDIA)
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(BUCKETS.MEDIA, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf']
        })
        if (createError) {
          console.error('Failed to create media bucket:', createError)
          return NextResponse.json(
            { success: false, error: `Failed to create storage bucket: ${createError.message}` },
            { status: 500 }
          )
        }
      }
    }

    // Read ZIP file
    const zipBuffer = await zipFile.arrayBuffer()
    const zip = await JSZip.loadAsync(zipBuffer)

    const supportedImageTypes = SUPPORTED_MIME_TYPES.image
    const maxImageSize = MAX_FILE_SIZES.image
    const results: UploadResult[] = []
    let uploaded = 0
    let failed = 0

    // Filter for image files only
    const imageFiles: { name: string; file: JSZip.JSZipObject }[] = []
    zip.forEach((relativePath, file) => {
      // Skip directories and hidden files
      if (file.dir) return
      if (relativePath.startsWith('__MACOSX/')) return
      if (relativePath.startsWith('.')) return

      const ext = path.extname(relativePath).toLowerCase()
      if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
        imageFiles.push({ name: relativePath, file })
      }
    })

    if (imageFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No image files found in ZIP. Supported formats: JPG, PNG, GIF, WebP' },
        { status: 400 }
      )
    }

    // Process each image
    for (const { name, file } of imageFiles) {
      try {
        const fileBuffer = await file.async('uint8array')
        const fileSize = fileBuffer.length

        // Validate file size
        if (fileSize > maxImageSize) {
          results.push({
            fileName: name,
            success: false,
            error: `File too large. Max: ${(maxImageSize / 1024 / 1024).toFixed(1)}MB`
          })
          failed++
          continue
        }

        // Detect mime type from extension
        const ext = path.extname(name).toLowerCase()
        let mimeType = 'image/jpeg'
        switch (ext) {
          case '.png': mimeType = 'image/png'; break
          case '.gif': mimeType = 'image/gif'; break
          case '.webp': mimeType = 'image/webp'; break
        }

        // Validate mime type
        if (!supportedImageTypes.includes(mimeType)) {
          results.push({
            fileName: name,
            success: false,
            error: `Unsupported image type: ${mimeType}`
          })
          failed++
          continue
        }

        // Create a File-like object for uploadToBucket
        let uploadFile = new File([fileBuffer], path.basename(name), { type: mimeType })

        // Optimize image before upload
        try {
          const originalSize = uploadFile.size
          uploadFile = await createOptimizedGeneralFile(uploadFile)
          console.log(`[Bulk Upload] Image optimized: ${name} ${originalSize} → ${uploadFile.size} bytes`)
        } catch (optimizeError) {
          console.warn(`[Bulk Upload] Image optimization failed for ${name}, using original:`, optimizeError)
        }

        // Generate unique path
        const safeName = uploadFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filePath = `images/${uuidv4()}-${safeName}`

        // Upload to Supabase Storage
        const publicUrl = await uploadToBucket(uploadFile, BUCKETS.MEDIA, filePath)

        // Save metadata to DB
        const title = path.basename(name, ext)
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())

        try {
          let newMedia
          try {
            newMedia = await mediaDb.create({
              title,
              description: null,
              url: publicUrl,
              type: 'image',
              category,
              tags: [],
              is_featured: true
            })
          } catch (err: any) {
            // Retry without is_featured if column doesn't exist yet
            if (err?.message?.includes('is_featured') || err?.code === '42703') {
              console.warn('[Bulk Upload] is_featured column missing, retrying without it.')
              newMedia = await mediaDb.create({
                title,
                description: null,
                url: publicUrl,
                type: 'image',
                category,
                tags: []
              })
            } else {
              throw err
            }
          }

          results.push({
            fileName: name,
            success: true,
            url: publicUrl
          })
          uploaded++
        } catch (dbError) {
          console.error(`[Bulk Upload] DB error for ${name}:`, dbError)
          // Cleanup storage on DB failure
          await deleteFromBucket(BUCKETS.MEDIA, filePath).catch(console.error)
          results.push({
            fileName: name,
            success: false,
            error: 'Database save failed'
          })
          failed++
        }
      } catch (error) {
        console.error(`[Bulk Upload] Error processing ${name}:`, error)
        results.push({
          fileName: name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk upload complete. ${uploaded} uploaded, ${failed} failed out of ${imageFiles.length} images.`,
      total: imageFiles.length,
      uploaded,
      failed,
      results
    }, { status: 201 })

  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process bulk upload' },
      { status: 500 }
    )
  }
}
