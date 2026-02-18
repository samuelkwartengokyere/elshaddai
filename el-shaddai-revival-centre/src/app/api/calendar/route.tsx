import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const TIMEOUT_MS = 10000

// In-memory storage for calendar events (replaces MongoDB)
interface CalendarEventType {
  _id: string
  title: string
  description: string
  date: string
  time: string
  endTime?: string
  location: string
  category: string
  isPublished: boolean
  year: number
  createdAt: Date
  updatedAt: Date
}

let inMemoryCalendarEvents: CalendarEventType[] = []

function getInMemoryCalendarEvents() {
  return inMemoryCalendarEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// GET - Fetch all calendar events
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const category = searchParams.get('category')
    
    // Get events from in-memory storage
    let events = getInMemoryCalendarEvents()
    
    // Filter by year
    if (year) {
      events = events.filter(e => e.year === parseInt(year))
    }
    
    // Filter by category
    if (category && category !== 'all') {
      events = events.filter(e => e.category === category)
    }
    
    // Only return published events
    events = events.filter(e => e.isPublished)

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
      fallback: true,
      message: 'Using in-memory storage'
    })

  } catch (error) {
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
    const body = await request.json()
    
    // Check if bulk import
    if (Array.isArray(body)) {
      // Bulk insert
      const newEvents = body.map(event => {
        const year = event.date ? new Date(event.date).getFullYear() : new Date().getFullYear()
        return {
          _id: uuidv4(),
          ...event,
          isPublished: true,
          year,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      inMemoryCalendarEvents = [...inMemoryCalendarEvents, ...newEvents]
      
      return NextResponse.json({
        success: true,
        count: newEvents.length,
        message: `${newEvents.length} calendar events imported successfully`,
        fallback: true
      }, { status: 201 })
    }
    
    // Single event creation
    const year = body.date ? new Date(body.date).getFullYear() : new Date().getFullYear()
    const newEvent: CalendarEventType = {
      _id: uuidv4(),
      ...body,
      isPublished: true,
      year,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    inMemoryCalendarEvents = [...inMemoryCalendarEvents, newEvent]

    return NextResponse.json({
      success: true,
      event: newEvent,
      message: 'Calendar event created successfully',
      fallback: true
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
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const year = searchParams.get('year')
    
    if (id) {
      // Delete single event
      const initialLength = inMemoryCalendarEvents.length
      inMemoryCalendarEvents = inMemoryCalendarEvents.filter(e => e._id !== id)
      
      if (inMemoryCalendarEvents.length === initialLength) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        message: 'Calendar event deleted successfully',
        fallback: true
      })
    }
    
    if (year) {
      // Delete all events for a year
      const initialLength = inMemoryCalendarEvents.length
      inMemoryCalendarEvents = inMemoryCalendarEvents.filter(e => e.year !== parseInt(year))
      
      return NextResponse.json({
        success: true,
        count: initialLength - inMemoryCalendarEvents.length,
        message: `${initialLength - inMemoryCalendarEvents.length} events deleted for year ${year}`,
        fallback: true
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
    const body = await request.json()
    const eventId = request.nextUrl.searchParams.get('id')
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    const eventIndex = inMemoryCalendarEvents.findIndex(e => e._id === eventId)
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    const year = body.date ? new Date(body.date).getFullYear() : inMemoryCalendarEvents[eventIndex].year
    
    // Update the event
    inMemoryCalendarEvents[eventIndex] = {
      ...inMemoryCalendarEvents[eventIndex],
      ...body,
      year,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      event: inMemoryCalendarEvents[eventIndex],
      message: 'Calendar event updated successfully',
      fallback: true
    })

  } catch (error) {
    console.error('Error updating calendar event:', error)
    return NextResponse.json(
      { error: 'Failed to update calendar event' },
      { status: 500 }
    )
  }
}
