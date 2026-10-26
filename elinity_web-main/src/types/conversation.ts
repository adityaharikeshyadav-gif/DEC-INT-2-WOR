export interface Persona {
  id: string;
  name: string;
  dates: string;
  portrait: string;
  bio: string;
  topics: string[];
  category: string;
  opening_prompt: string;
}

export interface Journey {
  id: string;
  title: string;
  description: string;
  recommended_persona: string;
  theme: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'persona';
  text: string;
  isStreaming?: boolean;
}

export interface ReflectionData {
  summary: string;
  insight: string;
}

export interface ConversationSession {
  session_id: string;
  persona_id: string;
  persona_name: string;
  persona_portrait: string;
  journey_title?: string;
  mode: 'text' | 'voice';
  concluded: boolean;
  reflection?: ReflectionData;
  message_count?: number;
}

export interface SavedInsight {
  id: string;
  session_id: string;
  persona_id: string;
  persona_name: string;
  persona_portrait: string;
  journey_title?: string;
  summary: string;
  insight: string;
  created_at: string;
}
