import {
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isToday,
} from '../../lib/dateUtils.ts';
import type { Activity } from '../../types/activity.ts';
import { ActivityBlock } from './ActivityBlock.tsx';

interface WeekViewProps {
  anchorDate: Date;
  activities: Activity[];
  onDayClick: (date: Date) => void;
  onActivityClick: (activity: Activity) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

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
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-700">
        <div />
        {days.map((day) => {
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="px-2 py-2 text-center cursor-pointer hover:bg-slate-700/30"
              onClick={() => onDayClick(day)}
            >
              <div className="text-xs text-slate-400">{format(day, 'EEE')}</div>
              <div className={`text-lg font-semibold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full mx-auto ${
                today ? 'bg-orange-500 text-white' : 'text-slate-200'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_repeat(7,1fr)] relative">
          {HOURS.map((hour) => (
            <div key={hour} className="contents">
              <div className="h-14 border-b border-slate-700/30 pr-2 text-right text-[10px] text-slate-500 pt-0.5">
                {hour === 0 ? '' : `${hour}:00`}
              </div>
              {days.map((day) => (
                <div key={`${hour}-${day.toISOString()}`} className="h-14 border-b border-l border-slate-700/30" />
              ))}
            </div>
          ))}

          {/* Activities overlaid */}
          {days.map((day, dayIdx) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayActivities = activityMap.get(key) ?? [];
            return dayActivities.map((activity) => {
              const startHour = activity.startTime
                ? parseInt(activity.startTime.split(':')[0], 10)
                : 8;
              const top = startHour * 56; // 56px = h-14
              const height = Math.max((activity.durationMinutes / 60) * 56, 24);

              return (
                <div
                  key={activity.id}
                  className="absolute"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `calc(60px + ${dayIdx} * ((100% - 60px) / 7) + 2px)`,
                    width: `calc((100% - 60px) / 7 - 4px)`,
                  }}
                >
                  <ActivityBlock activity={activity} onClick={onActivityClick} />
                </div>
              );
            });
          })}
        </div>
      </div>
    </div>
  );
}
