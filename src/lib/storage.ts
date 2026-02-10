import Dexie, { type EntityTable } from 'dexie';
import type { Activity } from '../types/activity.ts';
import type { BodyLogEntry } from '../types/bodyLog.ts';

const db = new Dexie('FitnessCalendarDB') as Dexie & {
  activities: EntityTable<Activity, 'id'>;
  bodyLogs: EntityTable<BodyLogEntry, 'id'>;
};

db.version(1).stores({
  activities: 'id, date, type, source, [date+type]',
});

db.version(2).stores({
  activities: 'id, date, type, source, [date+type]',
  bodyLogs: 'id, date, category, [date+category]',
});

export { db };

// Activity CRUD
export async function getActivitiesByDateRange(start: string, end: string): Promise<Activity[]> {
  return db.activities.where('date').between(start, end, true, true).toArray();
}

export async function getAllActivities(): Promise<Activity[]> {
  return db.activities.toArray();
}

export async function addActivity(activity: Activity): Promise<void> {
  await db.activities.put(activity);
}

export async function addActivities(activities: Activity[]): Promise<void> {
  await db.activities.bulkPut(activities);
}

function activityFingerprint(a: { date: string; type: string; durationMinutes: number; startTime?: string }): string {
  return `${a.date}|${a.type}|${a.durationMinutes}|${a.startTime ?? ''}`;
}

export async function addActivitiesDeduped(activities: Activity[]): Promise<{ added: number; skipped: number }> {
  if (activities.length === 0) return { added: 0, skipped: 0 };

  // Collect all unique dates from the import batch
  const dates = [...new Set(activities.map((a) => a.date))];
  const minDate = dates.reduce((a, b) => (a < b ? a : b));
  const maxDate = dates.reduce((a, b) => (a > b ? a : b));

  // Fetch existing activities in that date range
  const existing = await getActivitiesByDateRange(minDate, maxDate);
  const existingFingerprints = new Set(existing.map(activityFingerprint));

  const newActivities = activities.filter((a) => !existingFingerprints.has(activityFingerprint(a)));

  if (newActivities.length > 0) {
    await db.activities.bulkPut(newActivities);
  }

  return { added: newActivities.length, skipped: activities.length - newActivities.length };
}

export async function deleteActivity(id: string): Promise<void> {
  await db.activities.delete(id);
}

export async function getActivityCount(): Promise<number> {
  return db.activities.count();
}

// Body Log CRUD
export async function getBodyLogsByDateRange(start: string, end: string): Promise<BodyLogEntry[]> {
  return db.bodyLogs.where('date').between(start, end, true, true).toArray();
}

export async function addBodyLog(entry: BodyLogEntry): Promise<void> {
  await db.bodyLogs.put(entry);
}

export async function deleteBodyLog(id: string): Promise<void> {
  await db.bodyLogs.delete(id);
}

// JSON Backup / Restore
export interface BackupData {
  version: 1;
  exportedAt: string;
  activities: Activity[];
  bodyLogs: BodyLogEntry[];
}

export async function exportBackupJSON(): Promise<BackupData> {
  const activities = await db.activities.toArray();
  const bodyLogs = await db.bodyLogs.toArray();
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    activities,
    bodyLogs,
  };
}

export async function importBackupJSON(data: BackupData): Promise<{ activities: number; bodyLogs: number }> {
  await db.transaction('rw', db.activities, db.bodyLogs, async () => {
    await db.activities.clear();
    await db.bodyLogs.clear();
    if (data.activities.length > 0) await db.activities.bulkPut(data.activities);
    if (data.bodyLogs.length > 0) await db.bodyLogs.bulkPut(data.bodyLogs);
  });
  return { activities: data.activities.length, bodyLogs: data.bodyLogs.length };
}
