
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentAdmin } from '@/lib/auth'
import { uploadToBucket, BUCKETS } from '@/lib/storage'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const currentAdmin = getCurrentAdmin(request)
    
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique path for avatars bucket
    const extension = path.extname(file.name)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `avatars/${uuidv4()}-${safeName}`

    // Ensure the avatars bucket exists before uploading
    const supabase = await getSupabaseAdmin()
    if (supabase) {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(b => b.name === BUCKETS.AVATARS)
      if (!bucketExists) {
        const { error: createError } = await supabase.storage.createBucket(BUCKETS.AVATARS, {
          public: true,
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf']
        })
        if (createError) {
          console.error('Failed to create avatars bucket:', createError)
          return NextResponse.json(
            { success: false, error: `Failed to create storage bucket: ${createError.message}` },
            { status: 500 }
          )
        }
      }
    }

    // Upload to Supabase Storage
    const publicUrl = await uploadToBucket(file, BUCKETS.AVATARS, filePath)
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath
    })

  } catch (error: any) {
    console.error('Profile image upload error:', error)
    const message = error?.message || String(error)
    return NextResponse.json(
      { success: false, error: `Upload failed: ${message}` },
      { status: 500 }
    )
  }
}

