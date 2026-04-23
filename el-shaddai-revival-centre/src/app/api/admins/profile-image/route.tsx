
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { getCurrentAdmin } from '@/lib/auth'
import { uploadToBucket, BUCKETS } from '@/lib/storage'

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

    // Upload to Supabase Storage
    const publicUrl = await uploadToBucket(file, BUCKETS.AVATARS, filePath)
    
    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath
    })

  } catch (error) {
    console.error('Profile image upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

