#!/usr/bin/env bash
# Run on the VPS to deploy the latest fitness-calendar code from GitHub.
# Usage: bash /opt/fitness-calendar/deploy/server-deploy.sh [branch]
set -euo pipefail

APP_DIR="/opt/fitness-calendar"
SERVICE="fitness-calendar"
BRANCH="${1:-main}"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "This script must run as root." >&2
  exit 1
fi

if [[ ! "$BRANCH" =~ ^[A-Za-z0-9._/-]+$ ]]; then
  echo "Invalid branch name: $BRANCH" >&2
  exit 1
fi

echo "→ Deploying fitness-calendar branch: $BRANCH"
cd "$APP_DIR"

echo "→ Fetching latest code from GitHub..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "→ Node.js/npm missing; installing Node.js 20..."
  apt-get update
  apt-get install -y ca-certificates curl gnupg
  install -d -m 755 /etc/apt/keyrings
  if [ ! -f /etc/apt/keyrings/nodesource.gpg ]; then
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
      | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    chmod 644 /etc/apt/keyrings/nodesource.gpg
  fi
  echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list
  apt-get update
  apt-get install -y nodejs
fi

node --version
npm --version

echo "→ Installing frontend dependencies and building..."
npm ci --no-audit --no-fund
npm run build

echo "→ Installing backend dependencies..."
python3 -m venv venv
venv/bin/pip install -q -r backend/requirements.txt

echo "→ Updating systemd service..."
cp deploy/fitness-calendar.service /etc/systemd/system/fitness-calendar.service
systemctl daemon-reload
systemctl enable "$SERVICE" >/dev/null 2>&1 || true

echo "→ Restarting service..."
systemctl restart "$SERVICE"

echo "✓ VPS deploy complete"
