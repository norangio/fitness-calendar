"""
One-time migration: Add user_id column to activities and body_logs tables.
Run on the production server BEFORE deploying the new backend code.

Usage:
    DATABASE_URL=sqlite:////opt/fitness-calendar/data/fitness.db python migrate_add_user_id.py
"""
import os
import sqlite3

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./fitness.db")
db_path = DATABASE_URL.replace("sqlite:///", "")

print(f"Migrating database: {db_path}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Activities table
cursor.execute("PRAGMA table_info(activities)")
columns = [col[1] for col in cursor.fetchall()]

if "user_id" not in columns:
    print("Adding user_id column to activities table...")
    cursor.execute("ALTER TABLE activities ADD COLUMN user_id TEXT NOT NULL DEFAULT 'nick'")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_activities_user_id ON activities(user_id)")
    cursor.execute("SELECT COUNT(*) FROM activities")
    count = cursor.fetchone()[0]
    print(f"  Backfilled {count} rows with user_id='nick'")
else:
    print("activities.user_id column already exists, skipping")

# Body logs table
cursor.execute("PRAGMA table_info(body_logs)")
columns = [col[1] for col in cursor.fetchall()]

if "user_id" not in columns:
    print("Adding user_id column to body_logs table...")
    cursor.execute("ALTER TABLE body_logs ADD COLUMN user_id TEXT NOT NULL DEFAULT 'nick'")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_body_logs_user_id ON body_logs(user_id)")
    cursor.execute("SELECT COUNT(*) FROM body_logs")
    count = cursor.fetchone()[0]
    print(f"  Backfilled {count} rows with user_id='nick'")
else:
    print("body_logs.user_id column already exists, skipping")

conn.commit()
conn.close()
print("Migration complete.")
