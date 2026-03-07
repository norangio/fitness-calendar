import { useMemo } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, LineChart } from 'recharts';
import type { BodyLogEntry, PainCategory } from '../../types/bodyLog.ts';
import type { ViewMode } from '../../types/calendar.ts';
import {
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  startOfWeek,
} from '../../lib/dateUtils.ts';
import { useAppStore } from '../../store/activityStore.ts';

interface BodyLogChartProps {
  bodyLogs: BodyLogEntry[];
  viewMode: ViewMode;
  dateRange: { start: Date; end: Date };
}

/** Colors for known categories + a palette for custom ones. */
const KNOWN_COLORS: Record<string, { label: string; color: string }> = {
  back: { label: 'Back', color: '#818cf8' },   // indigo-400
  knee: { label: 'Knee', color: '#c084fc' },   // purple-400
  ankle: { label: 'Ankle', color: '#34d399' }, // emerald-400
};

const FALLBACK_COLORS = ['#f472b6', '#fb923c', '#38bdf8', '#a3e635', '#fbbf24', '#e879f9'];

function getCategoryConfig(cat: string, customIndex: number): { label: string; color: string } {
  if (KNOWN_COLORS[cat]) return KNOWN_COLORS[cat];
  const color = FALLBACK_COLORS[customIndex % FALLBACK_COLORS.length];
  const label = cat.charAt(0).toUpperCase() + cat.slice(1);
  return { label, color };
}

const SEVERITY_LABELS: Record<number, string> = {
  1: 'Mild', 2: 'Slight', 3: 'Moderate', 4: 'Bad', 5: 'Severe',
};

interface BucketDef {
  label: string;
  startKey: string;
  endKey: string;
}

function buildBuckets(viewMode: ViewMode, dateRange: { start: Date; end: Date }): BucketDef[] {
  switch (viewMode) {
    case 'day':
      return [{
        label: format(dateRange.start, 'MMM d'),
        startKey: format(dateRange.start, 'yyyy-MM-dd'),
        endKey: format(dateRange.end, 'yyyy-MM-dd'),
      }];
    case 'week':
      return eachDayOfInterval(dateRange).map((d) => ({
        label: format(d, 'EEE'),
        startKey: format(d, 'yyyy-MM-dd'),
        endKey: format(d, 'yyyy-MM-dd'),
      }));
    case 'month':
      return eachWeekOfInterval(dateRange).map((d) => {
        const ws = startOfWeek(d);
        return {
          label: format(ws, 'MMM d'),
          startKey: format(ws, 'yyyy-MM-dd'),
          endKey: format(new Date(ws.getTime() + 6 * 86400000), 'yyyy-MM-dd'),
        };
      });
    case 'year':
    case 'heatmap':
      return eachMonthOfInterval(dateRange).map((d) => ({
        label: format(d, 'MMM'),
        startKey: format(d, 'yyyy-MM-dd'),
        endKey: format(new Date(d.getFullYear(), d.getMonth() + 1, 0), 'yyyy-MM-dd'),
      }));
  }
}

export function BodyLogChart({ bodyLogs, viewMode, dateRange }: BodyLogChartProps) {
  const theme = useAppStore((s) => s.theme);
  const isDark = theme === 'dark';

  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#1e293b' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0';
  const tooltipLabel = isDark ? '#94a3b8' : '#64748b';
  const labelColor = isDark ? '#64748b' : '#94a3b8';

  const categories = useMemo(() => {
    const cats = new Set(bodyLogs.map((b) => b.category));
    return [...cats] as PainCategory[];
  }, [bodyLogs]);

  const categoryConfigs = useMemo(() => {
    const configs: Record<string, { label: string; color: string }> = {};
    let customIdx = 0;
    for (const cat of categories) {
      if (KNOWN_COLORS[cat]) {
        configs[cat] = KNOWN_COLORS[cat];
      } else {
        configs[cat] = getCategoryConfig(cat, customIdx++);
      }
    }
    return configs;
  }, [categories]);

  const data = useMemo(() => {
    const buckets = buildBuckets(viewMode, dateRange);

    return buckets.map((bucket) => {
      const point: Record<string, string | number | null> = { label: bucket.label };

      for (const cat of categories) {
        const entries = bodyLogs.filter(
          (b) => b.category === cat && b.date >= bucket.startKey && b.date <= bucket.endKey
        );
        point[cat] = entries.length > 0
          ? Math.max(...entries.map((e) => e.severity))
          : null;
      }

      return point;
    });
  }, [bodyLogs, categories, viewMode, dateRange]);

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-slate-400 text-sm dark:text-slate-500">
        No body log data to chart
      </div>
    );
  }

  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: tickColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'severity', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: labelColor } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: tooltipLabel }}
            formatter={((value?: number, name?: string) => {
              if (value == null) return ['-', name ?? ''];
              const config = categoryConfigs[(name ?? '')];
              return [`${value}/5 (${SEVERITY_LABELS[value]})`, config?.label ?? name ?? ''];
            }) as never}
          />
          {categories.map((cat) => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              name={cat}
              stroke={categoryConfigs[cat].color}
              strokeWidth={2}
              dot={{ r: 3, fill: categoryConfigs[cat].color }}
              activeDot={{ r: 5, fill: categoryConfigs[cat].color }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {categories.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryConfigs[cat].color }} />
            {categoryConfigs[cat].label}
          </div>
        ))}
      </div>
    </div>
  );
}
