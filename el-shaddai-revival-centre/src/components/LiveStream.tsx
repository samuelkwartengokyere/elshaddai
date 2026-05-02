'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Users, MessageCircle, Clock, Calendar, RefreshCw, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface StreamInfo {
  title: string
  viewerCount: number
  scheduledStartTime?: string
  actualStartTime?: string
  videoId?: string
  embedUrl?: string
}

interface LiveStatus {
  success: boolean
  isLive: boolean
  configured: boolean
  channelId?: string
  /** Channel live slot embed (UC… id); YouTube switches to live when broadcasting */
  channelLiveEmbedUrl?: string
  streamInfo?: StreamInfo
  fallback?: {
    isLive: boolean
    serviceType?: string
    scheduledTime?: string
  }
  error?: string
  method?: string
}

export default function LiveStream() {
  const [isLive, setIsLive] = useState(false)
  const [viewers, setViewers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [streamTitle, setStreamTitle] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  /** Current live broadcast video embed (when API detects an active live stream) */
  const [liveEmbedUrl, setLiveEmbedUrl] = useState<string>('')
  /** Persistent channel live embed from admin-configured channel (resolved server-side) */
  const [channelLiveEmbedUrl, setChannelLiveEmbedUrl] = useState<string>('')

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
        setChannelLiveEmbedUrl(
          data.configured === false ? '' : (data.channelLiveEmbedUrl || '')
        )

        if (data.isLive && data.streamInfo) {
          setViewers(data.streamInfo.viewerCount)
          setStreamTitle(data.streamInfo.title)
          if (data.streamInfo.embedUrl) {
            setLiveEmbedUrl(data.streamInfo.embedUrl)
          } else if (data.streamInfo.videoId) {
            setLiveEmbedUrl(`https://www.youtube.com/embed/${data.streamInfo.videoId}`)
          } else {
            setLiveEmbedUrl('')
          }
        } else {
          setViewers(0)
          setStreamTitle('')
          setLiveEmbedUrl('')
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
      setChannelLiveEmbedUrl('')
      setLiveEmbedUrl('')

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

  // Prefer detected live video embed; else channel live slot from /api/live (matches admin YouTube URL)
  const getEmbedUrl = () => {
    if (liveEmbedUrl) return liveEmbedUrl
    if (channelLiveEmbedUrl) return channelLiveEmbedUrl
    const envId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || ''
    if (envId.startsWith('UC') && envId.length >= 22) {
      return `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(envId)}`
    }
    return ''
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
{/* Neutral placeholder - no config warning on public page */}
          {(!loading && !embedUrl) && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mb-6 text-center">
              <Play className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">Join Live During Service Times</h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                Live stream player will appear here during our scheduled services. 
                Check service times below.
              </p>
              <div className="text-sm text-gray-400">
                Next service: {getNextServiceTime()}
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
                <div className="absolute top-0 left-0 w-full h-full bg-gray-900 flex flex-col items-center justify-center text-center p-8">
                  <Play className="h-20 w-20 mx-auto mb-6 opacity-30" />
                  <div className="text-white">
                    <p className="text-xl mb-2">Live Stream Player</p>
                    <p className="text-lg mb-6 max-w-sm mx-auto leading-relaxed">
                      Player will automatically load during service times
                    </p>
                    <p className="text-sm opacity-75">Check service schedule below</p>
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
              <motion.div 
                className="border-t pt-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-lg font-bold mb-4">Service Times</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {serviceTimes.map((service, index) => (
                    <motion.div 
                      key={service.day} 
                      className="text-center p-4 bg-gray-50 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.03, y: -3 }}
                    >
                      <h4 className="font-bold text-primary">{service.day}</h4>
                      <p className="text-gray-600">
                        {service.times.join(' & ')}
                      </p>
                      <p className="text-sm text-accent mt-1">{service.label}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
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
    if (currentMinutes < 14 * 60) return 'Today at 2:00 PM (approx)'
  }
  // Wednesday
  if (day === 3 && currentMinutes < 19 * 60) return 'Today at 7:00 PM'
  // Friday
  if (day === 5 && currentMinutes < 19 * 60) return 'Today at 7:00 PM'

  // Next services
  const daysUntil = (targetDay: number) => (targetDay + 7 - day) % 7 || 7
  if (day === 0) return 'Next Wednesday at 7:00 PM'
  if (day === 1 || day === 2) return `Wednesday at 7:00 PM (${daysUntil(3)} days)`
  if (day === 3) return 'Friday at 7:00 PM'
  if (day === 4) return `Friday at 7:00 PM (1 day)`
  if (day === 5) return 'Next Sunday at 9:00 AM'
  return `Sunday at 9:00 AM (${daysUntil(0)} days)`
}

