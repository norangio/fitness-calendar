import {
  eachMonthOfInterval,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
} from '../../lib/dateUtils.ts';
import type { Activity } from '../../types/activity.ts';
import { ACTIVITY_TYPES } from '../../constants/activityTypes.ts';

interface YearViewProps {
  anchorDate: Date;
  activities: Activity[];
  onMonthClick: (date: Date) => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function YearView({ anchorDate, activities, onMonthClick }: YearViewProps) {
  const yearStart = startOfYear(anchorDate);
  const yearEnd = endOfYear(anchorDate);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const activityMap = new Map<string, Activity[]>();
  for (const a of activities) {
    const list = activityMap.get(a.date) ?? [];
    list.push(a);
    activityMap.set(a.date, list);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
        {months.map((month) => {
          const mStart = startOfMonth(month);
          const mEnd = endOfMonth(month);
          const calStart = startOfWeek(mStart);
          const calEnd = endOfWeek(mEnd);
          const days = eachDayOfInterval({ start: calStart, end: calEnd });

          return (
            <div
              key={month.toISOString()}
              className="rounded-lg bg-slate-800/50 p-3 cursor-pointer hover:bg-slate-700/50 transition-colors"
              onClick={() => onMonthClick(month)}
            >
              <div className="text-sm font-semibold text-slate-300 mb-2">
                {format(month, 'MMMM')}
              </div>
              <div className="grid grid-cols-7 gap-px">
                {WEEKDAYS.map((d, i) => (
                  <div key={i} className="text-[8px] text-slate-500 text-center">{d}</div>
                ))}
                {days.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const dayActivities = activityMap.get(key) ?? [];
                  const inMonth = isSameMonth(day, month);
                  const today = isToday(day);

                  return (
                    <div
                      key={key}
                      className={`aspect-square flex items-center justify-center relative ${
                        !inMonth ? 'opacity-0' : ''
                      }`}
                    >
                      {today && (
                        <div className="absolute inset-0.5 rounded-full bg-orange-500/30" />
                      )}
                      {dayActivities.length > 0 ? (
                        <div className="flex gap-px">
                          {dayActivities.slice(0, 3).map((a) => (
                            <div
                              key={a.id}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: ACTIVITY_TYPES[a.type].color }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[9px] text-slate-600">{inMonth ? format(day, 'd') : ''}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
