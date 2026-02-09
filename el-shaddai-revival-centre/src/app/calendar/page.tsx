'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  ArrowRight,
  Filter,
  List,
  Grid,
  Users,
  Star,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface CalendarEvent {
  _id: string
  title: string
  description: string
  date: string
  time: string
  endDate?: string
  endTime?: string
  location: string
  category: 'holiday' | 'special' | 'revival'
  year: number
  recurring: boolean
  colorCode?: string
}

// Revival Weeks Data (static, recalculate based on year)
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

const categories = [
  { id: 'all', label: 'All Events', color: 'bg-gray-100 text-gray-800' },
  { id: 'holiday', label: 'Public Holidays', color: 'bg-blue-100 text-blue-800' },
  { id: 'special', label: 'Special Programs', color: 'bg-green-100 text-green-800' },
  { id: 'revival', label: 'Revival Weeks', color: 'bg-orange-100 text-orange-800' },
]

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Month Navigation Component
const MonthNavigator = ({ onSelectMonth }: { onSelectMonth: (monthIndex: number) => void }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {months.map((month, index) => (
        <button
          key={index}
          onClick={() => onSelectMonth(index)}
          className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-accent hover:text-white hover:border-accent transition duration-300"
        >
          {month.slice(0, 3)}
        </button>
      ))}
    </div>
  )
}

