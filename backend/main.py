import json
import os
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import and_
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import Activity, BodyLog

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fitness Calendar API", docs_url=None, redoc_url=None)

# ── Auth ─────────────────────────────────────────────────────────────────────

DEV_MODE = os.environ.get("DEV_MODE", "false").lower() == "true"
DEV_USER = os.environ.get("DEV_USER", "nick")


def get_current_user(request: Request) -> str:
    """Extract authenticated user from Caddy's X-Remote-User header."""
    user = request.headers.get("X-Remote-User")
    if not user:
        if DEV_MODE:
            return DEV_USER
        raise HTTPException(status_code=401, detail="Missing X-Remote-User header")
    return user


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class ActivityIn(BaseModel):
    id: str
    type: str
    title: str
    date: str
    startTime: Optional[str] = None
    durationMinutes: float
    distanceKm: Optional[float] = None
    calories: Optional[float] = None
    avgHeartRate: Optional[float] = None
    maxHeartRate: Optional[float] = None
    notes: Optional[str] = None
    source: str = "manual"
    garminRawFields: Optional[dict] = None


class BulkImportIn(BaseModel):
    activities: list[ActivityIn]


class BulkImportResult(BaseModel):
    added: int
    skipped: int


class BodyLogIn(BaseModel):
    id: str
    date: str
    category: str
    severity: int
    notes: Optional[str] = None
    createdAt: str


class BackupData(BaseModel):
    version: int
    exportedAt: str
    activities: list[dict]
    bodyLogs: list[dict]


# ── Helpers ───────────────────────────────────────────────────────────────────

def _activity_fingerprint(a: dict) -> str:
    return f"{a['date']}|{a['type']}|{a['durationMinutes']}|{a.get('startTime') or ''}"


def _activity_to_orm(a: ActivityIn) -> Activity:
    return Activity(
        id=a.id,
        type=a.type,
        title=a.title,
        date=a.date,
        start_time=a.startTime,
        duration_minutes=a.durationMinutes,
        distance_km=a.distanceKm,
        calories=a.calories,
        avg_heart_rate=a.avgHeartRate,
        max_heart_rate=a.maxHeartRate,
        notes=a.notes,
        source=a.source,
        garmin_raw_fields=json.dumps(a.garminRawFields) if a.garminRawFields else None,
    )


def _body_log_to_orm(b: BodyLogIn) -> BodyLog:
    return BodyLog(
        id=b.id,
        date=b.date,
        category=b.category,
        severity=b.severity,
        notes=b.notes,
        created_at=b.createdAt,
    )


# ── User info route ───────────────────────────────────────────────────────────

@app.get("/api/me")
def get_me(user: str = Depends(get_current_user)):
    return {"username": user}


# ── Activity routes ───────────────────────────────────────────────────────────

