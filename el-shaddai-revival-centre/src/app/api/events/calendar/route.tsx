import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { eventsDb } from '@/lib/db'

// GET - Fetch all events for calendar display
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const month = searchParams.get('month')
    const category = searchParams.get('category')

    const dbConnection = await connectDB()
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    // Fetch all published events from Supabase
    let events = await eventsDb.getAll()
    events = events.filter(e => e.is_published)

    // Filter by year if provided
    if (year) {
      const yearStart = new Date(`${year}-01-01`).getTime()
      const yearEnd = new Date(`${year}-12-31`).getTime()
      events = events.filter(e => {
        const d = new Date(e.date).getTime()
        return d >= yearStart && d <= yearEnd
      })
    }

    // Filter by month if provided (requires year as well)
    if (year && month) {
      const monthIndex = parseInt(month) - 1
      const startDate = new Date(parseInt(year), monthIndex, 1).getTime()
      const endDate = new Date(parseInt(year), monthIndex + 1, 0, 23, 59, 59).getTime()
      events = events.filter(e => {
        const d = new Date(e.date).getTime()
        return d >= startDate && d <= endDate
      })
    }

    if (category && category !== 'all') {
      events = events.filter(e => e.category === category)
    }

    // Sort by date ascending
    events = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Transform events to calendar-friendly format
    const calendarEvents = events.map(event => {
      const eventDate = new Date(event.date)
      return {
        _id: event.id,
        title: event.title,
        description: event.description,
        date: eventDate.toISOString().split('T')[0], // YYYY-MM-DD format
        time: event.time,
        location: event.location,
        category: event.category,
        recurring: false,
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

    return NextResponse.json({
      success: true,
      events: calendarEvents,
      eventsByDate,
      count: calendarEvents.length
    })

  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

