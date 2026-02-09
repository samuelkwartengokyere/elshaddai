'use client'
import Image from 'next/image'
import { PlayCircle, Calendar, User, Youtube, ExternalLink } from 'lucide-react'

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

  // Extract video ID for YouTube embed
  const getYouTubeVideoId = () => {
    if (!videoUrl) return null
    const match = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const videoId = getYouTubeVideoId()

  return (
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
          <a 
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition duration-300 group"
            aria-label={`Watch ${sermon.title} on YouTube`}
          >
            {isYouTube ? (
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition duration-300">
                <PlayCircle className="h-10 w-10 text-white ml-1" />
              </div>
            ) : (
              <PlayCircle className="h-12 w-12 text-white group-hover:scale-110 transition duration-300" />
            )}
          </a>
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
            <a 
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition duration-300 text-sm font-medium flex items-center justify-center"
            >
              <Youtube className="h-4 w-4 mr-2" />
              Watch on YouTube
            </a>
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
                <a 
                  href={sermon.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center border border-accent text-accent py-2 rounded-lg hover:bg-accent hover:text-white transition duration-300 text-sm font-medium flex items-center justify-center"
                >
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Watch Video
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

