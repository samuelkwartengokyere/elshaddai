'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Loader2, 
  AlertCircle,
  Star
} from 'lucide-react'

// Event categories for regular events
const eventCategories = [
  { id: 'all', label: 'All Events' },
  { id: 'worship', label: 'Worship' },
  { id: 'youth', label: 'Youth' },
  { id: 'children', label: 'Children' },
  { id: 'outreach', label: 'Outreach' },
  { id: 'fellowship', label: 'Fellowship' },
]

// Calendar event categories (revival, special, holiday)
const calendarCategories = [
  { id: 'revival', label: 'Revival Weeks', color: 'bg-orange-500' },
  { id: 'special', label: 'Special Programs', color: 'bg-green-500' },
  { id: 'holiday', label: 'Holiday Programs', color: 'bg-blue-500' },
]

// All categories combined for legend
const allCategories = [
  ...eventCategories.slice(1), // All except 'all'
  ...calendarCategories
]

// Revival weeks data (recalculated based on year)
const getRevivalWeeks = (year: number) => [
  { month: 'January', startDay: 19, endDay: 23, dateRange: 'Jan 19 - 23' },
  { month: 'February', startDay: 16, endDay: 20, dateRange: 'Feb 16 - 20' },
  { month: 'March', startDay: 10, endDay: 14, dateRange: 'Mar 10 - 14' },
  { month: 'April', startDay: 21, endDay: 25, dateRange: 'Apr 21 - 25' },
  { month: 'May', startDay: 25, endDay: 29, dateRange: 'May 25 - 29' },
  { month: 'June', startDay: 9, endDay: 13, dateRange: 'Jun 9 - 13' },
  { month: 'July', startDay: 21, endDay: 25, dateRange: 'Jul 21 - 25' },
  { month: 'August', startDay: 11, endDay: 15, dateRange: 'Aug 11 - 15' },
  { month: 'September', startDay: 15, endDay: 19, dateRange: 'Sep 15 - 19' },
  { month: 'October', startDay: 6, endDay: 10, dateRange: 'Oct 6 - 10' },
  { month: 'November', startDay: 10, endDay: 14, dateRange: 'Nov 10 - 14' },
]

interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  recurring: boolean
  isPublished: boolean
}

interface CalendarEvent extends Event {
  dateObj?: Date
}

// CalendarEvent from /api/calendar (revival, special, holiday)
interface CalendarDayEvent {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: 'holiday' | 'special' | 'revival'
  year: number
  recurring: boolean
  colorCode?: string
}

