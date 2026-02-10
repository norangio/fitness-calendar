import { useRef } from 'react';
import { Moon, Sun, Upload, Download, FolderUp, Activity, Trash2, HeartPulse } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useAppStore } from '../../store/activityStore.ts';
import { db, exportBackupJSON, importBackupJSON, type BackupData } from '../../lib/storage.ts';

interface HeaderProps {
  onDataCleared: () => void;
}

export function Header({ onDataCleared }: HeaderProps) {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setImportModalOpen = useAppStore((s) => s.setImportModalOpen);
  const setBodyTrackerOpen = useAppStore((s) => s.setBodyTrackerOpen);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  const handleClear = async () => {
    if (!window.confirm('Delete all activities? This cannot be undone.')) return;
    await db.activities.clear();
    onDataCleared();
  };

  const handleExport = async () => {
    const data = await exportBackupJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data: BackupData = JSON.parse(text);
      if (!data.version || !Array.isArray(data.activities)) {
        alert('Invalid backup file.');
        return;
      }
      if (!window.confirm(`This will replace all current data with the backup (${data.activities.length} activities, ${data.bodyLogs?.length ?? 0} body logs). Continue?`)) return;
      const result = await importBackupJSON({ ...data, bodyLogs: data.bodyLogs ?? [] });
      alert(`Restore complete: ${result.activities} activities, ${result.bodyLogs} body logs.`);
      onDataCleared();
    } catch {
      alert('Failed to read backup file. Make sure it is a valid JSON backup.');
    }
    // Reset input so the same file can be selected again
    if (restoreInputRef.current) restoreInputRef.current.value = '';
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800/80 backdrop-blur px-6 py-3">
      <div className="flex items-center gap-3">
        <Activity className="text-orange-500" size={24} />
        <h1 className="text-lg font-bold text-slate-100">Fitness Calendar</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <Trash2 size={14} />
          Clear
        </Button>
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <Download size={14} />
          Export
        </Button>
        <label>
          <input ref={restoreInputRef} type="file" accept=".json" className="hidden" onChange={handleRestore} />
          <Button variant="ghost" size="sm" onClick={() => restoreInputRef.current?.click()}>
            <FolderUp size={14} />
            Restore
          </Button>
        </label>
        <Button variant="ghost" size="sm" onClick={() => setBodyTrackerOpen(true)}>
          <HeartPulse size={14} />
          Body Log
        </Button>
        <Button variant="primary" size="sm" onClick={() => setImportModalOpen(true)}>
          <Upload size={14} />
          Import
        </Button>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>
    </header>
  );
}
