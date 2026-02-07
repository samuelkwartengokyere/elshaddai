import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import TeamMember, { ITeamMember } from '@/models/TeamMember'

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

    // Execute query
    const teamMembers = await TeamMember.find(query)
      .sort(sort as string)
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await TeamMember.countDocuments(query)
    const totalPages = Math.ceil(total / limit)

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

