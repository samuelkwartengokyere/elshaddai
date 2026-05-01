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
    const now = new Date();

    // Auto-complete sessions whose end time has passed.
    const updatedBookings = await Promise.all(
      bookings.map(async (booking) => {
        const { startTime, durationMinutes } = parseStoredTimeSlot(booking.time_slot);
        const sessionEnd = getSessionEndDateTime(booking.booking_date, startTime, durationMinutes);
        const shouldAutoComplete =
          sessionEnd !== null &&
          sessionEnd.getTime() <= now.getTime() &&
          (booking.status === 'confirmed' || booking.status === 'pending');

        if (shouldAutoComplete) {
          const completed = await counsellingBookingsDb.update(booking.id, { status: 'completed' });
          return {
            ...completed,
            time_slot: startTime,
            session_duration: durationMinutes,
          };
        }

        return {
          ...booking,
          time_slot: startTime,
          session_duration: durationMinutes,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        bookings: updatedBookings,
        total: updatedBookings.length
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

function parseStoredTimeSlot(storedTimeSlot: string | undefined): { startTime: string; durationMinutes: number } {
  if (!storedTimeSlot) {
    return { startTime: '', durationMinutes: 60 };
  }

  const [startTime, durationRaw] = storedTimeSlot.split('|');
  const parsedDuration = Number.parseInt(durationRaw || '', 10);

  return {
    startTime,
    durationMinutes: Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : 60,
  };
}

function getSessionEndDateTime(bookingDate: string | undefined, startTime: string, durationMinutes: number): Date | null {
  if (!bookingDate || !startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
    return null;
  }

  const [hours, minutes] = startTime.split(':').map((value) => Number.parseInt(value, 10));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  const startDateTime = new Date(`${bookingDate}T${startTime}:00`);
  if (Number.isNaN(startDateTime.getTime())) {
    return null;
  }

  startDateTime.setMinutes(startDateTime.getMinutes() + durationMinutes);
  return startDateTime;
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
