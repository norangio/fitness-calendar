# Fitness Calendar

A self-hosted fitness activity calendar built with React, TypeScript, and FastAPI. Import your Garmin CSV exports, visualize your training across multiple calendar views, and track body wellness over time. Data is stored server-side in SQLite so it's accessible from any device.

## Features

- **Garmin CSV Import** — drag-and-drop your Garmin export files with automatic deduplication (re-import safely without duplicates)
- **Multiple Calendar Views** — day, week, month, year, and heatmap views with keyboard navigation
- **Activity Charts** — area charts showing activity hours over time
- **Body Wellness Tracking** — log pain/discomfort (back, knee, ankle, or custom body parts) with severity ratings and notes
- **GitHub Gist Sync** — push all activity + body log data to a private GitHub Gist for use by external tools (e.g. email digest)
- **JSON Backup & Restore** — export all data to a JSON file and restore it anytime
- **Dark/Light Theme** — toggle between dark and light mode

## Getting Started (local dev)

You'll need Node.js and Python 3.11+ installed.

```bash
# Terminal 1 — backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8001 --reload

# Terminal 2 — frontend (proxies /api/* to the backend)
npm install
npm run dev
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

**Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS, Zustand, Recharts, Framer Motion, date-fns

**Backend:** FastAPI, SQLite (via SQLAlchemy), Uvicorn

**Hosting:** Hetzner, Caddy (reverse proxy + HTTPS), systemd

## Deployment

See `deploy/` for the systemd service file, Caddyfile snippet, and setup script.

1. `npm run build` locally → sync `dist/` to `/opt/fitness-calendar/dist/` on the server
2. Push `backend/` to `/opt/fitness-calendar/backend/`
3. Run `deploy/setup.sh` on the server (once, for initial setup)
4. Add the Caddyfile snippet and reload Caddy
5. Add a DNS A record pointing your subdomain to the server IP

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` / `→` | Navigate prev/next |
| `Escape` | Zoom out (day → week → month → year → heatmap) |

## GitHub Gist Sync

The app can push all data to a private GitHub Gist, enabling external tools (like an email digest pipeline) to read your fitness data. To set up:

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens) with `gist` scope
2. Create a private gist on [gist.github.com](https://gist.github.com) with one empty file named `fitness_data.json`
3. Add to your `.env` file:
   ```
   VITE_GITHUB_TOKEN=ghp_your_token_here
   VITE_FITNESS_GIST_ID=your_gist_hex_id
   ```
4. A **Sync** button will appear in the header — click it to push your data

The sync overwrites the gist with a full export each time. SQLite is the source of truth; the gist is a read-only snapshot for external consumers.

## Data & Storage

All data is stored server-side in a SQLite database, so it's the same on any device. Use the **Export** button to download a JSON backup, and **Restore** to re-import from a backup file.
