/**
 * Supabase Storage Utilities
 * Handles file uploads/downloads/deletes for media, avatars, etc.
 * Uses admin client (bypasses RLS)
 */

import { getSupabaseAdmin } from './supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

/** Upload file to specified bucket, returns public URL */
export async function uploadToBucket(
  file: File | Buffer,
  bucket: string,
  path: string,
  upsert: boolean = false
): Promise<string> {
  const supabase = await getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase admin client not available')

  // Convert File to Uint8Array if needed
  let fileData: Uint8Array
  if (file instanceof File) {
    fileData = new Uint8Array(await file.arrayBuffer())
  } else if (file instanceof Buffer) {
    fileData = new Uint8Array(file)
  } else {
    throw new Error('Invalid file type: must be File or Buffer')
  }

  const fileName = path.split('/').pop()!
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileData, {
      cacheControl: '3600',
      upsert, // Overwrite if exists
      contentType: file instanceof File ? file.type : undefined,
    })

  if (error) {
    console.error('Storage upload error:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }

  if (!data?.path) {
    throw new Error('Upload succeeded but no path returned')
  }

  // Return public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  console.log(`[Storage] Uploaded to ${bucket}/${data.path}: ${publicUrl}`)

  return publicUrl
}

/** Delete file from bucket by path */
export async function deleteFromBucket(
  bucket: string,
  path: string
): Promise<void> {
  const supabase = await getSupabaseAdmin()
  if (!supabase) throw new Error('Supabase admin client not available')

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Storage delete error:', error)
    // Not fatal if file doesn't exist
    if (!error.message.includes('not found')) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  }
}

/** Generate public URL for file path (no network call) */
export function getPublicUrl(
  bucket: string,
  path: string,
  supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

/** Check if a bucket is publicly accessible */
export async function isBucketPublic(bucket: string): Promise<boolean> {
  const supabase = await getSupabaseAdmin()
  if (!supabase) return false

  try {
    const { data, error } = await supabase.storage.getBucket(bucket)
    if (error) {
      console.error(`[Storage] Error checking bucket ${bucket}:`, error)
      return false
    }
    return data?.public ?? false
  } catch (err) {
    console.error(`[Storage] Failed to check bucket ${bucket}:`, err)
    return false
  }
}

/** Log bucket status warnings */
export async function checkBucketStatus(): Promise<void> {
  for (const bucket of Object.values(BUCKETS)) {
    const isPublic = await isBucketPublic(bucket)
    if (!isPublic) {
      console.warn(`⚠️  [Storage] Bucket "${bucket}" is NOT PUBLIC. Images will not display on the website.`)
      console.warn(`   Fix: Go to Supabase Dashboard > Storage > Buckets > ${bucket} > Toggle "Public bucket" ON`)
    } else {
      console.log(`✅ [Storage] Bucket "${bucket}" is public`)
    }
  }
}

/** List files in bucket folder */
export async function listBucketFiles(
  bucket: string,
  prefix: string = ''
): Promise<{ name: string; id: string | null }[]> {
  const supabase = await getSupabaseAdmin()
  if (!supabase) return []

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix, { limit: 100 })

  if (error) {
    console.error('List bucket error:', error)
    return []
  }

  return (data || []).map(file => ({
    name: file.name,
    id: file.id
  }))
}

/** Supported mime types for validation */
export const SUPPORTED_MIME_TYPES: Record<string, string[]> = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  document: ['application/pdf']
}

/** Max file sizes (bytes) */
export const MAX_FILE_SIZES: Record<string, number> = {
  image: 5 * 1024 * 1024, // 5MB
  video: 50 * 1024 * 1024, // 50MB
  audio: 10 * 1024 * 1024, // 10MB
  document: 10 * 1024 * 1024 // 10MB
}

export const BUCKETS = {
  MEDIA: 'media',
  AVATARS: 'avatars'
} as const

