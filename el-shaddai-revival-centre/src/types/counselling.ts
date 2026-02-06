// Counselling Types

export interface Counsellor {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  bio: string;
  imageUrl: string;
  email: string;
  phone?: string;
  availability: Availability[];
  isOnline: boolean;
  isInPerson: boolean;
  yearsOfExperience: number;
  rating: number;
  reviewCount: number;
}

export interface Availability {
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface TimeSlot {
  id: string;
  counsellorId: string;
  date: string; // "2024-01-15"
  startTime: string; // "09:00"
  endTime: string; // "09:30"
  isAvailable: boolean;
}

export interface CounsellingBooking {
  id: string;
  createdAt: string;
  userId?: string;
  
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city?: string;
  
  // Booking Details
  counsellorId: string;
  bookingType: 'online' | 'in-person';
  preferredDate: string;
  preferredTime: string;
  sessionDuration: number; // in minutes (30, 45, 60)
  topic: string;
  notes?: string;
  
  // Google Teams Details (for online)
  teamsMeetingUrl?: string;
  teamsJoinUrl?: string;
  
  // Status
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  confirmationNumber?: string;
  
  // Payment (if applicable)
  isPaid: boolean;
  paymentAmount?: number;
  paymentReference?: string;
}

export interface CounsellorSelection {
  counsellor: Counsellor;
  availableSlots: TimeSlot[];
}

export interface BookingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  counsellorId: string;
  bookingType: 'online' | 'in-person';
  preferredDate: string;
  preferredTime: string;
  sessionDuration: number;
  topic: string;
  notes: string;
}

export interface BookingFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  counsellorId?: string;
  preferredDate?: string;
  preferredTime?: string;
  topic?: string;
  general?: string;
}

export interface Country {
  code: string;
  name: string;
  isGhana: boolean;
}

export const BOOKING_TYPES = {
  ONLINE: {
    id: 'online' as const,
    label: 'Online (Google Teams)',
    description: 'Join the counselling session from anywhere via Google Teams',
    icon: 'video',
  },
  IN_PERSON: {
    id: 'in-person' as const,
    label: 'In-Person',
    description: 'Visit our centre in Ghana for face-to-face counselling',
    icon: 'map-pin',
  },
} as const;

export const SESSION_DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' },
];

export const TOPICS = [
  'Marriage & Family',
  'Pre-Marital',
  'Grief & Loss',
  'Anxiety & Stress',
  'Depression',
  'Faith & Spiritual',
  'Career Guidance',
  'Relationship Issues',
  'Addiction Recovery',
  'Child & Adolescent',
  'Other',
];

export const AFRICAN_COUNTRIES = [
  { code: 'GH', name: 'Ghana', isGhana: true },
  { code: 'NG', name: 'Nigeria', isGhana: false },
  { code: 'KE', name: 'Kenya', isGhana: false },
  { code: 'ZA', name: 'South Africa', isGhana: false },
  { code: 'UG', name: 'Uganda', isGhana: false },
  { code: 'TZ', name: 'Tanzania', isGhana: false },
  { code: 'RW', name: 'Rwanda', isGhana: false },
  { code: 'CM', name: 'Cameroon', isGhana: false },
  { code: 'CI', name: 'Ivory Coast', isGhana: false },
  { code: 'SN', name: 'Senegal', isGhana: false },
  { code: 'ZW', name: 'Zimbabwe', isGhana: false },
  { code: 'ET', name: 'Ethiopia', isGhana: false },
  { code: 'MZ', name: 'Mozambique', isGhana: false },
  { code: 'MG', name: 'Madagascar', isGhana: false },
  { code: 'MW', name: 'Malawi', isGhana: false },
  { code: 'ZM', name: 'Zambia', isGhana: false },
  { code: 'BJ', name: 'Benin', isGhana: false },
  { code: 'BF', name: 'Burkina Faso', isGhana: false },
  { code: 'ML', name: 'Mali', isGhana: false },
  { code: 'TG', name: 'Togo', isGhana: false },
];

export const OTHER_COUNTRIES = [
  { code: 'US', name: 'United States', isGhana: false },
  { code: 'GB', name: 'United Kingdom', isGhana: false },
  { code: 'CA', name: 'Canada', isGhana: false },
  { code: 'AU', name: 'Australia', isGhana: false },
  { code: 'DE', name: 'Germany', isGhana: false },
  { code: 'FR', name: 'France', isGhana: false },
  { code: 'NL', name: 'Netherlands', isGhana: false },
  { code: 'BE', name: 'Belgium', isGhana: false },
  { code: 'ES', name: 'Spain', isGhana: false },
  { code: 'IT', name: 'Italy', isGhana: false },
  { code: 'SE', name: 'Sweden', isGhana: false },
  { code: 'NO', name: 'Norway', isGhana: false },
  { code: 'DK', name: 'Denmark', isGhana: false },
  { code: 'FI', name: 'Finland', isGhana: false },
  { code: 'AT', name: 'Austria', isGhana: false },
  { code: 'CH', name: 'Switzerland', isGhana: false },
  { code: 'IE', name: 'Ireland', isGhana: false },
  { code: 'PT', name: 'Portugal', isGhana: false },
  { code: 'GR', name: 'Greece', isGhana: false },
  { code: 'PL', name: 'Poland', isGhana: false },
  { code: 'CZ', name: 'Czech Republic', isGhana: false },
  { code: 'HU', name: 'Hungary', isGhana: false },
  { code: 'RO', name: 'Romania', isGhana: false },
  { code: 'BR', name: 'Brazil', isGhana: false },
  { code: 'MX', name: 'Mexico', isGhana: false },
  { code: 'AE', name: 'United Arab Emirates', isGhana: false },
  { code: 'SG', name: 'Singapore', isGhana: false },
  { code: 'HK', name: 'Hong Kong', isGhana: false },
  { code: 'JP', name: 'Japan', isGhana: false },
  { code: 'KR', name: 'South Korea', isGhana: false },
  { code: 'IN', name: 'India', isGhana: false },
  { code: 'CN', name: 'China', isGhana: false },
  { code: 'NZ', name: 'New Zealand', isGhana: false },
  { code: 'ZA', name: 'South Africa', isGhana: false },
];

export const ALL_COUNTRIES = [...AFRICAN_COUNTRIES, ...OTHER_COUNTRIES].sort((a, b) => 
  a.name.localeCompare(b.name)
);

export function getCountriesForDropdown() {
  return ALL_COUNTRIES;
}

export function isUserInGhana(countryCode: string): boolean {
  return countryCode === 'GH';
}

export function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CNSL-${timestamp}-${random}`;
}

export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTimeForDisplay(timeString: string): string {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function formatPhoneNumber(phone: string, countryCode: string): string {
  // This is a placeholder - actual formatting would depend on country
  return phone;
}

