export interface GameCatalogItem {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  players: { min: number; max: number };
  duration_range: { min: number; max: number };
  host: string;
  attributes: string[];
  moods: string[];
  mechanics: {
    allow_pass: boolean;
    allow_veto: boolean;
    twist_round: number;
    total_rounds: number;
  };
}

export interface GamePlayer {
  username: string;
  ready: boolean;
}

export interface GameMessage {
  role: 'system' | 'user' | 'assistant';
  sender: string;
  content: string;
}

export type UnsaidMode = 'solo' | 'face_to_face' | 'group';
export type UnsaidTerrain = 'appreciation' | 'regret' | 'apology' | 'admission' | 'hard_thing' | 'wander';
export type UnsaidDepth = 'surface' | 'current' | 'bedrock';
export type UnsaidPhase = 'LOBBY' | 'OPENING' | 'CONVERSATION' | 'DEPTH_CHECK' | 'RELEASE' | 'COMPLETED' | 'STOPPED';

export interface UnsaidMap {
  summary: string;
  specific_moment: string;
  shift: string;
  quote: string;
  open_question: string;
}

export type TurncoatMode = 'classic' | 'full_circle';
export type TurncoatSide = 'agree' | 'disagree';

export interface TurncoatScoreBreakdown {
  lumi: Record<string, number>;
  peer_average: Record<string, number>;
  final: Record<string, number>;
  subtotal: number;
  bonus: number;
}

export interface TurncoatRoundResult {
  round: number;
  motion: string;
  scores: Record<string, TurncoatScoreBreakdown>;
  peer_scorecards: Record<string, Record<string, Record<string, number>>>;
}

export type LongTableMode = 'letter' | 'conversation' | 'council';
export type LongTableAnchor = 'child' | 'young_one' | 'striver' | 'maker' | 'elder' | 'ancient';
export type GameOfGamesMode = 'discovery' | 'academy';
export type GameOfGamesPack = 'foundations' | 'commons_bargains' | 'deep_strategy' | 'paradoxes' | 'mixed';

export interface GameOfGamesChoice {
  key: string;
  label: string;
  description: string;
}

export interface GameOfGamesScenario {
  slug: string;
  name: string;
  format: 'simultaneous_choice' | 'sequential_choice' | 'multi_round' | 'negotiation' | 'solo_decision';
  choices: GameOfGamesChoice[];
  discovery_prompt: string;
  academy_prompt: string;
  payoff_note: string;
  theory: string;
  nash_equilibrium: string;
  rounds?: number;
  roles?: Record<string, string>;
}

export interface GameOfGamesPayoffResult {
  scenario: string;
  choices: Record<string, string>;
  scores_delta: Record<string, number>;
  outcome: string;
  optimal_alternative: string;
  nash_equilibrium: string;
  nash_observed: boolean;
  theory: string;
}

export interface GameOfGamesDecisionProfile {
  cooperation_tendency: number;
  risk_tolerance: number;
  reciprocity: number;
  strategic_sophistication: number;
  consistency: number;
  archetype: string;
  scenarios_played: number;
  strategic_architect_unlocked: boolean;
  _samples?: number;
}

export interface LongTableAgeSelf {
  age: number;
  anchor: LongTableAnchor;
  label: string;
}

export interface LongTableEntry {
  entry_id: string;
  completed_at: string;
  mode: LongTableMode;
  ages: number[];
  anchors: LongTableAnchor[];
  compass: string;
  summary: string;
  shift: string;
  open_question: string;
  lumi_noticed: string;
  conflicts: string[];
  record: {
    letter?: string | null;
    dialogue?: Array<{ speaker: string; text: string }> | null;
    council?: LongTableCouncilTurn[] | null;
  };
  return_from?: string | null;
  dedication?: string | null;
  full_table_achieved: boolean;
}

export type LongTableHistorySnapshot = Pick<LongTableEntry,
  'entry_id' | 'completed_at' | 'mode' | 'ages' | 'anchors' | 'compass' | 'summary' | 'shift' | 'open_question'
>;

export interface LongTableCouncilTurn {
  prompt?: string | null;
  target_type: 'seating' | 'all' | 'specific' | 'vote';
  target_age?: string | null;
  voices: Array<{ age_self: string; voice: string }>;
  facilitator_note?: string | null;
}

