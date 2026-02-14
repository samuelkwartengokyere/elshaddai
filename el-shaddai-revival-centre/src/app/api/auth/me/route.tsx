import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Admin from '@/models/Admin'
import { getCurrentAdmin, getAuthToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const admin = getCurrentAdmin(request)
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }
    
    // Check if this is a development mode token (non-MongoDB ObjectId)
    const isDevToken = admin.adminId === 'dev-admin-id' || admin.adminId.length !== 24
    
    if (isDevToken) {
      // In development mode with hardcoded credentials - return basic info from token
      return NextResponse.json({
        success: true,
        user: {
          adminId: admin.adminId,
          email: admin.email,
          role: admin.role,
          name: 'Admin',
          profileImage: ''
        },
        isInMemoryMode: true
      })
    }
    
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      // In-memory mode - return basic info from token
      return NextResponse.json({
        success: true,
        user: {
          adminId: admin.adminId,
          email: admin.email,
          role: admin.role,
          name: 'Admin',
          profileImage: ''
        },
        isInMemoryMode: true
      })
    }
    
    // Get full admin details from database
    const fullAdmin = await Admin.findById(admin.adminId)
      .select('-password')
      .lean()
    
    if (!fullAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: {
        adminId: fullAdmin._id.toString(),
        email: fullAdmin.email,
        name: fullAdmin.name,
        role: fullAdmin.role,
        isActive: fullAdmin.isActive,
        profileImage: fullAdmin.profileImage,
        lastLogin: fullAdmin.lastLogin,
        createdAt: fullAdmin.createdAt
      }
    })
    
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
