import jwt, { SignOptions } from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = '7d'
const COOKIE_NAME = 'admin_auth_token'

export interface JWTPayload {
  adminId: string
  email: string
  role: string
}

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
  const response = NextResponse.json({
    success: true,
    message: message || 'Login successful',
    user: verifyToken(token)
  }, {
    status: 200
  })

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })

  return response
}

/**
 * Clear the auth cookie
 */
export function clearAuthCookie(message?: string): NextResponse {
  const response = NextResponse.json({
    success: true,
    message: message || 'Logged out successfully'
  }, {
    status: 200
  })

  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=')
    acc[key] = value
    return acc
  }, {} as Record<string, string>)

  return cookies[COOKIE_NAME] || null
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

