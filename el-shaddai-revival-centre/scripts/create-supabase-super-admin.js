#!/usr/bin/env node
/**
 * Create Super Admin User in Supabase
 * Run: cd el-shaddai-revival-centre && npm i @supabase/supabase-js bcryptjs && node scripts/create-supabase-super-admin.js
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Supabase config - set in .env.local
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  console.log('Add to .env.local and rerun')
  process.exit(1)
}

const SUPER_ADMIN_EMAIL = 'admin@elshaddai.com'
const SUPER_ADMIN_PASSWORD = '@elshaddaiadmin12345'
const SUPER_ADMIN_NAME = 'Super Admin'

async function createSuperAdmin() {
  console.log('🔐 Creating/connecting Super Admin in Supabase...')

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    // Check if exists
    const { data: existing, error: checkError } = await supabase
      .from('admins')
      .select('id, email, role')
      .eq('email', SUPER_ADMIN_EMAIL)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existing) {
      console.log('👤 Super admin already exists:')
      console.log(`   Email: ${existing.email}`)
      console.log(`   Role: ${existing.role}`)
      
      // Upgrade to super_admin if needed
      if (existing.role !== 'super_admin') {
        const { error: updateError } = await supabase
          .from('admins')
          .update({ 
            role: 'super_admin',
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('email', SUPER_ADMIN_EMAIL)

        if (updateError) throw updateError
        console.log('✅ Upgraded to super_admin role')
      } else {
        console.log('✅ Already super_admin')
      }
      return
    }

    // Create new
    const passwordHash = bcrypt.hashSync(SUPER_ADMIN_PASSWORD, 12)

    const { data, error } = await supabase
      .from('admins')
      .insert({
        email: SUPER_ADMIN_EMAIL,
        name: SUPER_ADMIN_NAME,
        role: 'super_admin',
        password_hash: passwordHash,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    console.log('🎉 Super admin created successfully!')
    console.log(`📧 Email: ${SUPER_ADMIN_EMAIL}`)
    console.log(`🔑 Password: ${SUPER_ADMIN_PASSWORD}`)
    console.log(`👑 Role: super_admin`)
    console.log('\n📝 Next steps:')
    console.log('1. Verify in Supabase Dashboard > Table Editor > admins')
    console.log('2. Test login at /admin (if route exists)')
    console.log('3. Change password after first login')
    console.log('4. Remove this script after use')

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createSuperAdmin()
