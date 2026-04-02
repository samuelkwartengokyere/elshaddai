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
    const toDate = `${parseInt(year) + 1}-01-01`

    // Fetch all donations and filter by date/status
    const allDonations = await donationsDb.getAll()
    const yearDonations = allDonations.filter(donation => {
      const createdAt = new Date(donation.created_at)
      return (
        donation.status === 'completed' &&
        createdAt >= new Date(fromDate) &&
        createdAt < new Date(toDate)
      )
    })

    // Pagination
    const offset = (page - 1) * limit
    const paginatedDonations = yearDonations.slice(offset, offset + limit)
    const totalPages = Math.ceil(yearDonations.length / limit)

    // Audit summary
    const totalAmount = yearDonations.reduce((sum, d) => sum + (d.amount || 0), 0)
    const uniqueDonors = new Set(yearDonations.map(d => d.donor_email).filter(Boolean)).size
    const methodBreakdown = yearDonations.reduce((acc, d) => {
      const method = d.payment_method || 'unknown'
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const summary = {
      totalDonations: yearDonations.length,
      totalAmount,
      uniqueDonors,
      avgDonation: yearDonations.length > 0 ? totalAmount / yearDonations.length : 0,
      methodBreakdown,
      year: parseInt(year)
    }

    return NextResponse.json({
      success: true,
      data: {
        donations: paginatedDonations,
        summary,
        pagination: {
          page,
          limit,
          total: yearDonations.length,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    })

  } catch (error) {
    console.error('Audit report API error:', error)
    return NextResponse.json(
      { success: false, error: 'Server error generating audit report' },
      { status: 500 }
    )
  }
}
