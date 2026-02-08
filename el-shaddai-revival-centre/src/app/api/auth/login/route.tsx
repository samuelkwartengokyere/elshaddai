import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Admin from '@/models/Admin'
import { setAuthCookie, generateToken, getCurrentAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      // In-memory mode for development without database
      // Default admin credentials: admin@elshaddai.com / admin123
      const body = await request.json()
      const { email, password } = body
      
      if (email === 'admin@elshaddai.com' && password === 'admin123') {
        const token = generateToken({
          adminId: 'dev-admin-id',
          email: 'admin@elshaddai.com',
          role: 'super_admin'
        })
        
        return setAuthCookie(token, 'Login successful (development mode)')
      }
      
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { email, password } = body
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() })
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Check if admin is active
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated' },
        { status: 403 }
      )
    }
    
    // Verify password
    const isMatch = await admin.comparePassword(password)
    
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Update last login
    admin.lastLogin = new Date()
    await admin.save()
    
    // Generate JWT token
    const token = generateToken({
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role
    })
    
    // Set cookie and return response
    return setAuthCookie(token, 'Login successful')
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = getCurrentAdmin(request)
    
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: {
        adminId: admin.adminId,
        email: admin.email,
        role: admin.role
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

