import { useMemo } from 'react';
import type { Activity } from '../types/activity.ts';
import type { ViewMode } from '../types/calendar.ts';
import type { ChartDataPoint, ChartSeries } from '../types/chart.ts';
import { ACTIVITY_TYPES, ACTIVITY_TYPE_LIST } from '../constants/activityTypes.ts';
import {
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
} from '../lib/dateUtils.ts';

export function useChartData(
  activities: Activity[],
  viewMode: ViewMode,
  dateRange: { start: Date; end: Date }
) {
  const data = useMemo<ChartDataPoint[]>(() => {
    let buckets: { label: string; date: string; start: Date; end: Date }[];

    switch (viewMode) {
      case 'day':
        // Group by hour (simplified: just show single day totals)
        buckets = [{ label: format(dateRange.start, 'MMM d'), date: format(dateRange.start, 'yyyy-MM-dd'), start: dateRange.start, end: dateRange.end }];
        break;
      case 'week':
        buckets = eachDayOfInterval(dateRange).map((d) => ({
          label: format(d, 'EEE'),
          date: format(d, 'yyyy-MM-dd'),
          start: d,
          end: d,
        }));
        break;
      case 'month':
        buckets = eachWeekOfInterval(dateRange).map((d) => ({
          label: format(d, 'MMM d'),
          date: format(d, 'yyyy-MM-dd'),
          start: startOfWeek(d),
          end: new Date(startOfWeek(d).getTime() + 6 * 86400000),
        }));
        break;
      case 'year':
      case 'heatmap':
        buckets = eachMonthOfInterval(dateRange).map((d) => ({
          label: format(d, 'MMM'),
          date: format(d, 'yyyy-MM'),
          start: d,
          end: new Date(d.getFullYear(), d.getMonth() + 1, 0),
        }));
        break;
    }

    return buckets.map((bucket) => {
      const point: ChartDataPoint = { label: bucket.label, date: bucket.date };
      const bucketStart = format(bucket.start, 'yyyy-MM-dd');
      const bucketEnd = format(bucket.end, 'yyyy-MM-dd');

      for (const config of ACTIVITY_TYPE_LIST) {
        const total = activities
          .filter((a) => a.type === config.key && a.date >= bucketStart && a.date <= bucketEnd)
          .reduce((sum, a) => sum + a.durationMinutes, 0);
        point[config.key] = Math.round(total / 6) / 10; // Convert to hours with 1 decimal
      }

      return point;
    });
  }, [activities, viewMode, dateRange]);

  const series = useMemo<ChartSeries[]>(() => {
    const typesInData = new Set(activities.map((a) => a.type));
    return ACTIVITY_TYPE_LIST
      .filter((c) => typesInData.has(c.key))
      .map((c) => ({
        type: c.key,
        label: c.label,
        color: ACTIVITY_TYPES[c.key].color,
        visible: true,
      }));
  }, [activities]);

  return { data, series };
}
