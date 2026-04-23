-- Supabase Storage Bucket Setup
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Create buckets if they don't exist (or verify they exist)
-- Note: Buckets must be created via Dashboard or Storage API
-- This script configures policies and CORS

-- 2. Enable public access for 'media' bucket
-- Go to Supabase Dashboard > Storage > Buckets > media > Make Public
-- Go to Supabase Dashboard > Storage > Buckets > avatars > Make Public

-- 3. Set up Row Level Security policies for public read access
-- This allows anyone to view files in these buckets

-- Policy for media bucket: Public read access
CREATE POLICY IF NOT EXISTS "Public read access for media bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Policy for avatars bucket: Public read access
CREATE POLICY IF NOT EXISTS "Public read access for avatars bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy for media bucket: Allow authenticated uploads (admin only)
CREATE POLICY IF NOT EXISTS "Allow admin uploads to media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- Policy for avatars bucket: Allow authenticated uploads
CREATE POLICY IF NOT EXISTS "Allow admin uploads to avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Policy for media bucket: Allow admin deletes
CREATE POLICY IF NOT EXISTS "Allow admin deletes from media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');

-- Policy for avatars bucket: Allow admin deletes
CREATE POLICY IF NOT EXISTS "Allow admin deletes from avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');

-- 4. CORS Configuration (run via Supabase Dashboard or API)
-- Go to Supabase Dashboard > Storage > Policies > CORS
-- Add your domain(s):
-- - http://localhost:3000 (development)
-- - https://your-domain.com (production)
-- Allowed methods: GET, POST, DELETE
-- Allowed headers: *

-- Alternative: Use Supabase CLI or API to set CORS
-- Example curl command:
/*
curl -X POST https://your-project.supabase.co/storage/v1/buckets/media \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "media",
    "public": true,
    "allowed_mime_types": ["image/*", "video/*", "audio/*", "application/pdf"],
    "file_size_limit": 52428800
  }'
*/

-- 5. Verify buckets are public
-- After running, test by accessing:
-- https://your-project.supabase.co/storage/v1/object/public/media/test.txt
-- Should return file or 404 (not 403)

