import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Admin from '@/models/Admin'
import { getCurrentAdmin } from '@/lib/auth'

// Timeout for requests
const TIMEOUT_MS = 5000

// Dev mode admin (created automatically when no database)
const DEV_ADMIN_ID = 'dev-admin-id'
const DEV_ADMIN_EMAIL = 'admin@elshaddai.com'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated first
    const currentAdmin = getCurrentAdmin(request)
    
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user is super_admin
    if (currentAdmin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only super admins can view all admins' },
        { status: 403 }
      )
    }
    
    const dbConnection = await connectDB()
    
    // In-memory mode - return dev admin only
    if (!dbConnection) {
      return NextResponse.json({
        success: true,
        admins: [
          {
            _id: DEV_ADMIN_ID,
            email: DEV_ADMIN_EMAIL,
            name: 'Super Admin (Dev)',
            role: 'super_admin',
            isActive: true,
            createdAt: new Date(),
            lastLogin: new Date()
          }
        ],
        isInMemoryMode: true
      })
    }
    
    // Use timeout for the query
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
    
    try {
      const admins = await Admin.find({})
        .select('-password')
        .sort({ createdAt: -1 })
        .maxTimeMS(TIMEOUT_MS - 1000)
        .lean()
      
      clearTimeout(timeoutId)
      
      return NextResponse.json({
        success: true,
        admins: admins.map(admin => ({
          _id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
          isActive: admin.isActive,
          lastLogin: admin.lastLogin,
          createdAt: admin.createdAt
        }))
      })
    } catch (queryError) {
      clearTimeout(timeoutId)
      if (queryError instanceof Error && queryError.name === 'AbortError') {
        return NextResponse.json(
          { success: false, error: 'Request timed out' },
          { status: 408 }
        )
      }
      throw queryError
    }
    
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admins' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    
    if (!dbConnection) {
      return NextResponse.json(
        { success: false, error: 'Database not available. Please connect to MongoDB to create admin users.' },
        { status: 503 }
      )
    }
    
    // Check if user is authenticated and is super_admin
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    if (currentAdmin.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only super admins can create admins' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { email, password, name, role } = body
    
    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }
    
    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }
    
    // Check if admin with this email already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() })
    if (existingAdmin) {
      return NextResponse.json(
        { success: false, error: 'An admin with this email already exists' },
        { status: 409 }
      )
    }
    
    // Validate role
    if (role && !['admin', 'editor'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be admin or editor' },
        { status: 400 }
      )
    }
    
    // Create new admin (password will be hashed by the model's pre-save hook)
    const admin = new Admin({
      email: email.toLowerCase(),
      password, // Store plain password - model will hash it
      name,
      role: role || 'admin'
    })
    
    await admin.save()
    
    // Return admin without password
    return NextResponse.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        _id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt
      }
    }, { status: 201 })
    
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create admin' },
      { status: 500 }
    )
  }
}

