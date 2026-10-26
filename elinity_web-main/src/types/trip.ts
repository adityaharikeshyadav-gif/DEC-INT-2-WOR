export type TripVibe = 'adventure' | 'wellness' | 'culture' | 'social';
export type TripRegion = 'asia' | 'europe' | 'americas' | 'africa' | 'oceania';
export type TripDifficulty = 'easy' | 'moderate' | 'challenging';

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  location: string;
  activities: ItineraryActivity[];
  accommodation: string;
  meals: ('breakfast' | 'lunch' | 'dinner')[];
}

export interface TripReview {
  name: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

export interface PriceBreakdown {
  accommodation: number;
  activities: number;
  transport: number;
  food: number;
}

export interface Trip {
  id: string;
  title: string;
  tagline: string;
  destination: string;
  region: TripRegion;
  duration: number;
  price: number;
  priceBreakdown: PriceBreakdown;
  vibe: TripVibe;
  groupSize: { current: number; max: number };
  image: string;
  gallery: string[];
  summary: string;
  highlights: string[];
  itinerary: ItineraryDay[];
  includes: string[];
  excludes: string[];
  rating: number;
  reviewCount: number;
  reviews: TripReview[];
  isRecommended: boolean;
  startDate: string;
  endDate: string;
  difficulty: TripDifficulty;
  lumiInsight?: string;
}

export interface TripFilters {
  vibes: TripVibe[];
  regions: TripRegion[];
  maxDuration: number | null;
  maxPrice: number | null;
  difficulty: TripDifficulty[];
}
