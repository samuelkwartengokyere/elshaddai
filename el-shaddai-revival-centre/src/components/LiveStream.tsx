'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Users, MessageCircle, Clock, Calendar, RefreshCw, AlertCircle } from 'lucide-react'

interface StreamInfo {
  title: string
  viewerCount: number
  scheduledStartTime?: string
  actualStartTime?: string
}

interface LiveStatus {
  success: boolean
  isLive: boolean
  configured: boolean
  streamInfo?: StreamInfo
  fallback?: {
    isLive: boolean
    serviceType?: string
    scheduledTime?: string
  }
  error?: string
}

export default function LiveStream() {
  const [isLive, setIsLive] = useState(false)
  const [viewers, setViewers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [streamTitle, setStreamTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Service times configuration
  const serviceTimes = [
    { day: 'Sunday', times: ['9:00 AM', '11:00 AM'], label: 'Sunday Services' },
    { day: 'Wednesday', times: ['7:00 PM'], label: 'Bible Study' },
    { day: 'Friday', times: ['7:00 PM'], label: 'Youth Service' }
  ]

  // Estimate viewer count based on service time
  const getEstimatedViewers = useCallback((live: boolean): number => {
    if (!live) return 0
    
    const now = new Date()
    const day = now.getDay()
    const hour = now.getHours()
    
    // Sunday morning peak
    if (day === 0 && hour >= 9 && hour < 12) {
      return 450
    }
    // Sunday evening
    if (day === 0 && hour >= 11 && hour < 14) {
      return 300
    }
    // Wednesday Bible Study
    if (day === 3 && hour >= 19 && hour < 21) {
      return 200
    }
    // Friday Youth
    if (day === 5 && hour >= 19 && hour < 22) {
      return 250
    }
    
    return 150 // Default estimate
  }, [])

  // Fetch live status from API
  const fetchLiveStatus = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const url = '/api/live'
      const fetchUrl = forceRefresh 
        ? `${url}?refresh=true` 
        : url

      const response = await fetch(fetchUrl, {
        next: { revalidate: 60 } // Cache for 60 seconds server-side
      })

      if (!response.ok) {
        throw new Error('Failed to fetch live status')
      }

      const data: LiveStatus = await response.json()

      if (data.success) {
        setIsLive(data.isLive)
        
        if (data.isLive && data.streamInfo) {
          setViewers(data.streamInfo.viewerCount)
          setStreamTitle(data.streamInfo.title)
        } else {
          // Use estimated viewers based on time if not live
          setViewers(0)
          setStreamTitle('')
        }
      } else if (data.fallback?.isLive) {
        // Fallback to time-based detection
        setIsLive(true)
        setViewers(getEstimatedViewers(true))
        setStreamTitle(`${data.fallback.serviceType?.replace('-', ' ')} Service`)
      } else {
        setIsLive(false)
        setViewers(0)
        setStreamTitle('')
      }

      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching live status:', err)
      setError('Unable to load live status')
      
      // Fallback to time-based detection
      const now = new Date()
      const day = now.getDay()
      const hour = now.getHours()
      const isLiveTime = (day === 0 && ((hour >= 9 && hour < 12) || (hour >= 11 && hour < 14))) ||
                          (day === 3 && hour >= 19 && hour < 21) ||
                          (day === 5 && hour >= 19 && hour < 22)
      
      setIsLive(isLiveTime)
      setViewers(isLiveTime ? getEstimatedViewers(true) : 0)
    } finally {
      setLoading(false)
    }
  }, [getEstimatedViewers])

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchLiveStatus()

    // Refresh status every 30 seconds when page is visible
    const interval = setInterval(() => {
      fetchLiveStatus()
    }, 30000)

    // Refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchLiveStatus()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchLiveStatus])

  // YouTube channel ID - try settings first, then fallback to environment variable
  const [youtubeChannelId, setYoutubeChannelId] = useState<string>('')

  // Fetch YouTube channel ID from settings
  useEffect(() => {
    async function fetchYouTubeSettings() {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        
        if (data.success && data.settings?.youtube) {
          // Use channel ID from settings if available
          const channelId = data.settings.youtube.channelId || data.settings.youtube.channelUrl || ''
          setYoutubeChannelId(channelId)
        } else {
          // Fallback to environment variable
          setYoutubeChannelId(process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || '')
        }
      } catch (error) {
        console.error('Error fetching YouTube settings:', error)
        // Fallback to environment variable
        setYoutubeChannelId(process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || '')
      }
    }
    
    fetchYouTubeSettings()
  }, [])

  // Build embed URL from channel ID
  const getEmbedUrl = () => {
    const channelId = youtubeChannelId || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || ''
    if (!channelId) return ''
    
    // If it looks like a full URL, extract the channel ID
    if (channelId.includes('youtube.com')) {
      const match = channelId.match(/channel\/([a-zA-Z0-9_-]+)/)
      if (match) return `https://www.youtube.com/embed/live_stream?channel=${match[1]}`
      
      // Handle @username URLs
      const usernameMatch = channelId.match(/@([a-zA-Z0-9_-]+)/)
      if (usernameMatch) return `https://www.youtube.com/embed/${usernameMatch[1]}`
    }
    
    // Assume it's a channel ID
    return `https://www.youtube.com/embed/live_stream?channel=${channelId}`
  }
  
  const embedUrl = getEmbedUrl()

  return (
    <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4">Join Our Live Stream</h2>
          <p className="text-xl text-gray-600">Worship with us, wherever you are</p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* YouTube not configured message */}
          {!embedUrl && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-700">YouTube Channel Not Configured</h3>
                  <p className="text-sm text-yellow-600 mt-1">
                    To enable live streaming, please configure your YouTube channel in the admin settings.
                  </p>
                  <a
                    href="/admin/settings"
                    className="inline-block mt-3 text-sm text-accent hover:text-red-600 font-medium"
                  >
                    Go to Settings →
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
            {/* Video Player */}
            <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen
                  title="Live Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-900 flex items-center justify-center">
                  <div className="text-center text-gray-400 p-4">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Live stream player not available</p>
                    <p className="text-sm mt-2">Configure YouTube channel in admin settings</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div className="bg-white p-6">
              {/* Status Bar */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="flex items-center space-x-4 mb-4 md:mb-0">
                  {/* Live Status Badge */}
                  <div className={`px-4 py-2 rounded-full flex items-center ${
                    isLive 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {loading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        isLive ? 'bg-red-600 animate-pulse' : 'bg-gray-400'
                      }`} />
                    )}
                    <span className="font-semibold">
                      {loading ? 'Loading...' : isLive ? 'LIVE NOW' : 'OFFLINE'}
                    </span>
                  </div>

                  {/* Viewer Count */}
                  {isLive && viewers > 0 && (
                    <div className="flex items-center text-gray-600">
                      <Users className="h-5 w-5 mr-2" />
                      <span className="font-medium">
                        {viewers.toLocaleString()} watching
                      </span>
                    </div>
                  )}

                  {/* Stream Title (when live) */}
                  {isLive && streamTitle && (
                    <div className="hidden md:block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {streamTitle}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-4">
                  {isLive ? (
                    <a
                      href="https://www.youtube.com/live"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Join Live
                    </a>
                  ) : (
                    <button className="btn-primary flex items-center bg-gray-400 cursor-not-allowed">
                      <Calendar className="h-5 w-5 mr-2" />
                      Next Service
                    </button>
                  )}
                  <a
                    href="https://www.youtube.com/live_chat"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Chat
                  </a>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
                  {error} • Showing estimated times
                </div>
              )}

              {/* Last Updated */}
              {lastUpdated && !loading && (
                <div className="mb-4 text-xs text-gray-400 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
                  <button
                    onClick={() => fetchLiveStatus(true)}
                    className="ml-2 text-blue-500 hover:text-blue-700 flex items-center"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </button>
                </div>
              )}

              {/* Service Times */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold mb-4">Service Times</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {serviceTimes.map((service) => (
                    <div key={service.day} className="text-center p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-bold text-primary">{service.day}</h4>
                      <p className="text-gray-600">
                        {service.times.join(' & ')}
                      </p>
                      <p className="text-sm text-accent mt-1">{service.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    </section>
  )
}

// Helper function to get next service time
function getNextServiceTime(): string {
  const now = new Date()
  const day = now.getDay()
  const hour = now.getHours()
  const currentMinutes = hour * 60 + now.getMinutes()

  // Today's services
  // Sunday
  if (day === 0) {
    if (currentMinutes < 9 * 60) return 'Today at 9:00 AM'
    if (currentMinutes < 11 * 60) return 'Today at 11:00 AM'
  }
  // Wednesday
  if (day === 3 && currentMinutes < 19 * 60) return 'Today at 7:00 PM'
  // Friday
  if (day === 5 && currentMinutes < 19 * 60) return 'Today at 7:00 PM'

  // Next service
  // Next Sunday
  if (day === 0) return 'Next Sunday at 9:00 AM'
  // Next Wednesday
  if (day === 1 || day === 2) return 'Wednesday at 7:00 PM'
  if (day === 3) return 'Wednesday at 7:00 PM'
  // Next Friday
  if (day === 4) return 'Friday at 7:00 PM'
  if (day === 5) return 'Friday at 7:00 PM'
  // Next Sunday
  return 'Sunday at 9:00 AM'
}

