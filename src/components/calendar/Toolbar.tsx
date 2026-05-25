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

const VIEW_MODES: { value: ViewMode; label: string; shortLabel: string }[] = [
  { value: 'day', label: 'Day', shortLabel: 'D' },
  { value: 'week', label: 'Week', shortLabel: 'W' },
  { value: 'month', label: 'Month', shortLabel: 'M' },
  { value: 'year', label: 'Year', shortLabel: 'Y' },
  { value: 'heatmap', label: 'Heatmap', shortLabel: 'H' },
];

export function Toolbar({ title, viewMode, onViewModeChange, onPrev, onNext, onToday }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-stone-200 px-3 sm:px-5 py-2 sm:py-3 dark:border-stone-700">
      <div className="flex items-center gap-1 sm:gap-2">
        <Button variant="ghost" size="sm" onClick={onPrev}><ChevronLeft size={16} /></Button>
        <Button variant="ghost" size="sm" onClick={onToday}>Today</Button>
        <Button variant="ghost" size="sm" onClick={onNext}><ChevronRight size={16} /></Button>
        <h2 className="ml-1 sm:ml-2 text-sm sm:text-lg font-semibold text-stone-900 dark:text-stone-100">{title}</h2>
      </div>
      <div className="flex rounded-lg bg-stone-100 p-0.5 dark:bg-stone-700/50">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.value}
            onClick={() => onViewModeChange(mode.value)}
            className={`rounded-md px-2 sm:px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              viewMode === mode.value
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <span className="hidden sm:inline">{mode.label}</span>
            <span className="sm:hidden">{mode.shortLabel}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
