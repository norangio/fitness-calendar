# Fitness Calendar

A React + TypeScript fitness activity calendar with Garmin import support, activity visualization, and body wellness tracking.

## Tech Stack
- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS** for styling (dark theme, slate/orange palette)
- **Zustand** for state management (with `persist` middleware for settings)
- **Dexie.js** (IndexedDB wrapper) for client-side storage
- **Framer Motion** for view transitions
- **Recharts** for activity charts
- **Lucide React** for icons
- **date-fns** for date manipulation (re-exported through `src/lib/dateUtils.ts`)

## Build & Dev
```bash
npm run dev      # Start dev server
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build
```

## Architecture

### Data Flow
`App.tsx` is the top-level orchestrator. It owns:
- Calendar navigation state via `useCalendarNavigation` hook
- Activity data via `useActivities(startKey, endKey)` hook
- Body log data via `useBodyLogs(startKey, endKey)` hook
- Modal state from Zustand store (`useAppStore`)

Data flows down: `App` → `CalendarView` → individual view components (`MonthView`, `WeekView`, `DayView`, `YearView`, `HeatmapView`).

### Key Directories
```
src/
├── types/           # TypeScript types (activity, calendar, bodyLog, chart)
├── lib/
│   ├── storage.ts   # Dexie DB (v2), CRUD for activities + bodyLogs
│   └── dateUtils.ts # date-fns wrappers, view-mode-aware range/nav/title
├── store/
│   └── activityStore.ts  # Zustand store (viewMode, theme, modals, lastUsedCategories)
├── hooks/
│   ├── useActivities.ts      # Fetches activities by date range
│   ├── useBodyLogs.ts        # Fetches body logs by date range
│   ├── useCalendarNavigation.ts  # Navigation state (anchor date, view mode, drill-down)
│   └── useChartData.ts       # Transforms activities into chart data points
├── constants/
│   └── activityTypes.ts      # Activity type configs (colors, labels, icons)
└── components/
    ├── calendar/    # Toolbar, CalendarView, MonthView, WeekView, DayView, YearView, HeatmapView
    ├── body/        # BodyTrackerModal, BodyIndicator
    ├── charts/      # ActivityChart (Recharts stacked bar)
    ├── import/      # ImportModal (Garmin CSV parser)
    ├── layout/      # AppShell, Header, SidePanel
    └── ui/          # Button (shared component)
```

### View Modes
`ViewMode = 'day' | 'week' | 'month' | 'year' | 'heatmap'`

- Escape key zooms out: day → week → month → year → heatmap
- Arrow keys navigate prev/next within current view
- `dateUtils.ts` handles range calculation, navigation, and title formatting per view mode
- `useChartData.ts` switch must handle all view modes (heatmap shares year's bucket logic)

### Database (Dexie v2)
- `activities` table: `'id, date, type, source, [date+type]'`
- `bodyLogs` table: `'id, date, category, [date+category]'`

### Body Tracker
- Categories: `'back' | 'knee'` (PainCategory type)
- Severity: 1-5 scale (Mild → Severe)
- Last-used categories persisted in Zustand store
- `BodyIndicator` shows colored pip (green→red) on month view day cells
- `DayView` shows full body log entries with severity and notes
- `SidePanel` shows recent body log entries for current date range

### Patterns
- All date keys use `'yyyy-MM-dd'` format
- Hooks follow pattern: fetch on mount/range change, expose add/remove/refresh
- Components are functional with TypeScript interfaces for props
- No CSS modules — all Tailwind utility classes
- Modal components render `null` when `!open`
