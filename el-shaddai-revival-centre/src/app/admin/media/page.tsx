'use client';

import React, { useState, useEffect, useCallback } from 'react';

import MediaUpload from '../../../components/ImageUpload';
import path from 'path';
import { Media, MediaType, MediaCategory } from '@/types/media';
import { 
  Plus, 
  Search, 
  Trash2, 
  Loader2,
  X,
  Image as ImageIcon,
  Video,
  FileText
} from 'lucide-react';

interface MediaFormData {
  title: string;
  description: string;
  type: MediaType;
  category: MediaCategory;
  url: string;
}

export default function MediaAdmin() {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<MediaType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<MediaCategory | ''>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState<MediaFormData>({
    title: '',
    description: '',
    type: 'image',
    category: 'ministry',
    url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      title: '',
      description: '',
      type: 'image',
      category: 'ministry',
      url: ''
    });
    setError('');
    setSuccess('');
    setShowUploadModal(true);
  };

  const handleMediaChange = (url: string) => {
    setFormData(prev => ({ ...prev, url }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) {
      setError('Please upload a file first');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const mediaData = new FormData();
      mediaData.append('title', formData.title);
      mediaData.append('description', formData.description);
      mediaData.append('type', formData.type);
      mediaData.append('category', formData.category);
      mediaData.append('url', formData.url);  // URL from MediaUpload
      mediaData.append('date', new Date().toISOString());

      const response = await fetch('/api/media', {
        method: 'POST',
        body: mediaData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Media saved successfully!');
        setShowUploadModal(false);
        fetchMedia();
      } else {
        setError(data.error || 'Failed to save media');
      }
    } catch (err: unknown) {
      console.error('Save error:', err);
      setError('Save failed. Please try again.');
    } finally {
      setUploading(false);
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
        <button
          onClick={openUploadModal}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Upload Media
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search media by title..."
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
                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
                  {item.url ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const iconDiv = document.createElement('div');
                          iconDiv.className = 'p-8';
                          parent.appendChild(iconDiv);
                        }
                      }}
                    />
                  ) : (
                    <div className="p-8">
                      {getTypeIcon(item.type)}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
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
              <button
                onClick={openUploadModal}
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                Upload First Media
              </button>
            </div>
          )}
        </>
      )}

      {/* Upload Modal */}
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
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter media title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Optional description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as MediaType }))}
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
                  <MediaUpload
                    value={formData.url}
                    onChange={handleMediaChange}
                    type={formData.type}
                    category={formData.category}
                    title={formData.title}
                    label="Click to upload"
                  />

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
                  disabled={uploading || !formData.url || !formData.title}
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
    </div>
  );
}

