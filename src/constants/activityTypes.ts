import type { ActivityType } from '../types/activity.ts';

export interface ActivityTypeConfig {
  key: ActivityType;
  label: string;
  color: string;
  icon: string; // lucide icon name
  garminAliases: string[];
}

export const ACTIVITY_TYPES: Record<ActivityType, ActivityTypeConfig> = {
  basketball: {
    key: 'basketball',
    label: 'Basketball',
    color: '#F97316',
    icon: 'circle-dot',
    garminAliases: ['Basketball'],
  },
  yoga: {
    key: 'yoga',
    label: 'Yoga',
    color: '#8B5CF6',
    icon: 'flower-2',
    garminAliases: ['Yoga'],
  },
  open_water_swimming: {
    key: 'open_water_swimming',
    label: 'Open Water Swimming',
    color: '#06B6D4',
    icon: 'waves',
    garminAliases: ['Open Water Swimming', 'Open Water'],
  },
  weightlifting: {
    key: 'weightlifting',
    label: 'Weightlifting',
    color: '#EF4444',
    icon: 'dumbbell',
    garminAliases: ['Strength Training', 'Strength', 'Weightlifting'],
  },
  running: {
    key: 'running',
    label: 'Running',
    color: '#22C55E',
    icon: 'footprints',
    garminAliases: ['Running', 'Trail Running', 'Treadmill Running'],
  },
  cycling: {
    key: 'cycling',
    label: 'Cycling',
    color: '#3B82F6',
    icon: 'bike',
    garminAliases: ['Cycling', 'Road Cycling', 'Mountain Biking', 'Indoor Cycling'],
  },
  other: {
    key: 'other',
    label: 'Other',
    color: '#6B7280',
    icon: 'activity',
    garminAliases: [],
  },
};

export const ACTIVITY_TYPE_LIST = Object.values(ACTIVITY_TYPES);

export function resolveActivityType(garminType: string): ActivityType {
  const normalized = garminType.trim();
  for (const config of ACTIVITY_TYPE_LIST) {
    if (config.garminAliases.some((a) => a.toLowerCase() === normalized.toLowerCase())) {
      return config.key;
    }
  }
  return 'other';
}