// Full Calendar Grid Component
const FullCalendarGrid = ({ 
  month, 
  year, 
  events,
  onDayClick 
}: { 
  month: number, 
  year: number, 
  events: CalendarEvent[],
  onDayClick: (day: number | null) => void 
}) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDay = firstDay.getDay()
  const totalDays = lastDay.getDate()
  const monthName = months[month]

  const days: (number | null)[] = []
  for (let i = 0; i < startDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= totalDays; i++) {
    days.push(i)
  }

  const revivalWeeks = getRevivalWeeks(year)
  const revivalWeek = revivalWeeks.find(rw => rw.month === monthName)

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      {/* Month Title */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{monthName} {year}</h3>
        {revivalWeek && (
          <span className="inline-block bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full mt-2">
            Revival Week: {revivalWeek.dateRange}
          </span>
        )}
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isRevivalDay = day && revivalWeek && day >= revivalWeek.startDay && day <= revivalWeek.endDay
          const dateStr = day 
            ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            : ''
          const dayEvents = day ? events.filter(e => e.date === dateStr) : []
          
          return (
            <div
              key={index}
              className={`min-h-[60px] p-1 rounded-lg border text-xs ${
                day
                  ? isRevivalDay
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                  : 'bg-gray-100 border-transparent'
              }`}
              onClick={() => onDayClick(day)}
            >
              {day && (
                <>
                  <span className={`font-medium ${
                    isRevivalDay ? 'text-orange-600' : 'text-gray-700'
                  }`}>
                    {day}
                  </span>
                  {isRevivalDay && (
                    <div className="mt-0.5">
                      <span className="text-[10px] text-orange-500 font-semibold">✦ REVIVAL</span>
                    </div>
                  )}
                  {dayEvents.map(event => (
                    <div
                      key={event._id}
                      className={`text-[10px] px-0.5 py-0.5 rounded truncate mt-0.5 ${
                        event.category === 'holiday' 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-green-100 text-green-600'
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'month' | 'list' | 'full'>('full')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      setError('')
      
      try {
        const params = new URLSearchParams({ year: selectedYear.toString() })
        const response = await fetch(`/api/calendar?${params}`)
        const data = await response.json()
        
        if (data.success) {
          setEvents(data.events)
        } else {
          setError(data.error || 'Failed to fetch events')
        }
      } catch (err) {
        setError('Failed to connect to server')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [selectedYear])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(selectedYear, selectedMonth, 1)
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0)
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
  }, [selectedMonth, selectedYear])

  // Get events for selected month
  const monthEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      const eventMonth = eventDate.getMonth()
      const eventYear = eventDate.getFullYear()
      
      const matchesMonth = eventMonth === selectedMonth && eventYear === selectedYear
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
      
      return matchesMonth && matchesCategory
    })
  }, [events, selectedMonth, selectedYear, selectedCategory])

  // Get events for a specific day
  const getEventsForDay = (day: number | null) => {
    if (!day) return []
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  // Check if a day falls in revival week
  const getRevivalWeekForDay = (day: number | null) => {
    if (!day) return null
    const monthName = months[selectedMonth]
    const revivalWeeks = getRevivalWeeks(selectedYear)
    return revivalWeeks.find(rw => rw.month === monthName && day >= rw.startDay && day <= rw.endDay)
  }

  // Navigate months
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(prev => prev - 1)
    } else {
      setSelectedMonth(prev => prev - 1)
    }
  }

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(prev => prev + 1)
    } else {
      setSelectedMonth(prev => prev + 1)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  const getCategoryColor = (category: string) => {
    return categories.find(c => c.id === category)?.color || 'bg-gray-100 text-gray-800'
  }

  // Special programs from API
  const specialPrograms = events.filter(e => e.category === 'special')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{selectedYear} Calendar</h1>
          <p className="text-xl opacity-90">
            El-Shaddai Revival Centre - Special Programs, Revival Weeks & Public Holidays
          </p>
        </div>
      </section>

      {/* Legend Section */}
      <section className="py-6 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-orange-400 rounded"></span>
              <span className="text-sm text-gray-600">Revival Weeks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-500 rounded"></span>
              <span className="text-sm text-gray-600">Holiday Programs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-green-500 rounded"></span>
              <span className="text-sm text-gray-600">Special Programs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Special Programs Section */}
      {specialPrograms.length > 0 && (
        <section className="py-12 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">Special Church Programs {selectedYear}</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Mark your calendars for these transformative special programs throughout the year
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {specialPrograms.map((event) => (
                  <div 
                    key={event._id}
                    className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition duration-300 cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">Special</span>
                      <span className="text-gray-500 text-sm">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{event.location}</p>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Revival Weeks Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-3">Monthly Revival Weeks {selectedYear}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Each month is dedicated to a week of revival and spiritual renewal
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {getRevivalWeeks(selectedYear).map((rw, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg p-4 border border-orange-300 hover:shadow-lg transition duration-300 text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-5 w-5 text-orange-500" />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-1">{rw.month}</h4>
                  <p className="text-sm text-orange-600 font-semibold">{rw.dateRange}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Public Holidays Section */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Public Holidays {selectedYear}</h2>
              <p className="text-blue-100 max-w-2xl mx-auto">
                National holidays observed in Ghana for {selectedYear}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {events.filter(e => e.category === 'holiday').map((holiday) => (
                <div 
                  key={holiday._id}
                  className="bg-white/10 backdrop-blur rounded-lg p-4 text-center hover:bg-white/20 transition duration-300"
                >
                  <span className="block text-sm font-semibold mb-1">
                    {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="block text-sm">{holiday.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Calendar Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center mb-4">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}
              
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                {/* Month Navigation */}
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  <button
                    onClick={prevMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition duration-300"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-600" />
                  </button>
                  <h2 className="text-2xl font-bold text-gray-800 min-w-[200px] text-center">
                    {months[selectedMonth]} {selectedYear}
                  </h2>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-full transition duration-300"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-600" />
                  </button>
                </div>

                {/* View Toggle & Category Filter */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode('full')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-300 ${
                        viewMode === 'full'
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Grid className="h-4 w-4 inline mr-1" />
                      Full View
                    </button>
                    <button
                      onClick={() => setViewMode('month')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-300 ${
                        viewMode === 'month'
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Grid className="h-4 w-4 inline mr-1" />
                      Month
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-300 ${
                        viewMode === 'list'
                          ? 'bg-accent text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <List className="h-4 w-4 inline mr-1" />
                      List
                    </button>
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Month Quick Navigation */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3 text-center">Quick Navigation</p>
                <MonthNavigator onSelectMonth={(monthIndex) => {
                  setSelectedMonth(monthIndex)
                  setViewMode('full')
                }} />
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              )}

              {/* Full Calendar View */}
              {!loading && viewMode === 'full' && (
                <FullCalendarGrid
                  month={selectedMonth}
                  year={selectedYear}
                  events={events}
                  onDayClick={(day) => {
                    if (day) {
                      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                      const dayEvents = events.filter(e => e.date === dateStr)
                      if (dayEvents.length > 0) {
                        setSelectedEvent(dayEvents[0])
                      }
                    }
                  }}
                />
              )}

              {!loading && viewMode === 'month' ? (
                /* Month View */
                <>
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, index) => {
                      const dayEvents = getEventsForDay(day)
                      const revivalWeek = getRevivalWeekForDay(day)
                      const isToday = day === new Date().getDate() && 
                                     selectedMonth === new Date().getMonth() &&
                                     selectedYear === new Date().getFullYear()

                      return (
                        <div
                          key={index}
                          className={`min-h-[100px] p-2 rounded-lg border ${
                            day
                              ? 'bg-white border-gray-200 hover:border-accent transition duration-300 cursor-pointer'
                              : 'bg-gray-50 border-transparent'
                          } ${isToday ? 'ring-2 ring-accent' : ''}`}
                          onClick={() => day && setSelectedEvent(dayEvents[0])}
                        >
                          {day && (
                            <>
                              <span className={`text-sm font-medium ${
                                isToday ? 'text-accent' : 'text-gray-700'
                              }`}>
                                {day}
                              </span>
                              {/* Revival Week Indicator */}
                              {revivalWeek && (
                                <div className="mt-1">
                                  <div className="bg-orange-100 text-orange-600 text-xs px-1.5 py-0.5 rounded text-center">
                                    Revival
                                  </div>
                                </div>
                              )}
                              {/* Events */}
                              <div className="mt-1 space-y-1">
                                {dayEvents.slice(0, 2).map(event => (
                                  <div
                                    key={event._id}
                                    className={`text-xs px-1.5 py-0.5 rounded truncate ${getCategoryColor(event.category)}`}
                                  >
                                    {event.title}
                                  </div>
                                ))}
                                {dayEvents.length > 2 && (
                                  <div className="text-xs text-gray-500 pl-1">
                                    +{dayEvents.length - 2} more
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : !loading && viewMode === 'list' ? (
                /* List View */
                <div className="space-y-4">
                  {monthEvents.length > 0 ? (
                    monthEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                      <div
                        key={event._id}
                        className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition duration-300 cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(event.category)}`}>
                                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{event.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formatDate(event.date)}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {event.time}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {event.location}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2 text-gray-600">No Events Found</h3>
                      <p className="text-gray-500">There are no events in this category for {months[selectedMonth]}</p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${
            selectedEvent.category === 'special' 
              ? 'bg-black/30 backdrop-blur-md' 
              : 'bg-black bg-opacity-50'
          }`}
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className={`rounded-xl shadow-xl w-full max-w-lg ${
              selectedEvent.category === 'special' 
                ? 'bg-white/40 backdrop-blur-lg border border-white/30 shadow-2xl' 
                : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-3 py-1 rounded-full ${
                  selectedEvent.category === 'special'
                    ? 'bg-white/60 backdrop-blur-sm text-green-800'
                    : getCategoryColor(selectedEvent.category)
                }`}>
                  {selectedEvent.category.charAt(0).toUpperCase() + selectedEvent.category.slice(1)}
                </span>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className={`p-2 hover:bg-white/40 rounded-lg transition ${
                    selectedEvent.category === 'special' ? 'text-white' : ''
                  }`}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <h2 className={`text-2xl font-bold mb-4 ${
                selectedEvent.category === 'special' ? 'text-white' : 'text-gray-800'
              }`}>
                {selectedEvent.title}
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className={`flex items-center ${
                  selectedEvent.category === 'special' ? 'text-white/90' : 'text-gray-600'
                }`}>
                  <CalendarIcon className="h-5 w-5 mr-3" />
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
                <div className={`flex items-center ${
                  selectedEvent.category === 'special' ? 'text-white/90' : 'text-gray-600'
                }`}>
                  <Clock className="h-5 w-5 mr-3" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className={`flex items-center ${
                  selectedEvent.category === 'special' ? 'text-white/90' : 'text-gray-600'
                }`}>
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
              
              <p className={`mb-6 ${
                selectedEvent.category === 'special' ? 'text-white/90' : 'text-gray-600'
              }`}>
                {selectedEvent.description}
              </p>
              
              {selectedEvent.category !== 'special' && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-300"
                  >
                    Close
                  </button>
                  <Link
                    href="/contact"
                    className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
                  >
                    Register / Contact
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscribe CTA */}
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

      {/* Quick Links */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link 
                href="/events"
                className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition duration-300"
              >
                <CalendarIcon className="h-10 w-10 text-accent mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Browse Events</h3>
                <p className="text-gray-600 text-sm">View all upcoming events</p>
              </Link>
              <Link 
                href="/groups"
                className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition duration-300"
              >
                <Users className="h-10 w-10 text-primary mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Join a Group</h3>
                <p className="text-gray-600 text-sm">Connect with others</p>
              </Link>
              <Link 
                href="/contact"
                className="bg-gray-50 p-6 rounded-xl text-center hover:shadow-lg transition duration-300"
              >
                <CalendarIcon className="h-10 w-10 text-secondary mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Host an Event</h3>
                <p className="text-gray-600 text-sm">Book our facilities</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

// Helper component for X icon
function X({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M6 18L18 6M6 6l12 12" 
      />
    </svg>
  )
}

