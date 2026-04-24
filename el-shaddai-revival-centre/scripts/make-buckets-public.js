#!/usr/bin/env node
/**
 * Make Supabase Storage Buckets Public
 * Run: node scripts/make-buckets-public.js
 * 
 * This script updates your Supabase Storage buckets to be publicly accessible
 * so uploaded images can be viewed on the website without authentication.
 */

const fs = require('fs');
const path = require('path');

// Load env vars from .env.local if it exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
      const key = line.slice(0, eqIndex).trim();
      const value = line.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? '✅' : '❌');
  console.error('\nPlease add these to your .env.local file');
  process.exit(1);
}

const BUCKETS = ['media', 'avatars'];

async function makeBucketPublic(bucketName) {
  console.log(`\n📦 Processing bucket: ${bucketName}`);
  console.log('--------------------------------');
  
  try {
    // First, check if bucket exists
    const getResponse = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucketName}`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (getResponse.status === 404) {
      console.log('🆕 Bucket does not exist, creating...');
      
      const createResponse = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: bucketName,
          public: true,
          file_size_limit: 52428800, // 50MB
          allowed_mime_types: ['image/*', 'video/*', 'audio/*', 'application/pdf']
        })
      });
      
      if (createResponse.ok) {
        console.log('✅ Bucket created and set to public');
      } else {
        const error = await createResponse.json();
        console.log('❌ Failed to create bucket:', error.message || createResponse.statusText);
      }
    } else if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('ℹ️  Bucket exists, public status:', data.public ? '✅ Yes' : '❌ No');
      
      if (!data.public) {
        console.log('🔓 Making bucket public...');
        
        const updateResponse = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucketName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            public: true,
            file_size_limit: 52428800,
            allowed_mime_types: ['image/*', 'video/*', 'audio/*', 'application/pdf']
          })
        });
        
        if (updateResponse.ok) {
          console.log('✅ Bucket is now public');
        } else {
          const error = await updateResponse.json();
          console.log('❌ Failed to update bucket:', error.message || updateResponse.statusText);
        }
      } else {
        console.log('✅ Bucket is already public');
      }
    } else {
      console.log('❌ Error checking bucket:', getResponse.status, getResponse.statusText);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function updateCorsConfig() {
  console.log('\n🌐 Updating CORS configuration');
  console.log('--------------------------------');
  
  // Note: CORS configuration in Supabase is typically managed through the dashboard
  // or via storage API policies. This is a best-effort attempt.
  console.log('ℹ️  CORS configuration must be updated in Supabase Dashboard:');
  console.log('   Storage > Policies > CORS');
  console.log('   Add origins: http://localhost:3000, https://your-domain.com');
}

async function main() {
  console.log('🔧 Supabase Storage Bucket Configuration');
  console.log('==========================================');
  console.log('URL:', supabaseUrl);
  
  for (const bucket of BUCKETS) {
    await makeBucketPublic(bucket);
  }
  
  await updateCorsConfig();
  
  console.log('\n✨ Done!');
  console.log('\n📋 Next steps:');
  console.log('1. Restart your Next.js dev server: npm run dev');
  console.log('2. Upload a test image in /admin/media');
  console.log('3. Check /gallery to verify images display');
  console.log('\n🧪 Run diagnostics:');
  console.log('   curl http://localhost:3000/api/diagnostics/storage');
}

main().catch(console.error);

