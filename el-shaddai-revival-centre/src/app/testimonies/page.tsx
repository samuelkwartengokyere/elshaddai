'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Quote, Calendar, User, ChevronRight, Heart, Cross, Sparkles, Star, Loader2, AlertCircle } from 'lucide-react'
import TestimonyCard from '@/components/TestimonyCard'

interface Testimony {
  _id: string
  name: string
  title: string
  content: string
  category: 'healing' | 'breakthrough' | 'salvation' | 'other'
  date: string
  location: string
  isFeatured: boolean
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

const categories = [
  { name: 'All', icon: Star, color: 'bg-gray-100 text-gray-800' },
  { name: 'Healing', icon: Heart, color: 'bg-green-100 text-green-800' },
  { name: 'Salvation', icon: Cross, color: 'bg-blue-100 text-blue-800' },
  { name: 'Breakthrough', icon: Sparkles, color: 'bg-purple-100 text-purple-800' },
  { name: 'Other', icon: User, color: 'bg-yellow-100 text-yellow-800' },
]

export default function TestimoniesPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })
  const [featuredTestimony, setFeaturedTestimony] = useState<Testimony | null>(null)

  // Fetch testimonies from API
  const fetchTestimonies = async () => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      params.append('sort', '-date')

      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory.toLowerCase())
      }

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/testimonies?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTestimonies(data.testimonies)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          hasNext: data.pagination.hasNext,
          hasPrev: data.pagination.hasPrev
        }))

        // Set featured testimony (first featured one or first one)
        if (data.testimonies.length > 0 && !featuredTestimony) {
          const featured = data.testimonies.find((t: Testimony) => t.isFeatured) || data.testimonies[0]
          setFeaturedTestimony(featured)
        }
      } else {
        setError(data.error || 'Failed to fetch testimonies')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Error fetching testimonies:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonies()
  }, [pagination.page, selectedCategory])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchTestimonies()
  }

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategory(categoryName)
    setPagination(prev => ({ ...prev, page: 1 }))
    // Reset featured testimony when changing category
    setFeaturedTestimony(null)
  }

  // Filter out featured from main list to avoid duplication
  const otherTestimonies = featuredTestimony
    ? testimonies.filter(t => t._id !== featuredTestimony._id)
    : testimonies

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Quote className="h-16 w-16 mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Testimonies</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            Real stories from real people who have experienced God's power 
            at El-Shaddai Revival Centre's Prayer Camp
          </p>
        </motion.div>
      </section>

      {/* Error Message */}
      {error && (
        <section className="py-8 bg-red-50 border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-accent" />
              <span className="ml-2 text-gray-600">Loading testimonies...</span>
            </div>
          </div>
        </section>
      )}

      {/* Featured Testimony */}
      {!loading && !error && featuredTestimony && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold text-center mb-4">Featured Testimony</h2>
              <div className="w-24 h-1 bg-accent mx-auto mb-8" />

              <div className="max-w-4xl mx-auto">
                <TestimonyCard testimony={featuredTestimony} featured={true} />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Filter and Search Section */}
      {!loading && !error && (
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <motion.div
              className="flex flex-col md:flex-row gap-6 items-center justify-between"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => {
                  const Icon = category.icon || Star
                  return (
                    <button
                      key={category.name}
                      onClick={() => handleCategoryChange(category.name)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition duration-300 flex items-center gap-2 ${
                        selectedCategory === category.name
                          ? 'bg-accent text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-accent hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {category.name}
                    </button>
                  )
                })}
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search testimonies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-accent focus:outline-none transition duration-300"
                />
              </form>
            </motion.div>
          </div>
        </section>
      )}

      {/* Testimonies Grid */}
      {!loading && !error && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {selectedCategory === 'All' ? 'All Testimonies' : `${selectedCategory} Testimonies`}
                </h2>
                <p className="text-gray-600">{pagination.total} stories found</p>
              </div>
            </div>

            {otherTestimonies.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                layout
              >
                <AnimatePresence>
                  {otherTestimonies.map((testimony, index) => (
                    <motion.div
                      key={testimony._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <TestimonyCard testimony={testimony} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Quote className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-bold mb-2">No testimonies found</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search or filter criteria' : 'Check back soon for new testimonies!'}
                </p>
              </motion.div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12 space-x-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`px-4 py-2 rounded-lg ${
                      pagination.page === page
                        ? 'bg-accent text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Share Your Testimony CTA */}
      <section className="py-16 bg-gradient-to-r from-accent to-red-600 text-white">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Share Your Testimony</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Have you experienced God's power? We'd love to hear your story and share it 
            with others to encourage them in their faith journey.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-white text-accent px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition duration-300"
          >
            Submit Your Testimony
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </section>
    </main>
  )
}

