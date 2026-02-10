export type ActivityType =
  | 'basketball'
  | 'yoga'
  | 'open_water_swimming'
  | 'weightlifting'
  | 'running'
  | 'cycling'
  | 'other';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  date: string; // ISO 8601 "YYYY-MM-DD"
  startTime?: string;
  durationMinutes: number;
  distanceKm?: number;
  calories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  notes?: string;
  source: 'manual' | 'garmin';
  garminRawFields?: Record<string, string>;
}
