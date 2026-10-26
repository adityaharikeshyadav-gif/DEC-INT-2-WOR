import type { Trip } from '../types/trip';

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';

export async function fetchTrips(): Promise<Trip[]> {
  const res = await fetch(`${BASE_URL}/trips`);
  if (!res.ok) throw new Error(`Failed to fetch trips: ${res.status}`);
  return res.json() as Promise<Trip[]>;
}

export async function fetchTripById(id: string): Promise<Trip> {
  const res = await fetch(`${BASE_URL}/trips/${id}`);
  if (res.status === 404) throw new Error('Trip not found');
  if (!res.ok) throw new Error(`Failed to fetch trip: ${res.status}`);
  return res.json() as Promise<Trip>;
}

export async function fetchLumiInsight(tripId: string, userContext?: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/trips/${tripId}/lumi-insight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_context: userContext ?? '' }),
  });
  if (!res.ok) throw new Error('Failed to fetch Lumi insight');
  const data = (await res.json()) as { insight: string };
  return data.insight;
}

export interface BookingPayload {
  trip_id: string;
  trip_title: string;
  price: number;
  user_email?: string;
  user_name?: string;
}

export interface BookingResult {
  booking_id: string;
  status: string;
  trip_id: string;
  message: string;
}

export async function bookTrip(payload: BookingPayload): Promise<BookingResult> {
  const res = await fetch(`${BASE_URL}/trips/book`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.status === 409) throw new Error('This trip is fully booked');
  if (!res.ok) throw new Error('Booking failed — please try again');
  return res.json() as Promise<BookingResult>;
}
