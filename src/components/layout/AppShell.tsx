import type { ReactNode } from 'react';
import { Header } from './Header.tsx';

interface AppShellProps {
  children: ReactNode;
  onDataCleared: () => void;
  currentUser?: string;
}

export function AppShell({ children, onDataCleared, currentUser }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col bg-slate-900 text-slate-100">
      <Header onDataCleared={onDataCleared} currentUser={currentUser} />
      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
