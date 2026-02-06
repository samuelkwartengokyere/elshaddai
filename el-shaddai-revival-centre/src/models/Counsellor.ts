import { Counsellor } from '@/types/counselling';

export const COUNSELLORS: Counsellor[] = [
  {
    id: 'counsellor-1',
    name: 'Pastor John Smith',
    title: 'Senior Pastoral Counsellor',
    specialization: ['Marriage & Family', 'Pre-Marital', 'Faith & Spiritual'],
    bio: 'Pastor John has over 15 years of experience in pastoral counselling. He specializes in marriage preparation, family therapy, and spiritual guidance. His approach combines biblical principles with professional counselling techniques.',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    email: 'counselling@elshaddai.com',
    phone: '+233 50 123 4567',
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
      { dayOfWeek: 5, startTime: '09:00', endTime: '15:00' }, // Friday
    ],
    isOnline: true,
    isInPerson: true,
    yearsOfExperience: 15,
    rating: 4.9,
    reviewCount: 127,
  },
  {
    id: 'counsellor-2',
    name: 'Dr. Sarah Johnson',
    title: 'Licensed Clinical Psychologist',
    specialization: ['Anxiety & Stress', 'Depression', 'Grief & Loss', 'Relationship Issues'],
    bio: 'Dr. Sarah is a licensed clinical psychologist with a doctorate in Clinical Psychology. She has extensive experience treating anxiety, depression, and grief. She integrates faith with evidence-based therapeutic approaches.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    email: 'dr.sarah@elshaddai.com',
    phone: '+233 50 234 5678',
    availability: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' }, // Monday
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' }, // Thursday
      { dayOfWeek: 5, startTime: '10:00', endTime: '16:00' }, // Friday
    ],
    isOnline: true,
    isInPerson: true,
    yearsOfExperience: 12,
    rating: 4.8,
    reviewCount: 98,
  },
  {
    id: 'counsellor-3',
    name: 'Rev. Michael Osei',
    title: 'Family & Marriage Counsellor',
    specialization: ['Marriage & Family', 'Addiction Recovery', 'Faith & Spiritual'],
    bio: 'Rev. Michael specializes in family dynamics, marriage counselling, and addiction recovery. He has helped numerous families heal and rebuild their relationships through Christ-centered counselling.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    email: 'rev.michael@elshaddai.com',
    phone: '+233 50 345 6789',
    availability: [
      { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' }, // Monday
      { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' }, // Thursday
      { dayOfWeek: 5, startTime: '08:00', endTime: '14:00' }, // Friday
      { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' }, // Saturday
    ],
    isOnline: true,
    isInPerson: true,
    yearsOfExperience: 10,
    rating: 4.9,
    reviewCount: 86,
  },
  {
    id: 'counsellor-4',
    name: 'Dr. Emily Chen',
    title: 'Child & Adolescent Psychologist',
    specialization: ['Child & Adolescent', 'Anxiety & Stress', 'Relationship Issues'],
    bio: 'Dr. Emily is a specialist in child and adolescent psychology. She works with young people aged 6-18, helping them navigate the challenges of growing up, school stress, family transitions, and emotional regulation.',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    email: 'dr.emily@elshaddai.com',
    phone: '+233 50 456 7890',
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
      { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    ],
    isOnline: true,
    isInPerson: true,
    yearsOfExperience: 8,
    rating: 4.7,
    reviewCount: 64,
  },
  {
    id: 'counsellor-5',
    name: 'Mr. David Williams',
    title: 'Career & Leadership Coach',
    specialization: ['Career Guidance', 'Anxiety & Stress', 'Relationship Issues'],
    bio: 'Mr. David specializes in career counselling, professional development, and leadership coaching. He helps individuals discover their calling, navigate career transitions, and develop essential life skills.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    email: 'david@elshaddai.com',
    phone: '+233 50 567 8901',
    availability: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' }, // Monday
      { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '10:00', endTime: '18:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' }, // Thursday
      { dayOfWeek: 5, startTime: '10:00', endTime: '18:00' }, // Friday
    ],
    isOnline: true,
    isInPerson: true,
    yearsOfExperience: 7,
    rating: 4.8,
    reviewCount: 52,
  },
  {
    id: 'counsellor-6',
    name: 'Mrs. Grace Mensah',
    title: 'Women\'s Counsellor & Mentor',
    specialization: ['Marriage & Family', 'Faith & Spiritual', 'Grief & Loss'],
    bio: 'Mrs. Grace is passionate about helping women navigate life\'s various stages. She provides counselling for women dealing with marriage challenges, motherhood, grief, and spiritual growth.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    email: 'grace@elshaddai.com',
    phone: '+233 50 678 9012',
    availability: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '16:00' }, // Monday
      { dayOfWeek: 2, startTime: '09:00', endTime: '16:00' }, // Tuesday
      { dayOfWeek: 3, startTime: '09:00', endTime: '16:00' }, // Wednesday
      { dayOfWeek: 4, startTime: '09:00', endTime: '16:00' }, // Thursday
      { dayOfWeek: 5, startTime: '09:00', endTime: '13:00' }, // Friday
      { dayOfWeek: 6, startTime: '10:00', endTime: '14:00' }, // Saturday
    ],
    isOnline: true,
    isInPerson: true,
    yearsOfExperience: 9,
    rating: 4.9,
    reviewCount: 73,
  },
];

export function getCounsellorById(id: string): Counsellor | undefined {
  return COUNSELLORS.find(c => c.id === id);
}

export function getAvailableCounsellors(
  bookingType: 'online' | 'in-person',
  country: string
): Counsellor[] {
  const isInGhana = country === 'GH';
  
  return COUNSELLORS.filter(counsellor => {
    if (bookingType === 'online') {
      return counsellor.isOnline;
    } else if (bookingType === 'in-person') {
      // Only show for in-person if user is coming to Ghana
      // Or if they're in Ghana
      return counsellor.isInPerson;
    }
    return true;
  });
}

export function getSpecializations(): string[] {
  const specializations = new Set<string>();
  COUNSELLORS.forEach(c => {
    c.specialization.forEach(s => specializations.add(s));
  });
  return Array.from(specializations).sort();
}

export function getCounsellorsBySpecialization(specialization: string): Counsellor[] {
  return COUNSELLORS.filter(c => c.specialization.includes(specialization));
}

export function getFeaturedCounsellors(): Counsellor[] {
  return COUNSELLORS.filter(c => c.rating >= 4.8).slice(0, 3);
}

