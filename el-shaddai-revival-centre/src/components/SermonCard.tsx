'use client'
import Image from 'next/image'
import { PlayCircle, Calendar, User, Youtube, ExternalLink, X } from 'lucide-react'
import { useState } from 'react'

interface SermonCardProps {
  sermon: {
    _id?: string
    id?: string
    title: string
    speaker: string
    date: string
    description?: string
    thumbnail?: string
    audioUrl?: string
    videoUrl?: string
    embedUrl?: string
    duration?: string
    series?: string
    isYouTube?: boolean
  }
  source?: 'youtube' | 'database'
}

export default function SermonCard({ sermon, source }: SermonCardProps) {
  const isYouTube = source === 'youtube' || sermon.isYouTube
  const videoUrl = sermon.videoUrl || sermon.embedUrl || ''
  const [showVideoModal, setShowVideoModal] = useState(false)

  // Extract video ID for YouTube embed
  const getYouTubeVideoId = () => {
    if (!videoUrl) return null
    const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const videoId = getYouTubeVideoId()

  // Generate YouTube embed URL
  const getEmbedUrl = () => {
    if (!videoId) return ''
    // Check if it's a YouTube video and use embed URL
    if (isYouTube || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    }
    // For other videos, return the original URL
    return videoUrl
  }

  return (
    <>
      <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 ${isYouTube ? 'ring-2 ring-red-100' : ''}`}>
        {/* YouTube Badge */}
        {isYouTube && (
          <div className="bg-red-600 text-white px-3 py-1 flex items-center text-xs font-medium">
            <Youtube className="h-3 w-3 mr-1" />
            YouTube
          </div>
        )}

        {/* Video Thumbnail */}
        <div className="relative h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
          {sermon.thumbnail ? (
            <Image 
              src={sermon.thumbnail} 
              alt={sermon.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <PlayCircle className="h-12 w-12 text-gray-400" />
            </div>
          )}
        
          {/* Play Button Overlay */}
          {videoId && (
            <button 
              onClick={() => setShowVideoModal(true)}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition duration-300 group"
              aria-label={`Watch ${sermon.title}`}
            >
              {isYouTube ? (
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition duration-300">
                  <PlayCircle className="h-10 w-10 text-white ml-1" />
                </div>
              ) : (
                <PlayCircle className="h-12 w-12 text-white group-hover:scale-110 transition duration-300" />
              )}
            </button>
          )}

          {/* Duration Badge */}
          {sermon.duration && (
            <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {sermon.duration}
            </span>
          )}
        </div>
      
        <div className="p-4">
          {/* Series Badge */}
          {sermon.series && (
            <span className="inline-block bg-accent bg-opacity-10 text-accent text-xs px-2 py-1 rounded-full mb-2">
              {sermon.series}
            </span>
          )}
        
          {/* Title */}
          <h3 className="text-xl font-bold mb-2 line-clamp-2">{sermon.title}</h3>
        
          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
            {sermon.description || 'No description available'}
          </p>
        
          {/* Meta Info */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(sermon.date).toLocaleDateString()}
              </span>
            </div>
            <span className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {sermon.speaker}
            </span>
          </div>
        
          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            {isYouTube ? (
              <button 
                onClick={() => setShowVideoModal(true)}
                className="flex-1 text-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300 text-sm font-medium flex items-center justify-center"
              >
                <Youtube className="h-4 w-4 mr-2" />
                Watch Now
              </button>
            ) : (
              <>
                {sermon.audioUrl && (
                  <a 
                    href={sermon.audioUrl} 
                    className="flex-1 text-center bg-accent text-white py-2 rounded-lg hover:bg-red-700 transition duration-300 text-sm font-medium"
                    download
                  >
                    Download MP3
                  </a>
                )}
                {sermon.videoUrl && (
                  <button 
                    onClick={() => setShowVideoModal(true)}
                    className="flex-1 text-center border border-accent text-accent py-2 rounded-lg hover:bg-accent hover:text-white transition duration-300 text-sm font-medium flex items-center justify-center"
                  >
                    <PlayCircle className="h-4 w-4 mr-1" />
                    Watch Video
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal / Lightbox */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
          {/* Close Button */}
          <button 
            onClick={() => setShowVideoModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            aria-label="Close video"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Video Container */}
          <div className="w-full max-w-4xl relative" style={{ paddingTop: '56.25%' }}>
            {isYouTube || videoId ? (
              <iframe
                src={getEmbedUrl()}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={sermon.title}
              />
            ) : (
              <video 
                controls 
                className="absolute top-0 left-0 w-full h-full"
                src={videoUrl}
              >
                Your browser does not support video playback.
              </video>
            )}
          </div>

          {/* Video Info */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-xl font-bold">{sermon.title}</h3>
            <p className="text-sm text-gray-300">{sermon.speaker} • {new Date(sermon.date).toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </>
  )
}

