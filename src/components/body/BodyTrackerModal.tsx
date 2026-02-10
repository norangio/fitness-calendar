import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button.tsx';
import { useAppStore } from '../../store/activityStore.ts';
import type { PainCategory, BodyLogEntry } from '../../types/bodyLog.ts';
import { format } from '../../lib/dateUtils.ts';

interface BodyTrackerModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: BodyLogEntry) => void;
}

const CATEGORIES: { value: PainCategory; label: string }[] = [
  { value: 'back', label: 'Back' },
  { value: 'knee', label: 'Knee' },
];

const SEVERITY_LABELS: Record<number, string> = {
  1: 'Mild',
  2: 'Slight',
  3: 'Moderate',
  4: 'Bad',
  5: 'Severe',
};

const SEVERITY_COLORS: Record<number, string> = {
  1: 'bg-green-500 hover:bg-green-600',
  2: 'bg-lime-500 hover:bg-lime-600',
  3: 'bg-yellow-500 hover:bg-yellow-600',
  4: 'bg-orange-500 hover:bg-orange-600',
  5: 'bg-red-500 hover:bg-red-600',
};

export function BodyTrackerModal({ open, onClose, onSave }: BodyTrackerModalProps) {
  const lastUsedCategories = useAppStore((s) => s.lastUsedCategories);
  const setLastUsedCategories = useAppStore((s) => s.setLastUsedCategories);

  const [selectedCategories, setSelectedCategories] = useState<PainCategory[]>([]);
  const [severity, setSeverity] = useState(3);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Pre-select last used categories when modal opens
  useEffect(() => {
    if (open) {
      setSelectedCategories(lastUsedCategories.length > 0 ? [...lastUsedCategories] : []);
      setSeverity(3);
      setNotes('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
    }
  }, [open, lastUsedCategories]);

  if (!open) return null;

  const toggleCategory = (cat: PainCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSave = () => {
    if (selectedCategories.length === 0) return;
    const now = new Date().toISOString();
    for (const category of selectedCategories) {
      onSave({
        id: crypto.randomUUID(),
        date,
        category,
        severity,
        notes: notes.trim() || undefined,
        createdAt: now,
      });
    }
    setLastUsedCategories(selectedCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-100">Body Log</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Categories */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-2">Category</label>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  selectedCategories.includes(cat.value)
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Severity */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Severity: {SEVERITY_LABELS[severity]}
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setSeverity(level)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  severity === level
                    ? `${SEVERITY_COLORS[level]} text-white ring-2 ring-white/30`
                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-400 mb-1">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How does it feel?"
            rows={3}
            className="w-full rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-orange-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={selectedCategories.length === 0}
          >
            Log
          </Button>
        </div>
      </div>
    </div>
  );
}
