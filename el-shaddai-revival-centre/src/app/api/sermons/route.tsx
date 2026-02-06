import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Sermon, { ISermon } from '@/models/Sermon'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const speaker = searchParams.get('speaker')
    const series = searchParams.get('series')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || '-date'

    const skip = (page - 1) * limit

    // Build query
    let query: Record<string, unknown> = {}

    if (speaker) {
      query.speaker = { $regex: speaker, $options: 'i' }
    }

    if (series) {
      query.series = { $regex: series, $options: 'i' }
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { speaker: { $regex: search, $options: 'i' } },
        { biblePassage: { $regex: search, $options: 'i' } }
      ]
    }

    // Execute query
    const sermons = await Sermon.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await Sermon.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      sermons,
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
    console.error('Error fetching sermons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sermons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    
    const sermon = new Sermon({
      ...body,
      date: new Date(body.date),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await sermon.save()

    return NextResponse.json({
      success: true,
      sermon,
      message: 'Sermon created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating sermon:', error)
    return NextResponse.json(
      { error: 'Failed to create sermon' },
      { status: 500 }
    )
  }
}

