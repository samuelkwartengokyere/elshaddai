import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = '7d'
const COOKIE_NAME = 'admin_auth_token'

export interface JWTPayload {
  adminId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// Validate JWT_SECRET at module load time
function validateEnvironment(): void {
  if (!process.env.JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET not set in environment variables!')
    console.warn('⚠️  Using default secret which is NOT secure for production!')
    console.warn('⚠️  Please set JWT_SECRET in your .env file for production use.')
  } else if (process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
    console.warn('⚠️  WARNING: JWT_SECRET appears to be the default value!')
    console.warn('⚠️  Please change JWT_SECRET to a unique, secure value.')
  } else {
    console.log('✅ JWT_SECRET is configured properly')
  }
}

// Run validation on module load
validateEnvironment()

/**
 * Generate a JWT token for an admin
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN
  }
  return jwt.sign(payload, JWT_SECRET, options)
}

/**
 * Generate a refresh token with longer expiration
 */
export function generateRefreshToken(adminId: string): string {
  return jwt.sign(
    { adminId, type: 'refresh' },
    JWT_SECRET + '_refresh',
    { expiresIn: '30d' }
  )
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): { adminId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET + '_refresh') as { adminId: string; type: string }
    if (decoded.type !== 'refresh') return null
    return { adminId: decoded.adminId }
  } catch (error) {
    console.error('Refresh token verification failed:', error)
    return null
  }
}

/**
 * Check if token is expired and get time remaining
 */
export function getTokenStatus(token: string): { valid: boolean; expired: boolean; timeRemaining?: number } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true }) as JwtPayload
    const now = Math.floor(Date.now() / 1000)
    
    if (decoded.exp && decoded.exp < now) {
      return { valid: false, expired: true, timeRemaining: 0 }
    }
    
    const timeRemaining = decoded.exp ? decoded.exp - now : undefined
    return { valid: true, expired: false, timeRemaining }
  } catch (error) {
    return { valid: false, expired: true }
  }
}

/**
 * Create a response with the auth cookie set
 */
export function createAuthResponse(
  data: object,
  message?: string,
  status: number = 200
): NextResponse {
  const response = NextResponse.json({
    success: true,
    ...(message && { message }),
    ...data
  }, { status })

  return response
}

/**
 * Create response with auth cookie for login
 */
export function setAuthCookie(token: string, message?: string): NextResponse {
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  
  const response = NextResponse.json({
    success: true,
    message: message || 'Login successful',
    user: verifyToken(token)
  }, {
    status: 200
  })

  // Use sameSite: 'lax' which works for both development and production
  // 'none' requires secure: true which doesn't work in local development
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })

  return response
}

/**
 * Create response with auth and refresh cookies
 */
export function setAuthCookies(token: string, refreshToken: string, message?: string): NextResponse {
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  
  const response = NextResponse.json({
    success: true,
    message: message || 'Login successful',
    user: verifyToken(token)
  }, {
    status: 200
  })

  // Use sameSite: 'lax' which works for both development and production
  // 'none' requires secure: true which doesn't work in local development
  // Set auth token (7 days)
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  })

  // Set refresh token (30 days)
  response.cookies.set('admin_refresh_token', refreshToken, {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/'
  })

  return response
}

/**
 * Clear the auth cookie
 */
export function clearAuthCookie(message?: string): NextResponse {
  const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  
  const response = NextResponse.json({
    success: true,
    message: message || 'Logged out successfully'
  }, {
    status: 200
  })

  // Use sameSite: 'lax' which works for both development and production
  // Clear auth token
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })

  // Clear refresh token
  response.cookies.set('admin_refresh_token', '', {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })

  return response
}

/**
 * Get auth token from cookies
 */
export function getAuthToken(request: Request): string | null {
  // Try to get from cookies header first
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    
    if (cookies[COOKIE_NAME]) {
      return cookies[COOKIE_NAME]
    }
  }

  // Fallback: try to get from cookies directly (for Next.js 14+)
  if ('cookies' in request) {
    try {
      return (request as any).cookies.get(COOKIE_NAME)?.value || null
    } catch {
      return null
    }
  }

  return null
}

/**
 * Get refresh token from cookies
 */
export function getRefreshToken(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    
    return cookies['admin_refresh_token'] || null
  }

  if ('cookies' in request) {
    try {
      return (request as any).cookies.get('admin_refresh_token')?.value || null
    } catch {
      return null
    }
  }

  return null
}

/**
 * Get current admin from request
 */
export function getCurrentAdmin(request: Request): JWTPayload | null {
  const token = getAuthToken(request)
  if (!token) return null

  return verifyToken(token)
}

export { JWT_SECRET, COOKIE_NAME }

