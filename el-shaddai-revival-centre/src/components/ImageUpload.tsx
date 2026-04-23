'use client';

import { useState, useRef } from 'react';
import { X, Loader2, Image, Video, FileText } from 'lucide-react';

interface MediaUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  type?: 'image' | 'video' | 'audio' | 'document';
  category?: string;
  title?: string;
  className?: string;
}

export default function MediaUpload({ 
  value, 
  onChange, 
  label = 'Upload Media', 
  type = 'image',
  category = 'ministry',
  title = 'Media upload',
  className = '' 
}: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAccept = () => {
    switch (type) {
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      case 'document': return '.pdf';
      default: return 'image/*';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'video': return Video;
      case 'document': return FileText;
      default: return Image;
    }
  };

  const getMaxSizeMB = (t: string) => {
    switch (t) {
      case 'video': return 50;
      case 'audio': return 10;
      case 'document': return 10;
      default: return 5;
    }
  };

  const Icon = getIcon();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = getMaxSizeMB(type) * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File too large. Max ${getMaxSizeMB(type)}MB`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('type', type);
      formData.append('category', category);
      formData.append('date', new Date().toISOString());

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onChange(data.media.url);
      } else {
        setError(data.error || 'Failed to upload media');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={getAccept()}
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative group">
          <div className={`w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 ${
            type === 'image' ? 'rounded-full' : 'rounded-lg'
          }`}>
            {type === 'image' ? (
              <img
                src={value}
                alt="Uploaded media"
                className="w-full h-full object-cover"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = '/file.svg';
                }}
              />
            ) : (
              <video 
                src={value} 
                className="w-full h-full object-cover"
                muted 
                playsInline
              >
                <img src="/file.svg" alt="Media preview unavailable" />
              </video>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
            title="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-xs mt-1">Uploading...</span>
            </>
          ) : (
            <>
              <Icon className="h-8 w-8" />
              <span className="text-xs mt-2 text-center">{label}</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="mt-2 text-red-500 text-xs">{error}</p>
      )}
    </div>
  );
}

