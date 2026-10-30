
import joblib
import pandas as pd
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "traffic_model.pkl"

model = joblib.load(MODEL_PATH)

def predict_congestion(
    vehicle_count,
    average_speed,
    rainfall,
    hour,
    active_incident
):
    data = pd.DataFrame([{
        "vehicle_count": vehicle_count,
        "average_speed": average_speed,
        "rainfall": rainfall,
        "hour": hour,
        "active_incident": active_incident
    }])

    prediction = model.predict(data)[0]
    probabilities = model.predict_proba(data)[0]

    return {
        "predicted_congestion": str(prediction),
        "confidence": round(float(max(probabilities)) * 100, 2)
    }
