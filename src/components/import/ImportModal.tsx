import { useState, useCallback } from 'react';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal.tsx';
import { Button } from '../ui/Button.tsx';
import { useGarminImport } from '../../hooks/useGarminImport.ts';
import { ACTIVITY_TYPES } from '../../constants/activityTypes.ts';
import type { Activity } from '../../types/activity.ts';

interface ImportResult {
  added: number;
  skipped: number;
}

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (activities: Activity[]) => Promise<ImportResult>;
}

export function ImportModal({ open, onClose, onImport }: ImportModalProps) {
  const { parseFile, parsing, result, error, reset } = useGarminImport();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      parseFile(file);
    }
  }, [parseFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  }, [parseFile]);

  const handleImport = async () => {
    if (!result) return;
    setImporting(true);
    const dedupResult = await onImport(result.activities);
    setImportResult(dedupResult);
    setImporting(false);
  };

  const handleClose = () => {
    reset();
    setImportResult(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Import Garmin Activities">
      {importResult ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <Check className="text-green-400" size={40} />
          <p className="text-slate-200 font-medium">{importResult.added} new {importResult.added === 1 ? 'activity' : 'activities'} added</p>
          {importResult.skipped > 0 && (
            <p className="text-sm text-slate-400">{importResult.skipped} duplicate{importResult.skipped === 1 ? '' : 's'} skipped</p>
          )}
          <Button variant="primary" onClick={handleClose}>Done</Button>
        </div>
      ) : !result ? (
        <div>
          <div
            className="border-2 border-dashed border-slate-600 rounded-xl p-10 text-center hover:border-orange-500/50 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto text-slate-500 mb-3" size={32} />
            <p className="text-sm text-slate-300 mb-1">Drag & drop your Garmin CSV export here</p>
            <p className="text-xs text-slate-500 mb-4">or click to browse</p>
            <label className="inline-block">
              <input type="file" accept=".csv" className="hidden" onChange={handleFileSelect} />
              <span className="inline-flex items-center gap-2 rounded-lg bg-slate-700 text-slate-200 px-4 py-2 text-sm cursor-pointer hover:bg-slate-600">
                <FileText size={14} />
                Browse Files
              </span>
            </label>
          </div>
          {parsing && <p className="text-sm text-slate-400 mt-3 text-center">Parsing...</p>}
          {error && (
            <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <p className="text-sm text-slate-300">
              Found <span className="font-bold text-slate-100">{result.activities.length}</span> activities
              {result.skipped > 0 && <span className="text-slate-500"> ({result.skipped} skipped)</span>}
            </p>
          </div>

          {/* Preview */}
          <div className="max-h-60 overflow-y-auto rounded-lg bg-slate-900/50 border border-slate-700">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-800">
                <tr className="text-left text-slate-400">
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Duration</th>
                </tr>
              </thead>
              <tbody>
                {result.activities.slice(0, 20).map((a) => {
                  const config = ACTIVITY_TYPES[a.type];
                  return (
                    <tr key={a.id} className="border-t border-slate-700/50">
                      <td className="px-3 py-1.5">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
                          <span className="text-slate-300">{config.label}</span>
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-slate-300 max-w-[150px] truncate">{a.title}</td>
                      <td className="px-3 py-1.5 text-slate-400">{a.date}</td>
                      <td className="px-3 py-1.5 text-slate-400">{Math.round(a.durationMinutes)}m</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {result.activities.length > 20 && (
              <p className="text-xs text-slate-500 text-center py-2">
                ...and {result.activities.length - 20} more
              </p>
            )}
          </div>

          {result.errors.length > 0 && (
            <div className="mt-3 text-xs text-yellow-400">
              {result.errors.length} parsing warnings
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => { reset(); }}>Cancel</Button>
            <Button variant="primary" onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : `Import ${result.activities.length} Activities`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
