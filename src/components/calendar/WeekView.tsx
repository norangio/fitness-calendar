import {
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isToday,
} from '../../lib/dateUtils.ts';
import type { Activity } from '../../types/activity.ts';
import { ACTIVITY_TYPES } from '../../constants/activityTypes.ts';

interface WeekViewProps {
  anchorDate: Date;
  activities: Activity[];
  onDayClick: (date: Date) => void;
  onActivityClick: (activity: Activity) => void;
}

export function WeekView({ anchorDate, activities, onDayClick, onActivityClick }: WeekViewProps) {
  const weekStart = startOfWeek(anchorDate);
  const weekEnd = endOfWeek(anchorDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const activityMap = new Map<string, Activity[]>();
  for (const a of activities) {
    const list = activityMap.get(a.date) ?? [];
    list.push(a);
    activityMap.set(a.date, list);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
        {days.map((day) => {
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="px-1 py-2 text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/30"
              onClick={() => onDayClick(day)}
            >
              <div className="text-xs text-slate-500 dark:text-slate-400">{format(day, 'EEE')}</div>
              <div className={`text-lg font-semibold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full mx-auto ${
                today ? 'bg-orange-500 text-white' : 'text-slate-800 dark:text-slate-200'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity columns */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-700/50 h-full min-h-full">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayActivities = activityMap.get(key) ?? [];
            const today = isToday(day);

            return (
              <div
                key={key}
                className={`p-1 space-y-1 ${today ? 'bg-slate-50 dark:bg-slate-700/10' : ''}`}
              >
                {dayActivities.map((activity) => {
                  const config = ACTIVITY_TYPES[activity.type];
                  return (
                    <div
                      key={activity.id}
                      className="rounded px-1.5 py-1 cursor-pointer hover:brightness-110 transition-all"
                      style={{
                        backgroundColor: config.color + '20',
                        borderLeft: `3px solid ${config.color}`,
                      }}
                      onClick={() => onActivityClick(activity)}
                    >
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate leading-tight">
                        {activity.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                        {Math.round(activity.durationMinutes)}m
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
