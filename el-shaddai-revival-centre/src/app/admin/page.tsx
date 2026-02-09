'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  FileAudio, 
  Image, 
  Calendar, 
  Users, 
  MessageSquare,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  AlertCircle
} from 'lucide-react'

interface Stats {
  totalSermons: number
  totalMedia: number
  totalEvents: number
  totalTestimonies: number
}

interface RecentItem {
  _id: string
  title: string
  date: string
  type?: string
  uploadedAt?: string
}

interface DashboardData {
  stats: Stats
  recentSermons: RecentItem[]
  recentMedia: RecentItem[]
  recentEvents: RecentItem[]
  recentTestimonies: RecentItem[]
}

// Fallback data when database is not connected
const fallbackData: DashboardData = {
  stats: { totalSermons: 0, totalMedia: 0, totalEvents: 0, totalTestimonies: 0 },
  recentSermons: [],
  recentMedia: [],
  recentEvents: [],
  recentTestimonies: []
}

// Timeout for each individual API request
const API_TIMEOUT_MS = 5000
// Maximum time to wait before showing the page with fallback data
const MAX_LOAD_TIME_MS = 10000

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Helper function to fetch with timeout
  const fetchWithTimeout = async (url: string, timeout: number): Promise<Response> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    const errors: string[] = []
    let hasTimeout = false

    // Set up a timeout to show the page even if data is still loading
    const maxLoadTimeout = setTimeout(() => {
      if (loading) {
        console.warn('Dashboard load timeout - showing fallback data')
        setError('Database connection timed out. Showing limited data.')
        setData(fallbackData)
        setConnectionStatus('disconnected')
        setLoading(false)
      }
    }, MAX_LOAD_TIME_MS)

    try {
      // Fetch all data in parallel with individual timeouts
      const fetchPromises = [
        fetchWithTimeout('/api/sermons?limit=5', API_TIMEOUT_MS)
          .then(res => res.json())
          .then(data => ({ type: 'sermons', data }))
          .catch(err => {
            console.warn('Sermons fetch failed:', err)
            errors.push('Sermons unavailable')
            hasTimeout = true
            return { type: 'sermons', data: { pagination: { total: 0 }, sermons: [] } }
          }),
        fetchWithTimeout('/api/media?limit=5', API_TIMEOUT_MS)
          .then(res => res.json())
          .then(data => ({ type: 'media', data }))
          .catch(err => {
            console.warn('Media fetch failed:', err)
            errors.push('Media unavailable')
            hasTimeout = true
            return { type: 'media', data: { pagination: { total: 0 }, media: [] } }
          }),
        fetchWithTimeout('/api/events?limit=5', API_TIMEOUT_MS)
          .then(res => res.json())
          .then(data => ({ type: 'events', data }))
          .catch(err => {
            console.warn('Events fetch failed:', err)
            errors.push('Events unavailable')
            hasTimeout = true
            return { type: 'events', data: { pagination: { total: 0 }, events: [] } }
          }),
        fetchWithTimeout('/api/testimonies?limit=5', API_TIMEOUT_MS)
          .then(res => res.json())
          .then(data => ({ type: 'testimonies', data }))
          .catch(err => {
            console.warn('Testimonies fetch failed:', err)
            errors.push('Testimonies unavailable')
            hasTimeout = true
            return { type: 'testimonies', data: { pagination: { total: 0 }, testimonies: [] } }
          })
      ]

      const results = await Promise.all(fetchPromises)

      // Clear the max load timeout since we got responses
      clearTimeout(maxLoadTimeout)

      // Process results
      const sermonsData = results.find(r => r.type === 'sermons')?.data || {}
      const mediaData = results.find(r => r.type === 'media')?.data || {}
      const eventsData = results.find(r => r.type === 'events')?.data || {}
      const testimoniesData = results.find(r => r.type === 'testimonies')?.data || {}

      // Check if any API returned an error (not just timeout)
      const hasErrors = results.some(r => r.data.error)

      setData({
        stats: {
          totalSermons: sermonsData.pagination?.total || 0,
          totalMedia: mediaData.pagination?.total || 0,
          totalEvents: eventsData.pagination?.total || 0,
          totalTestimonies: testimoniesData.pagination?.total || 0
        },
        recentSermons: sermonsData.sermons || [],
        recentMedia: mediaData.media || [],
        recentEvents: eventsData.events || [],
        recentTestimonies: testimoniesData.testimonies || []
      })

      // Set error message if there were issues
      if (errors.length > 0) {
        setError(`Some data could not be loaded: ${errors.join(', ')}`)
        setConnectionStatus('disconnected')
      } else if (hasTimeout) {
        setError('Database connection timed out. Some data may be incomplete.')
        setConnectionStatus('disconnected')
      } else {
        setConnectionStatus('connected')
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Showing demo mode.')
      setData(fallbackData)
      setConnectionStatus('disconnected')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Sermons',
      value: data?.stats.totalSermons || 0,
      icon: FileAudio,
      color: 'bg-blue-500',
      href: '/admin/sermons',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Media Library',
      value: data?.stats.totalMedia || 0,
      icon: Image,
      color: 'bg-purple-500',
      href: '/admin/media',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Upcoming Events',
      value: data?.stats.totalEvents || 0,
      icon: Calendar,
      color: 'bg-green-500',
      href: '/admin/events',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Testimonies',
      value: data?.stats.totalTestimonies || 0,
      icon: MessageSquare,
      color: 'bg-orange-500',
      href: '/admin/testimonies',
      change: '+15%',
      trend: 'up'
    }
  ]

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to El-Shaddai Revival Centre Admin Panel</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
          {error} - Showing demo data
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link
              key={index}
              href={stat.href}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
              <p className="text-gray-600 text-sm">{stat.title}</p>
              <div className="mt-3 text-accent text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition duration-300">
                View All <ArrowUpRight className="h-4 w-4 ml-1" />
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/admin/sermons/upload"
          className="flex items-center p-4 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
        >
          <Plus className="h-5 w-5 mr-3" />
          Upload New Sermon
        </Link>
        <button
          onClick={() => window.open('/admin/events', '_self')}
          className="flex items-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
        >
          <Plus className="h-5 w-5 mr-3" />
          Create New Event
        </button>
        <button
          onClick={() => window.open('/admin/testimonies', '_self')}
          className="flex items-center p-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-300"
        >
          <Plus className="h-5 w-5 mr-3" />
          Add Testimony
        </button>
        <button
          onClick={() => window.open('/admin/teams', '_self')}
          className="flex items-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
        >
          <Plus className="h-5 w-5 mr-3" />
          Add Team Member
        </button>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sermons */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <FileAudio className="h-5 w-5 mr-2 text-accent" />
              Recent Sermons
            </h2>
            <Link href="/admin/sermons" className="text-accent hover:text-red-600 text-sm font-medium">
              View All
            </Link>
          </div>
          {data?.recentSermons && data.recentSermons.length > 0 ? (
            <div className="space-y-4">
              {data.recentSermons.map((sermon) => (
                <div key={sermon._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300">
                  <div>
                    <p className="font-medium text-gray-800">{sermon.title}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(sermon.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/admin/sermons`} className="text-gray-400 hover:text-accent">
                    →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileAudio className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No sermons yet</p>
              <Link href="/admin/sermons/upload" className="text-accent hover:text-red-600 text-sm mt-2 inline-block">
                Upload your first sermon
              </Link>
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-green-500" />
              Upcoming Events
            </h2>
            <Link href="/admin/events" className="text-accent hover:text-red-600 text-sm font-medium">
              View All
            </Link>
          </div>
          {data?.recentEvents && data.recentEvents.length > 0 ? (
            <div className="space-y-4">
              {data.recentEvents.map((event) => (
                <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300">
                  <div>
                    <p className="font-medium text-gray-800">{event.title}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/admin/events`} className="text-gray-400 hover:text-accent">
                    →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No events yet</p>
              <Link href="/admin/events/create" className="text-accent hover:text-red-600 text-sm mt-2 inline-block">
                Create your first event
              </Link>
            </div>
          )}
        </div>

        {/* Recent Testimonies */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-orange-500" />
              Recent Testimonies
            </h2>
            <Link href="/admin/testimonies" className="text-accent hover:text-red-600 text-sm font-medium">
              View All
            </Link>
          </div>
          {data?.recentTestimonies && data.recentTestimonies.length > 0 ? (
            <div className="space-y-4">
              {data.recentTestimonies.map((testimony) => (
                <div key={testimony._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300">
                  <div>
                    <p className="font-medium text-gray-800">{testimony.title || 'Testimony'}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(testimony.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Link href={`/admin/testimonies`} className="text-gray-400 hover:text-accent">
                    →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No testimonies yet</p>
              <Link href="/admin/testimonies/create" className="text-accent hover:text-red-600 text-sm mt-2 inline-block">
                Add your first testimony
              </Link>
            </div>
          )}
        </div>

        {/* Recent Media */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Image className="h-5 w-5 mr-2 text-purple-500" />
              Recent Media
            </h2>
            <Link href="/admin/media" className="text-accent hover:text-red-600 text-sm font-medium">
              View All
            </Link>
          </div>
          {data?.recentMedia && data.recentMedia.length > 0 ? (
            <div className="space-y-4">
              {data.recentMedia.map((media) => (
                <div key={media._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-300">
                  <div>
                    <p className="font-medium text-gray-800">{media.title}</p>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(media.uploadedAt || media.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-200 rounded capitalize">
                    {media.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No media yet</p>
              <Link href="/admin/media" className="text-accent hover:text-red-600 text-sm mt-2 inline-block">
                Upload your first media
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="mt-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`flex items-center p-4 ${connectionStatus === 'connected' ? 'bg-green-50' : 'bg-yellow-50'} rounded-lg`}>
            <div className={`h-3 w-3 ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'} rounded-full mr-3 ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}></div>
            <span className={`${connectionStatus === 'connected' ? 'text-green-700' : 'text-yellow-700'} font-medium`}>
              {connectionStatus === 'connected' ? 'Database Connected' : 'Database Disconnected'}
            </span>
          </div>
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-green-700 font-medium">API Services Online</span>
          </div>
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
            <span className="text-green-700 font-medium">Storage Available</span>
          </div>
        </div>
        {connectionStatus === 'disconnected' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
            <div>
              <p className="text-yellow-700 font-medium">Database connection issue detected</p>
              <p className="text-yellow-600 text-sm mt-1">
                The admin panel is running in demo mode. To connect the database:
              </p>
              <ul className="text-yellow-600 text-sm mt-2 list-disc list-inside">
                <li>Add MONGODB_URI to your .env.local file</li>
                <li>Restart the development server</li>
                <li>Or use the admin panel to manage content without database persistence</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

