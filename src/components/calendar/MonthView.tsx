import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
} from '../../lib/dateUtils.ts';
import type { Activity } from '../../types/activity.ts';
import type { BodyLogEntry } from '../../types/bodyLog.ts';
import { ActivityBlock } from './ActivityBlock.tsx';
import { BodyIndicator } from '../body/BodyIndicator.tsx';

interface MonthViewProps {
  anchorDate: Date;
  activities: Activity[];
  bodyLogs?: BodyLogEntry[];
  onDayClick: (date: Date) => void;
  onActivityClick: (activity: Activity) => void;
}

const WEEKDAYS_LONG = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function MonthView({ anchorDate, activities, bodyLogs = [], onDayClick, onActivityClick }: MonthViewProps) {
  const monthStart = startOfMonth(anchorDate);
  const monthEnd = endOfMonth(anchorDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const activityMap = new Map<string, Activity[]>();
  for (const a of activities) {
    const list = activityMap.get(a.date) ?? [];
    list.push(a);
    activityMap.set(a.date, list);
  }

  const bodyLogMap = new Map<string, BodyLogEntry[]>();
  for (const b of bodyLogs) {
    const list = bodyLogMap.get(b.date) ?? [];
    list.push(b);
    bodyLogMap.set(b.date, list);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
        {WEEKDAYS_LONG.map((d, i) => (
          <div key={d} className="px-1 sm:px-2 py-1 sm:py-2 text-xs font-medium text-slate-500 text-center dark:text-slate-400">
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{WEEKDAYS_SHORT[i]}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr min-h-0">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayActivities = activityMap.get(key) ?? [];
          const dayBodyLogs = bodyLogMap.get(key) ?? [];
          const inMonth = isSameMonth(day, anchorDate);
          const today = isToday(day);

          return (
            <div
              key={key}
              className={`border-b border-r border-slate-200 p-0.5 sm:p-1.5 overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors dark:border-slate-700/50 dark:hover:bg-slate-700/30 ${
                !inMonth ? 'opacity-30' : ''
              }`}
              onClick={() => onDayClick(day)}
            >
              <div className="flex items-center gap-1 mb-1">
                <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                  today ? 'bg-orange-500 text-white' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {format(day, 'd')}
                </div>
                <BodyIndicator entries={dayBodyLogs} />
              </div>
              <div className="space-y-0.5">
                {dayActivities.slice(0, 3).map((a) => (
                  <ActivityBlock key={a.id} activity={a} onClick={onActivityClick} />
                ))}
                {dayActivities.length > 3 && (
                  <div className="text-[10px] text-slate-400 pl-2 dark:text-slate-500">+{dayActivities.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
