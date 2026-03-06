#!/bin/bash
# Run on the Hetzner server as root to deploy fitness-calendar.
# Assumes the repo has been cloned to /opt/fitness-calendar/
# and the frontend has been built locally (dist/ committed or rsync'd).

set -e

APP_DIR=/opt/fitness-calendar

# 1. Create data directory for SQLite
mkdir -p $APP_DIR/data
chown www-data:www-data $APP_DIR/data

# 2. Create Python venv and install dependencies
python3 -m venv $APP_DIR/venv
$APP_DIR/venv/bin/pip install -r $APP_DIR/backend/requirements.txt

# 3. Install and enable the systemd service
cp $APP_DIR/deploy/fitness-calendar.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable fitness-calendar
systemctl restart fitness-calendar

echo "Service status:"
systemctl status fitness-calendar --no-pager

echo ""
echo "Next: add the Caddyfile snippet from deploy/Caddyfile.snippet"
echo "to /etc/caddy/Caddyfile, then run: sudo systemctl reload caddy"
echo ""
echo "Also add DNS A record: fitness.norangio.dev -> 5.78.109.38 in Cloudflare"
