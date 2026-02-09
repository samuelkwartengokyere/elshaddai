import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Event, { IEvent } from '@/models/Event'

// Add AbortController for timeout
const TIMEOUT_MS = 5000

export async function GET(request: NextRequest) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  
  try {
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      clearTimeout(timeoutId)
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const upcoming = searchParams.get('upcoming') === 'true'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'date'

    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = { isPublished: true }

    if (category && category !== 'all') {
      query.category = category
    }

    if (upcoming) {
      query.date = { $gte: new Date() }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ]
    }

    // Execute query with timeout
    const events = await Event.find(query)
      .sort(sort === 'date' ? { date: 1 } : { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .collation({ locale: 'en', strength: 2 })
      .maxTimeMS(TIMEOUT_MS - 1000)

    const total = await Event.countDocuments(query)
      .maxTimeMS(TIMEOUT_MS - 1000)
    
    const totalPages = Math.ceil(total / limit)
    
    clearTimeout(timeoutId)

    return NextResponse.json({
      success: true,
      events,
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
      console.error('Events API request timed out')
      return NextResponse.json(
        { error: 'Request timed out. Database connection may be slow.' },
        { status: 503 }
      )
    }
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }
    
    const body = await request.json()
    
    const event = new Event({
      ...body,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await event.save()

    return NextResponse.json({
      success: true,
      event,
      message: 'Event created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
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
    const eventId = request.nextUrl.searchParams.get('id')
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    
    if (!updatedEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      event: updatedEvent,
      message: 'Event updated successfully'
    })

  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

