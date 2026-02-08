import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Admin from '@/models/Admin'
import { getCurrentAdmin } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// Validate MongoDB ObjectId
function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID' },
        { status: 400 }
      )
    }
    
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      )
    }
    
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const admin = await Admin.findById(id).select('-password').lean()
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      admin: {
        _id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    })
    
  } catch (error) {
    console.error('Error fetching admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID' },
        { status: 400 }
      )
    }
    
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      )
    }
    
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Only super_admin can update admins
    if (currentAdmin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only super admins can update admins' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { name, role, isActive, currentPassword, newPassword } = body
    
    const admin = await Admin.findById(id)
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }
    
    // Prevent modifying super_admin role
    if (admin.role === 'super_admin' && role && role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot change super_admin role' },
        { status: 403 }
      )
    }
    
    // Update fields
    if (name) admin.name = name
    if (role && admin.role !== 'super_admin') admin.role = role
    if (typeof isActive === 'boolean') admin.isActive = isActive
    
    // Password change requires current password verification
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, error: 'Current password required to change password' },
          { status: 400 }
        )
      }
      
      const isMatch = await admin.comparePassword(currentPassword)
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 401 }
        )
      }
      
      admin.password = newPassword
    }
    
    await admin.save()
    
    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
      admin: {
        _id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }
    })
    
  } catch (error) {
    console.error('Error updating admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update admin' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin ID' },
        { status: 400 }
      )
    }
    
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { success: false, error: 'Database not available' },
        { status: 503 }
      )
    }
    
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Only super_admin can delete admins
    if (currentAdmin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only super admins can delete admins' },
        { status: 403 }
      )
    }
    
    // Cannot delete yourself
    if (currentAdmin.adminId === id) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }
    
    const admin = await Admin.findById(id)
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }
    
    // Cannot delete super_admin
    if (admin.role === 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete super admin account' },
        { status: 403 }
      )
    }
    
    await Admin.findByIdAndDelete(id)
    
    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete admin' },
      { status: 500 }
    )
  }
}

