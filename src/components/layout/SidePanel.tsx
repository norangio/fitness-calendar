import { useMemo } from 'react';
import type { Activity } from '../../types/activity.ts';
import type { ViewMode } from '../../types/calendar.ts';
import type { BodyLogEntry } from '../../types/bodyLog.ts';
import { ActivityChart } from '../charts/ActivityChart.tsx';
import { ACTIVITY_TYPES } from '../../constants/activityTypes.ts';

const SEVERITY_COLORS = ['', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];
const SEVERITY_LABELS: Record<number, string> = {
  1: 'Mild', 2: 'Slight', 3: 'Moderate', 4: 'Bad', 5: 'Severe',
};

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

  const painSummary = useMemo(() => {
    if (bodyLogs.length === 0) return null;
    const byCat: Record<string, { count: number; avgSeverity: number; maxSeverity: number }> = {};
    for (const log of bodyLogs) {
      if (!byCat[log.category]) {
        byCat[log.category] = { count: 0, avgSeverity: 0, maxSeverity: 0 };
      }
      byCat[log.category].count++;
      byCat[log.category].avgSeverity += log.severity;
      byCat[log.category].maxSeverity = Math.max(byCat[log.category].maxSeverity, log.severity);
    }
    return Object.entries(byCat).map(([cat, stats]) => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      count: stats.count,
      avg: Math.round(stats.avgSeverity / stats.count * 10) / 10,
      max: stats.maxSeverity,
    }));
  }, [bodyLogs]);

  return (
    <aside className="flex flex-col gap-4 border-l border-slate-200 bg-slate-50/80 p-5 overflow-y-auto w-80 shrink-0 dark:border-slate-700 dark:bg-slate-800/50">
      <div>
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">Summary</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-slate-200/60 p-3 dark:bg-slate-700/50">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{activities.length}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Activities</div>
          </div>
          <div className="rounded-lg bg-slate-200/60 p-3 dark:bg-slate-700/50">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalHours}h</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Time</div>
          </div>
        </div>

        {painSummary && (
          <div className="mt-3 flex flex-wrap gap-2">
            {painSummary.map((p) => (
              <span
                key={p.category}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                style={{
                  backgroundColor: SEVERITY_COLORS[Math.round(p.avg)] + '1a',
                  color: SEVERITY_COLORS[Math.round(p.avg)],
                  border: `1px solid ${SEVERITY_COLORS[Math.round(p.avg)]}33`,
                }}
                title={`${p.count} entries, avg ${p.avg}/5 (${SEVERITY_LABELS[Math.round(p.avg)]}), peak ${p.max}/5`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS[Math.round(p.avg)] }}
                />
                {p.category} · avg {p.avg}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3 dark:text-slate-400">By Type</h2>
        <div className="space-y-2">
          {uniqueTypes.map((type) => {
            const config = ACTIVITY_TYPES[type];
            const count = activities.filter((a) => a.type === type).length;
            const mins = activities.filter((a) => a.type === type).reduce((s, a) => s + a.durationMinutes, 0);
            return (
              <div key={type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.color }} />
                  <span className="text-slate-700 dark:text-slate-300">{config.label}</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400">{count} · {Math.round(mins / 6) / 10}h</span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3 dark:text-slate-400">Activity Hours</h2>
        <ActivityChart activities={activities} viewMode={viewMode} dateRange={dateRange} />
      </div>
    </aside>
  );
}
