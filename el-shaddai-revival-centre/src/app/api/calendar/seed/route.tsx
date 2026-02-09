import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/database'
import CalendarEvent from '@/models/CalendarEvent'

// Seed data for 2026 calendar
const seedData2026 = [
  // Public Holidays
  {
    title: "New Year's Day",
    description: "Public Holiday - New Year's Day",
    date: '2026-01-01',
    time: 'All Day',
    location: 'National Holiday',
    category: 'holiday',
    year: 2026,
    recurring: false,
    colorCode: '#3B82F6'
  },
  {
    title: 'Constitution Day',
    description: 'Public Holiday - Constitution Day',
    date: '2026-01-07',
    time: 'All Day',
    location: 'National Holiday',
    category: 'holiday',
    year: 2026,
    recurring: false,
    colorCode: '#3B82F6'
  },
  {
    title: 'Independence Day',
    description: 'Public Holiday - Ghana Independence Day',
    date: '2026-03-06',
    time: 'All Day',
    location: 'National Holiday',
    category: 'holiday',
    year: 2026,
    recurring: false,
    colorCode: '#3B82F6'
  },
  {
    title: 'Good Friday',
    description: 'Public Holiday - Good Friday',
    date: '2026-04-06',
    time: 'All Day',
    location: 'National Holiday',
    category: 'holiday',
    year: 2026,
    recurring: false,
    colorCode: '#3B82F6'
  },
  {
    title: 'Easter Monday',
    description: 'Public Holiday - Easter Monday',
    date: '2026-04-10',
    time: 'All Day',
    location: 'National Holiday',
    category: 'holiday',
    year: 2026,
    recurring: false,
    colorCode: '#3B82F6'
  },
  {
    title: 'Labor Day',
    description: 'Public Holiday - Labor Day',
    date: '2026-05-01',
    time: 'All Day',
    location: 'National Holiday',
    category: 'holiday',
    year: 2026,
    recurring: false,
    colorCode: '#3B82F6'
  },
  {
    title: "Founders Day",
    description: "Public Holiday - Founders Day",
    date: '2026-08-04',
    time: 'All Day',
    location: 'National Holiday',
    category: 'holiday',
    year: 2026,
    recurring: false,
    colorCode: '#3B82F6'
  },
  {
    title: 'Farmers Day',
    description: 'Public Holiday - Farmers Day',
    date: '2026-12-01',
    time: 'All Day',
    location: 'National Holiday',
    category: 'holiday',
    year: 2026,
    recurring: false,
    colorCode: '#3B82F6'
  },
  {
    title: 'Christmas Day',
    description: 'Public Holiday - Christmas Day',
    date: '2026-12-25',
    time: 'All Day',
    location: 'National Holiday',
    category: 'holiday',
    year: 2026,
    recurring: false,
    colorCode: '#3B82F6'
  },
  {
    title: 'Boxing Day',
    description: 'Public Holiday - Boxing Day',
    date: '2026-12-26',
    time: 'All Day',
    location: 'National Holiday',
    category: 'holiday',
    year: 2026,
    recurring: false,
    colorCode: '#3B82F6'
  },
  // Special Programs
  {
    title: 'Power Conference',
    description: 'A powerful conference for spiritual empowerment and breakthrough.',
    date: '2026-05-25',
    time: 'All Day',
    endDate: '2026-05-29',
    location: 'Church Premises',
    category: 'special',
    year: 2026,
    recurring: false,
    colorCode: '#10B981'
  },
  {
    title: 'Supernatural Encounter',
    description: 'Experience God in a supernatural way. A week of miracles and divine encounters.',
    date: '2026-08-11',
    time: 'All Day',
    endDate: '2026-08-15',
    location: 'Church Premises',
    category: 'special',
    year: 2026,
    recurring: false,
    colorCode: '#3B82F6'
  },
  {
    title: 'My Season of Waiting',
    description: 'A prophetic season of waiting on God for your breakthrough.',
    date: '2026-10-06',
    time: 'All Day',
    endDate: '2026-10-10',
    location: 'Church Premises',
    category: 'special',
    year: 2026,
    recurring: false,
    colorCode: '#8B5CF6'
  },
  {
    title: 'End of Year Program',
    description: 'Closing out the year with gratitude and anticipation for the new year.',
    date: '2026-12-09',
    time: 'All Day',
    endDate: '2026-12-11',
    location: 'Church Premises',
    category: 'special',
    year: 2026,
    recurring: false,
    colorCode: '#F59E0B'
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
    const year = parseInt(searchParams.get('year') || '2026')
    const force = searchParams.get('force') === 'true'
    
    // Check if data already exists for the year
    const existingCount = await CalendarEvent.countDocuments({ year })
    
    if (existingCount > 0 && !force) {
      return NextResponse.json({
        success: false,
        message: `Calendar data already exists for ${year}. Use ?force=true to overwrite.`,
        count: existingCount
      })
    }
    
    // Delete existing data for the year if force=true
    if (force) {
      await CalendarEvent.deleteMany({ year })
    }
    
    // Prepare seed data for the specified year
    const events = seedData2026.map(event => ({
      ...event,
      year,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
    
    // Insert data
    const result = await CalendarEvent.insertMany(events)
    
    return NextResponse.json({
      success: true,
      count: result.length,
      message: `Successfully seeded ${result.length} calendar events for ${year}`
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
    
    // Check if data exists
    const count = await CalendarEvent.countDocuments()
    
    return NextResponse.json({
      success: true,
      count,
      message: count > 0 
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

