import { NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import connectDB from '@/lib/database'
import Sermon from '@/models/Sermon'

// Mark this route as dynamic to prevent static generation
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
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
    const thumbnail = formData.get('thumbnail') as File | null
    const title = formData.get('title') as string
    const speaker = formData.get('speaker') as string
    const date = formData.get('date') as string
    const description = formData.get('description') as string
    const series = formData.get('series') as string
    const biblePassage = formData.get('biblePassage') as string
    const tags = formData.get('tags') as string
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const extension = path.extname(file.name)
    const filename = `${uuidv4()}${extension}`
    
    // Save file to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'sermons')
    const filepath = path.join(uploadDir, filename)
    
    await writeFile(filepath, buffer)

    // Handle thumbnail upload
    let thumbnailPath = ''
    if (thumbnail) {
      const thumbBytes = await thumbnail.arrayBuffer()
      const thumbBuffer = Buffer.from(thumbBytes)
      const thumbExt = path.extname(thumbnail.name)
      const thumbFilename = `${uuidv4()}${thumbExt}`
      const thumbPath = path.join(uploadDir, thumbFilename)
      await writeFile(thumbPath, thumbBuffer)
      thumbnailPath = `/uploads/sermons/${thumbFilename}`
    }

    // Save sermon to database
    const sermon = new Sermon({
      title,
      speaker,
      date: new Date(date),
      description,
      series,
      biblePassage,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      audioUrl: `/uploads/sermons/${filename}`,
      thumbnail: thumbnailPath || undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await sermon.save()

    return NextResponse.json({
      success: true,
      message: 'Sermon uploaded successfully',
      sermon
    }, { status: 201 })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload sermon' },
      { status: 500 }
    )
  }
}

