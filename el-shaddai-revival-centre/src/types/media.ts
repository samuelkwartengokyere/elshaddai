export interface MediaItem {
  id?: string;
  title: string;
  description?: string;
  url: string;
  type: 'image' | 'video' | 'document';
  category: 'service' | 'event' | 'ministry' | 'other';
  date: Date;
  uploadedAt: Date;
}

export interface UploadResponse {
  success: boolean;
  filename?: string;
  message: string;
  url?: string;
  error?: string;
}