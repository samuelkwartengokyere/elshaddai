'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Users, ArrowRight, ChevronLeft, ChevronRight, Search, Filter, Loader2, AlertCircle } from 'lucide-react'

// Event categories
const categories = [
  { id: 'all', label: 'All Events' },
  { id: 'worship', label: 'Worship' },
  { id: 'youth', label: 'Youth' },
  { id: 'children', label: 'Children' },
  { id: 'outreach', label: 'Outreach' },
  { id: 'fellowship', label: 'Fellowship' },
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

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
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

  useEffect(() => {
    fetchEvents()
  }, [pagination.page, selectedCategory])

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
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Calendar className="h-16 w-16 text-accent mx-auto mb-6" />
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
              {categories.map(category => (
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
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                  className="p-2 rounded-full hover:bg-gray-100 transition duration-300"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="font-medium min-w-[150px] text-center">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                  className="p-2 rounded-full hover:bg-gray-100 transition duration-300"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
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
                      <Calendar className="h-16 w-16 text-white opacity-50" />
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
                          <Calendar className="h-4 w-4 mr-2" />
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

                      {/* Learn More Link */}
                      <Link
                        href={`/events/${event._id}`}
                        className="inline-flex items-center text-accent hover:text-red-600 font-medium text-sm transition duration-300"
                      >
                        Learn More <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
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
              <Calendar className="h-12 w-12 text-accent mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Monthly Calendar</h2>
              <p className="text-gray-600">
                View all upcoming events on our monthly calendar
              </p>
            </div>

            {/* Simple Calendar Grid */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, index) => {
                  const day = index - 6 + 1 // Adjust for month starting on different day
                  const isCurrentMonth = day > 0 && day <= 31
                  const hasEvent = [5, 8, 10, 15, 18, 25].includes(day) // Sample event days

                  return (
                    <div
                      key={index}
                      className={`p-2 text-center rounded-lg min-h-[60px] ${
                        isCurrentMonth
                          ? hasEvent
                            ? 'bg-accent-10 cursor-pointer hover:bg-opacity-20'
                            : 'hover:bg-gray-50'
                          : 'text-gray-300'
                      }`}
                    >
                      {isCurrentMonth && (
                        <>
                          <span className={`text-sm font-medium ${hasEvent ? 'text-accent font-bold' : 'text-gray-700'}`}>
                            {day}
                          </span>
                          {hasEvent && (
                            <div className="flex justify-center mt-1">
                              <div className="h-1.5 w-1.5 rounded-full bg-accent"></div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/calendar"
                  className="inline-flex items-center text-accent hover:text-red-600 font-medium"
                >
                  View Full Calendar <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
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
                      <Calendar className="h-5 w-5 text-accent" />
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

