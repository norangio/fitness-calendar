import type { Activity } from '../../types/activity.ts';
import { ACTIVITY_TYPES } from '../../constants/activityTypes.ts';

interface MobileStatsBarProps {
  activities: Activity[];
}

export function MobileStatsBar({ activities }: MobileStatsBarProps) {
  const totalMinutes = activities.reduce((sum, a) => sum + a.durationMinutes, 0);
  const totalHours = Math.round(totalMinutes / 6) / 10;
  const uniqueTypes = [...new Set(activities.map((a) => a.type))];

  return (
    <details className="border-b border-stone-200 bg-stone-100/50 dark:border-stone-700 dark:bg-stone-800/50">
      <summary className="flex items-center gap-3 px-4 py-2 text-xs text-stone-500 cursor-pointer select-none dark:text-stone-400">
        <span className="font-medium text-stone-800 dark:text-stone-200">{activities.length}</span> activities
        <span className="text-stone-400 dark:text-stone-600">|</span>
        <span className="font-medium text-stone-800 dark:text-stone-200">{totalHours}h</span> total
        <span className="ml-auto text-stone-400 dark:text-stone-500">Details</span>
      </summary>
      <div className="px-4 pb-3 space-y-1.5">
        {uniqueTypes.map((type) => {
          const config = ACTIVITY_TYPES[type];
          const count = activities.filter((a) => a.type === type).length;
          const mins = activities.filter((a) => a.type === type).reduce((s, a) => s + a.durationMinutes, 0);
          return (
            <div key={type} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                <span className="text-stone-700 dark:text-stone-300">{config.label}</span>
              </div>
              <span className="text-stone-500 dark:text-stone-400">{count} &middot; {Math.round(mins / 6) / 10}h</span>
            </div>
          );
        })}
      </div>
    </details>
  );
}
