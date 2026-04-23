import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import { calendarEventsDb } from '@/lib/db'

// Seed data for 2026 calendar
const seedData2026 = [
  // Public Holidays
  {
    title: "New Year's Day",
    description: "Public Holiday - New Year's Day",
    start: '2026-01-01',
    end: '2026-01-01',
    time: 'All Day',
    location: 'National Holiday',
    event_type: 'holiday',
    all_day: true,
    color: '#3B82F6'
  },
  {
    title: 'Constitution Day',
    description: 'Public Holiday - Constitution Day',
    start: '2026-01-07',
    end: '2026-01-07',
    time: 'All Day',
    location: 'National Holiday',
    event_type: 'holiday',
    all_day: true,
    color: '#3B82F6'
  },
  {
    title: 'Independence Day',
    description: 'Public Holiday - Ghana Independence Day',
    start: '2026-03-06',
    end: '2026-03-06',
    time: 'All Day',
    location: 'National Holiday',
    event_type: 'holiday',
    all_day: true,
    color: '#3B82F6'
  },
  {
    title: 'Good Friday',
    description: 'Public Holiday - Good Friday',
    start: '2026-04-06',
    end: '2026-04-06',
    time: 'All Day',
    location: 'National Holiday',
    event_type: 'holiday',
    all_day: true,
    color: '#3B82F6'
  },
  {
    title: 'Easter Monday',
    description: 'Public Holiday - Easter Monday',
    start: '2026-04-10',
    end: '2026-04-10',
    time: 'All Day',
    location: 'National Holiday',
    event_type: 'holiday',
    all_day: true,
    color: '#3B82F6'
  },
  {
    title: 'Labor Day',
    description: 'Public Holiday - Labor Day',
    start: '2026-05-01',
    end: '2026-05-01',
    time: 'All Day',
    location: 'National Holiday',
    event_type: 'holiday',
    all_day: true,
    color: '#3B82F6'
  },
  {
    title: "Founders Day",
    description: "Public Holiday - Founders Day",
    start: '2026-08-04',
    end: '2026-08-04',
    time: 'All Day',
    location: 'National Holiday',
    event_type: 'holiday',
    all_day: true,
    color: '#3B82F6'
  },
  {
    title: 'Farmers Day',
    description: 'Public Holiday - Farmers Day',
    start: '2026-12-01',
    end: '2026-12-01',
    time: 'All Day',
    location: 'National Holiday',
    event_type: 'holiday',
    all_day: true,
    color: '#3B82F6'
  },
  {
    title: 'Christmas Day',
    description: 'Public Holiday - Christmas Day',
    start: '2026-12-25',
    end: '2026-12-25',
    time: 'All Day',
    location: 'National Holiday',
    event_type: 'holiday',
    all_day: true,
    color: '#3B82F6'
  },
  {
    title: 'Boxing Day',
    description: 'Public Holiday - Boxing Day',
    start: '2026-12-26',
    end: '2026-12-26',
    time: 'All Day',
    location: 'National Holiday',
    event_type: 'holiday',
    all_day: true,
    color: '#3B82F6'
  },
  // Special Programs
  {
    title: 'Power Conference',
    description: 'A powerful conference for spiritual empowerment and breakthrough.',
    start: '2026-05-25',
    end: '2026-05-29',
    time: 'All Day',
    location: 'Church Premises',
    event_type: 'special',
    all_day: true,
    color: '#10B981'
  },
  {
    title: 'Supernatural Encounter',
    description: 'Experience God in a supernatural way. A week of miracles and divine encounters.',
    start: '2026-08-11',
    end: '2026-08-15',
    time: 'All Day',
    location: 'Church Premises',
    event_type: 'special',
    all_day: true,
    color: '#3B82F6'
  },
  {
    title: 'My Season of Waiting',
    description: 'A prophetic season of waiting on God for your breakthrough.',
    start: '2026-10-06',
    end: '2026-10-10',
    time: 'All Day',
    location: 'Church Premises',
    event_type: 'special',
    all_day: true,
    color: '#8B5CF6'
  },
  {
    title: 'End of Year Program',
    description: 'Closing out the year with gratitude and anticipation for the new year.',
    start: '2026-12-09',
    end: '2026-12-11',
    time: 'All Day',
    location: 'Church Premises',
    event_type: 'special',
    all_day: true,
    color: '#F59E0B'
  }
]

export async function POST(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const force = searchParams.get('force') === 'true'

    // Fetch existing calendar events
    const existingEvents = await calendarEventsDb.getAll()

    if (existingEvents.length > 0 && !force) {
      return NextResponse.json({
        success: false,
        message: `Calendar data already exists. Use ?force=true to overwrite.`,
        count: existingEvents.length
      })
    }

    // Delete existing data if force=true
    if (force) {
      for (const event of existingEvents) {
        await calendarEventsDb.delete(event.id)
      }
    }

    // Insert seed data
    const createdEvents = []
    for (const event of seedData2026) {
      const created = await calendarEventsDb.create(event)
      createdEvents.push(created)
    }

    return NextResponse.json({
      success: true,
      count: createdEvents.length,
      message: `Successfully seeded ${createdEvents.length} calendar events for 2026`
    })

  } catch (error) {
    console.error('Error seeding calendar data:', error)
    return NextResponse.json(
      { error: 'Failed to seed calendar data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const dbConnection = await connectDB()
    if (!dbConnection) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      )
    }

    const existingEvents = await calendarEventsDb.getAll()

    return NextResponse.json({
      success: true,
      count: existingEvents.length,
      message: existingEvents.length > 0
        ? 'Calendar data exists'
        : 'No calendar data found. POST to this endpoint to seed data.'
    })

  } catch (error) {
    console.error('Error checking calendar data:', error)
    return NextResponse.json(
      { error: 'Failed to check calendar data' },
      { status: 500 }
    )
  }
}

