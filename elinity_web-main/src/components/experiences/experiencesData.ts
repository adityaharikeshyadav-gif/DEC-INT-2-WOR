export type ExperienceCategory = 'social' | 'creative' | 'active' | 'food' | 'music';
export type ExperienceStatus = 'confirmed' | 'almost-full' | 'filling-fast' | 'few-spots-left' | 'sold-out';

export interface TicketType {
  name: string;
  price: number;
  description: string;
}

export interface RecommendedPerson {
  id: string;
  name: string;
  avatar: string;
  compatibility: string;
  profession: string;
  interests: string[];
  bio: string;
}

export interface ExperienceReview {
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

export interface ExperienceHost {
  name: string;
  avatar: string;
  role: string;
  bio: string;
}

export interface Experience {
  id: string;
  title: string;
  tagline: string;
  description: string;
  heroImage: string;
  gallery: string[];
  city: string;
  venue: string;
  coordinates: { lat: number; lng: number };
  date: string; // YYYY-MM-DD
  time: string; // e.g., "7:00 PM"
  duration: string; // e.g., "3 hours"
  price: number; // Base price
  ticketTypes: TicketType[];
  capacity: number;
  filled: number;
  status: ExperienceStatus;
  category: ExperienceCategory;
  tags: string[];
  recommendedPeople: RecommendedPerson[];
  host: ExperienceHost;
  rating: number;
  reviews: ExperienceReview[];
  included: string[];
  requirements: string[];
  shareLink: string;
  isRecommended?: boolean;
}

export const CATEGORY_CONFIG: Record<ExperienceCategory, { label: string; icon: string; bg: string; color: string }> = {
  social: { label: 'Social', icon: ' ', bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  creative: { label: 'Creative', icon: '🎨', bg: 'rgba(236,72,153,0.15)', color: '#ec4899' },
  active: { label: 'Active', icon: '🌿', bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
  food: { label: 'Food & Drink', icon: '🍷', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  music: { label: 'Live Music', icon: '🎵', bg: 'rgba(168,85,247,0.15)', color: '#a855f7' }
};
