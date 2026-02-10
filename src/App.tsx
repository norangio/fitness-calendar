import { useEffect, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell.tsx';
import { SidePanel } from './components/layout/SidePanel.tsx';
import { CalendarView } from './components/calendar/CalendarView.tsx';
import { ImportModal } from './components/import/ImportModal.tsx';
import { BodyTrackerModal } from './components/body/BodyTrackerModal.tsx';
import { useCalendarNavigation } from './hooks/useCalendarNavigation.ts';
import { useActivities } from './hooks/useActivities.ts';
import { useBodyLogs } from './hooks/useBodyLogs.ts';
import { useAppStore } from './store/activityStore.ts';
import type { Activity } from './types/activity.ts';

export default function App() {
  const { anchorDate, viewMode, title, dateRange, setViewMode, goNext, goPrev, goToday, drillDown } =
    useCalendarNavigation();
  const { activities, loading, remove, bulkAddDeduped, refresh } = useActivities(dateRange.startKey, dateRange.endKey);
  const { bodyLogs, add: addBodyLog, refresh: refreshBodyLogs } = useBodyLogs(dateRange.startKey, dateRange.endKey);
  const importModalOpen = useAppStore((s) => s.importModalOpen);
  const setImportModalOpen = useAppStore((s) => s.setImportModalOpen);
  const bodyTrackerOpen = useAppStore((s) => s.bodyTrackerOpen);
  const setBodyTrackerOpen = useAppStore((s) => s.setBodyTrackerOpen);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case 'ArrowLeft': goPrev(); break;
        case 'ArrowRight': goNext(); break;
        case 'Escape':
          if (viewMode === 'day') setViewMode('week');
          else if (viewMode === 'week') setViewMode('month');
          else if (viewMode === 'month') setViewMode('year');
          else if (viewMode === 'year') setViewMode('heatmap');
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [goPrev, goNext, viewMode, setViewMode]);

  const handleImport = useCallback(async (imported: Activity[]) => {
    return await bulkAddDeduped(imported);
  }, [bulkAddDeduped]);

  const handleDataCleared = useCallback(() => {
    refresh();
    refreshBodyLogs();
  }, [refresh, refreshBodyLogs]);

  return (
    <AppShell onDataCleared={handleDataCleared}>
      <main className="flex-1 flex flex-col min-h-0 min-w-0">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">Loading...</div>
        ) : (
          <CalendarView
            anchorDate={anchorDate}
            viewMode={viewMode}
            title={title}
            activities={activities}
            bodyLogs={bodyLogs}
            onViewModeChange={setViewMode}
            onPrev={goPrev}
            onNext={goNext}
            onToday={goToday}
            onDrillDown={drillDown}
            onDeleteActivity={remove}
          />
        )}
      </main>
      <SidePanel activities={activities} bodyLogs={bodyLogs} viewMode={viewMode} dateRange={dateRange} />
      <ImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
      <BodyTrackerModal
        open={bodyTrackerOpen}
        onClose={() => setBodyTrackerOpen(false)}
        onSave={addBodyLog}
      />
    </AppShell>
  );
}
