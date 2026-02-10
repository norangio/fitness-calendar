import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { Activity } from '../../types/activity.ts';
import type { ViewMode } from '../../types/calendar.ts';
import { useChartData } from '../../hooks/useChartData.ts';

interface ActivityChartProps {
  activities: Activity[];
  viewMode: ViewMode;
  dateRange: { start: Date; end: Date };
}

export function ActivityChart({ activities, viewMode, dateRange }: ActivityChartProps) {
  const { data, series } = useChartData(activities, viewMode, dateRange);

  if (series.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
        No activity data to chart
      </div>
    );
  }

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.type} id={`gradient-${s.type}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={{ stroke: '#334155' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'hours', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#64748b' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          {series.map((s) => (
            <Area
              key={s.type}
              type="monotone"
              dataKey={s.type}
              name={s.label}
              stroke={s.color}
              fill={`url(#gradient-${s.type})`}
              strokeWidth={2}
              dot={{ r: 3, fill: s.color }}
              activeDot={{ r: 5, fill: s.color }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-2">
        {series.map((s) => (
          <div key={s.type} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}
