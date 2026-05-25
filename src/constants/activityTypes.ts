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
    color: '#f59e0b',
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
    color: '#0ea5e9',
    icon: 'dumbbell',
    garminAliases: ['Strength Training', 'Strength', 'Weightlifting'],
  },
  running: {
    key: 'running',
    label: 'Running',
    color: '#f43f5e',
    icon: 'footprints',
    garminAliases: ['Running', 'Trail Running', 'Treadmill Running'],
  },
  cycling: {
    key: 'cycling',
    label: 'Cycling',
    color: '#10b981',
    icon: 'bike',
    garminAliases: ['Cycling', 'Road Cycling', 'Mountain Biking', 'Indoor Cycling'],
  },
  hiking: {
    key: 'hiking',
    label: 'Hiking',
    color: '#c2410c',
    icon: 'mountain',
    garminAliases: ['Hiking'],
  },
  walking: {
    key: 'walking',
    label: 'Walking',
    color: '#a8a29e',
    icon: 'person-standing',
    garminAliases: ['Walking'],
  },
  pool_swim: {
    key: 'pool_swim',
    label: 'Pool Swim',
    color: '#0EA5E9',
    icon: 'droplets',
    garminAliases: ['Lap Swimming', 'Pool Swimming'],
  },
  indoor_cardio: {
    key: 'indoor_cardio',
    label: 'Indoor Cardio',
    color: '#EC4899',
    icon: 'zap',
    garminAliases: ['Indoor Cardio', 'Treadmill Running', 'Indoor Cycling', 'Elliptical'],
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
