import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Event, { IEvent } from '@/models/Event'

const TIMEOUT_MS = 5000

// GET - Fetch all events for calendar display
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
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const category = searchParams.get('category')
    
    // Build query - fetch all published events
    const query: Record<string, unknown> = { isPublished: true }
    
    // Filter by year if provided
    if (year) {
      const yearStart = new Date(`${year}-01-01`)
      const yearEnd = new Date(`${year}-12-31`)
      query.date = { $gte: yearStart, $lte: yearEnd }
    }
    
    // Filter by month if provided (requires year as well)
    if (year && month) {
      const monthIndex = parseInt(month) - 1 // JavaScript months are 0-indexed
      const startDate = new Date(parseInt(year), monthIndex, 1)
      const endDate = new Date(parseInt(year), monthIndex + 1, 0, 23, 59, 59)
      query.date = { $gte: startDate, $lte: endDate }
    }
    
    if (category && category !== 'all') {
      query.category = category
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .lean()
      .maxTimeMS(TIMEOUT_MS - 1000)
    
    // Transform events to calendar-friendly format
    const calendarEvents = events.map(event => {
      const eventDate = new Date(event.date)
      return {
        _id: event._id.toString(),
        title: event.title,
        description: event.description,
        date: eventDate.toISOString().split('T')[0], // YYYY-MM-DD format
        time: event.time,
        location: event.location,
        category: event.category,
        recurring: event.recurring,
        dateObj: eventDate
      }
    })
    
    // Group events by date for easier calendar rendering
    const eventsByDate: Record<string, typeof calendarEvents[0][]> = {}
    calendarEvents.forEach(event => {
      if (!eventsByDate[event.date]) {
        eventsByDate[event.date] = []
      }
      eventsByDate[event.date].push(event)
    })
    
    clearTimeout(timeoutId)

    return NextResponse.json({
      success: true,
      events: calendarEvents,
      eventsByDate,
      count: calendarEvents.length
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

