import type { Activity } from '../types/activity.ts';
import type { BodyLogEntry } from '../types/bodyLog.ts';

export interface BackupData {
  version: 1;
  exportedAt: string;
  activities: Activity[];
  bodyLogs: BodyLogEntry[];
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${method} /api${path} failed (${res.status}): ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  me: () =>
    request<{ username: string }>('GET', '/me'),

  activities: {
    list: (from: string, to: string) =>
      request<Activity[]>('GET', `/activities?from=${from}&to=${to}`),

    create: (activity: Activity) =>
      request<Activity>('POST', '/activities', activity),

    bulkImport: (activities: Activity[]) =>
      request<{ added: number; skipped: number }>('POST', '/activities/bulk-import', { activities }),

    delete: (id: string) =>
      request<void>('DELETE', `/activities/${id}`),

    clear: () =>
      request<void>('DELETE', '/activities'),
  },

  bodyLogs: {
    list: (from: string, to: string) =>
      request<BodyLogEntry[]>('GET', `/body-logs?from=${from}&to=${to}`),

    create: (entry: BodyLogEntry) =>
      request<BodyLogEntry>('POST', '/body-logs', entry),

    delete: (id: string) =>
      request<void>('DELETE', `/body-logs/${id}`),

    clear: () =>
      request<void>('DELETE', '/body-logs'),
  },

  export: () =>
    request<BackupData>('GET', '/export'),

  import: (data: BackupData) =>
    request<{ activities: number; bodyLogs: number }>('POST', '/import', data),
};
