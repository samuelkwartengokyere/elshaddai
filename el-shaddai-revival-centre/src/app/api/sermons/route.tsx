import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Sermon, { ISermon } from '@/models/Sermon'

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
    const speaker = searchParams.get('speaker')
    const series = searchParams.get('series')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || '-date'

    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = {}

    if (speaker) {
      query.speaker = { $regex: speaker, $options: 'i' }
    }

    if (series) {
      query.series = { $regex: series, $options: 'i' }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { speaker: { $regex: search, $options: 'i' } },
        { biblePassage: { $regex: search, $options: 'i' } }
      ]
    }

    // Execute query with abort signal
    const sermons = await Sermon.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limit)
      .lean()
      .collation({ locale: 'en', strength: 2 })
      .maxTimeMS(TIMEOUT_MS - 1000)

    const total = await Sermon.countDocuments(query)
      .maxTimeMS(TIMEOUT_MS - 1000)
    
    const totalPages = Math.ceil(total / limit)
    
    clearTimeout(timeoutId)

    return NextResponse.json({
      success: true,
      sermons,
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
      console.error('Sermons API request timed out')
      return NextResponse.json(
        { error: 'Request timed out. Database connection may be slow.' },
        { status: 503 }
      )
    }
    console.error('Error fetching sermons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sermons' },
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
    
    const body = await request.json()
    
    const sermon = new Sermon({
      ...body,
      date: new Date(body.date),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await sermon.save()

    return NextResponse.json({
      success: true,
      sermon,
      message: 'Sermon created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating sermon:', error)
    return NextResponse.json(
      { error: 'Failed to create sermon' },
      { status: 500 }
    )
  }
}

