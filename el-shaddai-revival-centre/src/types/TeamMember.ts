// Team Member Type for leadership/teams
export interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: string;
  bio: string;
  imageUrl: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  order?: number;
  created_at: string;
}

export interface TeamFormData {
  name: string;
  title: string;
  role: string;
  bio: string;
  imageUrl: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  order?: number;
}
