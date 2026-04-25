'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { Media, MediaType, MediaCategory } from '@/types/media';
import { 
  Plus, 
  Search, 
  Trash2, 
  Loader2,
  X,
  Image as ImageIcon,
  Video,
  FileText,
  Star,
  Upload,
  CheckCircle,
  AlertCircle,
  FileArchive
} from 'lucide-react';

interface MediaFormData {
  type: MediaType;
  category: MediaCategory;
}

interface BulkResult {
  fileName: string;
  success: boolean;
  url?: string;
  error?: string;
}

export default function MediaAdmin() {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | ''>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState<MediaFormData>({
    type: 'image',
    category: 'ministry'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bulk upload state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkZipFile, setBulkZipFile] = useState<File | null>(null);
  const [bulkCategory, setBulkCategory] = useState<MediaCategory>('ministry');
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState('');
  const [bulkResults, setBulkResults] = useState<BulkResult[] | null>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('type', typeFilter);
      if (categoryFilter) params.append('category', categoryFilter);
      if (search) params.append('search', search);

      const response = await fetch(`/api/media?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setMediaItems(data.media || []);
      }
    } catch (err: unknown) {
      console.error('Error fetching media:', err);
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, categoryFilter, search]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia();
  };

  const openUploadModal = () => {
    setFormData({
      type: 'image',
      category: 'ministry'
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    setSuccess('');
    setShowUploadModal(true);
  };

  const openBulkModal = () => {
    setBulkZipFile(null);
    setBulkCategory('ministry');
    setBulkResults(null);
    setBulkProgress('');
    setError('');
    setSuccess('');
    setShowBulkModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleBulkZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkZipFile(file);
    setBulkResults(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleRemoveBulkZip = () => {
    setBulkZipFile(null);
    setBulkResults(null);
  };

  const getMaxSizeMB = (t: MediaType) => {
    switch (t) {
      case 'video': return 50;
      case 'document': return 10;
      default: return 5;
    }
  };

  const getAccept = () => {
    switch (formData.type) {
      case 'video': return 'video/*';
      case 'document': return '.pdf,.doc,.docx';
      default: return 'image/*';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    const maxSize = getMaxSizeMB(formData.type) * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`File too large. Max ${getMaxSizeMB(formData.type)}MB`);
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const mediaData = new FormData();
      mediaData.append('file', selectedFile);
      mediaData.append('type', formData.type);
      mediaData.append('category', formData.category);
      mediaData.append('date', new Date().toISOString());

      const response = await fetch('/api/media', {
        method: 'POST',
        body: mediaData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Media uploaded successfully!');
        setShowUploadModal(false);
        setSelectedFile(null);
        setPreviewUrl('');
        fetchMedia();
      } else {
        setError(data.error || 'Failed to upload media');
      }
    } catch (err: unknown) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkZipFile) {
      setError('Please select a ZIP file to upload');
      return;
    }

    setBulkUploading(true);
    setError('');
    setSuccess('');
    setBulkProgress('Uploading ZIP file...');

    try {
      const formData = new FormData();
      formData.append('zipFile', bulkZipFile);
      formData.append('category', bulkCategory);

      setBulkProgress('Extracting and processing images...');

      const response = await fetch('/api/media/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setBulkResults(data.results || []);
        setSuccess(data.message || `Bulk upload complete! ${data.uploaded} uploaded, ${data.failed} failed.`);
        fetchMedia();
      } else {
        setError(data.error || 'Failed to process bulk upload');
      }
    } catch (err: unknown) {
      console.error('Bulk upload error:', err);
      setError('Bulk upload failed. Please try again.');
    } finally {
      setBulkUploading(false);
      setBulkProgress('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;

    try {
      const response = await fetch(`/api/media?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Media deleted successfully!');
        fetchMedia();
      } else {
        setError(data.error || 'Failed to delete media');
      }
    } catch (err: unknown) {
      console.error('Delete error:', err);
      setError('Delete failed. Please try again.');
    }
  };

  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const getTypeIcon = (type: MediaType) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-12 w-12 text-blue-500" />;
      case 'video': return <Video className="h-12 w-12 text-purple-500" />;
      case 'document': return <FileText className="h-12 w-12 text-green-500" />;
    }
  };

  const getCategoryColor = (category: MediaCategory) => {
    switch (category) {
      case 'service': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'ministry': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">Manage church media assets</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={openBulkModal}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all shadow-lg"
          >
            <FileArchive className="h-5 w-5" />
            Bulk Upload (ZIP)
          </button>
          <button
            onClick={openUploadModal}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Upload Media
          </button>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value as MediaType || '');
            setSearch('');
          }}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value as MediaCategory || '');
            setSearch('');
          }}
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option value="service">Services</option>
          <option value="event">Events</option>
          <option value="ministry">Ministry</option>
          <option value="other">Other</option>
        </select>
        <button
          type="submit"
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all whitespace-nowrap"
        >
          Filter
        </button>
      </form>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
          <span className="text-lg text-gray-600">Loading media...</span>
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mediaItems.map((item) => (
              <div key={item._id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative">
                  {item.isFeatured && (
                    <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      Featured
                    </div>
                  )}
                  {item.url && !brokenImages.has(item._id) ? (
                    <img
                      src={item.url}
                      alt="Media preview"
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      onError={() => setBrokenImages(prev => new Set(prev).add(item._id))}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      {getTypeIcon(item.type)}
                      <span className="text-xs text-gray-400 mt-2">{item.url ? 'Preview unavailable' : 'No preview'}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(item.uploadedAt).toLocaleDateString()}</span>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </a>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="mt-4 w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 py-2 px-4 rounded-xl transition-all group-hover:scale-105"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {mediaItems.length === 0 && !loading && (
            <div className="text-center py-20 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-gray-200">
              <ImageIcon className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No media found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {search || typeFilter || categoryFilter 
                  ? 'Try adjusting your filters' 
                  : 'Upload your first media item to get started'
                }
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={openBulkModal}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <FileArchive className="h-5 w-5" />
                  Bulk Upload (ZIP)
                </button>
                <button
                  onClick={openUploadModal}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Plus className="h-5 w-5" />
                  Upload First Media
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Single Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Upload Media</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 -m-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, type: e.target.value as MediaType }));
                      setSelectedFile(null);
                      setPreviewUrl('');
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as MediaCategory }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="service">Services</option>
                    <option value="event">Events</option>
                    <option value="ministry">Ministry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-4">
                    Media File *
                  </label>
                  <input
                    type="file"
                    accept={getAccept()}
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {previewUrl && (
                    <div className="mt-4 relative inline-block">
                      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                        {formData.type === 'image' ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <video
                            src={previewUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Max size: {getMaxSizeMB(formData.type)}MB
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Media'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Bulk Upload Images (ZIP)</h2>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 -m-1 rounded-lg hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleBulkSubmit} className="p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    How it works
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>Select a ZIP file containing your images</li>
                    <li>Supported formats: JPG, PNG, GIF, WebP</li>
                    <li>Max 5MB per image</li>
                    <li>All images will be assigned the same category</li>
                    <li>File names will be used as titles (formatted)</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Category *</label>
                  <select
                    required
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value as MediaCategory)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="service">Services</option>
                    <option value="event">Events</option>
                    <option value="ministry">Ministry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-4">
                    ZIP File *
                  </label>
                  <input
                    type="file"
                    accept=".zip,application/zip,application/x-zip-compressed"
                    onChange={handleBulkZipChange}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {bulkZipFile && (
                    <div className="mt-4 flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                      <FileArchive className="h-8 w-8 text-purple-600" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{bulkZipFile.name}</p>
                        <p className="text-sm text-gray-500">{(bulkZipFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveBulkZip}
                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress */}
                {bulkUploading && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                    <span className="text-gray-700">{bulkProgress}</span>
                  </div>
                )}

                {/* Results */}
                {bulkResults && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">
                          {bulkResults.filter(r => r.success).length} uploaded
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">
                          {bulkResults.filter(r => !r.success).length} failed
                        </span>
                      </div>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto border rounded-xl divide-y">
                      {bulkResults.map((result, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3">
                          {result.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                          <span className="text-sm truncate flex-1" title={result.fileName}>
                            {result.fileName}
                          </span>
                          {!result.success && result.error && (
                            <span className="text-xs text-red-600 flex-shrink-0">{result.error}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-6 py-3 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors"
                  disabled={bulkUploading}
                >
                  {bulkResults ? 'Close' : 'Cancel'}
                </button>
                {!bulkResults && (
                  <button
                    type="submit"
                    disabled={bulkUploading || !bulkZipFile}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {bulkUploading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        Upload ZIP
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