export interface GameState {
  phase: string;
  scores?: Record<string, number>;
  vetos_used?: Record<string, boolean>;
  hot_seat_player_id?: string | null;
  custom_titles?: Record<string, string> | null;
  round_data?: {
    prompt?: string | null;
    target_player?: string | null;
    private_answer?: string | null;
    guesses?: Record<string, string | boolean>;
    bluffs?: Record<string, string | boolean>;
    votes?: Record<string, { text: string; creator: string; is_correct: boolean } | boolean>;
    bluff_options?: Array<{ text: string; creator?: string; is_correct?: boolean }>;
  } | null;
  mode?: UnsaidMode | string;
  terrain?: UnsaidTerrain | string;
  depth_level?: UnsaidDepth;
  turns_at_depth?: number;
  last_lumi_move?: 'draw' | 'hold' | 'dig' | 'redirect' | 'bridge' | 'witness' | null;
  paused?: boolean;
  stopped?: boolean;
  can_resume?: boolean;
  my_depth_choice?: 'stay' | 'deeper' | 'release' | null;
  depth_vote_count?: number;
  my_release_submitted?: boolean;
  my_release_starter?: string | null;
  individual_map?: UnsaidMap | null;
  shared_map?: UnsaidMap | null;
  total_rounds?: number;
  territory?: string;
  setup_positions?: Record<string, string>;
  motion?: string | null;
  motion_territory?: string | null;
  assigned_positions?: Record<string, TurncoatSide>;
  arguments?: Record<string, Record<string, string>>;
  round?: number;
  turn_index?: number;
  curveball?: string | null;
  totals?: Record<string, number>;
  score_history?: TurncoatRoundResult[];
  turncoat_bonus_awarded?: string | null;
  final_declarations?: {
    winners: string[];
    turncoat_award: string;
    most_changed_mind?: string | null;
  } | null;
  my_real_side?: TurncoatSide | null;
  stance_count?: number;
  my_peer_scores_submitted?: boolean;
  revealed_lumi_scores?: Record<string, Record<string, number>>;
  revealed_peer_scores?: Record<string, Record<string, Record<string, number>>>;
  selected_ages?: LongTableAgeSelf[];
  compass?: string | null;
  occasion?: string | null;
  return_match?: string | null;
  intake_question?: string | null;
  intake_answers?: Array<{ question: string; answer?: string | null; passed: boolean }>;
  intake_index?: number;
  letter_sections?: string[];
  letter_moves?: Array<{ move: 'draw' | 'hold' | 'unsent_line'; response: string }>;
  dialogue_turns?: Array<{ speaker: string; text: string }>;
  council_turns?: LongTableCouncilTurn[];
  table_log?: LongTableEntry | null;
  assembled_letter?: string | null;
  newly_visited_anchors?: LongTableAnchor[];
  full_table_achieved?: boolean;
  scenario_pack?: GameOfGamesPack;
  scenario_count?: number;
  scenario_index?: number;
  scenario_order?: string[];
  current_scenario?: GameOfGamesScenario | null;
  active_choices?: GameOfGamesChoice[];
  required_players?: string[];
  active_role?: string;
  current_decision_label?: string;
  submitted_players?: string[];
  choice_count?: number;
  my_choice?: string | null;
  choices?: Record<string, string | boolean>;
  revealed_choices?: Record<string, string>;
  payoff_result?: GameOfGamesPayoffResult | null;
  round_tracker?: GameOfGamesPayoffResult[];
  scenario_history?: GameOfGamesPayoffResult[];
  timer_seconds?: number;
  timer_started_at?: string | null;
  decision_profile?: Record<string, GameOfGamesDecisionProfile>;
}

export interface GameSession {
  session_id: string;
  invite_code: string;
  game_slug: string;
  status: 'LOBBY' | 'ACTIVE' | 'COMPLETED';
  mood: string;
  players: GamePlayer[];
  current_round: number;
  current_player_id: string | null;
  messages: GameMessage[];
  concluded: boolean;
  drift_log: string | null;
  twist_offered: boolean;
  game_state?: GameState | null;
}

export interface CreateSessionResponse {
  session_id: string;
  game_slug: string;
  status: string;
  invite_code: string;
}

const getDevApiUrl = (): string => {
  if (typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname === 'localhost' ? '127.0.0.1' : window.location.hostname;
    return `http://${host}:8000`;
  }
  return 'http://127.0.0.1:8000';
};

export const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || getDevApiUrl();

export const getWsUrl = (baseUrl: string): string => {
  // Handle relative URLs
  let absoluteUrl = baseUrl;
  if (baseUrl.startsWith('/')) {
    const loc = window.location;
    absoluteUrl = `${loc.protocol}//${loc.host}${baseUrl}`;
  }
  const url = new URL(absoluteUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString().replace(/\/$/, '');
};

export const WS_URL = getWsUrl(BASE_URL);

export async function fetchGamesCatalog(): Promise<GameCatalogItem[]> {
  const res = await fetch(`${BASE_URL}/games/catalog`);
  if (!res.ok) throw new Error(`Failed to fetch catalog: ${res.status}`);
  return res.json() as Promise<GameCatalogItem[]>;
}

export async function createGameSession(gameSlug: string, mood: string = 'Reflective'): Promise<CreateSessionResponse> {
  const res = await fetch(`${BASE_URL}/games/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ game_slug: gameSlug, mood }),
  });
  if (!res.ok) throw new Error(`Failed to create game session: ${res.status}`);
  return res.json() as Promise<CreateSessionResponse>;
}

export async function fetchGameSessionDetails(sessionId: string): Promise<GameSession> {
  const res = await fetch(`${BASE_URL}/games/sessions/${sessionId}`);
  if (!res.ok) throw new Error(`Failed to fetch session: ${res.status}`);
  return res.json() as Promise<GameSession>;
}

export async function fetchGameSessionByCode(inviteCode: string): Promise<GameSession> {
  const res = await fetch(`${BASE_URL}/games/sessions/by-code/${inviteCode}`);
  if (!res.ok) throw new Error(`Failed to find session by code: ${res.status}`);
  return res.json() as Promise<GameSession>;
}
