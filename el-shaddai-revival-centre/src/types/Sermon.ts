// Sermon Type for Sermons API and components
export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  date: string; // YYYY-MM-DD
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number; // seconds
  youtubeId?: string;
  description?: string;
  views?: number;
  isPublished: boolean;
  created_at: string;
  updated_at?: string;
}

export interface SermonFormData {
  title: string;
  preacher: string;
  date: string;
  videoUrl?: string;
  description?: string;
  youtubeId?: string;
  isPublished?: boolean;
}
