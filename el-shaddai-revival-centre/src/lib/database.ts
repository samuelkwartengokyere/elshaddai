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

// Inline config check - avoid import issues with Turbopack static analysis
import { isSupabaseConfigured } from './supabase'

// Removed hardcoded config - use src/lib/supabase.ts only
// Production requires NEXT_PUBLIC_SUPABASE_URL + keys in .env.local

/**
 * Connect to database - returns connection status
 */
async function connectDB(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production' && !isSupabaseConfigured()) {
    throw new Error('❌ Supabase env vars missing in production. Add to .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY')
  }
  
  if (isSupabaseConfigured()) {
    console.log('✅ Supabase is configured and ready')
    return true
  } else {
    console.warn('⚠️ Supabase not configured - using limited mode (dev only)')
    return false
  }
}

/**
 * Check if database connection is available and ready
 */
export async function isDatabaseConnected(): Promise<boolean> {
  return isSupabaseConfigured()
}

/**
 * Get database configuration status
 */
export function getDatabaseStatus() {
  const connected = isSupabaseConfigured()
  return {
    connected,
    ready: connected,
    connecting: false,
    retries: 0,
    state: connected ? 'supabase' : 'limited',
    config: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  }
}

export default connectDB