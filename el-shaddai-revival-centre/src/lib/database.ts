/**
 * Database Connection Module
 *
 * This module provides database connectivity information.
 * The actual database operations are handled by src/lib/db.ts
 *
 * To enable Supabase:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Add these environment variables to .env.local:
 *    - NEXT_PUBLIC_SUPABASE_URL=your-project-url
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 *    - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 * 3. Run the SQL schema from SUPABASE_SCHEMA.md in Supabase SQL Editor
 */

import { isSupabaseConfigured } from './supabase'
import { getSupabaseAdminAsync } from './supabase'

// Cache the connection check to avoid repeated pings
let _connectionStatus: boolean | null = null
let _lastConnectionCheck: number = 0
const CONNECTION_CACHE_MS = 30_000 // 30 seconds

/**
 * Connect to database - verifies Supabase is actually reachable
 */
async function connectDB(): Promise<boolean> {
  // Return cached result if recent
  const now = Date.now()
  if (_connectionStatus !== null && (now - _lastConnectionCheck) < CONNECTION_CACHE_MS) {
    return _connectionStatus
  }

  if (process.env.NODE_ENV === 'production' && !isSupabaseConfigured()) {
    throw new Error(
      '❌ Supabase env vars missing in production. Add to .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured - using limited mode (dev only)')
    _connectionStatus = false
    _lastConnectionCheck = now
    return false
  }

  // Actually verify the connection by making a lightweight query
  try {
    const admin = await getSupabaseAdminAsync()
    if (!admin) {
      console.warn('⚠️ Supabase admin client could not be created')
      _connectionStatus = false
      _lastConnectionCheck = now
      return false
    }

    // Try a simple health check query (select 1 equivalent)
    const { error } = await admin.from('admins').select('count', { count: 'exact', head: true })

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found (table doesn't exist), which is OK for connection check
      console.warn('⚠️ Supabase connection test failed:', error.message)
      _connectionStatus = false
      _lastConnectionCheck = now
      return false
    }

    console.log('✅ Supabase is connected and ready')
    _connectionStatus = true
    _lastConnectionCheck = now
    return true
  } catch (err) {
    console.warn('⚠️ Supabase connection test threw:', err instanceof Error ? err.message : err)
    _connectionStatus = false
    _lastConnectionCheck = now
    return false
  }
}

/**
 * Check if database connection is available and ready
 */
export async function isDatabaseConnected(): Promise<boolean> {
  return connectDB()
}

/**
 * Get database configuration status
 */
export function getDatabaseStatus() {
  const configured = isSupabaseConfigured()
  return {
    connected: _connectionStatus ?? configured,
    ready: _connectionStatus ?? configured,
    connecting: false,
    retries: 0,
    state: configured ? 'supabase' : 'limited',
    config: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  }
}

export default connectDB

