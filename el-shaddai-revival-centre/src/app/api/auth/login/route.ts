import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import type { JWTPayload } from '@/lib/auth'
import { generateToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, serviceKey)

    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, name, role, password_hash, profile_image, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !admin) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    let isValid = await bcrypt.compare(password, admin.password_hash)

    // Fallback for legacy plain-text passwords
    if (!isValid && password === admin.password_hash) {
      isValid = true
      // Auto-upgrade to hashed password
      try {
        const newHash = await bcrypt.hash(password, 10)
        await supabase
          .from('admins')
          .update({ password_hash: newHash })
          .eq('id', admin.id)
      } catch (upgradeError) {
        console.error('Failed to upgrade legacy password hash:', upgradeError)
      }
    }

    if (!isValid) {
      return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
    }

    const token = generateToken({
      adminId: admin.id as string,
      email: admin.email,
      role: admin.role,
      name: admin.name,
      profileImage: admin.profile_image
    })

    return setAuthCookie(token)

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

