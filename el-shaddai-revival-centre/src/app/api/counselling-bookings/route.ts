import { NextResponse } from 'next/server';
import { counsellingBookingsDb, isDbConfigured } from '@/lib/db';

// Admin-facing API for listing counselling bookings
export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({
      success: true,
      data: {
        bookings: [],
        total: 0
      }
    });
  }

  try {
    const bookings = await counsellingBookingsDb.getAll();

    return NextResponse.json({
      success: true,
      data: {
        bookings,
        total: bookings.length
      }
    });
  } catch (error: any) {
    console.error('Error fetching counselling bookings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch counselling bookings',
        details: process.env.NODE_ENV === 'development' ? error?.message || String(error) : undefined
      },
      { status: 500 }
    );
  }
}
