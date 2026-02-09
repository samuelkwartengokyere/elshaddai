import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import Admin from '@/models/Admin'
import { 
  setAuthCookies, 
  generateToken, 
  generateRefreshToken, 
  getCurrentAdmin,
  verifyRefreshToken
} from '@/lib/auth'

// Error codes for better debugging
export const ERROR_CODES = {
  MISSING_CREDENTIALS: 'AUTH_001',
  INVALID_CREDENTIALS: 'AUTH_002',
  ACCOUNT_DEACTIVATED: 'AUTH_003',
  DATABASE_ERROR: 'AUTH_004',
  TOKEN_ERROR: 'AUTH_005',
  INTERNAL_ERROR: 'AUTH_500'
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// Rate limiting store (in production, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

// Clear rate limiter on server start (development)
console.log('🗑️  Rate limiter initialized - attempts cleared on restart')

/**
 * Check and update login attempts for rate limiting
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5
  
  // In development mode, be more lenient - only 3 failed attempts per minute per IP
  const isDevMode = !process.env.MONGODB_URI || process.env.NODE_ENV === 'development'
  const effectiveMaxAttempts = isDevMode ? 10 : maxAttempts
  const effectiveWindowMs = isDevMode ? 60 * 1000 : windowMs
  
  const attempt = loginAttempts.get(ip)
  
  if (!attempt || now - attempt.lastAttempt > effectiveWindowMs) {
    // New window - reset count
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    console.log(`🔐 Rate limit: New window for ${ip}, attempts reset`)
    return { allowed: true, remaining: effectiveMaxAttempts - 1 }
  }
  
  if (attempt.count >= effectiveMaxAttempts) {
    console.log(`🔐 Rate limit: Blocked ${ip}, max attempts reached (${attempt.count})`)
    return { allowed: false, remaining: 0 }
  }
  
  // Increment count
  attempt.count++
  attempt.lastAttempt = now
  console.log(`🔐 Rate limit: ${ip} now has ${attempt.count}/${effectiveMaxAttempts} attempts`)
  return { allowed: true, remaining: effectiveMaxAttempts - attempt.count }
}

/**
 * Clean old rate limit entries
 */
function cleanupRateLimit() {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000
  
  for (const [ip, attempt] of loginAttempts.entries()) {
    if (now - attempt.lastAttempt > windowMs) {
      loginAttempts.delete(ip)
    }
  }
}

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimit, 60 * 60 * 1000)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown'
  
  try {
    const body = await request.json().catch(() => ({}))
    const { email, password } = body
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email and password are required',
          code: ERROR_CODES.MISSING_CREDENTIALS
        },
        { status: 400 }
      )
    }
    
    // Check rate limit
    const rateLimit = checkRateLimit(clientIp)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. Please try again in 15 minutes.',
          code: ERROR_CODES.INVALID_CREDENTIALS
        },
        { status: 429 }
      )
    }
    
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()
    
    // Development mode: Check for hardcoded credentials first
    const isDevMode = !process.env.MONGODB_URI || process.env.NODE_ENV === 'development'
    
    if (isDevMode && normalizedEmail === 'admin@elshaddai.com' && password === 'admin123') {
      console.log('🔐 Development mode login successful with hardcoded credentials')
      
      const token = generateToken({
        adminId: 'dev-admin-id',
        email: normalizedEmail,
        role: 'super_admin'
      })
      
      const refreshToken = generateRefreshToken('dev-admin-id')
      
      return setAuthCookies(token, refreshToken, 'Login successful (development mode)')
    }
    
    // Try database connection for production or when admin exists
    let dbConnection = null
    try {
      dbConnection = await connectDB()
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      // If no database and not dev mode, credentials fail
      if (!isDevMode) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Unable to verify credentials. Please try again later.',
            code: ERROR_CODES.DATABASE_ERROR
          },
          { status: 503 }
        )
      }
    }
    
    if (!dbConnection) {
      // No database connection - only dev mode credentials work
      console.log('⚠️  No database connection, only dev mode credentials accepted')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid credentials',
          code: ERROR_CODES.INVALID_CREDENTIALS
        },
        { status: 401 }
      )
    }
    
    // Find admin by email
    const admin = await Admin.findOne({ email: normalizedEmail })
    
    if (!admin) {
      console.log(`🔐 Login failed: No admin found for ${normalizedEmail}`)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid credentials',
          code: ERROR_CODES.INVALID_CREDENTIALS
        },
        { status: 401 }
      )
    }
    
    // Check if admin is active
    if (!admin.isActive) {
      console.log(`🔐 Login failed: Account deactivated for ${normalizedEmail}`)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Account is deactivated. Please contact a super administrator.',
          code: ERROR_CODES.ACCOUNT_DEACTIVATED
        },
        { status: 403 }
      )
    }
    
    // Verify password with error handling
    let isMatch = false
    try {
      isMatch = await admin.comparePassword(password)
    } catch (bcryptError) {
      console.error('Password comparison error:', bcryptError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'An error occurred during authentication. Please try again.',
          code: ERROR_CODES.INTERNAL_ERROR
        },
        { status: 500 }
      )
    }
    
    if (!isMatch) {
      console.log(`🔐 Login failed: Invalid password for ${normalizedEmail}`)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid credentials',
          code: ERROR_CODES.INVALID_CREDENTIALS
        },
        { status: 401 }
      )
    }
    
    // Update last login
    try {
      admin.lastLogin = new Date()
      await admin.save()
    } catch (updateError) {
      // Non-critical error - login still succeeds
      console.warn('Failed to update lastLogin:', updateError)
    }
    
    // Generate tokens
    const token = generateToken({
      adminId: admin._id.toString(),
      email: admin.email,
      role: admin.role
    })
    
    const refreshToken = generateRefreshToken(admin._id.toString())
    
    const duration = Date.now() - startTime
    console.log(`🔐 Login successful for ${normalizedEmail} (${duration}ms)`)
    
    // Set cookies and return response
    return setAuthCookies(token, refreshToken, 'Login successful')
    
  } catch (error) {
    console.error('Login error:', error)
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request body',
          code: ERROR_CODES.INTERNAL_ERROR
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error. Please try again later.',
        code: ERROR_CODES.INTERNAL_ERROR
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = getCurrentAdmin(request)
    
    if (!admin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Not authenticated',
          code: ERROR_CODES.TOKEN_ERROR
        },
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
      { 
        success: false, 
        error: 'Internal server error',
        code: ERROR_CODES.INTERNAL_ERROR
      },
      { status: 500 }
    )
  }
}

