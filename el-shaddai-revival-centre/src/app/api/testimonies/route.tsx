import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Testimony, { ITestimony } from '@/models/Testimony'

export async function GET(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
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

    // Execute query
    const testimonies = await Testimony.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Testimony.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

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

