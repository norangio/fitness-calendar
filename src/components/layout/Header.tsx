import { useRef, useState } from 'react';
import { Moon, Sun, Upload, Download, FolderUp, Activity, Trash2, HeartPulse, CloudUpload, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useAppStore } from '../../store/activityStore.ts';
import { exportBackupJSON, importBackupJSON, type BackupData } from '../../lib/storage.ts';
import { api } from '../../lib/api.ts';
import { syncToGist } from '../../lib/gistSync.ts';

interface HeaderProps {
  onDataCleared: () => void;
  currentUser?: string;
}

export function Header({ onDataCleared, currentUser }: HeaderProps) {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const setImportModalOpen = useAppStore((s) => s.setImportModalOpen);
  const setBodyTrackerOpen = useAppStore((s) => s.setBodyTrackerOpen);
  const restoreInputRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);
  const [garminSyncing, setGarminSyncing] = useState(false);

  const handleClear = async () => {
    if (!window.confirm('Delete all activities and body logs? This cannot be undone.')) return;
    await api.activities.clear();
    await api.bodyLogs.clear();
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

  const handleGarminSync = async () => {
    setGarminSyncing(true);
    try {
      const result = await api.activities.syncGarmin();
      alert(`Garmin sync complete: ${result.added} added, ${result.skipped} skipped`);
      onDataCleared();
    } catch (e) {
      alert(`Garmin sync failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setGarminSyncing(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncToGist();
      if (result.success) {
        alert('Synced to GitHub Gist successfully.');
      } else {
        alert(`Sync failed: ${result.error}`);
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur px-3 sm:px-6 py-2 sm:py-3 dark:border-slate-700 dark:bg-slate-800/80">
      <div className="flex items-center gap-2 sm:gap-3">
        <Activity className="text-orange-500 shrink-0" size={24} />
        <h1 className="text-lg font-bold text-slate-900 hidden sm:block dark:text-slate-100">Fitness Calendar</h1>
      </div>
      <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-end">
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <Trash2 size={14} />
          <span className="hidden sm:inline">Clear</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <Download size={14} />
          <span className="hidden sm:inline">Export</span>
        </Button>
        {Boolean(currentUser) && (
          <Button variant="ghost" size="sm" onClick={handleGarminSync} disabled={garminSyncing}>
            <RefreshCw size={14} className={garminSyncing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{garminSyncing ? 'Syncing\u2026' : 'Garmin'}</span>
          </Button>
        )}
        {Boolean(currentUser) && (
          <Button variant="ghost" size="sm" onClick={handleSync} disabled={syncing}>
            <CloudUpload size={14} />
            <span className="hidden sm:inline">{syncing ? 'Syncing\u2026' : 'Sync'}</span>
          </Button>
        )}
        <label>
          <input ref={restoreInputRef} type="file" accept=".json" className="hidden" onChange={handleRestore} />
          <Button variant="ghost" size="sm" onClick={() => restoreInputRef.current?.click()}>
            <FolderUp size={14} />
            <span className="hidden sm:inline">Restore</span>
          </Button>
        </label>
        <Button variant="ghost" size="sm" onClick={() => setBodyTrackerOpen(true)}>
          <HeartPulse size={14} />
          <span className="hidden sm:inline">Body Log</span>
        </Button>
        <Button variant="primary" size="sm" onClick={() => setImportModalOpen(true)}>
          <Upload size={14} />
          <span className="hidden sm:inline">Import</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>
    </header>
  );
}
