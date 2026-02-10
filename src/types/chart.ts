import type { ActivityType } from './activity.ts';

export interface ChartDataPoint {
  label: string;
  date: string;
  [key: string]: number | string; // activity type keys map to duration minutes
}

export interface ChartSeries {
  type: ActivityType;
  label: string;
  color: string;
  visible: boolean;
}
