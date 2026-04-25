import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { teamsDb } from '@/lib/db'

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
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }

    const existingMember = await teamsDb.getById(id)

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    await teamsDb.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Team member deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: 'Failed to delete team member' },
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
        { error: 'Team member ID is required' },
        { status: 400 }
      )
    }

    const existingMember = await teamsDb.getById(id)

    if (!existingMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    const body = await request.json()

    // Build update data using spread to avoid type inference issues with Partial<T>
    const updateData = {
      ...(body.name !== undefined && { name: String(body.name) }),
      ...(body.role !== undefined && { role: String(body.role) }),
      ...(body.department !== undefined && { department: body.department ? String(body.department) : undefined }),
      ...(body.bio !== undefined && { bio: body.bio ? String(body.bio) : undefined }),
      ...(body.image !== undefined && { image: body.image ? String(body.image) : undefined }),
      ...(body.imageUrl !== undefined && { image: body.imageUrl ? String(body.imageUrl) : undefined }),
      ...(body.email !== undefined && { email: body.email ? String(body.email) : undefined }),
      ...(body.phone !== undefined && { phone: body.phone ? String(body.phone) : undefined }),
      ...(body.isPublished !== undefined && { is_active: Boolean(body.isPublished) }),
      ...(body.order !== undefined && { order_index: Number(body.order) }),
    }

    const updatedMember = await teamsDb.update(id, updateData)

    return NextResponse.json({
      success: true,
      teamMember: {
        _id: updatedMember.id,
        name: updatedMember.name,
        role: updatedMember.role,
        department: updatedMember.department,
        bio: updatedMember.bio,
        image: updatedMember.image,
        email: updatedMember.email,
        phone: updatedMember.phone,
        isPublished: updatedMember.is_active,
        isLeadership: updatedMember.order_index < 10,
        order: updatedMember.order_index,
        createdAt: updatedMember.created_at,
        updatedAt: updatedMember.updated_at
      },
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

