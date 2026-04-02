import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { 
  verifyRefreshToken, 
  generateToken, 
  generateRefreshToken,
  setAuthCookies,
  getRefreshToken
} from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie or body
    let refreshToken = getRefreshToken(request)
    
    if (!refreshToken) {
      // Try to get from request body as fallback
      try {
        const body = await request.json()
        refreshToken = body.refreshToken
      } catch {
        // No body provided
      }
    }
    
    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No refresh token provided' 
        },
        { status: 401 }
      )
    }
    
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)
    
    if (!decoded) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired refresh token' 
        },
        { status: 401 }
      )
    }
    
    const { adminId } = decoded
    
    // Try to get admin details from database
    let adminEmail = null
    let adminRole = 'admin' // Default role
    
    const supabaseAdmin = await getSupabaseAdmin();
    if (supabaseAdmin) {
      try {
        const { data: admin, error } = await supabaseAdmin
          .from('admins')
          .select('email, role, is_active')
          .eq('id', adminId)
          .single();

        if (error || !admin) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Admin account not found' 
            },
            { status: 401 }
          )
        }

        if (!admin.is_active) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Account is deactivated' 
            },
            { status: 403 }
          )
        }

        adminEmail = admin.email
        adminRole = admin.role
      } catch (dbError) {
        console.error('Database error during token refresh:', dbError)
      }
    } else {
      console.log('⚠️  No database connection, using dev mode token refresh')
    }
    
    // Generate new tokens
    const newToken = generateToken({
      adminId,
      email: adminEmail || 'dev@elshaddai.com',
      role: adminRole
    })
    
    const newRefreshToken = generateRefreshToken(adminId)
    
    // Set new cookies and return response
    return setAuthCookies(newToken, newRefreshToken, 'Token refreshed successfully')
    
  } catch (error) {
    console.error('Token refresh error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

