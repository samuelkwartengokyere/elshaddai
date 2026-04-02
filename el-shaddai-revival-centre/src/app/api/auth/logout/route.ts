import { NextRequest } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
  // Clear auth cookies
  const response = clearAuthCookie('Logged out successfully')
  return response
}

