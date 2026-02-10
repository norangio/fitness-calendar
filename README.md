# Fitness Calendar

A local-first fitness activity calendar built with React and TypeScript. Import your Garmin CSV exports, visualize your training across multiple calendar views, and track body wellness over time.

## Features

- **Garmin CSV Import** — drag-and-drop your Garmin export files with automatic deduplication (re-import safely without duplicates)
- **Multiple Calendar Views** — day, week, month, year, and heatmap views with keyboard navigation
- **Activity Charts** — area charts showing activity hours over time
- **Body Wellness Tracking** — log pain/discomfort (back, knee) with severity ratings and notes
- **JSON Backup & Restore** — export all data to a JSON file and restore it anytime
- **Dark/Light Theme** — toggle between dark and light mode
- **Fully Local** — all data stored in your browser via IndexedDB, no server required

## Getting Started

You'll need [Node.js](https://nodejs.org/) installed (which includes npm, the JavaScript package manager).

```bash
npm install    # download dependencies
npm run dev    # start the app locally
```

## Importing from Garmin Connect

1. Go to [Garmin Connect](https://connect.garmin.com/) and sign in
2. Navigate to **Activities** → **All Activities**
3. In the top-right corner, click the **Export CSV** button (download icon)
4. This downloads a file called `Activities.csv`
5. In the app, click **Import** in the header
6. Drag and drop the CSV file (or click Browse to select it)
7. Preview the parsed activities and click **Import**

You can re-import the same file or updated exports as often as you like — the app automatically skips activities that already exist.

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
