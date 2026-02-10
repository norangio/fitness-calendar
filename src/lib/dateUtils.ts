import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
  addDays, addWeeks, addMonths, addYears,
  subDays, subWeeks, subMonths, subYears,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns';
import type { ViewMode } from '../types/calendar.ts';

export function getDateRange(anchorDate: Date, viewMode: ViewMode): { start: Date; end: Date } {
  switch (viewMode) {
    case 'day':
      return { start: startOfDay(anchorDate), end: endOfDay(anchorDate) };
    case 'week':
      return { start: startOfWeek(anchorDate), end: endOfWeek(anchorDate) };
    case 'month':
      return { start: startOfMonth(anchorDate), end: endOfMonth(anchorDate) };
    case 'year':
      return { start: startOfYear(anchorDate), end: endOfYear(anchorDate) };
    case 'heatmap':
      return { start: startOfYear(anchorDate), end: endOfYear(anchorDate) };
  }
}

export function navigateDate(anchorDate: Date, viewMode: ViewMode, direction: 'next' | 'prev'): Date {
  const fn = direction === 'next'
    ? { day: addDays, week: addWeeks, month: addMonths, year: addYears, heatmap: addYears }
    : { day: subDays, week: subWeeks, month: subMonths, year: subYears, heatmap: subYears };
  return fn[viewMode](anchorDate, 1);
}

export function getViewTitle(anchorDate: Date, viewMode: ViewMode): string {
  switch (viewMode) {
    case 'day':
      return format(anchorDate, 'EEEE, MMMM d, yyyy');
    case 'week': {
      const start = startOfWeek(anchorDate);
      const end = endOfWeek(anchorDate);
      if (start.getMonth() === end.getMonth()) {
        return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`;
      }
      return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
    }
    case 'month':
      return format(anchorDate, 'MMMM yyyy');
    case 'year':
      return format(anchorDate, 'yyyy');
    case 'heatmap':
      return format(anchorDate, 'yyyy');
  }
}

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addMonths,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
};