@app.get("/api/activities")
def get_activities(
    from_date: str = Query(..., alias="from"),
    to_date: str = Query(..., alias="to"),
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    rows = (
        db.query(Activity)
        .filter(and_(Activity.user_id == user, Activity.date >= from_date, Activity.date <= to_date))
        .all()
    )
    return [r.to_dict() for r in rows]


@app.post("/api/activities", status_code=201)
def create_activity(activity: ActivityIn, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    orm = _activity_to_orm(activity)
    orm.user_id = user
    db.merge(orm)  # upsert by primary key
    db.commit()
    return activity.model_dump()


@app.post("/api/activities/bulk-import")
def bulk_import(payload: BulkImportIn, db: Session = Depends(get_db), user: str = Depends(get_current_user)) -> BulkImportResult:
    if not payload.activities:
        return BulkImportResult(added=0, skipped=0)

    dates = list({a.date for a in payload.activities})
    min_date = min(dates)
    max_date = max(dates)

    existing = (
        db.query(Activity)
        .filter(and_(Activity.user_id == user, Activity.date >= min_date, Activity.date <= max_date))
        .all()
    )
    existing_fps = {_activity_fingerprint(e.to_dict()) for e in existing}

    added = 0
    skipped = 0
    for a in payload.activities:
        fp = _activity_fingerprint(a.model_dump())
        if fp in existing_fps:
            skipped += 1
        else:
            orm = _activity_to_orm(a)
            orm.user_id = user
            db.add(orm)
            existing_fps.add(fp)
            added += 1

    db.commit()
    return BulkImportResult(added=added, skipped=skipped)


@app.delete("/api/activities/{activity_id}", status_code=204)
def delete_activity(activity_id: str, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    row = db.query(Activity).filter(and_(Activity.id == activity_id, Activity.user_id == user)).first()
    if not row:
        raise HTTPException(status_code=404, detail="Activity not found")
    db.delete(row)
    db.commit()


@app.delete("/api/activities", status_code=204)
def clear_activities(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    db.query(Activity).filter(Activity.user_id == user).delete()
    db.commit()


# ── Body log routes ───────────────────────────────────────────────────────────

@app.get("/api/body-logs")
def get_body_logs(
    from_date: str = Query(..., alias="from"),
    to_date: str = Query(..., alias="to"),
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
):
    rows = (
        db.query(BodyLog)
        .filter(and_(BodyLog.user_id == user, BodyLog.date >= from_date, BodyLog.date <= to_date))
        .all()
    )
    return [r.to_dict() for r in rows]


@app.post("/api/body-logs", status_code=201)
def create_body_log(entry: BodyLogIn, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    orm = _body_log_to_orm(entry)
    orm.user_id = user
    db.merge(orm)
    db.commit()
    return entry.model_dump()


@app.delete("/api/body-logs/{log_id}", status_code=204)
def delete_body_log(log_id: str, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    row = db.query(BodyLog).filter(and_(BodyLog.id == log_id, BodyLog.user_id == user)).first()
    if not row:
        raise HTTPException(status_code=404, detail="Body log not found")
    db.delete(row)
    db.commit()


@app.delete("/api/body-logs", status_code=204)
def clear_body_logs(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    db.query(BodyLog).filter(BodyLog.user_id == user).delete()
    db.commit()


# ── Backup / Restore ──────────────────────────────────────────────────────────

@app.get("/api/export")
def export_backup(db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    from datetime import datetime, timezone
    activities = [a.to_dict() for a in db.query(Activity).filter(Activity.user_id == user).all()]
    body_logs = [b.to_dict() for b in db.query(BodyLog).filter(BodyLog.user_id == user).all()]
    return {
        "version": 1,
        "exportedAt": datetime.now(timezone.utc).isoformat(),
        "activities": activities,
        "bodyLogs": body_logs,
    }


@app.post("/api/import")
def import_backup(data: BackupData, db: Session = Depends(get_db), user: str = Depends(get_current_user)):
    db.query(Activity).filter(Activity.user_id == user).delete()
    db.query(BodyLog).filter(BodyLog.user_id == user).delete()

    for a in data.activities:
        db.merge(Activity(
            id=a["id"],
            user_id=user,
            type=a["type"],
            title=a["title"],
            date=a["date"],
            start_time=a.get("startTime"),
            duration_minutes=a["durationMinutes"],
            distance_km=a.get("distanceKm"),
            calories=a.get("calories"),
            avg_heart_rate=a.get("avgHeartRate"),
            max_heart_rate=a.get("maxHeartRate"),
            notes=a.get("notes"),
            source=a.get("source", "manual"),
            garmin_raw_fields=json.dumps(a["garminRawFields"]) if a.get("garminRawFields") else None,
        ))

    for b in data.bodyLogs:
        db.merge(BodyLog(
            id=b["id"],
            user_id=user,
            date=b["date"],
            category=b["category"],
            severity=b["severity"],
            notes=b.get("notes"),
            created_at=b["createdAt"],
        ))

    db.commit()
    return {"activities": len(data.activities), "bodyLogs": len(data.bodyLogs)}


# ── Garmin sync ───────────────────────────────────────────────────────────────

GARMIN_SPORT_MAP: dict[str, str] = {
    'strength_training': 'weightlifting',
    'yoga': 'yoga',
    'open_water_swimming': 'open_water_swimming',
    'walking': 'walking',
    'basketball': 'basketball',
    'running': 'running',
    'indoor_cardio': 'indoor_cardio',
    'treadmill_running': 'indoor_cardio',
    'indoor_running': 'indoor_cardio',
    'hiking': 'hiking',
    'cycling': 'cycling',
    'indoor_cycling': 'indoor_cardio',
    'lap_swimming': 'pool_swim',
}


@app.post("/api/sync/garmin")
def sync_from_garmin(
    days: int = Query(default=90),
    db: Session = Depends(get_db),
    user: str = Depends(get_current_user),
) -> BulkImportResult:
    import urllib.request
    from datetime import date, timedelta

    garmin_url = os.environ.get("GARMIN_BOT_API_URL", "http://localhost:8091")
    api_key = os.environ.get("GARMIN_BOT_API_KEY", "")
    if not api_key:
        raise HTTPException(status_code=503, detail="Garmin sync not configured (missing GARMIN_BOT_API_KEY)")

    to_date = date.today().isoformat()
    from_date = (date.today() - timedelta(days=days)).isoformat()

    url = f"{garmin_url}/api/activities?from={from_date}&to={to_date}"
    req = urllib.request.Request(url, headers={"X-API-Key": api_key})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            garmin_activities = json.loads(resp.read())
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Garmin API error: {e}")

    activities_to_import: list[ActivityIn] = []
    for g in garmin_activities:
        if str(g.get("id", "")).startswith("cal-"):
            continue
        fc_type = GARMIN_SPORT_MAP.get(g.get("sport", ""), "other")
        raw_title = g.get("title") or ""
        title = raw_title if raw_title else fc_type.replace("_", " ").title()
        activities_to_import.append(ActivityIn(
            id=f"garmin-{g['id']}",
            type=fc_type,
            title=title,
            date=g["date"],
            durationMinutes=round(float(g.get("duration_mins") or 0), 1),
            distanceKm=g.get("distance_km"),
            calories=g.get("calories"),
            avgHeartRate=g.get("avg_hr"),
            maxHeartRate=g.get("max_hr"),
            source="garmin",
        ))

    if not activities_to_import:
        return BulkImportResult(added=0, skipped=0)

    dates = list({a.date for a in activities_to_import})
    existing = (
        db.query(Activity)
        .filter(and_(Activity.user_id == user, Activity.date >= min(dates), Activity.date <= max(dates)))
        .all()
    )
    existing_fps = {_activity_fingerprint(e.to_dict()) for e in existing}

    added = 0
    skipped = 0
    for a in activities_to_import:
        fp = _activity_fingerprint(a.model_dump())
        if fp in existing_fps:
            skipped += 1
        else:
            orm = _activity_to_orm(a)
            orm.user_id = user
            db.add(orm)
            existing_fps.add(fp)
            added += 1

    db.commit()
    return BulkImportResult(added=added, skipped=skipped)


# ── Serve frontend static files (production) ──────────────────────────────────
# Must be mounted LAST so API routes take priority.

STATIC_DIR = os.environ.get("STATIC_DIR", "../dist")

if os.path.isdir(STATIC_DIR):
    # Serve real files (JS, CSS, images) or fall back to index.html for SPA routes.
    # The wildcard catches everything not matched by /api/* routes above.
    @app.get("/{full_path:path}")
    def spa_fallback(full_path: str):
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
