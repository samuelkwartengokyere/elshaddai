'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Calendar, 
  Trash2, 
  Edit,
  Eye,
  Clock,
  MapPin,
  Users,
  Loader2,
  X,
  Filter
} from 'lucide-react'

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

type EventCategory = 'worship' | 'youth' | 'children' | 'outreach' | 'fellowship' | 'other'

interface EventFormData {
  title: string
  description: string
  date: string
  time: string
  location: string
  category: EventCategory
  recurring: boolean
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    location: '',
    category: 'other',
    recurring: false
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchEvents = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      if (categoryFilter) params.append('category', categoryFilter)

      const response = await fetch(`/api/events?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setEvents(data.events)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }))
      }
    } catch (err) {
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [pagination.page, categoryFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchEvents()
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Event created successfully!')
        setShowCreateModal(false)
        setFormData({
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          time: '',
          location: '',
          category: 'other',
          recurring: false
        })
        fetchEvents()
      } else {
        setError(data.error || 'Failed to create event')
      }
    } catch (err) {
      setError('An error occurred while creating event')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        fetchEvents()
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
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

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent w-64"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="worship">Worship</option>
              <option value="youth">Youth</option>
              <option value="children">Children</option>
              <option value="outreach">Outreach</option>
              <option value="fellowship">Fellowship</option>
              <option value="other">Other</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Search
            </button>
          </form>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Events</p>
          <p className="text-2xl font-bold">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">This Page</p>
          <p className="text-2xl font-bold text-accent">{events.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Categories</p>
          <p className="text-2xl font-bold text-blue-500">6</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Published</p>
          <p className="text-2xl font-bold text-green-500">
            {events.filter(e => e.isPublished).length}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-gray-600">Loading events...</span>
        </div>
      )}

      {/* Events Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition duration-300">
                {/* Event Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                    {event.recurring && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Recurring
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-gray-800 mb-2 truncate">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-between mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="flex items-center text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                    <Link
                      href={`/admin/events`}
                      className="flex items-center text-accent hover:text-red-600"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {events.length === 0 && (
            <div className="text-center py-20 bg-white rounded-lg shadow">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No events found</h3>
              <p className="text-gray-600 mb-4">
                {search || categoryFilter
                  ? 'Try adjusting your search or filters'
                  : 'Create your first event to get started'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300 inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Event
              </button>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
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
        </>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Create New Event</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-4">
              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  {success}
                </div>
              )}

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={3}
                  placeholder="Describe the event"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="e.g., Main Sanctuary"
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as EventCategory }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value="worship">Worship</option>
                  <option value="youth">Youth</option>
                  <option value="children">Children</option>
                  <option value="outreach">Outreach</option>
                  <option value="fellowship">Fellowship</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Recurring */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.recurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">This is a recurring event</span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {uploading ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

