import { NextRequest, NextResponse } from 'next/server'
import { eventsDb, isDbConfigured } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const upcoming = searchParams.get('upcoming') === 'true'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'date'

    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        let events = await eventsDb.getAll()
        
        // Filter by published
        events = events.filter(e => e.is_published)
        
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
            (e.description && e.description.toLowerCase().includes(searchLower)) ||
            (e.location && e.location.toLowerCase().includes(searchLower))
          )
        }
        
        // Sort
        if (sort === 'date') {
          events = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        } else {
          events = events.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }
        
        // Pagination
        const total = events.length
        const skip = (page - 1) * limit
        const paginatedEvents = events.slice(skip, skip + limit)
        const totalPages = Math.ceil(total / limit)

        return NextResponse.json({
          success: true,
          events: paginatedEvents.map(event => ({
            _id: event.id,
            title: event.title,
            description: event.description,
            date: event.date,
            endDate: event.end_date,
            time: event.time,
            endTime: event.end_time,
            location: event.location,
            category: event.category,
            imageUrl: event.image_url,
            isPublished: event.is_published,
            createdAt: event.created_at,
            updatedAt: event.updated_at
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          },
          isInMemoryMode: false,
          isSupabaseMode: true
        })
      } catch (dbError) {
        console.error('[Events API] Database error:', dbError)
      }
    }
    
    // Fall back to empty list if Supabase not configured
    return NextResponse.json({
      success: true,
      events: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      },
      isInMemoryMode: true,
      isSupabaseMode: false,
      message: 'Using in-memory storage (no database configured)'
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
    // Check if user is authenticated
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const newEvent = await eventsDb.create({
          title: body.title,
          description: body.description,
          date: body.date,
          end_date: body.endDate || null,
          time: body.time,
          end_time: body.endTime || null,
          location: body.location,
          category: body.category,
          image_url: body.imageUrl || null,
          is_published: true
        })

        return NextResponse.json({
          success: true,
          event: {
            _id: newEvent.id,
            title: newEvent.title,
            description: newEvent.description,
            date: newEvent.date,
            endDate: newEvent.end_date,
            time: newEvent.time,
            endTime: newEvent.end_time,
            location: newEvent.location,
            category: newEvent.category,
            imageUrl: newEvent.image_url,
            isPublished: newEvent.is_published,
            createdAt: newEvent.created_at,
            updatedAt: newEvent.updated_at
          },
          message: 'Event created successfully',
          isSupabaseMode: true
        }, { status: 201 })
      } catch (dbError) {
        console.error('[Events API] Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to create event in database' },
          { status: 500 }
        )
      }
    }
    
    // Fall back to error when Supabase not configured
    return NextResponse.json(
      { success: false, error: 'Database not available. Please configure Supabase.' },
      { status: 503 }
    )

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
    // Check if user is authenticated
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
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const existingEvent = await eventsDb.getById(eventId)
        
        if (!existingEvent) {
          return NextResponse.json(
            { error: 'Event not found' },
            { status: 404 }
          )
        }
        
        const updateData: {
          title?: string
          description?: string
          date?: string
          end_date?: string | null
          time?: string
          end_time?: string | null
          location?: string
          category?: string
          image_url?: string | null
          is_published?: boolean
        } = {}
        
        if (body.title !== undefined) updateData.title = body.title
        if (body.description !== undefined) updateData.description = body.description
        if (body.date !== undefined) updateData.date = body.date
        if (body.endDate !== undefined) updateData.end_date = body.endDate
        if (body.time !== undefined) updateData.time = body.time
        if (body.endTime !== undefined) updateData.end_time = body.endTime
        if (body.location !== undefined) updateData.location = body.location
        if (body.category !== undefined) updateData.category = body.category
        if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl
        if (body.isPublished !== undefined) updateData.is_published = body.isPublished
        
        const updatedEvent = await eventsDb.update(eventId, updateData)

        return NextResponse.json({
          success: true,
          event: {
            _id: updatedEvent.id,
            title: updatedEvent.title,
            description: updatedEvent.description,
            date: updatedEvent.date,
            endDate: updatedEvent.end_date,
            time: updatedEvent.time,
            endTime: updatedEvent.end_time,
            location: updatedEvent.location,
            category: updatedEvent.category,
            imageUrl: updatedEvent.image_url,
            isPublished: updatedEvent.is_published,
            createdAt: updatedEvent.created_at,
            updatedAt: updatedEvent.updated_at
          },
          message: 'Event updated successfully',
          isSupabaseMode: true
        })
      } catch (dbError) {
        console.error('[Events API] Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to update event in database' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    )

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
    // Check if user is authenticated
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const eventId = request.nextUrl.searchParams.get('id')
    
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const existingEvent = await eventsDb.getById(eventId)
        
        if (!existingEvent) {
          return NextResponse.json(
            { error: 'Event not found' },
            { status: 404 }
          )
        }
        
        await eventsDb.delete(eventId)

        return NextResponse.json({
          success: true,
          message: 'Event deleted successfully',
          isSupabaseMode: true
        })
      } catch (dbError) {
        console.error('[Events API] Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to delete event in database' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    )

  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
}

