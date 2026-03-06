import { useState, useEffect, useCallback } from 'react';
import type { Activity } from '../types/activity.ts';
import { api } from '../lib/api.ts';

export function useActivities(startDate: string, endDate: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.activities.list(startDate, endDate).then((data) => {
      if (!cancelled) {
        setActivities(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [startDate, endDate, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const add = useCallback(async (activity: Activity) => {
    await api.activities.create(activity);
    refresh();
  }, [refresh]);

  const bulkAdd = useCallback(async (items: Activity[]) => {
    for (const item of items) await api.activities.create(item);
    refresh();
  }, [refresh]);

  const bulkAddDeduped = useCallback(async (items: Activity[]) => {
    const result = await api.activities.bulkImport(items);
    refresh();
    return result;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await api.activities.delete(id);
    refresh();
  }, [refresh]);

  return { activities, loading, refresh, add, bulkAdd, bulkAddDeduped, remove };
}
