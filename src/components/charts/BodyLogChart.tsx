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

interface BodyLogChartProps {
  bodyLogs: BodyLogEntry[];
  viewMode: ViewMode;
  dateRange: { start: Date; end: Date };
}

const CATEGORY_CONFIG: Record<PainCategory, { label: string; color: string }> = {
  back: { label: 'Back', color: '#818cf8' },   // indigo-400
  knee: { label: 'Knee', color: '#c084fc' },   // purple-400
};

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
  const categories = useMemo(() => {
    const cats = new Set(bodyLogs.map((b) => b.category));
    return [...cats] as PainCategory[];
  }, [bodyLogs]);

  const data = useMemo(() => {
    const buckets = buildBuckets(viewMode, dateRange);

    return buckets.map((bucket) => {
      const point: Record<string, string | number | null> = { label: bucket.label };

      for (const cat of categories) {
        const entries = bodyLogs.filter(
          (b) => b.category === cat && b.date >= bucket.startKey && b.date <= bucket.endKey
        );
        // Use max severity in the bucket, null if no entries (so the line has gaps)
        point[cat] = entries.length > 0
          ? Math.max(...entries.map((e) => e.severity))
          : null;
      }

      return point;
    });
  }, [bodyLogs, categories, viewMode, dateRange]);

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-slate-500 text-sm">
        No body log data to chart
      </div>
    );
  }

  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'severity', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={((value?: number, name?: string) => {
              if (value == null) return ['-', name ?? ''];
              const config = CATEGORY_CONFIG[(name ?? '') as PainCategory];
              return [`${value}/5 (${SEVERITY_LABELS[value]})`, config?.label ?? name ?? ''];
            }) as never}
          />
          {categories.map((cat) => (
            <Line
              key={cat}
              type="monotone"
              dataKey={cat}
              name={cat}
              stroke={CATEGORY_CONFIG[cat].color}
              strokeWidth={2}
              dot={{ r: 3, fill: CATEGORY_CONFIG[cat].color }}
              activeDot={{ r: 5, fill: CATEGORY_CONFIG[cat].color }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {categories.map((cat) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_CONFIG[cat].color }} />
            {CATEGORY_CONFIG[cat].label}
          </div>
        ))}
      </div>
    </div>
  );
}
