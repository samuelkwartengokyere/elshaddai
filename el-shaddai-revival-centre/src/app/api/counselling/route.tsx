import { NextRequest, NextResponse } from 'next/server';
import { CounsellingBooking, BookingFormData, generateBookingNumber } from '@/types/counselling';
import { COUNSELLORS, getCounsellorById } from '@/models/Counsellor';
import { createTeamsMeeting, sendTeamsInvitation } from '@/lib/teams';
import { sendBookingConfirmation, sendCounsellorNotification, sendCancellationEmail } from '@/lib/email';

// In-memory storage for demo (replace with database in production)
const bookings: Map<string, CounsellingBooking> = new Map();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const counsellorId = searchParams.get('counsellorId');
    const bookingType = searchParams.get('bookingType') as 'online' | 'in-person' | null;
    
    let availableCounsellors = COUNSELLORS;
    
    if (counsellorId) {
      const counsellor = getCounsellorById(counsellorId);
      if (counsellor) {
        availableCounsellors = [counsellor];
      }
    }
    
    if (bookingType) {
      availableCounsellors = availableCounsellors.filter(c => {
        if (bookingType === 'online') return c.isOnline;
        if (bookingType === 'in-person') return c.isInPerson;
        return true;
      });
    }
    
    // Return available time slots for the next 14 days
    const availableSlots = generateAvailableSlots(availableCounsellors);
    
    return NextResponse.json({
      success: true,
      data: {
        counsellors: availableCounsellors,
        availableSlots,
      },
    });
  } catch (error) {
    console.error('Error fetching counselling data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch counselling data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData: BookingFormData = await request.json();
    
    // Validate required fields
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, errors: validationErrors },
        { status: 400 }
      );
    }
    
    // Get counsellor details
    const counsellor = getCounsellorById(formData.counsellorId);
    if (!counsellor) {
      return NextResponse.json(
        { success: false, error: 'Counsellor not found' },
        { status: 404 }
      );
    }
    
    // Generate confirmation number
    const confirmationNumber = generateBookingNumber();
    
    // Create booking object
    const booking: CounsellingBooking = {
      id: `booking-${Date.now()}`,
      createdAt: new Date().toISOString(),
      userId: undefined,
      
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      country: formData.country,
      city: formData.city,
      
      counsellorId: formData.counsellorId,
      bookingType: formData.bookingType,
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      sessionDuration: formData.sessionDuration,
      topic: formData.topic,
      notes: formData.notes,
      
      status: 'pending',
      confirmationNumber,
      
      isPaid: false,
    };
    
    // If online booking, create Teams meeting
    if (formData.bookingType === 'online') {
      const teamsMeeting = await createTeamsMeeting(booking, formData.sessionDuration);
      
      booking.teamsMeetingUrl = teamsMeeting.joinWebUrl;
      booking.teamsJoinUrl = teamsMeeting.joinWebUrl;
    }
    
    // Save booking to storage
    bookings.set(confirmationNumber, booking);
    
    // Send confirmation email to user
    await sendBookingConfirmation(booking);
    
    // Send notification to counsellor
    await sendCounsellorNotification(
      booking,
      counsellor.email,
      counsellor.name
    );
    
    // If cancelled, send cancellation email
    if (booking.status === 'cancelled') {
      await sendCancellationEmail(booking);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        confirmationNumber,
        booking: {
          id: booking.id,
          confirmationNumber: booking.confirmationNumber,
          status: booking.status,
          preferredDate: booking.preferredDate,
          preferredTime: booking.preferredTime,
          bookingType: booking.bookingType,
          topic: booking.topic,
          teamsMeetingUrl: booking.teamsMeetingUrl,
          counsellor: {
            name: counsellor.name,
            title: counsellor.title,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const confirmationNumber = searchParams.get('confirmationNumber');
    const email = searchParams.get('email');
    
    if (!confirmationNumber || !email) {
      return NextResponse.json(
        { success: false, error: 'Confirmation number and email are required' },
        { status: 400 }
      );
    }
    
    const booking = bookings.get(confirmationNumber);
    
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    if (booking.email !== email) {
      return NextResponse.json(
        { success: false, error: 'Email does not match booking' },
        { status: 403 }
      );
    }
    
    // Update booking status
    booking.status = 'cancelled';
    bookings.set(confirmationNumber, booking);
    
    // Send cancellation email
    await sendCancellationEmail(booking);
    
    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}

function validateFormData(data: BookingFormData): string[] {
  const errors: string[] = [];
  
  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  }
  
  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  }
  
  if (!data.email?.trim()) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Please enter a valid email address');
  }
  
  if (!data.phone?.trim()) {
    errors.push('Phone number is required');
  }
  
  if (!data.country) {
    errors.push('Country is required');
  }
  
  if (!data.counsellorId) {
    errors.push('Please select a counsellor');
  }
  
  if (!data.preferredDate) {
    errors.push('Please select a preferred date');
  }
  
  if (!data.preferredTime) {
    errors.push('Please select a preferred time');
  }
  
  if (!data.topic?.trim()) {
    errors.push('Please specify a topic for your session');
  }
  
  return errors;
}

interface AvailableSlot {
  id: string;
  counsellorId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

function generateAvailableSlots(counsellors: typeof COUNSELLORS): AvailableSlot[] {
  const slots: AvailableSlot[] = [];
  const today = new Date();
  
  // Generate slots for the next 14 days
  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    
    // Only show weekdays (Monday to Friday)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue; // Skip weekends
    }
    
    for (const counsellor of counsellors) {
      // Check if counsellor works on this day
      const availability = counsellor.availability.find(a => a.dayOfWeek === dayOfWeek);
      if (!availability) {
        continue;
      }
      
      // Generate 30-minute slots
      const [startHour, startMin] = availability.startTime.split(':').map(Number);
      const [endHour, endMin] = availability.endTime.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      for (let time = startMinutes; time < endMinutes; time += 30) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = Math.floor((time + 30) / 60);
        const endMinute = (time + 30) % 60;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
        
        // Randomly mark some slots as unavailable (for demo)
        const isAvailable = Math.random() > 0.3;
        
        slots.push({
          id: `${counsellor.id}-${dateStr}-${startTime}`,
          counsellorId: counsellor.id,
          date: dateStr,
          startTime,
          endTime,
          isAvailable,
        });
      }
    }
  }
  
  return slots;
}

