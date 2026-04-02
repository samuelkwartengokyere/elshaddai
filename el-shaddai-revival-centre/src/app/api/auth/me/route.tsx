import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth'
import { adminsDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const admin = getCurrentAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch full admin data from Supabase admins table
    const fullAdmin = await adminsDb.getById(admin.adminId)
    if (!fullAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin not found' },
        { status: 404 }
      )
    }

    const user = {
      adminId: fullAdmin.id,
      email: fullAdmin.email,
      name: fullAdmin.name,
      role: fullAdmin.role,
      profileImage: fullAdmin.profile_image
    }

    return NextResponse.json({ success: true, user })

  } catch (error) {
    console.error('Get me error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    )
  }
}
