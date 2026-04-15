import json
from sqlalchemy import Column, String, Float, Integer, Text
from database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True, default="local-user")
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    date = Column(String, nullable=False, index=True)
    start_time = Column(String, nullable=True)
    duration_minutes = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=True)
    calories = Column(Float, nullable=True)
    avg_heart_rate = Column(Float, nullable=True)
    max_heart_rate = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    source = Column(String, nullable=False, default="manual")
    garmin_raw_fields = Column(Text, nullable=True)  # JSON string

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.type,
            "title": self.title,
            "date": self.date,
            "startTime": self.start_time,
            "durationMinutes": self.duration_minutes,
            "distanceKm": self.distance_km,
            "calories": self.calories,
            "avgHeartRate": self.avg_heart_rate,
            "maxHeartRate": self.max_heart_rate,
            "notes": self.notes,
            "source": self.source,
            "garminRawFields": json.loads(self.garmin_raw_fields) if self.garmin_raw_fields else None,
        }


class BodyLog(Base):
    __tablename__ = "body_logs"

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True, default="local-user")
    date = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)
    severity = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(String, nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "date": self.date,
            "category": self.category,
            "severity": self.severity,
            "notes": self.notes,
            "createdAt": self.created_at,
        }
