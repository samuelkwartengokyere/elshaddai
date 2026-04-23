import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { eventsDb } from '@/lib/db'

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

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const existingEvent = await eventsDb.getById(id)

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    await eventsDb.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
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

    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const existingEvent = await eventsDb.getById(id)

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

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

    const updatedEvent = await eventsDb.update(id, updateData)

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

