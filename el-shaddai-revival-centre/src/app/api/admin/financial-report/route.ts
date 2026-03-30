import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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
    const fromDate = `${year}-01-01`
    const toDate = `${parseInt(year) + 1}-01-01`

    // Fetch completed donations for the year
    const donations = await donationsDb.getAll().then(donations => 
      donations.filter(d => 
        d.status === 'completed' &&
        new Date(d.created_at) >= new Date(fromDate) &&
        new Date(d.created_at) < new Date(toDate)
      )
    )

    if (!donations || donations.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: {
          totalReceipts: 0,
          totalExpenditure: 0, 
          netSurplus: 0,
          receiptBreakdown: [],
          expenditureBreakdown: [],
          quarterlyData: [],
          count: 0
        }
      })
    }

    // Aggregate totals
    const totalReceipts = donations.reduce((sum, d) => sum + (d.amount || 0), 0)
    const uniqueDonors = new Set(donations.map(d => d.donor_email).filter(Boolean)).size

    // Receipt breakdown by donation_type (or payment_channel if no type)
    const typeBreakdown = donations.reduce((acc, d) => {
      const type = d.donation_type || d.payment_channel || 'other'
      acc[type] = (acc[type] || 0) + (d.amount || 0)
      return acc
    }, {} as Record<string, number>)

    const receiptBreakdown = Object.entries(typeBreakdown)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / totalReceipts) * 100
      }))
      .slice(0, 4) // Top 4

    // Monthly data grouped by year
    const monthlyData = donations.reduce((acc, d) => {
      const date = new Date(d.created_at)
      const yearKey = date.getFullYear().toString()
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      if (!acc[yearKey]) acc[yearKey] = {}
      if (!acc[yearKey][monthKey]) acc[yearKey][monthKey] = { receipts: 0, count: 0 }
      
      acc[yearKey][monthKey].receipts += (d.amount || 0)
      acc[yearKey][monthKey].count += 1
      
      return acc
    }, {} as Record<string, Record<string, { receipts: number; count: number }>>)

    // Flatten for API response
    const monthlyBreakdown = Object.entries(monthlyData).flatMap(([year, months]) => 
      Object.entries(months).map(([month, stats]) => ({
        year: parseInt(year),
        month,
        receipts: stats.receipts,
        count: stats.count
      }))
    )

    // Expenditure placeholder
    const expenditureBreakdown = [
      { category: 'Ministry Activities', amount: totalReceipts * 0.4, percentage: 40 },
      { category: 'Outreach & Missions', amount: totalReceipts * 0.25, percentage: 25 },
      { category: 'Church Operations', amount: totalReceipts * 0.2, percentage: 20 },
      { category: 'Building Fund', amount: totalReceipts * 0.15, percentage: 15 }
    ]

    const reportData = {
      totalReceipts,
      totalExpenditure: 0,
      netSurplus: totalReceipts,
      receiptBreakdown,
      expenditureBreakdown,
      monthlyData: monthlyBreakdown,
      count: donations.length,
      uniqueDonors,
      year: parseInt(year),
      currency: 'GHS'
    }

    return NextResponse.json({ success: true, data: reportData })

  } catch (error) {
    console.error('Financial report API error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

