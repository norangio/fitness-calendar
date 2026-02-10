import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import type { ViewMode } from '../../types/calendar.ts';

interface ToolbarProps {
  title: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
  { value: 'heatmap', label: 'Heatmap' },
];

export function Toolbar({ title, viewMode, onViewModeChange, onPrev, onNext, onToday }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700 px-5 py-3">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onPrev}><ChevronLeft size={16} /></Button>
        <Button variant="ghost" size="sm" onClick={onToday}>Today</Button>
        <Button variant="ghost" size="sm" onClick={onNext}><ChevronRight size={16} /></Button>
        <h2 className="ml-2 text-lg font-semibold text-slate-100">{title}</h2>
      </div>
      <div className="flex rounded-lg bg-slate-700/50 p-0.5">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onViewModeChange(mode.value)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              viewMode === mode.value
                ? 'bg-orange-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
