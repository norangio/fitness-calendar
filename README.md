# Fitness Calendar

A self-hosted fitness activity calendar with Garmin import, multiple calendar views, and body wellness tracking. Hosted at **[fitness.norangio.dev](https://fitness.norangio.dev)**.

---

## Using the App

### Logging in

Go to [fitness.norangio.dev](https://fitness.norangio.dev). Your browser will prompt for a username and password. Each person has their own login and their data is completely separate.

### Importing from Garmin Connect

1. Go to [Garmin Connect](https://connect.garmin.com/) and sign in
2. Navigate to **Activities** → **All Activities**
3. In the top-right corner, click the **Export CSV** button (download icon)
4. This downloads a file called `Activities.csv`
5. In the app, click **Import** in the header
6. Drag and drop the CSV file (or click Browse to select it)
7. Preview the parsed activities and click **Import**

You can re-import the same file or updated exports as often as you like — the app automatically skips activities that already exist, so there are no duplicates.

### Calendar Views

Use the view buttons in the toolbar to switch between:

| View | Shows |
|------|-------|
| **Day** | All activities for a single day |
| **Week** | A full week, with activities plotted by time |
| **Month** | Calendar grid — good for seeing your training pattern |
| **Year** | All 12 months at once |
| **Heatmap** | A GitHub-style heatmap of activity frequency |

**Keyboard shortcuts:**
- `←` / `→` — navigate prev/next
- `Escape` — zoom out (day → week → month → year → heatmap)

### Body Wellness Log

Click **Body Log** in the header to log pain or discomfort. Choose a body part (back, knee, ankle, or add a custom one), set severity from 1–5, and add notes. These show as colored dots on the calendar so you can spot patterns between training and how your body feels.

### Backup & Restore

- **Export** — downloads a full JSON backup of all your activities and body logs
- **Restore** — re-imports from a backup file (replaces all current data)

---

## Features

- **Garmin CSV Import** — drag-and-drop your Garmin export with automatic deduplication
- **Multiple Calendar Views** — day, week, month, year, and heatmap
- **Activity Charts** — area charts showing activity hours over time, visible on desktop
- **Body Wellness Tracking** — log pain/discomfort with severity ratings and notes
- **GitHub Gist Sync** *(nick only)* — pushes data to a private GitHub Gist for use by an email digest pipeline
- **JSON Backup & Restore** — export all data and restore it anytime
- **Dark/Light Theme** — toggle in the top-right corner
- **Multi-user** — each user's data is fully isolated on the server

---

## Tech Stack

**Frontend:** React 19, TypeScript, Vite 7, Tailwind CSS, Zustand, Recharts, Framer Motion, date-fns

**Backend:** FastAPI, SQLite (via SQLAlchemy), Uvicorn

**Hosting:** Hetzner VPS, Caddy (reverse proxy + HTTPS + basic auth), systemd

---

## Local Development

You'll need Node.js and Python 3.11+ installed.

```bash
# Terminal 1 — backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
DEV_MODE=true uvicorn main:app --host 127.0.0.1 --port 8001 --reload

# Terminal 2 — frontend (proxies /api/* to the backend)
npm install
npm run dev
```

The Vite dev proxy injects `X-Remote-User: nick` so the backend identifies you without Caddy.

---

## Deployment

Run `./deploy.sh` from the project root. Deploys use GitHub as the source of truth (no rsync from local machine).

```bash
# Push current branch to GitHub, then deploy that branch on VPS
./deploy.sh

# Deploy a specific branch
./deploy.sh main

# Skip local push (useful in CI/CD where code is already on GitHub)
SKIP_PUSH=1 ./deploy.sh main
```

`./deploy.sh` SSHes to the server and runs:

```bash
bash /opt/fitness-calendar/deploy/server-deploy.sh main
```

The server script:
- `git fetch/pull` from GitHub
- builds frontend assets with `npm ci && npm run build`
- installs backend dependencies
- restarts `fitness-calendar` systemd service

> Note: Node.js 20+ and npm must be installed on the VPS for frontend build.

### GitHub Actions Auto Deploy

`.github/workflows/deploy.yml` deploys automatically on pushes to `main` (and supports manual runs).

Required repository secrets:
- `VPS_HOST` (example: `5.78.109.38`)
- `VPS_USER` (example: `root`)
- `VPS_SSH_KEY` (private key content used by Actions)

One-time key setup:
```bash
# local machine
ssh-keygen -t ed25519 -f ~/.ssh/github-actions-hetzner -C "github-actions-deploy"

# server
cat ~/.ssh/github-actions-hetzner.pub | ssh root@5.78.109.38 'cat >> /root/.ssh/authorized_keys'
```
Then paste `~/.ssh/github-actions-hetzner` (private key) into the `VPS_SSH_KEY` secret.

```
Server:  root@5.78.109.38
App dir: /opt/fitness-calendar/
Service: systemctl status fitness-calendar
Logs:    journalctl -u fitness-calendar -f
Caddy:   /etc/caddy/Caddyfile  (see deploy/Caddyfile.snippet)
```

### Adding a new user

1. Generate a password hash on the server:
   ```
   caddy hash-password --plaintext "theirpassword"
   ```
2. Add the username and hash to the `basicauth` block in `/etc/caddy/Caddyfile`
3. `sudo systemctl reload caddy`

### Database migrations

Run scripts in `backend/migrate_*.py` manually on the server before deploying new backend code that changes the schema:

```bash
DATABASE_URL=sqlite:////opt/fitness-calendar/data/fitness.db python3 migrate_add_user_id.py
```

---

## GitHub Gist Sync

The app can push all data to a private GitHub Gist for use by external tools (e.g. an email digest pipeline). This feature is only available for the `nick` user.

To set up:

1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens) with `gist` scope
2. Create a private gist on [gist.github.com](https://gist.github.com) with one file named `fitness_data.json`
3. Add to your `.env` file:
   ```
   VITE_GITHUB_TOKEN=ghp_your_token_here
   VITE_FITNESS_GIST_ID=your_gist_hex_id
   ```
4. A **Sync** button appears in the header — click it to push your data

---

## Project Structure

```
src/
├── types/           # TypeScript types (activity, calendar, bodyLog, chart)
├── lib/
│   ├── api.ts       # API client — all fetch calls to /api/*
│   ├── storage.ts   # Backup helpers: exportBackupJSON / importBackupJSON
│   ├── gistSync.ts  # GitHub Gist sync
│   └── dateUtils.ts # date-fns wrappers, view-mode-aware range/nav/title
├── store/
│   └── activityStore.ts  # Zustand store (viewMode, theme, modals)
├── hooks/
│   ├── useActivities.ts
│   ├── useBodyLogs.ts
│   ├── useCalendarNavigation.ts
│   ├── useCurrentUser.ts
│   └── useChartData.ts
└── components/
    ├── calendar/    # Toolbar, CalendarView, MonthView, WeekView, DayView, YearView, HeatmapView
    ├── body/        # BodyTrackerModal, BodyIndicator
    ├── charts/      # ActivityChart (Recharts stacked bar)
    ├── import/      # ImportModal (Garmin CSV parser)
    ├── layout/      # AppShell, Header, SidePanel, MobileStatsBar
    └── ui/          # Button (shared component)

backend/
├── main.py          # FastAPI app — all routes
├── models.py        # SQLAlchemy models (Activity, BodyLog)
├── database.py      # DB engine + session
└── migrate_*.py     # One-time migration scripts

deploy/
├── Caddyfile.snippet          # Caddy config (basic auth + reverse proxy)
├── fitness-calendar.service   # systemd unit file
└── setup.sh                   # One-time server setup script
```
