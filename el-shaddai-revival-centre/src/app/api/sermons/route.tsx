import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Define YouTube video type
interface YouTubeVideo {
  id: string
  _id?: string
  title: string
  speaker: string
  date: string
  description: string
  thumbnail: string
  videoUrl: string
  embedUrl: string
  audioUrl: string | null
  duration: string
  durationSeconds: number
  series: string | null
  biblePassage: string | null
  tags: string[]
  isYouTube: boolean
  viewCount: string
}

// In-memory storage for sermons (replaces MongoDB)
interface SermonType {
  [key: string]: unknown
  _id: string
  title: string
  speaker: string
  date: string
  description: string
  thumbnail: string
  videoUrl: string
  embedUrl: string
  audioUrl: string | null
  duration: string
  durationSeconds: number
  series: string | null
  biblePassage: string | null
  tags: string[]
  isYouTube: boolean
  viewCount: string
  source: string
  createdAt: Date
  updatedAt: Date
}

let inMemorySermons: SermonType[] = []

function getInMemorySermons() {
  return inMemorySermons.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const includeYouTube = searchParams.get('youtube') !== 'false'
    const forceRefresh = searchParams.get('youtube') === 'refresh'
    
    let youtubeVideos: YouTubeVideo[] = []
    let youtubeTotal = 0

    // Get sermons from in-memory storage
    let sermons = getInMemorySermons()

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
            youtubeVideos = ytData.videos.map((v: YouTubeVideo) => ({ ...v, source: 'youtube' }))
            youtubeTotal = ytData.videos.length
          }
        }
      } catch (ytError) {
        console.error('YouTube fetch error:', ytError)
      }
    }

// Combine and sort sermons (in-memory + YouTube)
    const combinedSermons: SermonType[] = [
      ...sermons,
      ...youtubeVideos.map(v => ({ ...v, source: 'youtube', createdAt: new Date(), updatedAt: new Date() } as unknown as SermonType))
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
    const totalCombined = sermons.length + youtubeTotal
    const totalPages = Math.ceil(totalCombined / limit)
    const skip = (page - 1) * limit
    const paginatedSermons = combinedSermons.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      sermons: paginatedSermons,
      youtubeCount: youtubeTotal,
      databaseCount: sermons.length,
      pagination: {
        page,
        limit,
        total: totalCombined,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      fallback: true,
      message: 'Using in-memory storage'
    })

  } catch (error) {
    console.error('Error fetching sermons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sermons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newSermon: SermonType = {
      _id: uuidv4(),
      title: body.title || '',
      speaker: body.speaker || '',
      date: body.date || new Date().toISOString(),
      description: body.description || '',
      thumbnail: body.thumbnail || '',
      videoUrl: body.videoUrl || '',
      embedUrl: body.embedUrl || '',
      audioUrl: body.audioUrl || null,
      duration: body.duration || '',
      durationSeconds: body.durationSeconds || 0,
      series: body.series || null,
      biblePassage: body.biblePassage || null,
      tags: body.tags || [],
      isYouTube: false,
      viewCount: '0',
      source: 'database',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    inMemorySermons = [...inMemorySermons, newSermon]

    return NextResponse.json({
      success: true,
      sermon: newSermon,
      message: 'Sermon created successfully (in-memory)',
      fallback: true
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
    const body = await request.json()
    const sermonId = request.nextUrl.searchParams.get('id')
    
    if (!sermonId) {
      return NextResponse.json(
        { error: 'Sermon ID is required' },
        { status: 400 }
      )
    }
    
    const sermonIndex = inMemorySermons.findIndex(s => s._id === sermonId)
    
    if (sermonIndex === -1) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      )
    }
    
    // Update the sermon
    inMemorySermons[sermonIndex] = {
      ...inMemorySermons[sermonIndex],
      ...body,
      date: body.date || inMemorySermons[sermonIndex].date,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      sermon: inMemorySermons[sermonIndex],
      message: 'Sermon updated successfully (in-memory)',
      fallback: true
    })

  } catch (error) {
    console.error('Error updating sermon:', error)
    return NextResponse.json(
      { error: 'Failed to update sermon' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sermonId = request.nextUrl.searchParams.get('id')
    
    if (!sermonId) {
      return NextResponse.json(
        { error: 'Sermon ID is required' },
        { status: 400 }
      )
    }
    
    const sermonIndex = inMemorySermons.findIndex(s => s._id === sermonId)
    
    if (sermonIndex === -1) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      )
    }
    
    inMemorySermons = inMemorySermons.filter(s => s._id !== sermonId)

    return NextResponse.json({
      success: true,
      message: 'Sermon deleted successfully (in-memory)',
      fallback: true
    })

  } catch (error) {
    console.error('Error deleting sermon:', error)
    return NextResponse.json(
      { error: 'Failed to delete sermon' },
      { status: 500 }
    )
  }
}
