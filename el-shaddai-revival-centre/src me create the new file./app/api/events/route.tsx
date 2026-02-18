import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const TIMEOUT_MS = 5000

// In-memory storage for events (replaces MongoDB)
interface EventType {
  _id: string
  title: string
  description: string
  date: string
  endDate?: string
  time: string
  endTime?: string
  location: string
  category: string
  imageUrl?: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

let inMemoryEvents: EventType[] = []

function getInMemoryEvents() {
  return inMemoryEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const upcoming = searchParams.get('upcoming') === 'true'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'date'

    // Get events from in-memory storage
    let events = getInMemoryEvents()
    
    // Filter by published
    events = events.filter(e => e.isPublished)
    
    // Filter by category
    if (category && category !== 'all') {
      events = events.filter(e => e.category === category)
    }
    
    // Filter by upcoming
    if (upcoming) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      events = events.filter(e => new Date(e.date) >= today)
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      events = events.filter(e => 
        e.title.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower) ||
        e.location.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort
    if (sort === 'date') {
      events = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else {
      events = events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }
    
    // Pagination
    const total = events.length
    const skip = (page - 1) * limit
    const paginatedEvents = events.slice(skip, skip + limit)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      events: paginatedEvents,
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
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newEvent: EventType = {
      _id: uuidv4(),
      ...body,
      date: body.date,
      endDate: body.endDate || undefined,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    inMemoryEvents = [...inMemoryEvents, newEvent]

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: 'Event created successfully',
      fallback: true
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
    const body = await request.json()
    const eventId = request.nextUrl.searchParams.get('id')
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    const eventIndex = inMemoryEvents.findIndex(e => e._id === eventId)
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    // Update the event
    inMemoryEvents[eventIndex] = {
      ...inMemoryEvents[eventIndex],
      ...body,
      date: body.date || inMemoryEvents[eventIndex].date,
      endDate: body.endDate || inMemoryEvents[eventIndex].endDate,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      event: inMemoryEvents[eventIndex],
      message: 'Event updated successfully',
      fallback: true
    })

  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get('id')
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    const eventIndex = inMemoryEvents.findIndex(e => e._id === eventId)
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    inMemoryEvents = inMemoryEvents.filter(e => e._id !== eventId)

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
      fallback: true
    })

  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}
