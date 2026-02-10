import { useMemo, useState } from 'react';
import { startOfYear, endOfYear, startOfWeek, eachDayOfInterval, format, getDay } from '../../lib/dateUtils.ts';
import type { Activity } from '../../types/activity.ts';

interface HeatmapViewProps {
  anchorDate: Date;
  activities: Activity[];
  onDayClick: (date: Date) => void;
}

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const EMPTY_COLOR = '#334155'; // slate-700
const INTENSITY_COLORS = [
  '#7c2d12', // orange-900
  '#c2410c', // orange-700
  '#f97316', // orange-500
  '#fb923c', // orange-400
];

function getIntensityColor(minutes: number): string {
  if (minutes === 0) return EMPTY_COLOR;
  if (minutes < 30) return INTENSITY_COLORS[0];
  if (minutes < 60) return INTENSITY_COLORS[1];
  if (minutes < 120) return INTENSITY_COLORS[2];
  return INTENSITY_COLORS[3];
}

function getIntensityLabel(minutes: number): string {
  if (minutes === 0) return 'No activity';
  if (minutes < 30) return 'Light';
  if (minutes < 60) return 'Moderate';
  if (minutes < 120) return 'Active';
  return 'Very active';
}

export function HeatmapView({ anchorDate, activities, onDayClick }: HeatmapViewProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Filter out "other" category, then build minute/count maps
  const filteredActivities = useMemo(
    () => activities.filter((a) => a.type !== 'other'),
    [activities]
  );

  const { weeks, monthLabels } = useMemo(() => {
    const yearStart = startOfYear(anchorDate);
    const yearEnd = endOfYear(anchorDate);
    const gridStart = startOfWeek(yearStart);

    // Build weeks (53 columns x 7 rows)
    const allDays = eachDayOfInterval({ start: gridStart, end: yearEnd });
    const weekCols: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = [];

    for (const day of allDays) {
      const dow = getDay(day);
      if (dow === 0 && currentWeek.length > 0) {
        weekCols.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weekCols.push(currentWeek);
    }

    // Month labels with column positions
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weekCols.forEach((week, colIdx) => {
      for (const day of week) {
        if (day && day.getFullYear() === anchorDate.getFullYear()) {
          const month = day.getMonth();
          if (month !== lastMonth) {
            lastMonth = month;
            labels.push({ label: format(day, 'MMM'), col: colIdx });
            break;
          }
        }
      }
    });

    return { weeks: weekCols, monthLabels: labels };
  }, [anchorDate]);

  const minuteData = useMemo(() => {
    const minutes = new Map<string, number>();
    const counts = new Map<string, number>();
    for (const a of filteredActivities) {
      minutes.set(a.date, (minutes.get(a.date) ?? 0) + a.durationMinutes);
      counts.set(a.date, (counts.get(a.date) ?? 0) + 1);
    }
    return { minutes, counts };
  }, [filteredActivities]);

  const cellSize = 14;
  const cellGap = 3;
  const leftPad = 36;
  const topPad = 20;

  return (
    <div className="flex-1 flex flex-col items-center justify-center overflow-auto p-6">
      <svg
        width={leftPad + weeks.length * (cellSize + cellGap) + 10}
        height={topPad + 7 * (cellSize + cellGap) + 30}
        className="select-none"
      >
        {/* Month labels */}
        {monthLabels.map(({ label, col }) => (
          <text
            key={label}
            x={leftPad + col * (cellSize + cellGap)}
            y={topPad - 6}
            fill="#94a3b8"
            fontSize={10}
          >
            {label}
          </text>
        ))}

        {/* Day labels */}
        {DAY_LABELS.map((label, i) => (
          label ? (
            <text
              key={i}
              x={leftPad - 6}
              y={topPad + i * (cellSize + cellGap) + cellSize - 2}
              fill="#64748b"
              fontSize={10}
              textAnchor="end"
            >
              {label}
            </text>
          ) : null
        ))}

        {/* Cells */}
        {weeks.map((week, colIdx) =>
          week.map((day, rowIdx) => {
            if (!day) return null;
            const key = format(day, 'yyyy-MM-dd');
            const mins = minuteData.minutes.get(key) ?? 0;
            const count = minuteData.counts.get(key) ?? 0;
            const isCurrentYear = day.getFullYear() === anchorDate.getFullYear();

            if (!isCurrentYear) return null;

            const x = leftPad + colIdx * (cellSize + cellGap);
            const y = topPad + rowIdx * (cellSize + cellGap);

            return (
              <rect
                key={key}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={getIntensityColor(mins)}
                opacity={mins === 0 ? 0.4 : 1}
                className="cursor-pointer"
                stroke="transparent"
                strokeWidth={1}
                onMouseEnter={(e) => {
                  (e.target as SVGRectElement).setAttribute('stroke', '#cbd5e1');
                  const hrs = Math.round(mins / 6) / 10;
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    text: `${format(day, 'MMM d, yyyy')} — ${hrs}h (${count} activities) — ${getIntensityLabel(mins)}`,
                  });
                }}
                onMouseLeave={(e) => {
                  (e.target as SVGRectElement).setAttribute('stroke', 'transparent');
                  setTooltip(null);
                }}
                onClick={() => onDayClick(day)}
              />
            );
          })
        )}

        {/* Legend */}
        <text x={leftPad} y={topPad + 7 * (cellSize + cellGap) + 18} fill="#64748b" fontSize={10}>
          Less
        </text>
        {[EMPTY_COLOR, ...INTENSITY_COLORS].map((color, i) => (
          <rect
            key={i}
            x={leftPad + 30 + i * (cellSize + 3)}
            y={topPad + 7 * (cellSize + cellGap) + 8}
            width={cellSize}
            height={cellSize}
            rx={2}
            fill={color}
            opacity={i === 0 ? 0.4 : 1}
          />
        ))}
        <text
          x={leftPad + 30 + 5 * (cellSize + 3) + 4}
          y={topPad + 7 * (cellSize + cellGap) + 18}
          fill="#64748b"
          fontSize={10}
        >
          More
        </text>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 rounded-lg bg-slate-800 border border-slate-600 px-3 py-1.5 text-xs text-slate-200 pointer-events-none shadow-lg"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
