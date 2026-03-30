import { NextRequest, NextResponse } from 'next/server';
import { counsellingSlotsDb } from '@/lib/db';
import type { CounsellingSlot, UpsertSlotData } from '@/types/counselling';
import { isDbConfigured } from '@/lib/db';

// Admin-only API for daily counselling slot management
// Requires admin auth middleware

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const slots = await counsellingSlotsDb.getFuture(days);
    
    // Enrich with computed available_slots
    const enrichedSlots: CounsellingSlot[] = slots.map(slot => ({
      ...slot,
      available_slots: slot.max_slots - slot.booked_slots
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        slots: enrichedSlots,
        total: enrichedSlots.length,
        default_max_slots: 10
      }
    });
  } catch (error) {
    console.error('Error fetching counselling slots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: UpsertSlotData = await request.json();
    
    // Validation
    if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
      return NextResponse.json(
        { success: false, error: 'Valid date (YYYY-MM-DD) required' },
        { status: 400 }
      );
    }
    
    if (data.max_slots < 0 || data.max_slots > 100) {
      return NextResponse.json(
        { success: false, error: 'max_slots must be 0-100' },
        { status: 400 }
      );
    }
    
    const slot = await counsellingSlotsDb.setMaxSlots(data.date, data.max_slots);
    
    const enriched: CounsellingSlot = {
      ...slot,
      available_slots: slot.max_slots - slot.booked_slots
    };
    
    return NextResponse.json({
      success: true,
      data: enriched,
      message: `Set ${data.max_slots} slots for ${data.date}`
    });
  } catch (error: any) {
    console.error('Error setting slot limit:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to set slot limit' },
      { status: 500 }
    );
  }
}

// Bulk update for multiple dates (admin convenience)
export async function PUT(request: NextRequest) {
  try {
    const updates: UpsertSlotData[] = await request.json();
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Array of updates required' },
        { status: 400 }
      );
    }
    
    const results: CounsellingSlot[] = [];
    
    for (const update of updates) {
      try {
        const slot = await counsellingSlotsDb.setMaxSlots(update.date, update.max_slots);
        results.push({
          ...slot,
          available_slots: slot.max_slots - slot.booked_slots
        });
      } catch (e: any) {
        console.warn(`Failed to update ${update.date}:`, e.message);
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        updated: results.length,
        failed: updates.length - results.length,
        slots: results
      }
    });
  } catch (error) {
    console.error('Error bulk updating slots:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to bulk update slots' },
      { status: 500 }
    );
  }
}

