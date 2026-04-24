import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { adminsDb, isDbConfigured } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

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
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const admins = await adminsDb.getAll()
        
        return NextResponse.json({
          success: true,
          admins: admins.map(admin => ({
            _id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            profileImage: admin.profile_image,
            createdAt: admin.created_at,
            updatedAt: admin.updated_at
          })),
          isInMemoryMode: false,
          isSupabaseMode: true
        })
      } catch (dbError) {
        console.error('[Admins API] Database error:', dbError)
      }
    }
    
    // Fall back to dev admin
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
      isInMemoryMode: true,
      isSupabaseMode: false
    })
    
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
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        // Explicit check for service role key to give a clear error message
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
          return NextResponse.json(
            { success: false, error: 'Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is missing. Check your .env.local file.' },
            { status: 500 }
          )
        }

        // Check if admin with this email already exists
        const existingAdmin = await adminsDb.getByEmail(email)
        if (existingAdmin) {
          return NextResponse.json(
            { success: false, error: 'An admin with this email already exists' },
            { status: 409 }
          )
        }
        
        // Normalize and validate role
        const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : 'admin'
        const allowedRoles = ['admin', 'editor', 'super_admin']
        if (!allowedRoles.includes(normalizedRole)) {
          return NextResponse.json(
            { success: false, error: `Invalid role "${normalizedRole}". Must be admin, editor, or super_admin` },
            { status: 400 }
          )
        }
        
        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10)

        const insertData = {
          email: email.toLowerCase().trim(),
          name: name.trim(),
          role: normalizedRole,
          is_active: true,
          password_hash: hashedPassword
        }
        
        console.log('[Admins API] Creating admin with data:', insertData)
        
        // Create new admin in Supabase
        const newAdmin = await adminsDb.create(insertData)
        
        return NextResponse.json({
          success: true,
          message: 'Admin created successfully',
          admin: {
            _id: newAdmin.id,
            email: newAdmin.email,
            name: newAdmin.name,
            role: newAdmin.role,
            createdAt: newAdmin.created_at
          },
          isSupabaseMode: true
        }, { status: 201 })
        
      } catch (dbError: any) {
        console.error('[Admins API] Database error:', dbError)
        let errorMessage: string
        if (dbError instanceof Error) {
          errorMessage = dbError.message
        } else if (typeof dbError === 'object' && dbError !== null) {
          // Supabase PostgREST errors are objects with message/code/details
          errorMessage = dbError.message || dbError.error_description || dbError.error || JSON.stringify(dbError)
        } else {
          errorMessage = String(dbError)
        }
        return NextResponse.json(
          { success: false, error: `Failed to create admin in database: ${errorMessage}` },
          { status: 500 }
        )
      }
    }
    
    // Fall back to error when Supabase not configured
    return NextResponse.json(
      { success: false, error: 'Database not available. Please configure Supabase to create admin users.' },
      { status: 503 }
    )
    
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create admin' },
      { status: 500 }
    )
  }
}

