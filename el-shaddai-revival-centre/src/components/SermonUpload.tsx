'use client'
import { useState } from 'react'
import { Upload, Video, Music, Image as ImageIcon, X } from 'lucide-react'

export default function SermonUpload() {
  const [sermonFile, setSermonFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    speaker: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    series: '',
    biblePassage: '',
    tags: '',
  })

  const handleSermonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSermonFile(file)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const clearSermonFile = () => {
    setSermonFile(null)
  }

  const clearThumbnail = () => {
    setThumbnailFile(null)
    setPreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sermonFile) {
      alert('Please upload a sermon file')
      return
    }

    setUploading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', sermonFile)
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile)
      }
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value)
      })

      const response = await fetch('/api/sermons/upload', {
        method: 'POST',
        body: formDataToSend,
      })

      if (response.ok) {
        alert('Sermon uploaded successfully!')
        // Reset form
        setSermonFile(null)
        setThumbnailFile(null)
        setPreview('')
        setFormData({
          title: '',
          speaker: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
          series: '',
          biblePassage: '',
          tags: '',
        })
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading sermon:', error)
      alert('Failed to upload sermon')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Upload New Sermon</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - File Upload */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sermon File (Audio/Video) *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-accent transition duration-300">
                <input
                  type="file"
                  id="sermon-file"
                  accept="audio/*,video/*"
                  onChange={handleSermonFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="sermon-file"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {sermonFile ? (
                    <div className="text-center relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          clearSermonFile()
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <Music className="h-12 w-12 text-accent mx-auto mb-2" />
                      <p className="font-medium truncate max-w-[200px]">{sermonFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(sermonFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">Click to upload</p>
                      <p className="text-sm text-gray-500">MP3, MP4, or video files</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-accent transition duration-300">
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
                <label
                  htmlFor="thumbnail"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {preview ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          clearThumbnail()
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 z-10"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg mb-2"
                      />
                      <p className="text-sm text-gray-500">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="font-medium">Upload thumbnail</p>
                      <p className="text-sm text-gray-500">JPG, PNG, or GIF</p>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sermon Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Enter sermon title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Speaker *
              </label>
              <input
                type="text"
                required
                value={formData.speaker}
                onChange={(e) => setFormData({...formData, speaker: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Speaker's name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bible Passage
              </label>
              <input
                type="text"
                value={formData.biblePassage}
                onChange={(e) => setFormData({...formData, biblePassage: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="e.g., John 3:16"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Series
              </label>
              <input
                type="text"
                value={formData.series}
                onChange={(e) => setFormData({...formData, series: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Sermon series name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Separate tags with commas"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            placeholder="Enter sermon description..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !sermonFile}
            className={`px-8 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-red-700 transition duration-300 ${
              (uploading || !sermonFile) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Sermon'}
          </button>
        </div>
      </form>
    </div>
  )
}

