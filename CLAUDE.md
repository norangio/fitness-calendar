# Fitness Calendar

A React + TypeScript fitness activity calendar with Garmin import support, activity visualization, and body wellness tracking. Hosted on a Hetzner VPS with FastAPI + SQLite backend, served via Caddy.

## Tech Stack
- **React 19** + **TypeScript** + **Vite 7**
- **Tailwind CSS** for styling (dark theme, slate/orange palette)
- **Zustand** for state management (with `persist` middleware for settings)
- **Framer Motion** for view transitions
- **Recharts** for activity charts
- **Lucide React** for icons
- **date-fns** for date manipulation (re-exported through `src/lib/dateUtils.ts`)

## Build & Dev
```bash
# Terminal 1 — backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload

# Terminal 2 — frontend (proxies /api/* to backend)
npm run dev      # Start dev server (Vite proxies /api/* → localhost:8001)
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
│   ├── api.ts       # API client — all fetch calls to /api/* (no auth headers, Caddy handles it)
│   ├── storage.ts   # Backup helpers: exportBackupJSON / importBackupJSON (thin wrappers over api.ts)
│   ├── gistSync.ts  # GitHub Gist sync (fetches /api/export, PATCHes gist)
│   └── dateUtils.ts # date-fns wrappers, view-mode-aware range/nav/title
├── store/
│   └── activityStore.ts  # Zustand store (viewMode, theme, modals, lastUsedCategories)
├── hooks/
│   ├── useActivities.ts      # Fetches activities by date range via api.ts
│   ├── useBodyLogs.ts        # Fetches body logs by date range via api.ts
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

### Backend (FastAPI + SQLite)
- Lives in `backend/` — run from that dir with `uvicorn main:app --host 127.0.0.1 --port 8001`
- SQLite database path controlled by `DATABASE_URL` env var (default: `sqlite:///./fitness.db`)
- In production: `DATABASE_URL=sqlite:////opt/fitness-calendar/data/fitness.db`
- `STATIC_DIR` env var points FastAPI at the built `dist/` folder for SPA serving
- All data is server-side; no browser local storage dependency
- SPA fallback: wildcard route checks if the path is a real file first, falls back to `index.html`
- API routes:
  - `GET/POST/DELETE /api/activities`
  - `POST /api/activities/bulk-import` (dedup by date|type|duration|startTime fingerprint)
  - `GET/POST/DELETE /api/body-logs`
  - `GET /api/export` — full JSON backup
  - `POST /api/import` — restore from backup

### Body Tracker
- Categories: `'back' | 'knee' | 'ankle' | (string & {})` (PainCategory type — extensible with custom entries)
- Preset categories defined in `PRESET_CATEGORIES` array in `src/types/bodyLog.ts`
- Users can add custom body parts via text input in BodyTrackerModal
- Severity: 1-5 scale (Mild → Severe)
- Last-used categories persisted in Zustand store
- `BodyIndicator` shows colored pip (green→red) on month view day cells
- `DayView` shows full body log entries with severity and notes
- `SidePanel` shows recent body log entries for current date range
- `BodyLogChart` uses dynamic color assignment for custom categories (known colors for back/knee/ankle, fallback palette for custom)

### GitHub Gist Sync
- `src/lib/gistSync.ts` — exports `isGistSyncConfigured()` and `syncToGist()`
- Fetches full export from `GET /api/export`, then PATCHes it to a private GitHub Gist as `fitness_data.json`
- Env vars: `VITE_GITHUB_TOKEN` (PAT with gist scope), `VITE_FITNESS_GIST_ID` (hex gist ID)
- Sync button in Header.tsx only visible when env vars are configured
- Full overwrite each sync — SQLite is source of truth, gist is read-only snapshot
- Used by the email-reports pipeline to generate weekly fitness digest insights

### Deployment
Run `./deploy.sh` from the project root. It pushes your branch to GitHub (unless `SKIP_PUSH=1`) then SSHes to the VPS and runs `deploy/server-deploy.sh`, which pulls from GitHub and deploys.

```
App dir: /opt/fitness-calendar/
Service: systemctl status fitness-calendar
Logs:    journalctl -u fitness-calendar -f
```

<!-- TODO: Set up GitHub Actions to auto-deploy on push to main (SSH + deploy/server-deploy.sh main) -->

### Patterns
- All date keys use `'yyyy-MM-dd'` format
- Hooks follow pattern: fetch on mount/range change, expose add/remove/refresh
- API calls in `src/lib/api.ts` — no auth headers needed (Caddy handles basic auth in prod)
- Components are functional with TypeScript interfaces for props
- No CSS modules — all Tailwind utility classes
- Modal components render `null` when `!open`

## Known Bugs

### Light/dark mode toggle not working in production
- **Status**: Open
- **Symptom**: Clicking the Sun/Moon toggle button in the header does nothing visually on the deployed server. Works correctly in local dev.
- **What's been tried**: Tailwind v4 `@custom-variant dark` configured, `classList.toggle` wired in both `useEffect` (App.tsx) and directly in `toggleTheme` action (activityStore.ts), store-level initialization applied before React mounts. CSS `dark:` variants compile correctly, JS bundle contains the right code, files checksums match local and server. Root cause unknown.
- **Files involved**: `src/store/activityStore.ts`, `src/App.tsx`, `src/index.css`
