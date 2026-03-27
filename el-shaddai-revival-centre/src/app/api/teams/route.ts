import { NextRequest, NextResponse } from 'next/server'
import { teamsDb, isDbConfigured } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const department = searchParams.get('department')
    const leadershipOnly = searchParams.get('leadership') === 'true'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'order'

    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        let teamMembers = await teamsDb.getAll()
        
        // Filter by active (published)
        teamMembers = teamMembers.filter(t => t.is_active)
        
        // Filter by department
        if (department && department !== 'all') {
          teamMembers = teamMembers.filter(t => t.department === department)
        }
        
        // Filter by leadership (using order_index for leadership)
        if (leadershipOnly) {
          teamMembers = teamMembers.filter(t => t.order_index < 10)
        }
        
        // Filter by search
        if (search) {
          const searchLower = search.toLowerCase()
          teamMembers = teamMembers.filter(t => 
            t.name.toLowerCase().includes(searchLower) ||
            t.role.toLowerCase().includes(searchLower) ||
            (t.department && t.department.toLowerCase().includes(searchLower))
          )
        }
        
        // Sort
        if (sort === 'order') {
          teamMembers = teamMembers.sort((a, b) => a.order_index - b.order_index)
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
          teamMembers: paginatedTeamMembers.map(t => ({
            _id: t.id,
            name: t.name,
            role: t.role,
            department: t.department,
            bio: t.bio,
            imageUrl: t.image,
            email: t.email,
            phone: t.phone,
            isPublished: t.is_active,
            isLeadership: t.order_index < 10,
            order: t.order_index,
            createdAt: t.created_at,
            updatedAt: t.updated_at
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
        console.error('[Teams API] Database error:', dbError)
      }
    }
    
    // Fall back to empty list if Supabase not configured
    return NextResponse.json({
      success: true,
      teamMembers: [],
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
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
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
        const newTeamMember = await teamsDb.create({
          name: body.name,
          role: body.role,
          department: body.department || null,
          bio: body.bio || null,
          image: body.imageUrl || null,
          email: body.email || null,
          phone: body.phone || null,
          is_active: true,
          order_index: body.order || 0
        })

        return NextResponse.json({
          success: true,
          teamMember: {
            _id: newTeamMember.id,
            name: newTeamMember.name,
            role: newTeamMember.role,
            department: newTeamMember.department,
            bio: newTeamMember.bio,
            imageUrl: newTeamMember.image,
            email: newTeamMember.email,
            phone: newTeamMember.phone,
            isPublished: newTeamMember.is_active,
            isLeadership: newTeamMember.order_index < 10,
            order: newTeamMember.order_index,
            createdAt: newTeamMember.created_at,
            updatedAt: newTeamMember.updated_at
          },
          message: 'Team member created successfully',
          isSupabaseMode: true
        }, { status: 201 })
      } catch (dbError) {
        console.error('[Teams API] Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to create team member in database' },
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
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { error: 'Failed to create team member' },
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
    const memberId = request.nextUrl.searchParams.get('id')
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const existingMember = await teamsDb.getById(memberId)
        
        if (!existingMember) {
          return NextResponse.json(
            { error: 'Team member not found' },
            { status: 404 }
          )
        }
        
        const updateData: {
          name?: string
          role?: string
          department?: string | null
          bio?: string | null
          image?: string | null
          email?: string | null
          phone?: string | null
          is_active?: boolean
          order_index?: number
        } = {}
        
        if (body.name !== undefined) updateData.name = body.name
        if (body.role !== undefined) updateData.role = body.role
        if (body.department !== undefined) updateData.department = body.department
        if (body.bio !== undefined) updateData.bio = body.bio
        if (body.imageUrl !== undefined) updateData.image = body.imageUrl
        if (body.email !== undefined) updateData.email = body.email
        if (body.phone !== undefined) updateData.phone = body.phone
        if (body.isPublished !== undefined) updateData.is_active = body.isPublished
        if (body.order !== undefined) updateData.order_index = body.order
        
        const updatedMember = await teamsDb.update(memberId, updateData)

        return NextResponse.json({
          success: true,
          teamMember: {
            _id: updatedMember.id,
            name: updatedMember.name,
            role: updatedMember.role,
            department: updatedMember.department,
            bio: updatedMember.bio,
            imageUrl: updatedMember.image,
            email: updatedMember.email,
            phone: updatedMember.phone,
            isPublished: updatedMember.is_active,
            isLeadership: updatedMember.order_index < 10,
            order: updatedMember.order_index,
            createdAt: updatedMember.created_at,
            updatedAt: updatedMember.updated_at
          },
          message: 'Team member updated successfully',
          isSupabaseMode: true
        })
      } catch (dbError) {
        console.error('[Teams API] Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to update team member in database' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    )

  } catch (error) {
    console.error('Error updating team member:', error)
    return NextResponse.json(
      { error: 'Failed to update team member' },
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
    
    const memberId = request.nextUrl.searchParams.get('id')
    
    if (!memberId) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const existingMember = await teamsDb.getById(memberId)
        
        if (!existingMember) {
          return NextResponse.json(
            { error: 'Team member not found' },
            { status: 404 }
          )
        }
        
        await teamsDb.delete(memberId)

        return NextResponse.json({
          success: true,
          message: 'Team member deleted successfully',
          isSupabaseMode: true
        })
      } catch (dbError) {
        console.error('[Teams API] Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to delete team member in database' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    )

  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    )
  }
}
