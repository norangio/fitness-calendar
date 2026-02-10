import { useState, useCallback, useMemo } from 'react';
import type { ViewMode } from '../types/calendar.ts';
import { getDateRange, navigateDate, getViewTitle, formatDateKey } from '../lib/dateUtils.ts';
import { useAppStore } from '../store/activityStore.ts';

export function useCalendarNavigation() {
  const [anchorDate, setAnchorDate] = useState(new Date());
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);

  const goToday = useCallback(() => setAnchorDate(new Date()), []);
  const goNext = useCallback(() => setAnchorDate((d) => navigateDate(d, viewMode, 'next')), [viewMode]);
  const goPrev = useCallback(() => setAnchorDate((d) => navigateDate(d, viewMode, 'prev')), [viewMode]);

  const dateRange = useMemo(() => {
    const range = getDateRange(anchorDate, viewMode);
    return {
      start: range.start,
      end: range.end,
      startKey: formatDateKey(range.start),
      endKey: formatDateKey(range.end),
    };
  }, [anchorDate, viewMode]);

  const title = useMemo(() => getViewTitle(anchorDate, viewMode), [anchorDate, viewMode]);

  const drillDown = useCallback((date: Date, toMode?: ViewMode) => {
    setAnchorDate(date);
    if (toMode) setViewMode(toMode);
  }, [setViewMode]);

  return {
    anchorDate,
    setAnchorDate,
    viewMode,
    setViewMode,
    goToday,
    goNext,
    goPrev,
    dateRange,
    title,
    drillDown,
  };
}
