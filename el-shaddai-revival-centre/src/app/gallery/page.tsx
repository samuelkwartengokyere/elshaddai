'use client'
import { useState, useEffect } from 'react'
import { Search, Loader2, Image as ImageIcon } from 'lucide-react'

interface GalleryImage {
  _id: string
  url: string
  caption?: string
  category?: string
  createdAt: string
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null)

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
    fetchImages()
  }, [])

  const fetchImages = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory)

      const response = await fetch(`/api/media?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setImages(data.media || [])
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error)
      // Set empty state on error
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchImages()
  }

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

        {/* Image Grid */}
        {!loading && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image._id}
                  className="group relative overflow-hidden rounded-lg shadow-md cursor-pointer"
                  onClick={() => setLightboxImage(image)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={image.url}
                      alt={image.caption || 'Gallery image'}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/file.svg'
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transform translate-y-full group-hover:translate-y-0 transition duration-300">
                      {image.caption && (
                        <p className="text-white font-medium">{image.caption}</p>
                      )}
                      {image.category && (
                        <p className="text-gray-300 text-sm">{image.category}</p>
                      )}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-300">
                      <div className="bg-white/90 p-2 rounded-full">
                        <ImageIcon className="h-5 w-5 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {images.length === 0 && (
              <div className="text-center py-20">
                <ImageIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold mb-4">No images found</h3>
                <p className="text-gray-600">Check back soon for new gallery updates!</p>
              </div>
            )}
          </>
        )}

        {/* Lightbox */}
        {lightboxImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <div className="max-w-5xl w-full max-h-screen">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.caption || 'Gallery image'}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/file.svg'
                }}
              />
              {lightboxImage.caption && (
                <p className="text-white text-center mt-4 text-lg">{lightboxImage.caption}</p>
              )}
              {lightboxImage.category && (
                <p className="text-gray-400 text-center mt-2">{lightboxImage.category}</p>
              )}
            </div>
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setLightboxImage(null)}
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

