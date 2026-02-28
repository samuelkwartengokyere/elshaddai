import { NextRequest, NextResponse } from 'next/server'
import { adminsDb, isDbConfigured } from '@/lib/db'
import { getCurrentAdmin, generateToken, setAuthCookie } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const admin = await adminsDb.getById(id)
        
        if (!admin) {
          return NextResponse.json(
            { success: false, error: 'Admin not found' },
            { status: 404 }
          )
        }
        
        return NextResponse.json({
          success: true,
          admin: {
            _id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            profile_image: admin.profile_image,
            createdAt: admin.created_at,
            updatedAt: admin.updated_at
          },
          isSupabaseMode: true
        })
      } catch (dbError) {
        console.error('[Admin API] Database error:', dbError)
      }
    }
    
    // Fall back to error when Supabase not configured
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    )
    
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
    
    const currentAdmin = getCurrentAdmin(request)
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if updating own profile
    const isOwnProfile = currentAdmin.adminId === id
    const isSuperAdmin = currentAdmin.role === 'super_admin'
    
    // Only super_admin can update other admins, but any admin can update their own profile
    if (!isOwnProfile && !isSuperAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only update your own profile' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { name, role, profile_image } = body
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const existingAdmin = await adminsDb.getById(id)
        
        if (!existingAdmin) {
          return NextResponse.json(
            { success: false, error: 'Admin not found' },
            { status: 404 }
          )
        }
        
        // Prevent modifying super_admin role
        if (existingAdmin.role === 'super_admin' && role && role !== 'super_admin') {
          return NextResponse.json(
            { success: false, error: 'Cannot change super_admin role' },
            { status: 403 }
          )
        }
        
        // Update fields
        const updateData: Partial<{
          name: string
          role: string
          profile_image: string
        }> = {}
        
        if (name) updateData.name = name
        if (role && existingAdmin.role !== 'super_admin') updateData.role = role
        if (profile_image !== undefined) updateData.profile_image = profile_image
        
        const updatedAdmin = await adminsDb.update(id, updateData)
        
        // Generate new token if updating own profile
        if (isOwnProfile) {
          const newName = updatedAdmin.name
          const newProfileImage = updatedAdmin.profile_image || ''
          
          const token = generateToken({
            adminId: updatedAdmin.id,
            email: updatedAdmin.email,
            role: updatedAdmin.role,
            name: newName,
            profileImage: newProfileImage
          })
          
          const response = NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            admin: {
              _id: updatedAdmin.id,
              email: updatedAdmin.email,
              name: updatedAdmin.name,
              role: updatedAdmin.role,
              profile_image: updatedAdmin.profile_image,
              createdAt: updatedAdmin.created_at
            }
          })
          
          const cookieResponse = setAuthCookie(token, 'Profile updated successfully')
          const cookies = cookieResponse.headers.get('set-cookie')
          if (cookies) {
            response.headers.set('set-cookie', cookies)
          }
          
          return response
        }
        
        return NextResponse.json({
          success: true,
          message: 'Admin updated successfully',
          admin: {
            _id: updatedAdmin.id,
            email: updatedAdmin.email,
            name: updatedAdmin.name,
            role: updatedAdmin.role,
            profile_image: updatedAdmin.profile_image,
            createdAt: updatedAdmin.created_at
          }
        })
        
      } catch (dbError) {
        console.error('[Admin API] Database error:', dbError)
        return NextResponse.json(
          { success: false, error: 'Failed to update admin in database' },
          { status: 500 }
        )
      }
    }
    
    // Dev mode fallback - allow profile updates without database
    const newName = name || currentAdmin.name || currentAdmin.email.split('@')[0]
    const newProfileImage = profile_image || currentAdmin.profileImage || ''
    
    const token = generateToken({
      adminId: currentAdmin.adminId,
      email: currentAdmin.email,
      role: currentAdmin.role,
      name: newName,
      profileImage: newProfileImage
    })
    
    const response = NextResponse.json({
      success: true,
      message: 'Profile updated successfully (dev mode)',
      admin: {
        _id: currentAdmin.adminId,
        email: currentAdmin.email,
        name: newName,
        role: currentAdmin.role,
        profile_image: newProfileImage
      },
      isInMemoryMode: true
    })
    
    const cookieResponse = setAuthCookie(token, 'Profile updated successfully (dev mode)')
    const cookies = cookieResponse.headers.get('set-cookie')
    if (cookies) {
      response.headers.set('set-cookie', cookies)
    }
    
    return response
    
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
    
    // Try Supabase first
    const supabaseConfigured = isDbConfigured()
    
    if (supabaseConfigured) {
      try {
        const existingAdmin = await adminsDb.getById(id)
        
        if (!existingAdmin) {
          return NextResponse.json(
            { success: false, error: 'Admin not found' },
            { status: 404 }
          )
        }
        
        // Cannot delete super_admin
        if (existingAdmin.role === 'super_admin') {
          return NextResponse.json(
            { success: false, error: 'Cannot delete super admin account' },
            { status: 403 }
          )
        }
        
        await adminsDb.delete(id)
        
        return NextResponse.json({
          success: true,
          message: 'Admin deleted successfully'
        })
        
      } catch (dbError) {
        console.error('[Admin API] Database error:', dbError)
        return NextResponse.json(
          { success: false, error: 'Failed to delete admin in database' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Database not available' },
      { status: 503 }
    )
    
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete admin' },
      { status: 500 }
    )
  }
}

