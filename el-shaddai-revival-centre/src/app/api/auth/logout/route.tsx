import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  // Clear auth cookies and return success response
  return clearAuthCookie('Logged out successfully')
}

export async function GET() {
  // Also support GET for logout (useful for frontend logout buttons)
  return clearAuthCookie('Logged out successfully')
}

