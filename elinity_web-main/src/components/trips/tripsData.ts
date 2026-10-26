export type { TripVibe, TripRegion, TripDifficulty } from '../../types/trip';

import type { TripVibe, TripRegion } from '../../types/trip';

export const VIBE_CONFIG: Record<TripVibe, { label: string; icon: string; color: string; bg: string }> = {
  adventure: { label: 'Adventure', icon: '⛰️', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  wellness:  { label: 'Wellness',  icon: '🌿', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  culture:   { label: 'Culture',   icon: '🏛️', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  social:    { label: 'Social',    icon: '✨', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
};

export const REGION_CONFIG: Record<TripRegion, { label: string; emoji: string }> = {
  asia:     { label: 'Asia',     emoji: '🌏' },
  europe:   { label: 'Europe',   emoji: '🌍' },
  americas: { label: 'Americas', emoji: '🌎' },
  africa:   { label: 'Africa',   emoji: '🌍' },
  oceania:  { label: 'Oceania',  emoji: '🌊' },
};
