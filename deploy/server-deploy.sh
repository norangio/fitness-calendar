#!/usr/bin/env bash
# Run on the VPS to deploy the latest fitness-calendar code from GitHub.
# Frontend (dist/) is built in CI and uploaded separately; this script handles
# backend setup and service restart only.
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

echo "→ Deploying fitness-calendar backend: $BRANCH"
cd "$APP_DIR"

echo "→ Fetching latest code from GitHub..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

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
