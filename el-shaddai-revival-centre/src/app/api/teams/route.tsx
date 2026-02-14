import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import TeamMember, { ITeamMember } from '@/models/TeamMember'

// Add AbortController for timeout
const TIMEOUT_MS = 5000

export async function GET(request: NextRequest) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  
  try {
    const dbConnection = await connectDB()
    const isReady = dbConnection !== null
    
    // Use fallback mode if database is not connected
    if (!dbConnection || !isReady) {
      console.warn('Database not connected, using fallback mode for teams')
      clearTimeout(timeoutId)
      return NextResponse.json({
        success: true,
        teamMembers: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        },
        fallback: true,
        message: 'Database unavailable - showing empty team'
      })
    }
    
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const department = searchParams.get('department')
    const leadershipOnly = searchParams.get('leadership') === 'true'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'order'

    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = { isPublished: true }

    if (department && department !== 'all') {
      query.department = department
    }

    if (leadershipOnly) {
      query.isLeadership = true
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ]
    }

    // Execute query with timeout
    const teamMembers = await TeamMember.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limit)
      .lean()
      .collation({ locale: 'en', strength: 2 })
      .maxTimeMS(TIMEOUT_MS - 1000)

    const total = await TeamMember.countDocuments(query)
      .maxTimeMS(TIMEOUT_MS - 1000)
    
    const totalPages = Math.ceil(total / limit)
    
    clearTimeout(timeoutId)

    return NextResponse.json({
      success: true,
      teamMembers,
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
      console.error('Teams API request timed out')
      return NextResponse.json(
        { error: 'Request timed out. Database connection may be slow.' },
        { status: 503 }
      )
    }
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
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
    
    const teamMember = new TeamMember({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    await teamMember.save()

    return NextResponse.json({
      success: true,
      teamMember,
      message: 'Team member created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { error: 'Failed to create team member' },
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
    const memberId = request.nextUrl.searchParams.get('id')
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }
    
    const updatedMember = await TeamMember.findByIdAndUpdate(
      memberId,
      {
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
    
    if (!updatedMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      teamMember: updatedMember,
      message: 'Team member updated successfully'
    })

  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}

