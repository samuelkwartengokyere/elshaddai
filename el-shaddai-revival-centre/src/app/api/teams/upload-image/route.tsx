import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { uploadToBucket, BUCKETS } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique path for avatars bucket
    const extension = path.extname(file.name)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `teams/${uuidv4()}-${safeName}`

    // Upload to Supabase Storage
    const publicUrl = await uploadToBucket(file, BUCKETS.AVATARS, filePath)

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      path: filePath,
      message: 'Image uploaded successfully'
    })

  } catch (error) {
    console.error('Error uploading team member image:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

