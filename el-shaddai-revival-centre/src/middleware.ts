import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { parseMaintenanceEnabled, parseMaintenanceMessage } from '@/lib/maintenance'

// Define protected and public routes
const protectedRoutes = ['/admin', '/financial-report']
const publicRoutes = ['/admin/login', '/admin/api/auth/login', '/admin/api/auth/logout', '/admin/api/auth/refresh', '/maintenance']

// Cookie name for auth token
const AUTH_COOKIE = 'admin_auth_token'

// JWT secret - must match the one in lib/auth.ts
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// Create a secret key for jose
const secretKey = new TextEncoder().encode(JWT_SECRET)

interface JWTPayload {
  adminId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

interface MaintenanceState {
  enabled: boolean
  message: string
}

// Verify JWT token using jose (works in Edge runtime)
async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    console.log('[Auth Debug] Token decoded successfully:', { adminId: payload.adminId, email: payload.email, role: payload.role })
    return payload as unknown as JWTPayload
  } catch (error) {
    const jwtError = error as { message?: string; code?: string }
    console.error('[Auth Debug] Token verification failed:', {
      message: jwtError.message,
      code: jwtError.code
    })
    return null
  }
}

// Get token from cookies header - more reliable for Turbopack
function getTokenFromCookies(request: NextRequest): string | null {
  // Try to get from cookies header first
  const cookieHeader = request.headers.get('cookie')
  if (cookieHeader) {
    console.log('[Auth Debug] Cookie header present, length:', cookieHeader.length)
    const cookies = cookieHeader.split(';').map(c => c.trim())
    for (const cookie of cookies) {
      const [name, ...valueParts] = cookie.split('=')
      if (name === AUTH_COOKIE) {
        const token = valueParts.join('=')
        console.log('[Auth Debug] Found token in cookies, length:', token.length)
        return token
      }
    }
  } else {
    console.log('[Auth Debug] No cookie header present')
  }

  // Fallback: try Next.js cookies API
  try {
    const token = request.cookies.get(AUTH_COOKIE)?.value || null
    console.log('[Auth Debug] Next.js cookies API result:', token ? `token present (${token.length})` : 'no token')
    return token
  } catch (error) {
    console.log('[Auth Debug] Next.js cookies API failed:', error)
    return null
  }
}

async function fetchMaintenanceViaSupabaseRest(): Promise<MaintenanceState | undefined> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const key = serviceKey || anonKey
  if (!supabaseUrl || !key) {
    return undefined
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/settings?key=eq.site_settings&select=value&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Accept: 'application/json'
        },
        cache: 'no-store'
      }
    )

    if (!res.ok) {
      console.error('[Maintenance Mode] Supabase REST:', res.status, await res.text().catch(() => ''))
      return undefined
    }

    const rows = (await res.json()) as { value?: unknown }[]
    if (!Array.isArray(rows) || rows.length === 0) {
      return { enabled: false, message: '' }
    }

    const raw = rows[0]?.value
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
      return { enabled: false, message: '' }
    }

    const v = raw as Record<string, unknown>
    return {
      enabled: parseMaintenanceEnabled(v.maintenanceMode),
      message: parseMaintenanceMessage(v.maintenanceMessage)
    }
  } catch (error) {
    console.error('[Maintenance Mode] Supabase REST fetch failed:', error)
    return undefined
  }
}

async function getPersistentMaintenanceMode(request: NextRequest): Promise<MaintenanceState> {
  const fromRest = await fetchMaintenanceViaSupabaseRest()
  if (fromRest !== undefined) {
    return fromRest
  }

  try {
    const url = new URL('/api/maintenance-status', request.nextUrl.origin)
    url.searchParams.set('_ts', `${Date.now()}`)
    const response = await fetch(url.toString(), {
      headers: {
        'x-internal-maintenance-check': '1'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      return { enabled: false, message: '' }
    }

    const data = (await response.json()) as { maintenanceMode?: unknown; maintenanceMessage?: unknown }
    return {
      enabled: parseMaintenanceEnabled(data?.maintenanceMode),
      message: parseMaintenanceMessage(data?.maintenanceMessage)
    }
  } catch (error) {
    console.error('[Maintenance Mode] Failed maintenance-status fallback:', error)
    return { enabled: false, message: '' }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow internal status checks without auth/maintenance redirects to avoid recursion.
  if (request.headers.get('x-internal-maintenance-check') === '1' || pathname === '/api/maintenance-status') {
    return NextResponse.next()
  }
  
  // Get auth token from cookies - using header parsing for reliability
  const token = getTokenFromCookies(request)
  
  // Verify token if present (async function for jose)
  const decoded = token ? await verifyToken(token) : null
  const isValidToken = decoded !== null
  
  // Determine route types
  const isLoginPage = pathname === '/admin/login'
  const isAdminApiRoute = pathname.startsWith('/admin/api')
  const isApiRoute = pathname.startsWith('/api')
  const isPublicApiRoute = publicRoutes.some(route => pathname.startsWith(route))
const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route)) && !isPublicApiRoute
  const isMaintenancePage = pathname === '/maintenance'
  const isAdminRoute = pathname.startsWith('/admin')
  
  // Check if user is admin (super_admin, admin, or editor)
  const isAdminUser = isValidToken && (decoded?.role === 'super_admin' || decoded?.role === 'admin' || decoded?.role === 'editor')
  
  // Check maintenance mode
  const maintenance = await getPersistentMaintenanceMode(request)
  
  // Debug logging
  console.log(`[Auth Middleware] ${pathname} | Auth: ${isValidToken} | Token: ${token ? 'present' : 'missing'} | Maintenance: ${maintenance.enabled}`)

  if (!maintenance.enabled && pathname === '/maintenance') {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // === MAINTENANCE MODE CHECK ===
  // If maintenance mode is enabled:
  // - Allow access to maintenance page
  // - Allow access to admin routes ONLY for admin users
  // - Block ALL other routes (redirect to maintenance page)
  if (maintenance.enabled) {
    // Always allow access to the maintenance page itself
    if (isMaintenancePage) {
      return NextResponse.next()
    }

    // Authenticated admin users can access only admin/system routes while
    // maintenance is active. Public pages should still show maintenance.
    if (isAdminUser && (isAdminRoute || isApiRoute)) {
      return NextResponse.next()
    }
    
    // Allow admin routes only for admin users
    if (isAdminRoute) {
      if (!isPublicApiRoute) {
        // Non-admin users trying to access admin routes -> redirect to login
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
      }
    }
    
    // Block all other routes - redirect to maintenance page
    if (!isAdminRoute && !isPublicApiRoute) {
      const maintenanceUrl = new URL('/maintenance', request.url)
      if (maintenance.message) {
        maintenanceUrl.searchParams.set('message', maintenance.message)
      }
      return NextResponse.redirect(maintenanceUrl)
    }
  }
  
  // === AUTHENTICATED USER ON LOGIN PAGE ===
  // Redirect logged-in users away from login page
  if (isLoginPage && isValidToken) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  
  // === UNAUTHENTICATED USER TRYING TO ACCESS PROTECTED ROUTE ===
  // Redirect to login if not authenticated
if (isProtectedRoute && !isAdminUser) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // === UNAUTHENTICATED USER TRYING TO ACCESS ADMIN API ===
  // Return 401 for unauthorized API requests
  if (isAdminApiRoute && !isPublicApiRoute && !isValidToken) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - Please log in' },
      { status: 401 }
    )
  }
  
  return NextResponse.next()
}

// Configure which paths the middleware runs on
// Include all routes to handle maintenance mode for entire site
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}

