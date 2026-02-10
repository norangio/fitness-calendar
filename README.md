# Fitness Calendar

A local-first fitness activity calendar built with React and TypeScript. Import your Garmin CSV exports, visualize your training across multiple calendar views, and track body wellness over time.

## Features

- **Garmin CSV Import** — drag-and-drop your Garmin export files with automatic deduplication (re-import safely without duplicates)
- **Multiple Calendar Views** — day, week, month, year, and heatmap views with keyboard navigation
- **Activity Charts** — stacked bar charts showing activity hours broken down by type
- **Body Wellness Tracking** — log pain/discomfort (back, knee) with severity ratings and notes
- **JSON Backup & Restore** — export all data to a JSON file and restore it anytime
- **Dark/Light Theme** — toggle between dark and light mode
- **Fully Local** — all data stored in your browser via IndexedDB, no server required

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- React 19, TypeScript, Vite 7
- Tailwind CSS (dark theme, slate/orange palette)
- Zustand (state management)
- Dexie.js (IndexedDB storage)
- Recharts (charts)
- Framer Motion (transitions)
- date-fns (date utilities)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Navigate prev/next |
| `Escape` | Zoom out (day → week → month → year → heatmap) |

## Data & Storage

All data lives in your browser's IndexedDB. To protect against data loss (e.g. clearing browser data), use the **Export** button in the header to download a JSON backup. Use **Restore** to re-import from a backup file.
