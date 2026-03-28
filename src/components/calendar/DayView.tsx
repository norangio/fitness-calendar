import { format, isToday } from '../../lib/dateUtils.ts';
import type { Activity } from '../../types/activity.ts';
import type { BodyLogEntry } from '../../types/bodyLog.ts';
import { ACTIVITY_TYPES } from '../../constants/activityTypes.ts';

interface DayViewProps {
  anchorDate: Date;
  activities: Activity[];
  bodyLogs?: BodyLogEntry[];
  onActivityClick: (activity: Activity) => void;
}

const SEVERITY_LABELS: Record<number, string> = {
  1: 'Mild', 2: 'Slight', 3: 'Moderate', 4: 'Bad', 5: 'Severe',
};

const SEVERITY_COLORS: Record<number, string> = {
  1: 'border-green-500', 2: 'border-lime-400', 3: 'border-yellow-400',
  4: 'border-orange-500', 5: 'border-red-500',
};

export function DayView({ anchorDate, activities, bodyLogs = [], onActivityClick }: DayViewProps) {
  const dateKey = format(anchorDate, 'yyyy-MM-dd');
  const dayActivities = activities.filter((a) => a.date === dateKey);
  const dayBodyLogs = bodyLogs.filter((b) => b.date === dateKey);
  const today = isToday(anchorDate);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-bold w-12 h-12 flex items-center justify-center rounded-full ${
            today ? 'bg-orange-500 text-white' : 'text-slate-800 dark:text-slate-200'
          }`}>
            {format(anchorDate, 'd')}
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{format(anchorDate, 'EEEE')}</div>
            <div className="text-sm text-slate-400 dark:text-slate-500">{dayActivities.length} activities</div>
          </div>
        </div>
      </div>

      {dayBodyLogs.length > 0 && (
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2 dark:text-slate-400">Body Log</h3>
          <div className="space-y-2">
            {dayBodyLogs.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-lg bg-slate-100 p-3 border-l-4 dark:bg-slate-700/40 ${SEVERITY_COLORS[entry.severity]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-800 capitalize dark:text-slate-200">{entry.category} pain</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{SEVERITY_LABELS[entry.severity]} ({entry.severity}/5)</span>
                </div>
                {entry.notes && <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">{entry.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {dayActivities.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm dark:text-slate-500">
            No activities on this day
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {dayActivities.map((activity) => {
              const config = ACTIVITY_TYPES[activity.type];
              return (
                <div
                  key={activity.id}
                  className="rounded-lg p-4 cursor-pointer hover:brightness-110 transition-all"
                  style={{
                    backgroundColor: config.color + '18',
                    borderLeft: `4px solid ${config.color}`,
                  }}
                  onClick={() => onActivityClick(activity)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activity.title}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{Math.round(activity.durationMinutes)} min</span>
                  </div>
                  {(activity.calories || activity.avgHeartRate) && (
                    <div className="mt-1 flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                      {activity.calories && <span>{activity.calories} cal</span>}
                      {activity.avgHeartRate && <span>{activity.avgHeartRate} bpm avg</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
