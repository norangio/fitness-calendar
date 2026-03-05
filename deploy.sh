#!/bin/bash
# Deploy fitness-calendar to production.
# Usage: ./deploy.sh
set -e

SERVER="root@5.78.109.38"
REMOTE="/opt/fitness-calendar"

echo "→ Building frontend..."
npm run build

echo "→ Syncing dist/..."
rsync -az --delete dist/ $SERVER:$REMOTE/dist/

echo "→ Syncing backend/..."
rsync -az --exclude='__pycache__' --exclude='*.pyc' --exclude='fitness.db' \
  backend/ $SERVER:$REMOTE/backend/

echo "→ Restarting service..."
ssh $SERVER "systemctl restart fitness-calendar"

echo "✓ Deployed to https://fitness.norangio.dev"
