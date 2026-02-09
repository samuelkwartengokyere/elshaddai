import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Sermon, { ISermon } from '@/models/Sermon'
import Settings from '@/models/Settings'

// Add AbortController for timeout
const TIMEOUT_MS = 5000

export async function GET(request: NextRequest) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  
  try {
    const dbConnection = await connectDB()
    const searchParams = request.nextUrl.searchParams
    const includeYouTube = searchParams.get('youtube') !== 'false'
    const forceRefresh = searchParams.get('refresh') === 'true'
    
    let sermons: any[] = []
    let youtubeVideos: any[] = []
    let total = 0
    let youtubeTotal = 0

    // Fetch database sermons if connected
    if (dbConnection) {
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
      sermons = await Sermon.find(query)
        .sort(sort as string)
        .skip(skip)
        .limit(limit)
        .lean()
        .collation({ locale: 'en', strength: 2 })
        .maxTimeMS(TIMEOUT_MS - 1000)

      total = await Sermon.countDocuments(query)
        .maxTimeMS(TIMEOUT_MS - 1000)
    }

    // Fetch YouTube videos if enabled
    if (includeYouTube) {
      try {
        const ytParams = new URLSearchParams()
        if (forceRefresh) ytParams.append('refresh', 'true')
        
        const ytResponse = await fetch(
          `${request.nextUrl.origin}/api/sermons/youtube?${ytParams.toString()}`,
          { cache: 'no-store' }
        )
        
        if (ytResponse.ok) {
          const ytData = await ytResponse.json()
          if (ytData.success && ytData.videos) {
            youtubeVideos = ytData.videos
            youtubeTotal = ytData.videos.length
          }
        }
      } catch (ytError) {
        console.error('YouTube fetch error:', ytError)
      }
    }

    // Combine and sort sermons (database + YouTube)
    const combinedSermons = [
      ...sermons.map(s => ({ ...s, source: 'database' })),
      ...youtubeVideos.map(v => ({ ...v, source: 'youtube' }))
    ]

    // Sort by date (newest first)
    combinedSermons.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA
    })

    // Calculate pagination for combined results
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const totalCombined = total + youtubeTotal
    const totalPages = Math.ceil(totalCombined / limit)
    const skip = (page - 1) * limit
    const paginatedSermons = combinedSermons.slice(skip, skip + limit)

    clearTimeout(timeoutId)

    return NextResponse.json({
      success: true,
      sermons: paginatedSermons,
      youtubeCount: youtubeTotal,
      databaseCount: total,
      pagination: {
        page,
        limit,
        total: totalCombined,
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
    const sermonId = request.nextUrl.searchParams.get('id')
    
    if (!sermonId) {
      return NextResponse.json(
        { error: 'Sermon ID is required' },
        { status: 400 }
      )
    }
    
    const updatedSermon = await Sermon.findByIdAndUpdate(
      sermonId,
      {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    
    if (!updatedSermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      sermon: updatedSermon,
      message: 'Sermon updated successfully'
    })

  } catch (error) {
    console.error('Error updating sermon:', error)
    return NextResponse.json(
      { error: 'Failed to update sermon' },
      { status: 500 }
    )
  }
}

