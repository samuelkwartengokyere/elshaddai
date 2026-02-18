import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const TIMEOUT_MS = 5000

// In-memory storage for team members (replaces MongoDB)
interface TeamMemberType {
  _id: string
  name: string
  role: string
  department: string
  bio: string
  imageUrl: string
  email: string
  phone: string
  isPublished: boolean
  isLeadership: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

let inMemoryTeamMembers: TeamMemberType[] = []

function getInMemoryTeamMembers() {
  return inMemoryTeamMembers.sort((a, b) => a.order - b.order)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const department = searchParams.get('department')
    const leadershipOnly = searchParams.get('leadership') === 'true'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'order'

    // Get team members from in-memory storage
    let teamMembers = getInMemoryTeamMembers()
    
    // Filter by published
    teamMembers = teamMembers.filter(t => t.isPublished)
    
    // Filter by department
    if (department && department !== 'all') {
      teamMembers = teamMembers.filter(t => t.department === department)
    }
    
    // Filter by leadership
    if (leadershipOnly) {
      teamMembers = teamMembers.filter(t => t.isLeadership)
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      teamMembers = teamMembers.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.role.toLowerCase().includes(searchLower) ||
        t.department.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort
    if (sort === 'order') {
      teamMembers = teamMembers.sort((a, b) => a.order - b.order)
    } else {
      teamMembers = teamMembers.sort((a, b) => a.name.localeCompare(b.name))
    }
    
    // Pagination
    const total = teamMembers.length
    const skip = (page - 1) * limit
    const paginatedTeamMembers = teamMembers.slice(skip, skip + limit)
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      teamMembers: paginatedTeamMembers,
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
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newTeamMember: TeamMemberType = {
      _id: uuidv4(),
      ...body,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    inMemoryTeamMembers = [...inMemoryTeamMembers, newTeamMember]

    return NextResponse.json({
      success: true,
      teamMember: newTeamMember,
      message: 'Team member created successfully',
      fallback: true
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
    const body = await request.json()
    const memberId = request.nextUrl.searchParams.get('id')
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }
    
    const memberIndex = inMemoryTeamMembers.findIndex(t => t._id === memberId)
    
    if (memberIndex === -1) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }
    
    // Update the team member
    inMemoryTeamMembers[memberIndex] = {
      ...inMemoryTeamMembers[memberIndex],
      ...body,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      teamMember: inMemoryTeamMembers[memberIndex],
      message: 'Team member updated successfully',
      fallback: true
    })

  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Failed to update team member' },
      { status: 500 }
    )
  }
}
