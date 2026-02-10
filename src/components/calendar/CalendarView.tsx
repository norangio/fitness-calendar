import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Activity } from '../../types/activity.ts';
import type { BodyLogEntry } from '../../types/bodyLog.ts';
import type { ViewMode } from '../../types/calendar.ts';
import { Toolbar } from './Toolbar.tsx';
import { MonthView } from './MonthView.tsx';
import { WeekView } from './WeekView.tsx';
import { DayView } from './DayView.tsx';
import { YearView } from './YearView.tsx';
import { HeatmapView } from './HeatmapView.tsx';
import { DetailPopover } from './DetailPopover.tsx';

interface CalendarViewProps {
  anchorDate: Date;
  viewMode: ViewMode;
  title: string;
  activities: Activity[];
  bodyLogs?: BodyLogEntry[];
  onViewModeChange: (mode: ViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onDrillDown: (date: Date, mode?: ViewMode) => void;
  onDeleteActivity: (id: string) => void;
}

export function CalendarView({
  anchorDate,
  viewMode,
  title,
  activities,
  bodyLogs = [],
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  onDrillDown,
  onDeleteActivity,
}: CalendarViewProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleDayClick = (date: Date) => {
    onDrillDown(date, 'day');
  };

  const handleMonthClick = (date: Date) => {
    onDrillDown(date, 'month');
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Toolbar
        title={title}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewMode}-${anchorDate.toISOString()}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.15 }}
          className="flex-1 flex flex-col min-h-0"
        >
          {viewMode === 'month' && (
            <MonthView
              anchorDate={anchorDate}
              activities={activities}
              bodyLogs={bodyLogs}
              onDayClick={handleDayClick}
              onActivityClick={setSelectedActivity}
            />
          )}
          {viewMode === 'week' && (
            <WeekView
              anchorDate={anchorDate}
              activities={activities}
              onDayClick={handleDayClick}
              onActivityClick={setSelectedActivity}
            />
          )}
          {viewMode === 'day' && (
            <DayView
              anchorDate={anchorDate}
              activities={activities}
              bodyLogs={bodyLogs}
              onActivityClick={setSelectedActivity}
            />
          )}
          {viewMode === 'year' && (
            <YearView
              anchorDate={anchorDate}
              activities={activities}
              onMonthClick={handleMonthClick}
            />
          )}
          {viewMode === 'heatmap' && (
            <HeatmapView
              anchorDate={anchorDate}
              activities={activities}
              onDayClick={handleDayClick}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {selectedActivity && (
        <DetailPopover
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onDelete={onDeleteActivity}
        />
      )}
    </div>
  );
}
