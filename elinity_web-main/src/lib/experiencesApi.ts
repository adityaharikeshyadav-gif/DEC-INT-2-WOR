import type { Experience } from '../components/experiences/experiencesData';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';

export async function fetchExperiences(): Promise<Experience[]> {
  const res = await fetch(`${BASE_URL}/experiences`);
  if (!res.ok) throw new Error(`Failed to fetch experiences: ${res.status}`);
  return res.json() as Promise<Experience[]>;
}

export async function fetchExperienceById(id: string): Promise<Experience> {
  const res = await fetch(`${BASE_URL}/experiences/${id}`);
  if (res.status === 404) throw new Error('Experience not found');
  if (!res.ok) throw new Error(`Failed to fetch experience: ${res.status}`);
  return res.json() as Promise<Experience>;
}

export async function fetchExperienceLumiInsight(experienceId: string, userContext?: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/experiences/${experienceId}/lumi-insight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_context: userContext ?? '' }),
  });
  if (!res.ok) throw new Error('Failed to fetch Lumi insight');
  const data = (await res.json()) as { insight: string };
  return data.insight;
}

export interface ExperienceBookingPayload {
  experience_id: string;
  experience_title: string;
  price: number;
  user_email?: string;
  user_name?: string;
}

export interface ExperienceBookingResult {
  booking_id: string;
  status: string;
  experience_id: string;
  message: string;
}

export async function bookExperience(payload: ExperienceBookingPayload): Promise<ExperienceBookingResult> {
  const res = await fetch(`${BASE_URL}/experiences/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.status === 409) throw new Error('This experience is fully booked');
  if (!res.ok) throw new Error('Booking failed — please try again');
  return res.json() as Promise<ExperienceBookingResult>;
}
