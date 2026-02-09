'use client'
import { useState, useEffect } from 'react'
import { 
  Upload, 
  Search, 
  Image, 
  Film, 
  FileText, 
  Trash2,
  Edit,
  Eye,
  X,
  Loader2
} from 'lucide-react'

interface MediaItem {
  _id: string
  title: string
  description?: string
  url: string
  type: 'image' | 'video' | 'document'
  category: 'service' | 'event' | 'ministry' | 'other'
  date: string
  uploadedAt: string
}

interface MediaFormData {
  title: string
  description: string
  type: 'image' | 'video' | 'document'
  category: 'service' | 'event' | 'ministry' | 'other'
  date: string
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [uploadForm, setUploadForm] = useState<MediaFormData>({
    title: '',
    description: '',
    type: 'image',
    category: 'other',
    date: new Date().toISOString().split('T')[0]
  })
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pagination.page.toString())
      params.append('limit', pagination.limit.toString())
      if (typeFilter) params.append('type', typeFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/media?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setMedia(data.media)
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }))
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedia()
  }, [pagination.page, typeFilter, categoryFilter])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/') && !file.type.includes('pdf') && !file.type.includes('document')) {
        setError('Please select an image, video, or document file')
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      
      // Auto-detect type
      if (file.type.startsWith('image/')) {
        setUploadForm(prev => ({ ...prev, type: 'image' }))
      } else if (file.type.startsWith('video/')) {
        setUploadForm(prev => ({ ...prev, type: 'video' }))
      } else {
        setUploadForm(prev => ({ ...prev, type: 'document' }))
      }
      setError('')
    }
  }

  const openCreateModal = () => {
    setModalMode('create')
    setUploadForm({
      title: '',
      description: '',
      type: 'image',
      category: 'other',
      date: new Date().toISOString().split('T')[0]
    })
    setSelectedFile(null)
    setPreviewUrl('')
    setEditingMedia(null)
    setError('')
    setSuccess('')
    setShowUploadModal(true)
  }

  const openEditModal = (item: MediaItem) => {
    setModalMode('edit')
    setEditingMedia(item)
    setUploadForm({
      title: item.title,
      description: item.description || '',
      type: item.type,
      category: item.category,
      date: item.date.split('T')[0]
    })
    setSelectedFile(null)
    setPreviewUrl(item.url)
    setError('')
    setSuccess('')
    setShowUploadModal(true)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile && modalMode === 'create') {
      setError('Please select a file to upload')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      if (modalMode === 'create') {
        const formData = new FormData()
        formData.append('file', selectedFile!)
        formData.append('title', uploadForm.title)
        formData.append('description', uploadForm.description)
        formData.append('type', uploadForm.type)
        formData.append('category', uploadForm.category)
        formData.append('date', uploadForm.date)

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        if (data.success) {
          setSuccess('Media uploaded successfully!')
          setShowUploadModal(false)
          setUploadForm({
            title: '',
            description: '',
            type: 'image',
            category: 'other',
            date: new Date().toISOString().split('T')[0]
          })
          setSelectedFile(null)
          setPreviewUrl('')
          fetchMedia()
        } else {
          setError(data.error || 'Failed to upload media')
        }
      } else {
        // Edit mode - update without file
        const response = await fetch(`/api/media?id=${editingMedia!._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadForm)
        })

        const data = await response.json()

        if (data.success) {
          setSuccess('Media updated successfully!')
          setShowUploadModal(false)
          fetchMedia()
        } else {
          setError(data.error || 'Failed to update media')
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('An error occurred')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return
    
    try {
      const response = await fetch(`/api/media?id=${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (data.success) {
        fetchMedia()
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-5 w-5 text-blue-500" />
      case 'video': return <Film className="h-5 w-5 text-purple-500" />
      default: return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent w-64"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPagination(prev => ({ ...prev, page: 1 }))
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="service">Services</option>
            <option value="event">Events</option>
            <option value="ministry">Ministry</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={fetchMedia}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
          >
            Search
          </button>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload Media
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Total Media</p>
          <p className="text-2xl font-bold">{pagination.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Images</p>
          <p className="text-2xl font-bold text-blue-500">
            {media.filter(m => m.type === 'image').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Videos</p>
          <p className="text-2xl font-bold text-purple-500">
            {media.filter(m => m.type === 'video').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Documents</p>
          <p className="text-2xl font-bold text-gray-500">
            {media.filter(m => m.type === 'document').length}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <span className="ml-2 text-gray-600">Loading media...</span>
        </div>
      )}

      {/* Media Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {media.map((item) => (
              <div key={item._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition duration-300">
                {/* Preview */}
                <div className="h-40 bg-gray-100 flex items-center justify-center relative">
                  {item.type === 'image' ? (
                    <img 
                      src={item.url} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : item.type === 'video' ? (
                    <video 
                      src={item.url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="h-16 w-16 text-gray-400" />
                  )}
                  <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                    {getTypeIcon(item.type)}
                  </div>
                </div>
                
                {/* Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1 truncate">{item.title}</h3>
                  <p className="text-sm text-gray-500 mb-2 capitalize">{item.category}</p>
                  <p className="text-xs text-gray-400 mb-3">
                    {new Date(item.uploadedAt).toLocaleDateString()}
                  </p>
                  
                  {/* Actions */}
                  <div className="flex justify-between">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-accent"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </a>
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex items-center text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex items-center text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {media.length === 0 && (
            <div className="text-center py-20">
              <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No media found</h3>
              <p className="text-gray-600 mb-4">Upload your first media file to get started</p>
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition duration-300"
              >
                Upload Media
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
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">
                {modalMode === 'create' ? 'Upload Media' : 'Edit Media'}
              </h2>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                  setPreviewUrl('')
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-4">
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

              {/* File Drop - Create mode only */}
              {modalMode === 'create' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-accent transition duration-300">
                    {previewUrl ? (
                      <div className="relative">
                        {uploadForm.type === 'image' ? (
                          <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded" />
                        ) : uploadForm.type === 'video' ? (
                          <video src={previewUrl} className="max-h-48 mx-auto rounded" />
                        ) : (
                          <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null)
                            setPreviewUrl('')
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 mb-2">Click or drag file to upload</p>
                        <input
                          type="file"
                          accept="image/*,video/*,.pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-input"
                        />
                        <label
                          htmlFor="file-input"
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200"
                        >
                          Choose File
                        </label>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Preview - Edit mode */}
              {modalMode === 'edit' && previewUrl && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current File
                  </label>
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    {editingMedia?.type === 'image' ? (
                      <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded" />
                    ) : editingMedia?.type === 'video' ? (
                      <video src={previewUrl} className="max-h-48 mx-auto rounded" />
                    ) : (
                      <div className="text-center py-4">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">{editingMedia?.title}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter media title"
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              {/* Type & Category */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    required
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, type: e.target.value as 'image' | 'video' | 'document' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value as 'service' | 'event' | 'ministry' | 'other' }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  >
                    <option value="service">Service</option>
                    <option value="event">Event</option>
                    <option value="ministry">Ministry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={uploadForm.date}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false)
                    setSelectedFile(null)
                    setPreviewUrl('')
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || (modalMode === 'create' && !selectedFile)}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {uploading ? 'Saving...' : (modalMode === 'create' ? 'Upload' : 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

