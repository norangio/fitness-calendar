import { useState, useEffect, useCallback } from 'react';
import type { Activity } from '../types/activity.ts';
import { getActivitiesByDateRange, addActivity, addActivities, addActivitiesDeduped, deleteActivity, getActivityCount } from '../lib/storage.ts';

export function useActivities(startDate: string, endDate: string) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getActivitiesByDateRange(startDate, endDate).then((data) => {
      if (!cancelled) {
        setActivities(data);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [startDate, endDate, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const add = useCallback(async (activity: Activity) => {
    await addActivity(activity);
    refresh();
  }, [refresh]);

  const bulkAdd = useCallback(async (items: Activity[]) => {
    await addActivities(items);
    refresh();
  }, [refresh]);

  const bulkAddDeduped = useCallback(async (items: Activity[]) => {
    const result = await addActivitiesDeduped(items);
    refresh();
    return result;
  }, [refresh]);

  const remove = useCallback(async (id: string) => {
    await deleteActivity(id);
    refresh();
  }, [refresh]);

  return { activities, loading, refresh, add, bulkAdd, bulkAddDeduped, remove };
}

export function useActivityCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    getActivityCount().then(setCount);
  }, []);
  return count;
}
