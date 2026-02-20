import { createClient } from '@supabase/supabase-js'

// Supabase client configuration
// Replace these with your actual Supabase project credentials
// Get these from: https://app.supabase.com/project/_/settings/api

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

// Public client (for client-side operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Admin client (for server-side operations with elevated privileges)
// Use this only in server contexts (API routes, server actions)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return (
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key' &&
    supabaseServiceKey !== 'your-service-role-key'
  )
}

// Get configuration status
export function getSupabaseConfig() {
  return {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey && supabaseAnonKey !== 'your-anon-key',
    hasServiceKey: !!supabaseServiceKey && supabaseServiceKey !== 'your-service-role-key',
    isConfigured: isSupabaseConfigured(),
  }
}

export default supabase

