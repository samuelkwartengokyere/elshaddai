/**
 * Supabase Client Configuration
 * Next.js 15+ App Router compatible
 * Uses @supabase/ssr for browser/server client handling
 */

import { createServerClient, createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type CookieOptions } from '@supabase/ssr'

// Environment configuration
const getSupabaseConfig = (): {
  url: string | undefined
  anonKey: string | undefined
  serviceKey: string | undefined
  isConfigured: boolean
} => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  const isConfigured = !!(url && anonKey)

  if (!isConfigured) {
    console.warn('⚠️ Supabase not configured. Check .env.local')
  } else {
    console.log('✅ Supabase is configured and ready')
  }

  return { url, anonKey, serviceKey, isConfigured }
}

// Check configuration
export const isSupabaseConfigured = () => getSupabaseConfig().isConfigured

// Server-side admin client (service role - bypass RLS)
// This should be called within async functions
export const getSupabaseAdmin = async () => {
  const config = getSupabaseConfig()
  if (!config.serviceKey || !config.url) return null

  return createServerClient(
    config.url,
    config.serviceKey,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.set(name, value, options)
        },
        async remove(name: string) {
          const cookieStore = await cookies()
          cookieStore.delete(name)
        },
      },
      auth: {
        flowType: 'pkce',
      },
    }
  )
}

// Server-side client factory (user auth - respects RLS)
export async function createServerSupabase() {
  const config = getSupabaseConfig()
  if (!config.isConfigured) {
    throw new Error('Supabase server client not configured')
  }

  return createServerClient(
    config.url!,
    config.anonKey!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.set(name, value, options)
        },
        async remove(name: string) {
          const cookieStore = await cookies()
          cookieStore.delete(name)
        },
      },
      auth: {
        flowType: 'pkce',
      },
    }
  )
}

// Browser client factory (synchronous - for client components)
export function createBrowserSupabaseClient() {
  const config = getSupabaseConfig()
  if (!config.isConfigured) {
    throw new Error('Supabase browser client not configured')
  }

  return createBrowserClient(
    config.url!,
    config.anonKey!,
    {
      auth: {
        flowType: 'pkce',
      },
    }
  )
}

// Route handler client (cookies + headers)
export async function createRouteHandlerClient() {
  const cookieStore = await cookies()
  const config = getSupabaseConfig()
  if (!config.isConfigured) {
    throw new Error('Supabase route handler client not configured')
  }

  return createServerClient(
    config.url!,
    config.anonKey!,
    {
      cookies: {
        async get(name: string) {
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options)
        },
        async remove(name: string) {
          cookieStore.delete(name)
        },
      },
    }
  )
}

// For backward compatibility - create a promise-based supabaseAdmin
export const supabaseAdmin = getSupabaseAdmin()

