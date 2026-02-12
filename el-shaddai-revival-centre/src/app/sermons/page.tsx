'use client'
import { useState, useEffect } from 'react'
import SermonCard from '@/components/SermonCard'
import { Search, Filter, Loader2, Database, Youtube } from 'lucide-react'

interface Sermon {
  _id: string
  id: string
  title: string
  speaker: string
  date: string
  description: string
  thumbnail?: string
  audioUrl?: string
  videoUrl?: string
  duration?: string
  series?: string
  biblePassage?: string
  isYouTube?: boolean
  embedUrl?: string
  source?: 'youtube' | 'database'
}

interface Settings {
  youtube?: {
    channelId?: string
    channelUrl?: string
    apiKey?: string
    configured?: boolean
  }
}

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [speaker, setSpeaker] = useState('')
  const [series, setSeries] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [databaseCount, setDatabaseCount] = useState(0)
  const [youtubeCount, setYoutubeCount] = useState(0)
  const [youtubeConfigured, setYoutubeConfigured] = useState(false)
  const [settings, setSettings] = useState<Settings>({})

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings || {})
        // Check if YouTube is configured (has channelId or channelUrl)
        const ytConfigured = !!(data.settings?.youtube?.channelId || data.settings?.youtube?.channelUrl)
        setYoutubeConfigured(ytConfigured)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const fetchSermons = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      if (search) params.append('search', search)
      if (speaker) params.append('speaker', speaker)
      if (series) params.append('series', series)

      // Fetch both database sermons and YouTube videos
      params.append('youtube', 'true')
      
      const response = await fetch(`/api/sermons?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setSermons(data.sermons)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }))
        setDatabaseCount(data.databaseCount || 0)
        setYoutubeCount(data.youtubeCount || 0)
      }
    } catch (error) {
      console.error('Error fetching sermons:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initial load - fetch settings first, then sermons
  useEffect(() => {
    fetchSettings()
  }, [])

  // Fetch sermons after settings (to know if YouTube is configured)
  useEffect(() => {
    if (youtubeConfigured !== undefined) {
      fetchSermons()
    }
  }, [youtubeConfigured])

  // Fetch when pagination changes (separate from filters)
  useEffect(() => {
    fetchSermons()
  }, [pagination.page])

  // Auto-search when search, speaker, or series changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only reset page to 1 if we're not already on page 1
      if (pagination.page !== 1) {
        setPagination(prev => ({ ...prev, page: 1 }))
      } else {
        fetchSermons()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [search, speaker, series])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchSermons()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Sermon Library</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our collection of messages to grow in faith and understanding
          </p>
        </div>

        {/* Stats Bar */}
        {/* {(youtubeCount > 0 || databaseCount > 0) && (
          <div className="max-w-4xl mx-auto mb-8 flex justify-center gap-6">
            {youtubeCount > 0 && (
              <div className="flex items-center bg-red-50 text-red-700 px-4 py-2 rounded-full">
                <Youtube className="h-5 w-5 mr-2" />
                <span className="font-medium">{youtubeCount} YouTube Videos</span>
              </div>
            )}
            {databaseCount > 0 && (
              <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                <Database className="h-5 w-5 mr-2" />
                <span className="font-medium">{databaseCount} Uploaded Sermons</span>
              </div>
            )}
          </div>
        )} */}

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sermons by title, speaker, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <input
              type="text"
              placeholder="Filter by speaker..."
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Filter by series..."
              value={series}
              onChange={(e) => setSeries(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              type="submit"
              className="flex items-center justify-center px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              <Filter className="h-5 w-5 mr-2" />
              Search
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-2 text-gray-600">Loading sermons...</span>
          </div>
        )}

        {/* Sermon Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sermons.map((sermon) => (
                <SermonCard 
                  key={sermon._id || sermon.id} 
                  sermon={sermon} 
                  source={sermon.source}
                />
              ))}
            </div>

            {/* Empty State */}
            {sermons.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold mb-4">No sermons found</h3>
                <p className="text-gray-600">Check back soon for new messages!</p>
              </div>
            )}

            {/* Pagination with Previous/Next buttons and range info */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col items-center mt-12 space-y-4">
                {/* Range Info */}
                {/* <p className="text-gray-600">
                  Showing{' '}
                  <span className="font-semibold">
                    {((pagination.page - 1) * pagination.limit) + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-semibold">{pagination.total}</span> sermons
                </p> */}
                
                {/* Previous/Next Buttons with << and >> icons */}
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setPagination(prev => ({ ...prev, page: prev.page - 1 })) }}
                    disabled={pagination.page === 1}
                    className={`flex items-center px-4 py-2 rounded-lg transition duration-300 ${
                      pagination.page === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-accent text-white hover:bg-red-700'
                    }`}
                  >
                    <span className="text-lg font-bold mr-2">«</span>
                    Previous
                  </button>
                  
                  {/* Page indicator */}
                  <span className="text-gray-600 font-medium px-4">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); setPagination(prev => ({ ...prev, page: prev.page + 1 })) }}
                    disabled={pagination.page === pagination.totalPages}
                    className={`flex items-center px-4 py-2 rounded-lg transition duration-300 ${
                      pagination.page === pagination.totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-accent text-white hover:bg-red-700'
                    }`}
                  >
                    Next
                    <span className="text-lg font-bold ml-2">»</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