interface EventsByDate {
  [date: string]: (CalendarEvent | CalendarDayEvent)[]
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calendarDayEvents, setCalendarDayEvents] = useState<CalendarDayEvent[]>([])
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({})
  const [loading, setLoading] = useState(true)
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [error, setError] = useState('')
  const [calendarError, setCalendarError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      params.append('upcoming', 'true')
      params.append('sort', 'date')

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/events?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setEvents(data.events)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          hasNext: data.pagination.hasNext,
          hasPrev: data.pagination.hasPrev
        }))
      } else {
        setError(data.error || 'Failed to fetch events')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch calendar events (revival, special, holiday programs)
  const fetchCalendarEvents = async () => {
    setCalendarLoading(true)
    setCalendarError('')

    try {
      // Fetch regular calendar events (from /api/events/calendar)
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString()
      })

      const response = await fetch(`/api/events/calendar?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setCalendarEvents(data.events)
        setEventsByDate(data.eventsByDate || {})
      } else {
        setCalendarError(data.error || 'Failed to fetch calendar events')
      }

      // Also fetch calendar events (revival, special, holiday) from /api/calendar
      const calendarApiResponse = await fetch(`/api/calendar?year=${currentYear}`)
      const calendarApiData = await calendarApiResponse.json()

      if (calendarApiData.success) {
        setCalendarDayEvents(calendarApiData.events || [])
      }
    } catch (err) {
      setCalendarError('Failed to connect to server')
      console.error('Error fetching calendar events:', err)
    } finally {
      setCalendarLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [pagination.page, selectedCategory])

  useEffect(() => {
    fetchCalendarEvents()
  }, [currentMonth, currentYear])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchEvents()
  }

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'worship': return 'bg-blue-100 text-blue-800'
      case 'youth': return 'bg-purple-100 text-purple-800'
      case 'children': return 'bg-green-100 text-green-800'
      case 'outreach': return 'bg-orange-100 text-orange-800'
      case 'fellowship': return 'bg-pink-100 text-pink-800'
      // Calendar event categories
      case 'revival': return 'bg-orange-100 text-orange-800'
      case 'special': return 'bg-green-100 text-green-800'
      case 'holiday': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  // Calendar functions
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    const startDay = firstDay.getDay()
    const totalDays = lastDay.getDate()
    
    const days: (number | null)[] = []
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startDay; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(i)
    }
    
    return days
  }, [currentMonth])

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <CalendarIcon className="h-16 w-16 text-accent mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Events</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Join us at El-Shaddai Revival Centre for worship, fellowship, and community events
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {eventCategories.map(category => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-accent text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300 flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <section className="py-8 bg-red-50 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2 text-gray-600">Loading events...</span>
            </div>
          </div>
        </section>
      )}

      {/* Events Grid */}
      {!loading && !error && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Upcoming Events</h2>
            </div>

            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                  <div
                    key={event._id}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 group"
                  >
                    {/* Event Image Placeholder */}
                    <div className="bg-gradient-to-br from-primary to-secondary h-48 flex items-center justify-center relative overflow-hidden">
                      <CalendarIcon className="h-16 w-16 text-white opacity-50" />
                      {event.recurring && (
                        <span className="absolute top-4 right-4 bg-accent text-white text-xs px-3 py-1 rounded-full">
                          Weekly
                        </span>
                      )}
                    </div>

                    <div className="p-6">
                      {/* Category Badge */}
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getCategoryColor(event.category)}`}>
                        {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                      </span>

                      {/* Event Title */}
                      <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition duration-300">
                        {event.title}
                      </h3>

                      {/* Event Description */}
                      <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                        {event.description}
                      </p>

                      {/* Event Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {event.recurring ? (
                            <span>{event.date}</span>
                          ) : (
                            <span>{formatDate(event.date)}</span>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{event.time}</span>
                        </div>
                      <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Events Found</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Check back soon for upcoming events!'}
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12 space-x-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-4 py-2 rounded-lg ${
                      pagination.page === page
                        ? 'bg-accent text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Calendar View Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <CalendarIcon className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Monthly Calendar</h2>
              <p className="text-gray-600">
                View all upcoming events on our monthly calendar
              </p>
            </div>

            {/* Calendar Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              {calendarError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {calendarError}
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition duration-300"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800">
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button
                    onClick={goToToday}
                    className="text-sm text-accent hover:text-red-600 transition duration-300"
                  >
                    Today
                  </button>
                </div>
                
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition duration-300"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {/* Loading State for Calendar */}
              {calendarLoading && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              )}

              {/* Calendar Grid */}
              {!calendarLoading && (
                <>
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                      if (!day) {
                        return <div key={index} className="min-h-[80px]" />
                      }

                      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      
                      // Get regular events for this day
                      const regularEvents = eventsByDate[dateStr] || []
                      
                      // Get calendar day events for this day (revival, special, holiday)
                      const dayCalendarEvents = calendarDayEvents.filter(e => e.date === dateStr)
                      
                      // Combine all events
                      const allDayEvents = [...regularEvents, ...dayCalendarEvents]
                      const hasEvents = allDayEvents.length > 0
                      
                      // Check if this day is in a revival week
                      const monthName = months[currentMonth.getMonth()]
                      const revivalWeeks = getRevivalWeeks(currentMonth.getFullYear())
                      const revivalWeek = revivalWeeks.find(rw => rw.month === monthName)
                      const isRevivalDay = revivalWeek && day >= revivalWeek.startDay && day <= revivalWeek.endDay

                      return (
                        <div
                          key={index}
                          className={`min-h-[80px] p-2 rounded-lg border ${
                            isRevivalDay
                              ? 'bg-orange-50 border-orange-300'
                              : hasEvents
                              ? 'bg-accent-10 border-accent-300'
                              : 'bg-white border-gray-200'
                          } ${isToday(day) ? 'ring-2 ring-accent' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm font-medium ${
                              isRevivalDay ? 'text-orange-600' : hasEvents ? 'text-accent' : 'text-gray-700'
                            } ${isToday(day) ? 'text-accent' : ''}`}>
                              {day}
                            </span>
                            {hasEvents && (
                              <span className="text-xs bg-accent text-white px-1.5 py-0.5 rounded-full">
                                {allDayEvents.length}
                              </span>
                            )}
                            {isRevivalDay && !hasEvents && (
                              <span className="text-[10px] bg-orange-100 text-orange-600 px-1 py-0.5 rounded">
                                REVIVAL
                              </span>
                            )}
                          </div>
                          
                          {/* Event Indicators */}
                          <div className="space-y-1">
                            {/* Regular events */}
                            {regularEvents.slice(0, 2).map(event => (
                              <div
                                key={event._id}
                                className={`text-[10px] px-1.5 py-0.5 rounded truncate ${getCategoryColor(event.category)}`}
                              >
                                {event.title}
                              </div>
                            ))}
                            
                            {/* Calendar day events (revival, special, holiday) */}
                            {dayCalendarEvents.slice(0, 2).map(event => (
                              <div
                                key={event._id}
                                className={`text-[10px] px-1.5 py-0.5 rounded truncate ${getCategoryColor(event.category)}`}
                              >
                                {event.title}
                              </div>
                            ))}
                            
                            {allDayEvents.length > 2 && (
                              <div className="text-xs text-gray-500 pl-1">
                                +{allDayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Calendar Legend */}
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {eventCategories.slice(1).map(category => (
                <div key={category.id} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${getCategoryColor(category.id)}`}></span>
                  <span className="text-sm text-gray-600">{category.label}</span>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-orange-500" />
                <span className="text-sm text-gray-600">Revival Weeks</span>
              </div>
              {calendarCategories.map(category => (
                <div key={category.id} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${category.color}`}></span>
                  <span className="text-sm text-gray-600">{category.label}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/calendar"
                className="inline-flex items-center text-accent hover:text-red-600 font-medium"
              >
                View Full Calendar <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Regular Schedule Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Clock className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-4xl font-bold mb-4">Weekly Schedule</h2>
              <p className="text-gray-600 text-lg">
                Plan your week with our regular service times
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { day: 'Sunday', time: '9:00 AM & 11:00 AM', name: 'Worship Services' },
                { day: 'Monday', time: '9:00 AM - 2:00 PM', name: 'Prayer Meeting' },
                { day: 'Tuesday', time: '9:00 AM - 12:00 Noon', name: 'One-on-One Meeting' },
                { day: 'Wednesday', time: '7:00 PM', name: 'Bible Study & Prayer' },
                { day: 'Friday', time: '7:00 PM', name: 'Youth Group' },
                { day: 'Saturday', time: '6:00 PM', name: 'Contemporary Service' },
              ].map((schedule, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-primary">{schedule.day}</h3>
                    {schedule.name.includes('Youth') && (
                      <Users className="h-5 w-5 text-purple-500" />
                    )}
                    {schedule.name.includes('Prayer') && (
                      <CalendarIcon className="h-5 w-5 text-accent" />
                    )}
                    {schedule.name.includes('One-on-One') && (
                      <Users className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-lg text-accent font-semibold mb-1">{schedule.time}</p>
                  <p className="text-gray-600">{schedule.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Never Miss an Event</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Subscribe to our events calendar to stay updated on all church activities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:ring-2 focus:ring-accent"
            />
            <button className="bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Host an Event?</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            If you&apos;re interested in hosting a community event at El-Shaddai Revival Centre,
            we&apos;d love to hear from you!
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition duration-300"
          >
            Contact Us Today
          </Link>
        </div>
      </section>
    </>
  )
}

