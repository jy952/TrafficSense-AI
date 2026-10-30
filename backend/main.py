
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(
    title="TrafficSense AI",
    description="Traffic Congestion Prediction System",
    version="1.0.0",
)

# Sample development data, not live traffic.
ROADS = [
    {
        "road_id": "R001",
        "name": "LB Nagar Ring Road",
        "area": "LB Nagar",
    },
    {
        "road_id": "R002",
        "name": "Outer Ring Road",
        "area": "Gachibowli",
    },
    {
        "road_id": "R003",
        "name": "MG Road",
        "area": "Secunderabad",
    },
]

TRAFFIC_DATA = [
    {
        "road_id": "R001",
        "vehicle_count": 850,
        "average_speed": 24.0,
        "rainfall": 0.0,
        "hour": 18,
        "day_of_week": 4,
    },
    {
        "road_id": "R002",
        "vehicle_count": 1200,
        "average_speed": 18.0,
        "rainfall": 2.0,
        "hour": 18,
        "day_of_week": 4,
    },
    {
        "road_id": "R003",
        "vehicle_count": 500,
        "average_speed": 38.0,
        "rainfall": 0.0,
        "hour": 11,
        "day_of_week": 4,
    },
]


class TrafficRecord(BaseModel):
    road_id: str
    vehicle_count: int = Field(ge=0)
    average_speed: float = Field(ge=0, le=250)
    rainfall: float = Field(ge=0)
    hour: int = Field(ge=0, le=23)
    day_of_week: int = Field(ge=0, le=6)


@app.get("/")
def home():
    return {"message": "TrafficSense AI backend is running!"}


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/roads")
def get_roads():
    return {
        "data_mode": "demo",
        "count": len(ROADS),
        "roads": ROADS,
    }


@app.get("/api/traffic/current")
def get_current_traffic():
    return {
        "data_mode": "demo",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "records": TRAFFIC_DATA,
    }


@app.get("/api/traffic/{road_id}")
def get_road_traffic(road_id: str):
    for record in TRAFFIC_DATA:
        if record["road_id"] == road_id:
            return {
                "data_mode": "demo",
                "traffic": record,
            }

    raise HTTPException(
        status_code=404,
        detail="Road not found",
    )


@app.post("/api/traffic")
def add_traffic_record(record: TrafficRecord):
    if not any(
        road["road_id"] == record.road_id
        for road in ROADS
    ):
        raise HTTPException(
            status_code=404,
            detail="Road not found",
        )

    new_record = record.model_dump()
    TRAFFIC_DATA.append(new_record)

    return {
        "message": "Traffic record added",
        "traffic": new_record,
    }
