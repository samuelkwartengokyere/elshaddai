export interface Sermon {
  id?: string;
  title: string;
  speaker: string;
  date: string | Date;
  description: string;
  audioUrl: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: string;
  series?: string;
  biblePassage?: string;
  tags?: string[];
  downloads?: number;
  views?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SermonFormData {
  title: string;
  speaker: string;
  date: string;
  description: string;
  series: string;
  biblePassage: string;
  tags: string;
}