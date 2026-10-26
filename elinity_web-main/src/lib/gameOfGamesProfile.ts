import type { GameOfGamesDecisionProfile } from './gamesApi';

const STORAGE_KEY = 'elinity_game_of_games_profiles_v1';
const MAX_SERIALIZED_LENGTH = 1_000_000;
const PROFILE_FIELDS: Array<keyof Pick<
  GameOfGamesDecisionProfile,
  'cooperation_tendency' | 'risk_tolerance' | 'reciprocity' | 'strategic_sophistication' | 'consistency'
>> = [
  'cooperation_tendency',
  'risk_tolerance',
  'reciprocity',
  'strategic_sophistication',
  'consistency',
];

export interface StoredGameOfGamesProfile extends GameOfGamesDecisionProfile {
  player: string;
  updated_at: string;
  sessions_played: number;
  total_score: number;
}

function storageKey(owner: string): string {
  return `${STORAGE_KEY}_${encodeURIComponent(owner.trim().toLowerCase() || 'anonymous')}`;
}

function isStoredProfile(value: unknown): value is StoredGameOfGamesProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<StoredGameOfGamesProfile>;
  return typeof profile.player === 'string'
    && typeof profile.archetype === 'string'
    && typeof profile.cooperation_tendency === 'number'
    && typeof profile.risk_tolerance === 'number'
    && typeof profile.reciprocity === 'number'
    && typeof profile.strategic_sophistication === 'number'
    && typeof profile.consistency === 'number';
}

export function loadGameOfGamesProfile(owner: string): StoredGameOfGamesProfile | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey(owner)) || 'null');
    return isStoredProfile(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function mergeProfiles(
  existing: StoredGameOfGamesProfile | null,
  incoming: GameOfGamesDecisionProfile,
): GameOfGamesDecisionProfile {
  if (!existing || (incoming.scenarios_played || 0) > (existing.scenarios_played || 0)) {
    return incoming;
  }

  const existingWeight = Math.max(0, existing.scenarios_played || existing._samples || 0);
  const incomingWeight = Math.max(1, incoming.scenarios_played || incoming._samples || 1);
  const totalWeight = existingWeight + incomingWeight;
  const merged: GameOfGamesDecisionProfile = {
    ...incoming,
    scenarios_played: totalWeight,
    _samples: totalWeight,
    strategic_architect_unlocked: existing.strategic_architect_unlocked || incoming.strategic_architect_unlocked,
    archetype: incoming.archetype,
  };

  PROFILE_FIELDS.forEach((field) => {
    merged[field] = Number((((existing[field] * existingWeight) + (incoming[field] * incomingWeight)) / totalWeight).toFixed(2));
  });

  return merged;
}

export function saveGameOfGamesProfile(
  owner: string,
  profile: GameOfGamesDecisionProfile,
  totalScore: number,
): StoredGameOfGamesProfile | null {
  const existing = loadGameOfGamesProfile(owner);
  const mergedProfile = mergeProfiles(existing, profile);
  const next: StoredGameOfGamesProfile = {
    ...mergedProfile,
    player: owner,
    updated_at: new Date().toISOString(),
    sessions_played: (existing?.sessions_played || 0) + 1,
    total_score: (existing?.total_score || 0) + totalScore,
  };

  try {
    const serialized = JSON.stringify(next);
    if (serialized.length > MAX_SERIALIZED_LENGTH) return null;
    localStorage.setItem(storageKey(owner), serialized);
    return next;
  } catch {
    return null;
  }
}
