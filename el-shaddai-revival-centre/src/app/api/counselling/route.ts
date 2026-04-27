import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'
import { counsellingBookingsDb, counsellingSlotsDb, isDbConfigured } from '@/lib/db'
import { createTeamsMeeting } from '@/lib/teams';
import { sendBookingConfirmation, sendCounsellorNotification, sendCancellationEmail } from '@/lib/email';
import { BookingFormData, generateBookingNumber, TimeSlot, CounsellingBooking } from '@/types/counselling';

// Main Counselling API Route - Handles fetching data and creating bookings

// GET - Fetch available counsellors and time slots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const counsellorId = searchParams.get('counsellorId');
    const bookingType = searchParams.get('bookingType') as 'online' | 'in-person' | null;
    
    // Fetch counselors (assumes /api/counsellors exists)
    const counselorsResponse = await fetch(new URL('/api/counsellors', request.url).href);
    const counselorsData = await counselorsResponse.json();
    let availableCounsellors = counselorsData.success ? counselorsData.data.counsellors : [];
    
    if (counsellorId) {
      const counsellor = availableCounsellors.find((c: { id: string }) => c.id === counsellorId);
      if (counsellor) {
        availableCounsellors = [counsellor];
      }
    }
    
    if (bookingType) {
      availableCounsellors = availableCounsellors.filter((c: { isOnline: boolean; isInPerson: boolean }) => {
        if (bookingType === 'online') return c.isOnline;
        if (bookingType === 'in-person') return c.isInPerson;
        return true;
      });
    }
    
    // Query real daily slots from DB (next 14 days)
    const slots = await counsellingSlotsDb.getFuture(14);
    
    const availableSlots: TimeSlot[] = [];
    
    for (const slot of slots) {
      if (slot.max_slots - slot.booked_slots > 0) {
        const date = new Date(slot.date);
        const dayOfWeek = date.getDay();
        
        // Skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        
        // Generate 30min slots 9AM-5PM
        const startMinutes = 9 * 60;
        const endMinutes = 17 * 60;
        
        for (let minute = startMinutes; minute < endMinutes - 30; minute += 30) {
          const hour = Math.floor(minute / 60);
          const mins = minute % 60;
          const startTime = `${hour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
          const endMinute = (minute + 30) % 60;
          const endHour = Math.floor((minute + 30) / 60);
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          
          availableSlots.push({
            id: `${slot.date}-${startTime}`,
            counsellorId: counsellorId || 'global',
            date: slot.date,
            startTime,
            endTime,
            isAvailable: true
          });
        }
      }
    }
    

    
    return NextResponse.json({
      success: true,
      data: {
        counsellors: availableCounsellors,
        availableSlots,
        total_slots: slots.length,
        dailySlots: slots.map(s => ({
          date: s.date,
          max_slots: s.max_slots,
          booked_slots: s.booked_slots,
          available_slots: s.max_slots - s.booked_slots
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching counselling data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch counselling data' },
      { status: 500 }
    );
  }
}

// POST - Create booking with slot management
export async function POST(request: NextRequest) {
  try {
    const formData: BookingFormData = await request.json();
    
    // Validate
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      return NextResponse.json({ success: false, errors: validationErrors }, { status: 400 });
    }
    
    // Get counsellor
    const counselorsResponse = await fetch(new URL('/api/counsellors', request.url).href);
    const counselorsData = await counselorsResponse.json();
    const allCounsellors = counselorsData.success ? counselorsData.data.counsellors : [];
    const counsellor = allCounsellors.find((c: { id: string }) => c.id === formData.counsellorId);
    
    if (!counsellor) {
      return NextResponse.json({ success: false, error: 'Counsellor not found' }, { status: 404 });
    }
    
    const confirmationNumber = generateBookingNumber();
    const now = new Date();
    
    if (isDbConfigured()) {
      // Check & book slot
      const slot = await counsellingSlotsDb.getByDate(formData.preferredDate);
      if (!slot || slot.booked_slots >= slot.max_slots) {
        return NextResponse.json({
          success: false,
          error: `No slots available on ${formData.preferredDate}`
        }, { status: 400 });
      }
      
      // Increment slot
      await counsellingSlotsDb.incrementBooked(formData.preferredDate);
      
      try {
        const dbBooking = await counsellingBookingsDb.create({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          preferred_counsellor: formData.counsellorId,
          booking_date: formData.preferredDate,
          time_slot: formData.preferredTime,
          issue_type: formData.topic,
          notes: formData.notes || undefined,
          status: 'pending'
        });
        
        // Teams meeting for online
        let teamsMeetingUrl: string | undefined;
        if (formData.bookingType === 'online') {
          try {
            const teamsMeeting = await createTeamsMeeting({
              id: dbBooking.id,
              createdAt: now.toISOString(),
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.phone,
              country: formData.country,
              city: formData.city || '',
              counsellorId: formData.counsellorId,
              bookingType: formData.bookingType,
              preferredDate: formData.preferredDate,
              preferredTime: formData.preferredTime,
              sessionDuration: formData.sessionDuration,
              topic: formData.topic,
              notes: formData.notes,
              status: 'pending',
              confirmationNumber,
              isPaid: false
            }, formData.sessionDuration);
            teamsMeetingUrl = teamsMeeting.joinWebUrl;
          } catch (teamsError) {
            console.error('Teams error:', teamsError);
          }
        }
        
        // Send emails (fire and forget)
        sendBookingConfirmation({
          id: dbBooking.id,
          createdAt: now.toISOString(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          city: formData.city || '',
          counsellorId: formData.counsellorId,
          bookingType: formData.bookingType,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          sessionDuration: formData.sessionDuration,
          topic: formData.topic,
          notes: formData.notes,
          teamsMeetingUrl,
          status: 'pending',
          confirmationNumber,
          isPaid: false
        }).catch(console.error);
        
        sendCounsellorNotification({
          id: dbBooking.id,
          createdAt: now.toISOString(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          city: formData.city || '',
          counsellorId: formData.counsellorId,
          bookingType: formData.bookingType,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          sessionDuration: formData.sessionDuration,
          topic: formData.topic,
          notes: formData.notes,
          teamsMeetingUrl,
          status: 'pending',
          confirmationNumber,
          isPaid: false
        }, counsellor.email, counsellor.name).catch(console.error);
        
        return NextResponse.json({
          success: true,
          data: {
            confirmationNumber,
            booking: {
              id: dbBooking.id,
              confirmationNumber,
              status: 'pending',
              preferredDate: formData.preferredDate,
              preferredTime: formData.preferredTime,
              bookingType: formData.bookingType,
              topic: formData.topic,
              teamsMeetingUrl,
              counsellor: {
                name: counsellor.name,
                title: counsellor.title
              }
            }
          }
        });
      } catch (bookingError) {
        // Rollback slot
        await counsellingSlotsDb.decrementBooked(formData.preferredDate).catch(console.error);
        console.error('Booking failed:', bookingError);
        return NextResponse.json({ success: false, error: 'Booking failed' }, { status: 500 });
      }
    }
    
    // In-memory fallback (for dev)
    return NextResponse.json({
      success: true,
      data: {
        confirmationNumber,
        booking: {
          id: 'fallback-' + Date.now(),
          confirmationNumber,
          status: 'pending',
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          bookingType: formData.bookingType,
          topic: formData.topic,
          counsellor: {
            name: counsellor.name,
            title: counsellor.title
          }
        }
      },
      warning: 'Using in-memory (Supabase not configured)'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
  }
}

function validateFormData(data: BookingFormData): string[] {
  const errors: string[] = [];
  
  if (!data.firstName?.trim()) errors.push('First name required');
  if (!data.lastName?.trim()) errors.push('Last name required');
  if (!data.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Valid email required');
  if (!data.phone?.trim()) errors.push('Phone required');
  if (!data.country) errors.push('Country required');
  if (!data.counsellorId) errors.push('Counsellor required');
  if (!data.preferredDate) errors.push('Date required');
  if (!data.preferredTime) errors.push('Time required');
  if (!data.topic?.trim()) errors.push('Topic required');
  
  return errors;
}
