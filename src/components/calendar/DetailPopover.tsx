import { X, Clock, Flame, Heart, MapPin, Trash2 } from 'lucide-react';
import type { Activity } from '../../types/activity.ts';
import { ACTIVITY_TYPES } from '../../constants/activityTypes.ts';
import { Button } from '../ui/Button.tsx';

interface DetailPopoverProps {
  activity: Activity;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function DetailPopover({ activity, onClose, onDelete }: DetailPopoverProps) {
  const config = ACTIVITY_TYPES[activity.type];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative z-10 w-80 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
            <span className="text-xs font-medium text-slate-400">{config.label}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <h3 className="text-lg font-semibold text-slate-100 mb-1">{activity.title}</h3>
        <p className="text-sm text-slate-400 mb-4">{activity.date}{activity.startTime ? ` at ${activity.startTime}` : ''}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Clock size={14} className="text-slate-500" />
            <span>{Math.round(activity.durationMinutes)} min</span>
          </div>
          {activity.calories != null && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Flame size={14} className="text-slate-500" />
              <span>{activity.calories} cal</span>
            </div>
          )}
          {activity.avgHeartRate != null && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Heart size={14} className="text-slate-500" />
              <span>{activity.avgHeartRate} bpm avg</span>
            </div>
          )}
          {activity.distanceKm != null && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin size={14} className="text-slate-500" />
              <span>{activity.distanceKm.toFixed(1)} km</span>
            </div>
          )}
        </div>

        {activity.notes && (
          <p className="text-sm text-slate-400 mb-4 border-t border-slate-700 pt-3">{activity.notes}</p>
        )}

        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => { onDelete(activity.id); onClose(); }}>
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
