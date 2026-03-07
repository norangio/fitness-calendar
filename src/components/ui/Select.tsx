import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({ options, className = '', ...props }: SelectProps) {
  return (
    <select
      className={`rounded-lg bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
