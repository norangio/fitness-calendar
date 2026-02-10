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

const HOURS = Array.from({ length: 24 }, (_, i) => i);

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
      <div className="px-5 py-3 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-bold w-12 h-12 flex items-center justify-center rounded-full ${
            today ? 'bg-orange-500 text-white' : 'text-slate-200'
          }`}>
            {format(anchorDate, 'd')}
          </div>
          <div>
            <div className="text-sm text-slate-400">{format(anchorDate, 'EEEE')}</div>
            <div className="text-sm text-slate-500">{dayActivities.length} activities</div>
          </div>
        </div>
      </div>

      {dayBodyLogs.length > 0 && (
        <div className="px-5 py-3 border-b border-slate-700">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Body Log</h3>
          <div className="space-y-2">
            {dayBodyLogs.map((entry) => (
              <div
                key={entry.id}
                className={`rounded-lg bg-slate-700/40 p-3 border-l-4 ${SEVERITY_COLORS[entry.severity]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200 capitalize">{entry.category} pain</span>
                  <span className="text-xs text-slate-400">{SEVERITY_LABELS[entry.severity]} ({entry.severity}/5)</span>
                </div>
                {entry.notes && <p className="text-xs text-slate-400 mt-1">{entry.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {dayActivities.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No activities on this day
          </div>
        ) : (
          <div className="grid grid-cols-[60px_1fr] relative">
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="h-14 border-b border-slate-700/30 pr-2 text-right text-[10px] text-slate-500 pt-0.5">
                  {hour === 0 ? '' : `${hour}:00`}
                </div>
                <div className="h-14 border-b border-slate-700/30" />
              </div>
            ))}

            {dayActivities.map((activity) => {
              const startHour = activity.startTime
                ? parseInt(activity.startTime.split(':')[0], 10)
                : 8;
              const top = startHour * 56;
              const height = Math.max((activity.durationMinutes / 60) * 56, 32);
              const config = ACTIVITY_TYPES[activity.type];

              return (
                <div
                  key={activity.id}
                  className="absolute left-[64px] right-4 rounded-lg p-3 cursor-pointer hover:brightness-110 transition-all"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    backgroundColor: config.color + '20',
                    borderLeft: `4px solid ${config.color}`,
                  }}
                  onClick={() => onActivityClick(activity)}
                >
                  <div className="text-sm font-medium text-slate-200">{activity.title}</div>
                  <div className="text-xs text-slate-400">
                    {Math.round(activity.durationMinutes)} min
                    {activity.calories ? ` · ${activity.calories} cal` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
