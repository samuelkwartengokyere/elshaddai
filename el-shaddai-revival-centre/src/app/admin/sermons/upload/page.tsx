'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Upload, 
  FileAudio, 
  Image, 
  X, 
  Loader2,
  File
} from 'lucide-react'

export default function UploadSermonPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    series: '',
    biblePassage: '',
    tags: ''
  })
  
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [audioPreview, setAudioPreview] = useState<string>('')
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setError('Please select an audio file (MP3, WAV, etc.)')
        return
      }
      setAudioFile(file)
      setAudioPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      setThumbnailFile(file)
      setThumbnailPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!audioFile) {
      setError('Please select an audio file')
      return
    }
    
    if (!formData.title || !formData.speaker || !formData.date) {
      setError('Please fill in all required fields')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const form = new FormData()
      form.append('file', audioFile)
      if (thumbnailFile) {
        form.append('thumbnail', thumbnailFile)
      }
      form.append('title', formData.title)
      form.append('speaker', formData.speaker)
      form.append('date', formData.date)
      form.append('description', formData.description)
      form.append('series', formData.series)
      form.append('biblePassage', formData.biblePassage)
      form.append('tags', formData.tags)

      const response = await fetch('/api/sermons/upload', {
        method: 'POST',
        body: form
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Sermon uploaded successfully!')
        // Reset form
        setFormData({
          title: '',
          speaker: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          series: '',
          biblePassage: '',
          tags: ''
        })
        setAudioFile(null)
        setThumbnailFile(null)
        setAudioPreview('')
        setThumbnailPreview('')
        
        // Redirect after short delay
        setTimeout(() => {
          router.push('/admin/sermons')
        }, 1500)
      } else {
        setError(data.error || 'Failed to upload sermon')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('An error occurred while uploading')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link 
          href="/admin/sermons"
          className="flex items-center text-gray-600 hover:text-accent mr-4"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Upload New Sermon</h1>
      </div>

      {/* Form Container with Shadow */}
      <div className="bg-transparent rounded-xl shadow-xl border border-gray-200/50 p-6">

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audio Upload */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio File <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-accent transition duration-300">
              {audioPreview ? (
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FileAudio className="h-10 w-10 text-accent mr-4" />
                    <div>
                      <p className="font-medium text-gray-800">{audioFile?.name}</p>
                      <p className="text-sm text-gray-500">
                        {(audioFile ? audioFile.size / (1024 * 1024) : 0).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioFile(null)
                      setAudioPreview('')
                    }}
                    className="p-2 text-gray-500 hover:text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Click or drag audio file to upload</p>
                  <p className="text-sm text-gray-500 mb-4">Supports MP3, WAV, M4A</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="hidden"
                    id="audio-input"
                  />
                  <label
                    htmlFor="audio-input"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200"
                  >
                    <FileAudio className="h-5 w-5 mr-2" />
                    Choose Audio File
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thumbnail Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-accent transition duration-300">
              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailFile(null)
                      setThumbnailPreview('')
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Image className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">Optional thumbnail</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                    id="thumbnail-input"
                  />
                  <label
                    htmlFor="thumbnail-input"
                    className="inline-flex items-center px-4 py-2 mt-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 text-sm"
                  >
                    Choose Image
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sermon Title <span className="text-red-500">*</span>
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
                Speaker <span className="text-red-500">*</span>
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
                Date <span className="text-red-500">*</span>
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
          <div className="lg:col-span-2">
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
          <div className="lg:col-span-2">
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
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Link
            href="/admin/sermons"
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center transition duration-300"
          >
            {uploading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
            {uploading ? 'Uploading...' : 'Upload Sermon'}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

