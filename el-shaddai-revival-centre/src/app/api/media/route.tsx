import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/database'
import Media, { IMedia } from '@/models/Media'

export async function GET(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    // Check if database connection is available
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available. Please check your environment variables.' },
        { status: 503 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || '-uploadedAt'

    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = {}

    if (type) {
      query.type = type
    }

    if (category) {
      query.category = category
    }

    // Execute query
    const media = await Media.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Media.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
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
    const dbConnection = await connectDB()
    
    // Check if database connection is available
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available. Please check your environment variables.' },
        { status: 503 }
      )
    }
    
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

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const extension = path.extname(file.name)
    const filename = `${uuidv4()}${extension}`

    // Save file to public/uploads/media
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'media')
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)

    // Save media to database
    const media = new Media({
      title,
      description: description || undefined,
      url: `/uploads/media/${filename}`,
      type: type as 'image' | 'video' | 'document',
      category: category as 'service' | 'event' | 'ministry' | 'other',
      date: new Date(date),
      uploadedAt: new Date()
    })

    await media.save()

    return NextResponse.json({
      success: true,
      message: 'Media uploaded successfully',
      media
    }, { status: 201 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
}
