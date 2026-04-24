import { NextRequest, NextResponse } from 'next/server'
import { isBucketPublic, BUCKETS } from '@/lib/storage'
import { isDbConfigured } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const supabaseConfigured = isDbConfigured()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    if (!supabaseConfigured) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured',
        env: {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        }
      }, { status: 503 })
    }

    // Check bucket statuses
    const bucketStatuses: Record<string, { exists: boolean; public: boolean }> = {}
    
    for (const [key, name] of Object.entries(BUCKETS)) {
      try {
        const isPublic = await isBucketPublic(name)
        bucketStatuses[name] = {
          exists: true,
          public: isPublic
        }
      } catch (err) {
        bucketStatuses[name] = {
          exists: false,
          public: false
        }
      }
    }

    // Generate test URLs
    const testUrls = {
      media: `${supabaseUrl}/storage/v1/object/public/media/test.txt`,
      avatars: `${supabaseUrl}/storage/v1/object/public/avatars/test.txt`,
    }

    return NextResponse.json({
      success: true,
      supabaseUrl,
      buckets: bucketStatuses,
      testUrls,
      issues: Object.entries(bucketStatuses)
        .filter(([_, status]) => !status.public)
        .map(([name]) => `Bucket "${name}" is not public. Images will not display.`),
      fixInstructions: [
        '1. Go to Supabase Dashboard > Storage > Buckets',
        '2. Click on each bucket and toggle "Public bucket" ON',
        '3. Restart your Next.js dev server',
      ]
    })

  } catch (error) {
    console.error('Storage diagnostics error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to run storage diagnostics'
    }, { status: 500 })
  }
}

