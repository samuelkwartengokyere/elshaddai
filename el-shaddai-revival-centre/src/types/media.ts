export interface Media {
  _id: string;
  title: string;
  description?: string;
  url: string;
  type: 'image' | 'video' | 'document';
  category: 'service' | 'event' | 'ministry' | 'other';
  date: Date;
  uploadedAt: Date;
  isFeatured?: boolean;
}

export type MediaType = 'image' | 'video' | 'document';
export type MediaCategory = 'service' | 'event' | 'ministry' | 'other';

export interface MediaFormData {
  title: string;
  description: string;
  file: File | null;
  type: MediaType;
  category: MediaCategory;
}

