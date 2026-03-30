import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth'
import { donationsDb } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Admin auth check
    const admin = getCurrentAdmin(request)
    if (!admin || (admin.role !== 'super_admin' && admin.role !== 'admin')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') || new Date().getFullYear().toString()
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const fromDate = `${year}-01-01`
