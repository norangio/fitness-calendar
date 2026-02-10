import type { BodyLogEntry } from '../../types/bodyLog.ts';

interface BodyIndicatorProps {
  entries: BodyLogEntry[];
}

function getSeverityColor(severity: number): string {
  switch (severity) {
    case 1: return 'bg-green-500';
    case 2: return 'bg-lime-400';
    case 3: return 'bg-yellow-400';
    case 4: return 'bg-orange-500';
    case 5: return 'bg-red-500';
    default: return 'bg-gray-400';
  }
}

export function BodyIndicator({ entries }: BodyIndicatorProps) {
  if (entries.length === 0) return null;
  const maxSeverity = Math.max(...entries.map((e) => e.severity));
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${getSeverityColor(maxSeverity)}`}
      title={`Body log: severity ${maxSeverity}/5`}
    />
  );
}
