import type { Persona, Journey, ConversationSession, SavedInsight, ReflectionData } from '../types/conversation';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';

export async function fetchPersonas(): Promise<Persona[]> {
  const res = await fetch(`${BASE_URL}/conversations/personas`);
  if (!res.ok) throw new Error(`Failed to fetch personas: ${res.status}`);
  return res.json() as Promise<Persona[]>;
}

export async function fetchJourneys(): Promise<Journey[]> {
  const res = await fetch(`${BASE_URL}/conversations/journeys`);
  if (!res.ok) throw new Error(`Failed to fetch journeys: ${res.status}`);
  return res.json() as Promise<Journey[]>;
}

export async function fetchPersonaById(id: string): Promise<Persona> {
  const res = await fetch(`${BASE_URL}/conversations/personas/${id}`);
  if (res.status === 404) throw new Error('Persona not found');
  if (!res.ok) throw new Error(`Failed to fetch persona: ${res.status}`);
  return res.json() as Promise<Persona>;
}

export interface StartSessionResponse {
  session_id: string;
  greeting: string;
  persona_name: string;
  persona_portrait: string;
}

export async function startConversationSession(
  personaId: string,
  journeyId?: string,
  mode: 'text' | 'voice' = 'text'
): Promise<StartSessionResponse> {
  const res = await fetch(`${BASE_URL}/conversations/session/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      persona_id: personaId,
      journey_id: journeyId || null,
      mode
    }),
  });
  if (!res.ok) throw new Error('Failed to start conversation session');
  return res.json() as Promise<StartSessionResponse>;
}

export interface ChatResponse {
  response: string;
  session_concluded: boolean;
  reflection?: ReflectionData;
}

export async function sendConversationMessage(
  sessionId: string,
  message: string
): Promise<ChatResponse> {
  const res = await fetch(`${BASE_URL}/conversations/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message
    }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json() as Promise<ChatResponse>;
}

export async function saveSessionInsight(payload: {
  session_id: string;
  persona_id: string;
  persona_name: string;
  persona_portrait: string;
  journey_title?: string;
  summary: string;
  insight: string;
}): Promise<{ insight_id: string; status: string }> {
  const res = await fetch(`${BASE_URL}/conversations/save-insight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to save insight');
  return res.json() as Promise<{ insight_id: string; status: string }>;
}

export async function fetchConversationHistory(): Promise<ConversationSession[]> {
  const res = await fetch(`${BASE_URL}/conversations/history`);
  if (!res.ok) throw new Error('Failed to fetch conversation history');
  return res.json() as Promise<ConversationSession[]>;
}

export async function fetchSavedInsights(): Promise<SavedInsight[]> {
  const res = await fetch(`${BASE_URL}/conversations/insights`);
  if (!res.ok) throw new Error('Failed to fetch saved insights');
  return res.json() as Promise<SavedInsight[]>;
}
