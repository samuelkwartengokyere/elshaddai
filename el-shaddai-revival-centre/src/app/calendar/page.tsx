'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MapPin,
  ArrowRight,
  Filter,
  List,
  Grid,
  Users
} from 'lucide-react'

// Sample events data
const events = [
  {
    id: 1,
    title: 'Sunday Worship Service',
    date: '2025-01-05',
    time: '9:00 AM & 11:00 AM',
    location: 'Main Sanctuary',
    category: 'worship',
    recurring: true,
    description: 'Join us for uplifting worship, biblical teaching, and community fellowship.'
  },
  {
    id: 2,
    title: 'Youth Friday Night Live',
    date: '2025-01-10',
    time: '7:00 PM',
    location: 'Youth Center',
    category: 'youth',
    recurring: true,
    description: 'A fun-filled evening for middle and high school students with games, worship, and teaching.'
  },
  {
    id: 3,
    title: 'Wednesday Bible Study',
    date: '2025-01-08',
    time: '7:00 PM',
    location: 'Fellowship Hall',
    category: 'worship',
    recurring: true,
    description: 'Deep dive into Scripture with our senior pastor. All ages welcome.'
  },
  {
    id: 4,
    title: 'Community Food Drive',
    date: '2025-01-15',
    time: '10:00 AM - 2:00 PM',
    location: 'Church Parking Lot',
    category: 'outreach',
    recurring: false,
    description: 'Help us serve our community by collecting and distributing food to families in need.'
  },
  {
    id: 5,
    title: 'Kids Church Camp',
    date: '2025-03-10',
    time: 'All Day',
    location: 'Camp Meadowview',
    category: 'children',
    recurring: false,
    description: 'A week of fun, friends, and faith for children ages 6-12.'
  },
  {
    id: 6,
    title: "Couples Night Out",
    date: '2025-01-18',
    time: '7:00 PM',
    location: 'Main Sanctuary',
    category: 'fellowship',
    recurring: false,
    description: 'An evening of encouragement and connection for married couples.'
  },
  {
    id: 7,
    title: "Men's Breakfast",
    date: '2025-01-25',
    time: '8:00 AM',
    location: 'Fellowship Hall',
    category: 'fellowship',
    recurring: false,
    description: "Start your Saturday with great food, fellowship, and encouragement."
  },
  {
    id: 8,
    title: "Women's Tea Party",
    date: '2025-02-01',
    time: '2:00 PM',
    location: 'Fellowship Hall',
    category: 'fellowship',
    recurring: false,
    description: 'An elegant afternoon tea for women of all ages. Guest speaker: Sarah Johnson.'
  },
  {
    id: 9,
    title: 'Leadership Conference',
    date: '2025-02-14',
    time: '9:00 AM - 5:00 PM',
    location: 'Conference Center',
    category: 'training',
    recurring: false,
    description: 'A day of training and equipping for church leaders and ministry heads.'
  },
  {
    id: 10,
    title: 'Monthly Communion Service',
    date: '2025-02-02',
    time: '11:00 AM',
    location: 'Main Sanctuary',
    category: 'worship',
    recurring: true,
    description: 'Join us for our monthly communion service as we remember Jesus together.'
  }
]

const categories = [
  { id: 'all', label: 'All Events', color: 'bg-gray-100 text-gray-800' },
  { id: 'worship', label: 'Worship', color: 'bg-blue-100 text-blue-800' },
  { id: 'youth', label: 'Youth', color: 'bg-purple-100 text-purple-800' },
  { id: 'children', label: 'Children', color: 'bg-green-100 text-green-800' },
  { id: 'outreach', label: 'Outreach', color: 'bg-orange-100 text-orange-800' },
  { id: 'fellowship', label: 'Fellowship', color: 'bg-pink-100 text-pink-800' },
  { id: 'training', label: 'Training', color: 'bg-indigo-100 text-indigo-800' },
]

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function CalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null)

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
  }, [selectedMonth, selectedYear, selectedCategory])

  // Get events for a specific day
  const getEventsForDay = (day: number | null) => {
    if (!day) return []
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Calendar</h1>
          <p className="text-xl opacity-90">
            Stay updated with all upcoming events and services at El-Shaddai Revival Centre
          </p>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Calendar Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
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

              {viewMode === 'month' ? (
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
                              <div className="mt-1 space-y-1">
                                {dayEvents.slice(0, 2).map(event => (
                                  <div
                                    key={event.id}
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
              ) : (
                /* List View */
                <div className="space-y-4">
                  {monthEvents.length > 0 ? (
                    monthEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                      <div
                        key={event.id}
                        className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition duration-300 cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(event.category)}`}>
                                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                              </span>
                              {event.recurring && (
                                <span className="text-xs text-gray-500">Weekly</span>
                              )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{event.title}</h3>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
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
                      <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2 text-gray-600">No Events Found</h3>
                      <p className="text-gray-500">There are no events in this category for {months[selectedMonth]}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(selectedEvent.category)}`}>
                  {selectedEvent.category.charAt(0).toUpperCase() + selectedEvent.category.slice(1)}
                </span>
                {selectedEvent.recurring && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    Weekly Event
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-4">{selectedEvent.title}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-3" />
                  <span>{formatDate(selectedEvent.date)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-3" />
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span>{selectedEvent.location}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{selectedEvent.description}</p>
              
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
                <Calendar className="h-10 w-10 text-accent mx-auto mb-3" />
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
                <Calendar className="h-10 w-10 text-secondary mx-auto mb-3" />
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

