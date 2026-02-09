'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw
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

const categories = [
  { id: 'holiday', label: 'Public Holiday', color: 'bg-blue-500' },
  { id: 'special', label: 'Special Program', color: 'bg-green-500' },
  { id: 'revival', label: 'Revival Week', color: 'bg-orange-500' }
]

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Generate years from 2020 to 2099
const years = Array.from({ length: 80 }, (_, i) => 2020 + i)

export default function AdminCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  const [showModal, setShowModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: 'All Day',
    endDate: '',
    endTime: '',
    location: 'Church Premises',
    category: 'special' as 'holiday' | 'special' | 'revival',
    recurring: false,
    colorCode: '#3B82F6'
  })

  const [csvData, setCsvData] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({ year: selectedYear.toString() })
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }
      
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

  useEffect(() => {
    fetchEvents()
  }, [selectedYear, selectedCategory])

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: 'All Day',
      endDate: '',
      endTime: '',
      location: 'Church Premises',
      category: 'special',
      recurring: false,
      colorCode: '#3B82F6'
    })
    setEditingEvent(null)
  }

  // Open modal for new event
  const openNewEventModal = () => {
    resetForm()
    setShowModal(true)
  }

  // Open modal for editing
  const openEditModal = (event: CalendarEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time,
      endDate: event.endDate || '',
      endTime: event.endTime || '',
      location: event.location,
      category: event.category,
      recurring: event.recurring,
      colorCode: event.colorCode || '#3B82F6'
    })
    setShowModal(true)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    try {
      const url = editingEvent 
        ? `/api/calendar?id=${editingEvent._id}`
        : '/api/calendar'
      
      const response = await fetch(url, {
        method: editingEvent ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          year: selectedYear
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(editingEvent ? 'Event updated successfully' : 'Event created successfully')
        setShowModal(false)
        resetForm()
        fetchEvents()
      } else {
        setError(data.error || 'Failed to save event')
      }
    } catch (err) {
      setError('Failed to save event')
    }
  }

  // Delete event
  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch(`/api/calendar?id=${eventId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess('Event deleted successfully')
        fetchEvents()
      } else {
        setError(data.error || 'Failed to delete event')
      }
    } catch (err) {
      setError('Failed to delete event')
    }
  }

  // Delete all events for a year
  const handleDeleteAll = async () => {
    if (!confirm(`Are you sure you want to delete ALL events for ${selectedYear}? This cannot be undone!`)) return
    
    setError('')
    setSuccess('')
    
    try {
      const response = await fetch(`/api/calendar?year=${selectedYear}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(`${data.count} events deleted successfully`)
        fetchEvents()
      } else {
        setError(data.error || 'Failed to delete events')
      }
    } catch (err) {
      setError('Failed to delete events')
    }
  }

  // Handle CSV import
  const handleCsvImport = async () => {
    if (!csvData.trim()) {
      setError('Please paste CSV data first')
      return
    }
    
    setError('')
    setSuccess('')
    
    try {
      // Parse CSV
      const lines = csvData.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      const events = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length >= 2) {
          const event: Record<string, unknown> = {
            title: values[0],
            date: values[1],
            time: values[2] || 'All Day',
            location: values[3] || 'Church Premises',
            category: values[4] || 'special',
            year: selectedYear
          }
          events.push(event)
        }
      }
      
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(events)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccess(`${data.count} events imported successfully`)
        setShowImportModal(false)
        setCsvData('')
        fetchEvents()
      } else {
        setError(data.error || 'Failed to import events')
      }
    } catch (err) {
      setError('Failed to import CSV data')
    }
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.color : 'bg-gray-500'
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Calendar Management</h1>
              <p className="opacity-90 mt-1">Manage church calendar events</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </button>
              <button
                onClick={openNewEventModal}
                className="flex items-center gap-2 bg-accent hover:bg-red-700 px-4 py-2 rounded-lg transition"
              >
                <Plus className="h-4 w-4" />
                Add Event
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Year Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedYear(prev => prev - 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSelectedYear(prev => prev + 1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchEvents}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              {events.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All {selectedYear}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mx-4 mt-4 rounded-lg flex items-center">
          <Check className="h-4 w-4 mr-2" />
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-4 mt-4 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {/* Events Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-gray-600">No Events Found</h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory !== 'all' 
                ? `No ${categories.find(c => c.id === selectedCategory)?.label} events for ${selectedYear}`
                : `No calendar events for ${selectedYear}`
              }
            </p>
            <button
              onClick={openNewEventModal}
              className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              <Plus className="h-4 w-4" />
              Add First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300"
              >
                <div className={`h-2 ${getCategoryColor(event.category)}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(event.category)}`}>
                      {categories.find(c => c.id === event.category)?.label}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(event)}
                        className="p-1.5 text-gray-400 hover:text-accent hover:bg-gray-100 rounded transition"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{event.title}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    {event.time !== 'All Day' && (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 text-gray-400" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 text-gray-400" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    placeholder="e.g., Power Conference"
                  />
                </div>

                {/* Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      type="text"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                      placeholder="All Day"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input
                      type="text"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                {/* Category & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => {
                        const cat = e.target.value as 'holiday' | 'special' | 'revival'
                        setFormData({ ...formData, category: cat })
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent"
                    placeholder="Brief description of the event..."
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      resetForm()
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg z-10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Import Events from CSV</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">CSV Format:</h4>
                  <code className="text-xs text-blue-600 block">
                    title,date,time,location,category
                  </code>
                  <p className="text-xs text-blue-600 mt-2">
                    Example: Power Conference,2026-05-25,All Day,Church Premises,special
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Paste CSV Data
                  </label>
                  <textarea
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent font-mono text-sm"
                    placeholder="title,date,time,location,category&#10;Power Conference,2026-05-25,All Day,Church Premises,special&#10;New Year's Day,2026-01-01,All Day,National Holiday,holiday"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCsvImport}
                    className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Import Events
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

