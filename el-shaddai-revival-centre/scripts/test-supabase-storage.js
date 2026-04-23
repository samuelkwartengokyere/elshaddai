#!/usr/bin/env node
/**
 * Supabase Storage Diagnostic Script
 * Run: node scripts/test-supabase-storage.js
 * 
 * This script tests if your Supabase Storage buckets are properly configured
 */

const fs = require('fs');
const path = require('path');

// Load env vars from .env.local if it exists
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !process.env[key.trim()]) {
      process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
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

console.log('🔍 Supabase Storage Diagnostic');
console.log('================================');
console.log('URL:', supabaseUrl);
console.log('');

// Test bucket accessibility
async function testBucket(bucketName) {
  console.log(`\n📦 Testing bucket: ${bucketName}`);
  console.log('--------------------------------');
  
  // 1. Check if bucket exists
  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket/${bucketName}`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Bucket exists');
      console.log('   Public:', data.public ? '✅ Yes' : '❌ No (MUST BE PUBLIC!)');
      console.log('   File size limit:', data.file_size_limit || 'Default');
      console.log('   Allowed mime types:', data.allowed_mime_types?.join(', ') || 'All');
      
      if (!data.public) {
        console.log('\n⚠️  WARNING: Bucket is NOT public!');
        console.log('   Images will NOT display on the website.');
        console.log('   Fix: Go to Supabase Dashboard > Storage > Buckets > ' + bucketName + ' > Toggle Public');
      }
    } else {
      console.log('❌ Bucket not found or error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Error checking bucket:', error.message);
  }
  
  // 2. Test public URL accessibility
  const testPublicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/test-file.txt`;
  console.log('\n🌐 Testing public URL accessibility...');
  console.log('   URL pattern:', testPublicUrl);
  
  try {
    const response = await fetch(testPublicUrl);
    if (response.status === 404) {
      console.log('✅ Public URL is accessible (404 for missing file is OK)');
    } else if (response.status === 403) {
      console.log('❌ Public URL returned 403 Forbidden');
      console.log('   The bucket is not public or RLS is blocking access.');
    } else {
      console.log(`ℹ️  Public URL returned ${response.status}`);
    }
  } catch (error) {
    console.log('❌ Error accessing public URL:', error.message);
  }
}

// Test upload a small file
async function testUpload(bucketName) {
  console.log(`\n📤 Testing upload to: ${bucketName}`);
  console.log('--------------------------------');
  
  const testContent = new Uint8Array([0x89, 0x50, 0x4E, 0x47]); // PNG magic bytes
  const testPath = `test-${Date.now()}.png`;
  
  try {
    const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${testPath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'image/png',
        'x-upsert': 'true'
      },
      body: testContent
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Upload successful');
      console.log('   Path:', data.path);
      
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${data.path}`;
      console.log('   Public URL:', publicUrl);
      
      // Clean up test file
      await fetch(`${supabaseUrl}/storage/v1/object/${bucketName}/${testPath}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${serviceKey}`
        }
      });
      console.log('🗑️  Test file cleaned up');
    } else {
      const error = await response.json();
      console.log('❌ Upload failed:', error.message || response.statusText);
    }
  } catch (error) {
    console.log('❌ Error during upload:', error.message);
  }
}

// Run tests
async function main() {
  await testBucket('media');
  await testBucket('avatars');
  
  console.log('\n\n📋 Summary & Next Steps');
  console.log('================================');
  console.log('1. Both buckets must be PUBLIC for images to display');
  console.log('2. If buckets are not public:');
  console.log('   - Go to Supabase Dashboard > Storage > Buckets');
  console.log('   - Click on each bucket and toggle "Public bucket"');
  console.log('3. CORS configuration (if images still don\'t show):');
  console.log('   - Go to Storage > Policies > CORS');
  console.log('   - Add: http://localhost:3000 (dev) and your production domain');
  console.log('4. Restart your Next.js server after any config changes');
}

main().catch(console.error);

