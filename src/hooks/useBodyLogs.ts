import { useState, useEffect, useCallback } from 'react';
import type { BodyLogEntry } from '../types/bodyLog.ts';
import { getBodyLogsByDateRange, addBodyLog, deleteBodyLog } from '../lib/storage.ts';

export function useBodyLogs(startDate: string, endDate: string) {
  const [bodyLogs, setBodyLogs] = useState<BodyLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBodyLogsByDateRange(startDate, endDate).then((data) => {
      if (!cancelled) {
        setBodyLogs(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [startDate, endDate, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const add = useCallback(async (entry: BodyLogEntry) => {
    await addBodyLog(entry);
    refresh();
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteBodyLog(id);
    refresh();
  }, [refresh]);

  return { bodyLogs, loading, refresh, add, remove };
}
