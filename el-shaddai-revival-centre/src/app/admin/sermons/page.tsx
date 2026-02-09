'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Upload, 
  Search, 
  FileAudio, 
  Trash2, 
  Edit,
  Eye,
  Calendar,
  User,
  BookOpen,
  Loader2,
  X
} from 'lucide-react'

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
  tags: string[]
}

interface SermonFormData {
  title: string
  speaker: string
  date: string
  description: string
  series: string
  biblePassage: string
  tags: string
}

export default function SermonsPage() {
  const [sermons, setSermons] = useState<Sermon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [speakerFilter, setSpeakerFilter] = useState('')
  const [seriesFilter, setSeriesFilter] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [formData, setFormData] = useState<SermonFormData>({
    title: '',
    speaker: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    series: '',
    biblePassage: '',
    tags: ''
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchSermons = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      if (search) params.append('search', search)
      if (speakerFilter) params.append('speaker', speakerFilter)
      if (seriesFilter) params.append('series', seriesFilter)

      const response = await fetch(`/api/sermons?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setSermons(data.sermons)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error('Error fetching sermons:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSermons()
  }, [pagination.page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchSermons()
  }

  const openEditModal = (sermon: Sermon) => {
    setEditingSermon(sermon)
    setFormData({
      title: sermon.title,
      speaker: sermon.speaker,
      date: sermon.date.split('T')[0],
      description: sermon.description || '',
      series: sermon.series || '',
      biblePassage: sermon.biblePassage || '',
      tags: sermon.tags ? sermon.tags.join(', ') : ''
    })
    setError('')
    setSuccess('')
    setShowEditModal(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSermon) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/sermons?id=${editingSermon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Sermon updated successfully!')
        setShowEditModal(false)
        setEditingSermon(null)
        fetchSermons()
      } else {
        setError(data.error || 'Failed to update sermon')
      }
    } catch (err) {
      setError('An error occurred while updating sermon')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sermon?')) return
    
    try {
      const response = await fetch(`/api/sermons?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        fetchSermons()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sermons..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent w-64"
              />
            </div>
            <input
              type="text"
              placeholder="Filter by speaker..."
              value={speakerFilter}
              onChange={(e) => {
                setSpeakerFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Filter by series..."
              value={seriesFilter}
              onChange={(e) => {
                setSeriesFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Search
            </button>
          </form>
        </div>
        <Link
          href="/admin/sermons/upload"
          className="flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload Sermon
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Sermons</p>
          <p className="text-2xl font-bold">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">This Page</p>
          <p className="text-2xl font-bold text-accent">{sermons.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Unique Speakers</p>
          <p className="text-2xl font-bold text-blue-500">
            {new Set(sermons.map(s => s.speaker)).size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Unique Series</p>
          <p className="text-2xl font-bold text-purple-500">
            {new Set(sermons.map(s => s.series).filter(Boolean)).size}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-gray-600">Loading sermons...</span>
        </div>
      )}

      {/* Sermons Table */}
      {!loading && (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sermon
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Speaker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Series
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sermons.map((sermon) => (
                  <tr key={sermon._id || sermon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {sermon.thumbnail ? (
                          <img
                            src={sermon.thumbnail}
                            alt={sermon.title}
                            className="h-12 w-12 rounded-lg object-cover mr-4"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-accent-10 flex items-center justify-center mr-4">
                            <FileAudio className="h-6 w-6 text-accent" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-xs">
                            {sermon.title}
                          </p>
                          {sermon.biblePassage && (
                            <p className="text-sm text-gray-500 flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {sermon.biblePassage}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-700">
                        <User className="h-4 w-4 mr-1" />
                        {sermon.speaker}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sermon.series ? (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          {sermon.series}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(sermon.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {sermon.duration || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        {sermon.audioUrl && (
                          <a
                            href={sermon.audioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-accent hover:bg-gray-100 rounded-lg"
                            title="Listen"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(sermon)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(sermon._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {sermons.length === 0 && (
            <div className="text-center py-20 bg-white rounded-lg shadow">
              <FileAudio className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No sermons found</h3>
              <p className="text-gray-600 mb-4">
                {search || speakerFilter || seriesFilter
                  ? 'Try adjusting your search or filters'
                  : 'Upload your first sermon to get started'}
              </p>
              <Link
                href="/admin/sermons/upload"
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300 inline-flex items-center"
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload Sermon
              </Link>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
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
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && editingSermon && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 z-10">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">Edit Sermon</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="p-4">
              {/* Error/Success Messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sermon Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Enter sermon title"
                  />
                </div>

                {/* Speaker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Speaker *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.speaker}
                    onChange={(e) => setFormData(prev => ({ ...prev, speaker: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Enter speaker name"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>

                {/* Series */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Series
                  </label>
                  <input
                    type="text"
                    value={formData.series}
                    onChange={(e) => setFormData(prev => ({ ...prev, series: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="e.g., Faith in Action"
                  />
                </div>

                {/* Bible Passage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bible Passage
                  </label>
                  <input
                    type="text"
                    value={formData.biblePassage}
                    onChange={(e) => setFormData(prev => ({ ...prev, biblePassage: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="e.g., John 3:16"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    rows={4}
                    placeholder="Optional description of the sermon"
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Separate tags with commas (faith, hope, love)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate multiple tags with commas
                  </p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center transition duration-300"
                >
                  {uploading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                  {uploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

