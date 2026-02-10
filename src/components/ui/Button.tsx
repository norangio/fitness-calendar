import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Button({ variant = 'secondary', size = 'md', className = '', children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 cursor-pointer';
  const sizes = {
    sm: 'px-2.5 py-1 text-xs gap-1',
    md: 'px-3.5 py-2 text-sm gap-2',
  };
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600',
    secondary: 'bg-slate-700 text-slate-200 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600',
    ghost: 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50',
  };

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
