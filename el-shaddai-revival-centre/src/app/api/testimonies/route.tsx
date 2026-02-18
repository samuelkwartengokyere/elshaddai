import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const TIMEOUT_MS = 5000

// In-memory storage for testimonies (replaces MongoDB)
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

function getInMemoryTestimonies() {
  return inMemoryTestimonies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || '-date'

    // Get testimonies from in-memory storage
    let testimonies = getInMemoryTestimonies()
    
    // Filter by published
    testimonies = testimonies.filter(t => t.isPublished)
    
    // Filter by category
    if (category && category !== 'all') {
      testimonies = testimonies.filter(t => t.category === category)
    }
    
    // Filter by featured
    if (featured) {
      testimonies = testimonies.filter(t => t.isFeatured)
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      testimonies = testimonies.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.title.toLowerCase().includes(searchLower) ||
        t.content.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort
    if (sort === 'date') {
      testimonies = testimonies.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    } else {
      testimonies = testimonies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
    
    // Pagination
    const total = testimonies.length
    const skip = (page - 1) * limit
    const paginatedTestimonies = testimonies.slice(skip, skip + limit)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      testimonies: paginatedTestimonies,
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
    console.error('Error fetching testimonies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newTestimony: TestimonyType = {
      _id: uuidv4(),
      ...body,
      date: body.date || new Date().toISOString(),
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    inMemoryTestimonies = [...inMemoryTestimonies, newTestimony]

    return NextResponse.json({
      success: true,
      testimony: newTestimony,
      message: 'Testimony created successfully',
      fallback: true
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating testimony:', error)
    return NextResponse.json(
      { error: 'Failed to create testimony' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const testimonyId = request.nextUrl.searchParams.get('id')
    
    if (!testimonyId) {
      return NextResponse.json(
        { error: 'Testimony ID is required' },
        { status: 400 }
      )
    }
    
    const testimonyIndex = inMemoryTestimonies.findIndex(t => t._id === testimonyId)
    
    if (testimonyIndex === -1) {
      return NextResponse.json(
        { error: 'Testimony not found' },
        { status: 404 }
      )
    }
    
    // Update the testimony
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

export async function DELETE(request: NextRequest) {
  try {
    const testimonyId = request.nextUrl.searchParams.get('id')
    
    if (!testimonyId) {
      return NextResponse.json(
        { error: 'Testimony ID is required' },
        { status: 400 }
      )
    }
    
    const testimonyIndex = inMemoryTestimonies.findIndex(t => t._id === testimonyId)
    
    if (testimonyIndex === -1) {
      return NextResponse.json(
        { error: 'Testimony not found' },
        { status: 404 }
      )
    }
    
    inMemoryTestimonies = inMemoryTestimonies.filter(t => t._id !== testimonyId)

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
