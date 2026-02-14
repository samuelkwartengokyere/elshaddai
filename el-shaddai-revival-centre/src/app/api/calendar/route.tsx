import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import CalendarEvent from '@/models/CalendarEvent'

const TIMEOUT_MS = 10000

// GET - Fetch all calendar events
export async function GET(request: NextRequest) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  
  try {
    const dbConnection = await connectDB()
    const isReady = dbConnection !== null
    
    // Use fallback mode if database is not connected
    if (!dbConnection || !isReady) {
      console.warn('Database not connected, using fallback mode for calendar')
      clearTimeout(timeoutId)
      return NextResponse.json({
        success: true,
        events: [],
        count: 0,
        fallback: true,
        message: 'Database unavailable - showing empty calendar'
      })
    }
    
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const category = searchParams.get('category')
    
    // Build query
    const query: Record<string, unknown> = { isPublished: true }
    
    if (year) {
      query.year = parseInt(year)
    }
    
    if (category && category !== 'all') {
      query.category = category
    }

    const events = await CalendarEvent.find(query)
      .sort({ date: 1 })
      .lean()
      .maxTimeMS(TIMEOUT_MS - 1000)
    
    clearTimeout(timeoutId)

    return NextResponse.json({
      success: true,
      events,
      count: events.length
    })

  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Calendar events API request timed out')
      return NextResponse.json(
        { error: 'Request timed out. Database connection may be slow.' },
        { status: 503 }
      )
    }
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

// POST - Create new calendar event or bulk import
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
    
    // Check if bulk import
    if (Array.isArray(body)) {
      // Bulk insert
      const events = body.map(event => ({
        ...event,
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }))
      
      const result = await CalendarEvent.insertMany(events, { ordered: false })
      
      return NextResponse.json({
        success: true,
        count: result.length,
        message: `${result.length} calendar events imported successfully`
      }, { status: 201 })
    }
    
    // Single event creation
    const calendarEvent = new CalendarEvent({
      ...body,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await calendarEvent.save()

    return NextResponse.json({
      success: true,
      event: calendarEvent,
      message: 'Calendar event created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to create calendar event' },
      { status: 500 }
    )
  }
}

// DELETE - Delete calendar event(s)
export async function DELETE(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const year = searchParams.get('year')
    
    if (id) {
      // Delete single event
      const deletedEvent = await CalendarEvent.findByIdAndDelete(id)
      
      if (!deletedEvent) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Calendar event deleted successfully'
      })
    }
    
    if (year) {
      // Delete all events for a year
      const result = await CalendarEvent.deleteMany({ year: parseInt(year) })
      
      return NextResponse.json({
        success: true,
        count: result.deletedCount,
        message: `${result.deletedCount} events deleted for year ${year}`
      })
    }
    
    return NextResponse.json(
      { error: 'Event ID or year is required' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error deleting calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to delete calendar event' },
      { status: 500 }
    )
  }
}

// PUT - Update calendar event
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
    
    const updatedEvent = await CalendarEvent.findByIdAndUpdate(
      eventId,
      {
        ...body,
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
      message: 'Calendar event updated successfully'
    })

  } catch (error) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    )
  }
}

