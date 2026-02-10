import type { Activity } from '../../types/activity.ts';
import type { ViewMode } from '../../types/calendar.ts';
import type { BodyLogEntry } from '../../types/bodyLog.ts';
import { ActivityChart } from '../charts/ActivityChart.tsx';
import { BodyLogChart } from '../charts/BodyLogChart.tsx';
import { ACTIVITY_TYPES } from '../../constants/activityTypes.ts';

interface SidePanelProps {
  activities: Activity[];
  bodyLogs?: BodyLogEntry[];
  viewMode: ViewMode;
  dateRange: { start: Date; end: Date };
}

export function SidePanel({ activities, bodyLogs = [], viewMode, dateRange }: SidePanelProps) {
  const totalMinutes = activities.reduce((sum, a) => sum + a.durationMinutes, 0);
  const totalHours = Math.round(totalMinutes / 6) / 10;
  const uniqueTypes = [...new Set(activities.map((a) => a.type))];

  return (
    <aside className="flex flex-col gap-4 border-l border-slate-700 bg-slate-800/50 p-5 overflow-y-auto">
      <div>
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Summary</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-700/50 p-3">
            <div className="text-2xl font-bold text-slate-100">{activities.length}</div>
            <div className="text-xs text-slate-400">Activities</div>
          </div>
          <div className="rounded-lg bg-slate-700/50 p-3">
            <div className="text-2xl font-bold text-slate-100">{totalHours}h</div>
            <div className="text-xs text-slate-400">Total Time</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">By Type</h2>
        <div className="space-y-2">
          {uniqueTypes.map((type) => {
            const config = ACTIVITY_TYPES[type];
            const count = activities.filter((a) => a.type === type).length;
            const mins = activities.filter((a) => a.type === type).reduce((s, a) => s + a.durationMinutes, 0);
            return (
              <div key={type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="text-slate-300">{config.label}</span>
                </div>
                <span className="text-slate-400">{count} · {Math.round(mins / 6) / 10}h</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Activity Hours</h2>
        <ActivityChart activities={activities} viewMode={viewMode} dateRange={dateRange} />
      </div>

      <div className="mt-4">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">Pain Severity</h2>
        <BodyLogChart bodyLogs={bodyLogs} viewMode={viewMode} dateRange={dateRange} />
      </div>
    </aside>
  );
}
