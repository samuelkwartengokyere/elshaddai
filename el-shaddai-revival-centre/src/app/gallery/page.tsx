'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, Image as ImageIcon, Play, X } from 'lucide-react'

interface GalleryItem {
  _id: string
  url: string
  title?: string
  caption?: string
  type?: 'image' | 'video' | 'document'
  category?: string
  createdAt: string
  uploadedAt: string
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)

  const categories = [
    'All',
    'Sunday Service',
    'Wednesday Service',
    'Special Events',
    'Youth',
    'Children',
    'Outreach'
  ]

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      // Filter for images and videos only
      params.append('type', 'image,video')
      if (search) params.append('search', search)
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory)

      const response = await fetch(`/api/media?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setItems(data.media || [])
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchItems()
  }

  const isVideo = (item: GalleryItem) => item.type === 'video'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Gallery</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Capture moments from our church events, services, and community activities
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search gallery..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'All' ? '' : cat}>{cat}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Search
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <span className="ml-2 text-gray-600">Loading gallery...</span>
          </div>
        )}

        {/* Item Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-lg shadow-md cursor-pointer"
                  onClick={() => setLightboxItem(item)}
                >
                  <div className="aspect-video relative">
                    {isVideo(item) ? (
                      <>
                        <video
                          src={item.url}
                          className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                          poster="/file.svg"
                          onError={(e) => {
                            const target = e.target as HTMLVideoElement
                            target.poster = '/file.svg'
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/50 rounded-full p-3">
                            <Play className="h-8 w-8 text-white" fill="white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.caption || item.title || 'Gallery image'}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/file.svg'
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transform translate-y-full group-hover:translate-y-0 transition duration-300">
                      {(item.caption || item.title) && (
                        <p className="text-white font-medium">{item.caption || item.title}</p>
                      )}
                      {item.category && (
                        <p className="text-gray-300 text-sm">{item.category}</p>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-300">
                      <div className="bg-white/90 p-2 rounded-full">
                        {isVideo(item) ? (
                          <Play className="h-5 w-5 text-gray-700" />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-gray-700" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {items.length === 0 && (
              <div className="text-center py-20">
                <ImageIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold mb-4">No media found</h3>
                <p className="text-gray-600">Check back soon for new gallery updates!</p>
              </div>
            )}
          </>
        )}

        {/* Lightbox */}
        {lightboxItem && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxItem(null)}
          >
            <div className="max-w-5xl w-full max-h-screen">
              {isVideo(lightboxItem) ? (
                <video
                  src={lightboxItem.url}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement
                    console.error('Video load error')
                  }}
                >
                  Your browser does not support video playback.
                </video>
              ) : (
                <img
                  src={lightboxItem.url}
                  alt={lightboxItem.caption || lightboxItem.title || 'Gallery image'}
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/file.svg'
                  }}
                />
              )}
              {(lightboxItem.caption || lightboxItem.title) && (
                <p className="text-white text-center mt-4 text-lg">{lightboxItem.caption || lightboxItem.title}</p>
              )}
              {lightboxItem.category && (
                <p className="text-gray-400 text-center mt-2">{lightboxItem.category}</p>
              )}
            </div>
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setLightboxItem(null)}
            >
              <X className="h-8 w-8" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

