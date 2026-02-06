'use client'
import Image from 'next/image'
import { PlayCircle, Calendar, User } from 'lucide-react'

interface SermonCardProps {
  sermon: {
    _id?: string
    id?: string
    title: string
    speaker: string
    date: string
    description: string
    thumbnail?: string
    audioUrl?: string
    videoUrl?: string
    duration?: string
    series?: string
  }
}

export default function SermonCard({ sermon }: SermonCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
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
        <button 
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-40 transition duration-300"
          aria-label={`Play ${sermon.title}`}
        >
          <PlayCircle className="h-12 w-12 text-white" />
        </button>
        {sermon.duration && (
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {sermon.duration}
          </span>
        )}
      </div>
      
      <div className="p-4">
        {sermon.series && (
          <span className="inline-block bg-accent bg-opacity-10 text-accent text-xs px-2 py-1 rounded-full mb-2">
            {sermon.series}
          </span>
        )}
        
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{sermon.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">{sermon.description}</p>
        
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
        
        <div className="flex gap-2 pt-4 border-t">
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
              className="flex-1 text-center border border-accent text-accent py-2 rounded-lg hover:bg-accent hover:text-white transition duration-300 text-sm font-medium"
            >
              Watch Video
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

