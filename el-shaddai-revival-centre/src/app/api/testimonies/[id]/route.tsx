import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// In-memory storage for testimonies (shared with testimonies/route.tsx via module caching)
interface TestimonyType {
  _id: string
  name: string
  title: string
  content: string
  imageUrl?: string
  category: string
  isPublished: boolean
  isFeatured: boolean
  date: string
  createdAt: Date
  updatedAt: Date
}

let inMemoryTestimonies: TestimonyType[] = []

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Testimony ID is required' },
        { status: 400 }
      )
    }

    const testimonyIndex = inMemoryTestimonies.findIndex(t => t._id === id)

    if (testimonyIndex === -1) {
      return NextResponse.json(
        { error: 'Testimony not found' },
        { status: 404 }
      )
    }

    inMemoryTestimonies = inMemoryTestimonies.filter(t => t._id !== id)

    return NextResponse.json({
      success: true,
      message: 'Testimony deleted successfully',
      fallback: true
    })

  } catch (error) {
    console.error('Error deleting testimony:', error)
    return NextResponse.json(
      { error: 'Failed to delete testimony' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Testimony ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const testimonyIndex = inMemoryTestimonies.findIndex(t => t._id === id)

    if (testimonyIndex === -1) {
      return NextResponse.json(
        { error: 'Testimony not found' },
        { status: 404 }
      )
    }

    inMemoryTestimonies[testimonyIndex] = {
      ...inMemoryTestimonies[testimonyIndex],
      ...body,
      date: body.date || inMemoryTestimonies[testimonyIndex].date,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      testimony: inMemoryTestimonies[testimonyIndex],
      message: 'Testimony updated successfully',
      fallback: true
    })

  } catch (error) {
    console.error('Error updating testimony:', error)
    return NextResponse.json(
      { error: 'Failed to update testimony' },
      { status: 500 }
    )
  }
}

