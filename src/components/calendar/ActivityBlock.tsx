import { ACTIVITY_TYPES } from '../../constants/activityTypes.ts';
import type { Activity } from '../../types/activity.ts';

interface ActivityBlockProps {
  activity: Activity;
  compact?: boolean;
  onClick?: (activity: Activity) => void;
}

export function ActivityBlock({ activity, compact = false, onClick }: ActivityBlockProps) {
  const config = ACTIVITY_TYPES[activity.type];

  if (compact) {
    return (
      <div
        className="w-2 h-2 rounded-full cursor-pointer hover:scale-150 transition-transform"
        style={{ backgroundColor: config.color }}
        title={`${activity.title} (${Math.round(activity.durationMinutes)}min)`}
        onClick={() => onClick?.(activity)}
      />
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs cursor-pointer hover:brightness-110 transition-all truncate"
      style={{ backgroundColor: config.color + '20', borderLeft: `3px solid ${config.color}` }}
      onClick={() => onClick?.(activity)}
    >
      <span className="font-medium text-slate-200 truncate">{activity.title}</span>
      <span className="text-slate-400 shrink-0">{Math.round(activity.durationMinutes)}m</span>
    </div>
  );
}
