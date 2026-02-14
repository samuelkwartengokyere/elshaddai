import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/database'
import Media, { IMedia } from '@/models/Media'

// Add AbortController for timeout
const TIMEOUT_MS = 5000

export async function GET(request: NextRequest) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  
  try {
    const dbConnection = await connectDB()
    
    // Check if database connection is available
    if (!dbConnection) {
      clearTimeout(timeoutId)
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

    // Execute query with timeout - wrapped in try-catch for graceful error handling
    let media: IMedia[] = []
    let total = 0
    
    try {
      media = await Media.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limit)
        .lean()
        .collation({ locale: 'en', strength: 2 })
        .maxTimeMS(TIMEOUT_MS - 1000) as unknown as IMedia[]

      total = await Media.countDocuments(query)
        .maxTimeMS(TIMEOUT_MS - 1000)
    } catch (dbError) {
      console.error('Database query error:', dbError)
      // Return empty results instead of error
      media = []
      total = 0
    }
    
    const totalPages = Math.ceil(total / limit)
    
    clearTimeout(timeoutId)

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
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Media API request timed out')
      return NextResponse.json(
        { error: 'Request timed out. Database connection may be slow.' },
        { status: 503 }
      )
    }
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

export async function PUT(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
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
    
    const updatedMedia = await Media.findByIdAndUpdate(
      mediaId,
      {
        title: body.title,
        description: body.description,
        type: body.type,
        category: body.category,
        date: body.date ? new Date(body.date) : undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    
    if (!updatedMedia) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      media: updatedMedia,
      message: 'Media updated successfully'
    })

  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}
