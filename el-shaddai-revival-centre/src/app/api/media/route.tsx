import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const TIMEOUT_MS = 5000

// In-memory storage for media (replaces MongoDB)
interface MediaType {
  _id: string
  title: string
  description?: string
  url: string
  type: 'image' | 'video' | 'document'
  category: 'service' | 'event' | 'ministry' | 'other'
  date: string
  uploadedAt: Date
}

let inMemoryMedia: MediaType[] = []

function getInMemoryMedia() {
  return inMemoryMedia.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || '-uploadedAt'

    // Get media from in-memory storage
    let media = getInMemoryMedia()
    
    // Filter by type
    if (type) {
      media = media.filter(m => m.type === type)
    }
    
    // Filter by category
    if (category) {
      media = media.filter(m => m.category === category)
    }
    
    // Sort
    if (sort === 'uploadedAt') {
      media = media.sort((a, b) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime())
    } else {
      media = media.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    }
    
    // Pagination
    const total = media.length
    const skip = (page - 1) * limit
    const paginatedMedia = media.slice(skip, skip + limit)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      media: paginatedMedia,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      fallback: true,
      message: 'Using in-memory storage'
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

    // Save media to in-memory storage
    const newMedia: MediaType = {
      _id: uuidv4(),
      title,
      description: description || undefined,
      url: `/uploads/media/${filename}`,
      type: type as 'image' | 'video' | 'document',
      category: category as 'service' | 'event' | 'ministry' | 'other',
      date: new Date(date).toISOString(),
      uploadedAt: new Date()
    }

    inMemoryMedia = [...inMemoryMedia, newMedia]

    return NextResponse.json({
      success: true,
      message: 'Media uploaded successfully',
      media: newMedia,
      fallback: true
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
    const body = await request.json()
    const mediaId = request.nextUrl.searchParams.get('id')
    
    if (!mediaId) {
      return NextResponse.json(
        { error: 'Media ID is required' },
        { status: 400 }
      )
    }
    
    const mediaIndex = inMemoryMedia.findIndex(m => m._id === mediaId)
    
    if (mediaIndex === -1) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      )
    }
    
    // Update the media
    inMemoryMedia[mediaIndex] = {
      ...inMemoryMedia[mediaIndex],
      title: body.title || inMemoryMedia[mediaIndex].title,
      description: body.description || inMemoryMedia[mediaIndex].description,
      type: body.type || inMemoryMedia[mediaIndex].type,
      category: body.category || inMemoryMedia[mediaIndex].category,
      date: body.date ? new Date(body.date).toISOString() : inMemoryMedia[mediaIndex].date
    }

    return NextResponse.json({
      success: true,
      media: inMemoryMedia[mediaIndex],
      message: 'Media updated successfully',
      fallback: true
    })

  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    )
  }
}
