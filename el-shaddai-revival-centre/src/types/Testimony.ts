// Testimony Type for testimonies API
export interface Testimony {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorLocation?: string;
  imageUrl?: string;
  videoUrl?: string;
  isApproved: boolean;
  isFeatured?: boolean;
  created_at: string;
  approved_at?: string;
}

export interface TestimonyFormData {
  title: string;
  content: string;
  authorName: string;
  authorLocation?: string;
  imageUrl?: string;
  videoUrl?: string;
}
