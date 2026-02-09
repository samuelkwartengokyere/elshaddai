'use client'
import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Trash2, 
  Edit,
  Clock,
  MapPin,
  Loader2,
  X,
  Star
} from 'lucide-react'

interface Testimony {
  _id: string
  name: string
  title: string
  content: string
  category: string
  date: string
  location: string
  isPublished: boolean
  isFeatured: boolean
}

type TestimonyCategory = 'healing' | 'breakthrough' | 'salvation' | 'deliverance' | 'provision' | 'other'

interface TestimonyFormData {
  name: string
  title: string
  content: string
  category: TestimonyCategory
  date: string
  location: string
  isFeatured: boolean
}

export default function TestimoniesPage() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTestimony, setEditingTestimony] = useState<Testimony | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [formData, setFormData] = useState<TestimonyFormData>({
    name: '',
    title: '',
    content: '',
    category: 'other',
    date: new Date().toISOString().split('T')[0],
    location: '',
    isFeatured: false
  })
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const fetchTestimonies = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      if (categoryFilter) params.append('category', categoryFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/testimonies?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTestimonies(data.testimonies)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }))
      }
    } catch (err) {
      console.error('Error fetching testimonies:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTestimonies()
  }, [pagination.page, categoryFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchTestimonies()
  }

  const openCreateModal = () => {
    setModalMode('create')
    setFormData({
      name: '',
      title: '',
      content: '',
      category: 'other',
      date: new Date().toISOString().split('T')[0],
      location: '',
      isFeatured: false
    })
    setEditingTestimony(null)
    setError('')
    setSuccess('')
    setShowCreateModal(true)
  }

  const openEditModal = (testimony: Testimony) => {
    setModalMode('edit')
    setEditingTestimony(testimony)
    setFormData({
      name: testimony.name,
      title: testimony.title,
      content: testimony.content,
      category: testimony.category as TestimonyCategory,
      date: testimony.date.split('T')[0],
      location: testimony.location,
      isFeatured: testimony.isFeatured
    })
    setError('')
    setSuccess('')
    setShowCreateModal(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/testimonies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Testimony created successfully!')
        setShowCreateModal(false)
        setFormData({
          name: '',
          title: '',
          content: '',
          category: 'other',
          date: new Date().toISOString().split('T')[0],
          location: '',
          isFeatured: false
        })
        fetchTestimonies()
      } else {
        setError(data.error || 'Failed to create testimony')
      }
    } catch (err) {
      setError('An error occurred while creating testimony')
    } finally {
      setUploading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTestimony) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/testimonies?id=${editingTestimony._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Testimony updated successfully!')
        setShowCreateModal(false)
        setEditingTestimony(null)
        fetchTestimonies()
      } else {
        setError(data.error || 'Failed to update testimony')
      }
    } catch (err) {
      setError('An error occurred while updating testimony')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimony?')) return
    
    try {
      const response = await fetch(`/api/testimonies?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        fetchTestimonies()
      }
    } catch (err) {
      console.error('Delete error:', err)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'healing': return 'bg-green-100 text-green-800'
      case 'breakthrough': return 'bg-blue-100 text-blue-800'
      case 'salvation': return 'bg-purple-100 text-purple-800'
      case 'deliverance': return 'bg-orange-100 text-orange-800'
      case 'provision': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
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
                placeholder="Search testimonies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent w-64"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="healing">Healing</option>
              <option value="breakthrough">Breakthrough</option>
              <option value="salvation">Salvation</option>
              <option value="deliverance">Deliverance</option>
              <option value="provision">Provision</option>
              <option value="other">Other</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Search
            </button>
          </form>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-300"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Testimony
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Testimonies</p>
          <p className="text-2xl font-bold">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">This Page</p>
          <p className="text-2xl font-bold text-orange-500">{testimonies.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Featured</p>
          <p className="text-2xl font-bold text-yellow-500">
            {testimonies.filter(t => t.isFeatured).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Categories</p>
          <p className="text-2xl font-bold text-blue-500">6</p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-gray-600">Loading testimonies...</span>
        </div>
      )}

      {/* Testimonies Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonies.map((testimony) => (
              <div key={testimony._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition duration-300">
                {/* Header */}
                <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(testimony.category)}`}>
                      {testimony.category}
                    </span>
                    {testimony.isFeatured && (
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">{testimony.title}</h3>
                  <p className="text-sm text-gray-500">by {testimony.name}</p>
                </div>
                
                {/* Content Preview */}
                <div className="p-4">
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{testimony.content}</p>
                  
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {new Date(testimony.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {testimony.location}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-between mt-4 pt-4 border-t">
                    <button
                      onClick={() => handleDelete(testimony._id)}
                      className="flex items-center text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                    <button
                      onClick={() => openEditModal(testimony)}
                      className="flex items-center text-accent hover:text-red-600"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {testimonies.length === 0 && (
            <div className="text-center py-20 bg-white rounded-lg shadow">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No testimonies found</h3>
              <p className="text-gray-600 mb-4">
                {search || categoryFilter
                  ? 'Try adjusting your search or filters'
                  : 'Add your first testimony to get started'}
              </p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-300 inline-flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Testimony
              </button>
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="relative bg-transparent rounded-xl shadow-xl border border-gray-200/50 w-full max-w-lg mx-4 z-10">
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Add New Testimony' : 'Edit Testimony'}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={modalMode === 'create' ? handleCreate : handleUpdate} className="p-4">
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

              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Person's Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter name"
                />
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Testimony Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="e.g., From Terminal Diagnosis to Complete Healing"
                />
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Testimony Content *
                </label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={5}
                  placeholder="Share the testimony story..."
                />
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TestimonyCategory }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="healing">Healing</option>
                    <option value="breakthrough">Breakthrough</option>
                    <option value="salvation">Salvation</option>
                    <option value="deliverance">Deliverance</option>
                    <option value="provision">Provision</option>
                    <option value="other">Other</option>
                  </select>
                </div>
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
              </div>

              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="e.g., Nabewam"
                />
              </div>

              {/* Featured */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Feature this testimony on homepage</span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {uploading 
                    ? (modalMode === 'create' ? 'Saving...' : 'Saving...')
                    : (modalMode === 'create' ? 'Add Testimony' : 'Save Changes')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

