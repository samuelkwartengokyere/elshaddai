import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Admin from '@/models/Admin'
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
    
    try {
      const dbConnection = await connectDB()
      
      if (dbConnection) {
        const admin = await Admin.findById(adminId).select('email role isActive').lean()
        
        if (!admin) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Admin account not found' 
            },
            { status: 401 }
          )
        }
        
        if (!admin.isActive) {
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
      } else {
        // No database - use token info for dev mode
        console.log('⚠️  No database connection, using dev mode token refresh')
      }
    } catch (dbError) {
      console.error('Database error during token refresh:', dbError)
      // Continue with limited info if database fails
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

