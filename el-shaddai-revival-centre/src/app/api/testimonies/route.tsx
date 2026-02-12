import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Testimony, { ITestimony } from '@/models/Testimony'

// Add AbortController for timeout
const TIMEOUT_MS = 5000

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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured') === 'true'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || '-date'

    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = { isPublished: true }

    if (category && category !== 'all') {
      query.category = category
    }

    if (featured) {
      query.isFeatured = true
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }

    // Execute query with timeout
    const testimonies = await Testimony.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limit)
      .lean()
      .collation({ locale: 'en', strength: 2 })
      .maxTimeMS(TIMEOUT_MS - 1000)

    const total = await Testimony.countDocuments(query)
      .maxTimeMS(TIMEOUT_MS - 1000)
    
    const totalPages = Math.ceil(total / limit)
    
    clearTimeout(timeoutId)

    return NextResponse.json({
      success: true,
      testimonies,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Testimonies API request timed out')
      return NextResponse.json(
        { error: 'Request timed out. Database connection may be slow.' },
        { status: 503 }
      )
    }
    console.error('Error fetching testimonies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch testimonies' },
      { status: 500 }
    )
  }
}

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
    
    const testimony = new Testimony({
      ...body,
      date: new Date(body.date),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await testimony.save()

    return NextResponse.json({
      success: true,
      testimony,
      message: 'Testimony created successfully'
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
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }
    
    const body = await request.json()
    const testimonyId = request.nextUrl.searchParams.get('id')
    
    if (!testimonyId) {
      return NextResponse.json(
        { error: 'Testimony ID is required' },
        { status: 400 }
      )
    }
    
    const updatedTestimony = await Testimony.findByIdAndUpdate(
      testimonyId,
      {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    
    if (!updatedTestimony) {
      return NextResponse.json(
        { error: 'Testimony not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      testimony: updatedTestimony,
      message: 'Testimony updated successfully'
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
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }
    
    const testimonyId = request.nextUrl.searchParams.get('id')
    
    if (!testimonyId) {
      return NextResponse.json(
        { error: 'Testimony ID is required' },
        { status: 400 }
      )
    }
    
    const deletedTestimony = await Testimony.findByIdAndDelete(testimonyId)
    
    if (!deletedTestimony) {
      return NextResponse.json(
        { error: 'Testimony not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Testimony deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting testimony:', error)
    return NextResponse.json(
      { error: 'Failed to delete testimony' },
      { status: 500 }
    )
  }
}

