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

import { isSupabaseConfigured, getSupabaseConfig } from './supabase'

/**
 * Connect to database - returns connection status
 */
async function connectDB(): Promise<boolean> {
  const config = getSupabaseConfig()
  
  if (config.isConfigured) {
    console.log('✅ Supabase is configured and ready')
    return true
  } else {
    console.log('⚠️ Using in-memory storage (Supabase not configured)')
    console.log('To enable Supabase, add the following to .env.local:')
    console.log('  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
    console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
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
  const config = getSupabaseConfig()
  return {
    connected: config.isConfigured,
    ready: config.isConfigured,
    connecting: false,
    retries: 0,
    state: config.isConfigured ? 'supabase' : 'in-memory',
    config: {
      url: config.url,
      hasAnonKey: config.hasAnonKey,
      hasServiceKey: config.hasServiceKey
    }
  }
}

export default connectDB

