import { NextRequest, NextResponse } from 'next/server'
import { teamsDb } from '@/lib/db'

// GET /api/teams?department=...&leadership=true&is_active=true&limit=20
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const leadership = searchParams.get('leadership')
    const isActive = searchParams.get('is_active')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    // Fetch all teams first, then filter client-side (since db.ts doesn't have direct filter)
    const allTeams = await teamsDb.getAll()

    let filtered = allTeams.filter(t => t.is_active !== false)

    if (department) {
      filtered = filtered.filter(t => t.department?.toLowerCase() === department.toLowerCase())
    }

    if (leadership === 'true') {
      // Map to leadership: assume department includes leadership roles or add logic
      // For now, take first 6 or all if leadership flag
      filtered = filtered.slice(0, 6)
    }

    // Sort by order_index
    filtered.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))

    // Apply limit
    const limited = filtered.slice(0, limit)

    return NextResponse.json({
      success: true,
      teamMembers: limited,
      total: filtered.length,
      filters: {
        department,
        leadership: leadership === 'true',
        is_active: isActive === 'true',
        limit
      }
    })
  } catch (error) {
    console.error('API /api/teams error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch teams', teamMembers: [] },
      { status: 500 }
    )
  }
}

