import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { calendarEventsDb, isDbConfigured } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

// In-memory storage fallback
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
    
    // Try Supabase first
    if (isDbConfigured()) {
      try {
        let events = await calendarEventsDb.getAll()
        
        // Filter by year
        if (year) {
          events = events.filter(e => {
            const eventYear = new Date(e.start).getFullYear()
            return eventYear === parseInt(year)
          })
        }
        
        // Filter by category
        if (category && category !== 'all') {
          events = events.filter(e => e.event_type === category)
        }
        
        return NextResponse.json({
          success: true,
          events: events.map(e => ({
            _id: e.id,
            title: e.title,
            description: e.description || '',
            date: e.start,
            time: e.start ? new Date(e.start).toTimeString().slice(0, 5) : '',
            endTime: e.end ? new Date(e.end).toTimeString().slice(0, 5) : undefined,
            location: e.location || '',
            category: e.event_type || 'general',
            isPublished: true,
            year: new Date(e.start).getFullYear(),
            createdAt: e.created_at,
            updatedAt: e.updated_at
          })),
          count: events.length,
          isSupabaseMode: true,
          isInMemoryMode: false
        })
      } catch (dbError) {
        console.error('[Calendar API] Database error:', dbError)
      }
    }
    
    // Fallback to in-memory storage
    let events = getInMemoryCalendarEvents()
    
    if (year) {
      events = events.filter(e => e.year === parseInt(year))
    }
    
    if (category && category !== 'all') {
      events = events.filter(e => e.category === category)
    }
    
    events = events.filter(e => e.isPublished)

    return NextResponse.json({
      success: true,
      events,
      count: events.length,
      isSupabaseMode: false,
      isInMemoryMode: true,
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
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Bulk import
    if (Array.isArray(body)) {
      if (isDbConfigured()) {
        try {
          const newEvents = await Promise.all(
            body.map(event => 
              calendarEventsDb.create({
                title: event.title,
                description: event.description || null,
                start: event.date,
                end: event.endDate || null,
                location: event.location || null,
                event_type: event.category || 'general',
                all_day: event.allDay || false,
                color: event.color || null
              })
            )
          )
          
          return NextResponse.json({
            success: true,
            count: newEvents.length,
            message: `${newEvents.length} calendar events imported successfully`,
            isSupabaseMode: true
          }, { status: 201 })
        } catch (dbError) {
          console.error('[Calendar API] Database error:', dbError)
        }
      }
      
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
        isSupabaseMode: false,
        isInMemoryMode: true,
        fallback: true
      }, { status: 201 })
    }
    
    // Single event creation
    if (isDbConfigured()) {
      try {
        const year = body.date ? new Date(body.date).getFullYear() : new Date().getFullYear()
        
        const newEvent = await calendarEventsDb.create({
          title: body.title,
          description: body.description || null,
          start: body.date,
          end: body.endDate || null,
          location: body.location || null,
          event_type: body.category || 'general',
          all_day: body.allDay || false,
          color: body.color || null
        })

        return NextResponse.json({
          success: true,
          event: {
            _id: newEvent.id,
            title: newEvent.title,
            description: newEvent.description || '',
            date: newEvent.start,
            time: newEvent.start ? new Date(newEvent.start).toTimeString().slice(0, 5) : '',
            endTime: newEvent.end ? new Date(newEvent.end).toTimeString().slice(0, 5) : undefined,
            location: newEvent.location || '',
            category: newEvent.event_type || 'general',
            isPublished: true,
            year,
            createdAt: newEvent.created_at,
            updatedAt: newEvent.updated_at
          },
          message: 'Calendar event created successfully',
          isSupabaseMode: true
        }, { status: 201 })
      } catch (dbError) {
        console.error('[Calendar API] Database error:', dbError)
      }
    }
    
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
      isSupabaseMode: false,
      isInMemoryMode: true,
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
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const year = searchParams.get('year')
    
    if (id) {
      if (isDbConfigured()) {
        try {
          await calendarEventsDb.delete(id)
          return NextResponse.json({
            success: true,
            message: 'Calendar event deleted successfully',
            isSupabaseMode: true
          })
        } catch (dbError) {
          console.error('[Calendar API] Database error:', dbError)
        }
      }
      
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
        isSupabaseMode: false,
        isInMemoryMode: true,
        fallback: true
      })
    }
    
    if (year) {
      const initialLength = inMemoryCalendarEvents.length
      inMemoryCalendarEvents = inMemoryCalendarEvents.filter(e => e.year !== parseInt(year))
      
      return NextResponse.json({
        success: true,
        count: initialLength - inMemoryCalendarEvents.length,
        message: `${initialLength - inMemoryCalendarEvents.length} events deleted for year ${year}`,
        isSupabaseMode: false,
        isInMemoryMode: true,
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
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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
    
    if (isDbConfigured()) {
      try {
        const year = body.date ? new Date(body.date).getFullYear() : new Date().getFullYear()
        
        const updatedEvent = await calendarEventsDb.update(eventId, {
          title: body.title,
          description: body.description || null,
          start: body.date,
          end: body.endDate || null,
          location: body.location || null,
          event_type: body.category || 'general',
          all_day: body.allDay || false,
          color: body.color || null
        })

        return NextResponse.json({
          success: true,
          event: {
            _id: updatedEvent.id,
            title: updatedEvent.title,
            description: updatedEvent.description || '',
            date: updatedEvent.start,
            time: updatedEvent.start ? new Date(updatedEvent.start).toTimeString().slice(0, 5) : '',
            endTime: updatedEvent.end ? new Date(updatedEvent.end).toTimeString().slice(0, 5) : undefined,
            location: updatedEvent.location || '',
            category: updatedEvent.event_type || 'general',
            isPublished: true,
            year,
            createdAt: updatedEvent.created_at,
            updatedAt: updatedEvent.updated_at
          },
          message: 'Calendar event updated successfully',
          isSupabaseMode: true
        })
      } catch (dbError) {
        console.error('[Calendar API] Database error:', dbError)
      }
    }
    
    const eventIndex = inMemoryCalendarEvents.findIndex(e => e._id === eventId)
    
    if (eventIndex === -1) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }
    
    const year = body.date ? new Date(body.date).getFullYear() : inMemoryCalendarEvents[eventIndex].year
    
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
      isSupabaseMode: false,
      isInMemoryMode: true,
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
