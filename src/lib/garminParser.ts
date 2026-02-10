import Papa from 'papaparse';
import type { Activity } from '../types/activity.ts';
import { resolveActivityType } from '../constants/activityTypes.ts';

function parseDuration(raw: string): number {
  if (!raw) return 0;
  // Handle "HH:MM:SS" or "H:MM:SS" or "MM:SS"
  const parts = raw.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + parts[2] / 60;
  }
  if (parts.length === 2) {
    return parts[0] + parts[1] / 60;
  }
  // Try parsing as minutes directly
  const n = parseFloat(raw);
  return isNaN(n) ? 0 : n;
}

function parseDate(raw: string): string {
  // Garmin exports dates as "YYYY-MM-DD HH:MM:SS" or "MM/DD/YYYY" etc.
  const d = new Date(raw);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseNumber(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/,/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? undefined : n;
}

export interface GarminParseResult {
  activities: Activity[];
  skipped: number;
  errors: string[];
}

export function parseGarminCSV(csvText: string): GarminParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const activities: Activity[] = [];
  let skipped = 0;
  const errors: string[] = [];

  if (result.errors.length > 0) {
    errors.push(...result.errors.map((e) => `Row ${e.row}: ${e.message}`));
  }

  for (const row of result.data) {
    const activityType = row['Activity Type'] ?? row['Type'] ?? '';
    const dateRaw = row['Date'] ?? row['Start Time'] ?? row['Begin Timestamp'] ?? '';
    const date = parseDate(dateRaw);

    if (!date) {
      skipped++;
      continue;
    }

    const title = row['Title'] ?? row['Activity Name'] ?? row['Name'] ?? activityType;
    const durationRaw = row['Time'] ?? row['Duration'] ?? row['Elapsed Time'] ?? row['Moving Time'] ?? '';
    const durationMinutes = parseDuration(durationRaw);

    if (durationMinutes <= 0) {
      skipped++;
      continue;
    }

    const activity: Activity = {
      id: crypto.randomUUID(),
      type: resolveActivityType(activityType),
      title: title || 'Untitled Activity',
      date,
      startTime: dateRaw.includes(' ') ? dateRaw.split(' ')[1] : undefined,
      durationMinutes: Math.round(durationMinutes * 100) / 100,
      distanceKm: parseNumber(row['Distance']),
      calories: parseNumber(row['Calories']),
      avgHeartRate: parseNumber(row['Avg HR'] ?? row['Average Heart Rate (bpm)']),
      maxHeartRate: parseNumber(row['Max HR'] ?? row['Max Heart Rate (bpm)']),
      source: 'garmin',
      garminRawFields: row,
    };

    activities.push(activity);
  }

  return { activities, skipped, errors };
}
