// Storage is now server-side (FastAPI + SQLite).
// This file exists only for the JSON backup helpers used by Header and gistSync.
import { api, type BackupData } from './api.ts';

export type { BackupData };

export async function exportBackupJSON(): Promise<BackupData> {
  return api.export();
}

export async function importBackupJSON(data: BackupData): Promise<{ activities: number; bodyLogs: number }> {
  const result = await api.import(data);
  return { activities: result.activities, bodyLogs: result.bodyLogs };
}
