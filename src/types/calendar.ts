export type ViewMode = 'day' | 'week' | 'month' | 'year' | 'heatmap';

export interface CalendarNavigation {
  viewMode: ViewMode;
  anchorDate: Date;
  setViewMode: (mode: ViewMode) => void;
  setAnchorDate: (date: Date) => void;
  goToday: () => void;
  goNext: () => void;
  goPrev: () => void;
  getDateRange: () => { start: Date; end: Date };
  getTitle: () => string;
}
