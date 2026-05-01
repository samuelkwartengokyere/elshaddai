import { NextResponse } from 'next/server';
import { counsellingBookingsDb, isDbConfigured } from '@/lib/db';
import { NextRequest } from 'next/server';

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

// Admin-facing API for updating booking status
export async function PATCH(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Database not configured' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const bookingId = body?.id as string | undefined;
    const status = body?.status as string | undefined;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking id is required' },
        { status: 400 }
      );
    }

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Valid status is required' },
        { status: 400 }
      );
    }

    const updated = await counsellingBookingsDb.update(bookingId, { status });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Booking status updated to ${status}`
    });
  } catch (error: any) {
    console.error('Error updating counselling booking status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update counselling booking status',
        details: process.env.NODE_ENV === 'development' ? error?.message || String(error) : undefined
      },
      { status: 500 }
    );
  }
}
