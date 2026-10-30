
import os
import numpy as np
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Reproducible simulated traffic data
np.random.seed(42)
n = 3000

data = pd.DataFrame({
    "vehicle_count": np.random.randint(100, 2001, n),
    "average_speed": np.random.uniform(5, 80, n),
    "rainfall": np.random.uniform(0, 20, n),
    "hour": np.random.randint(0, 24, n),
    "active_incident": np.random.randint(0, 2, n)
})

# Generate illustrative congestion labels
score = (
    data["vehicle_count"] / 2000 * 40
    + (80 - data["average_speed"]) / 80 * 30
    + data["rainfall"] / 20 * 10
    + data["active_incident"] * 20
)

data["congestion"] = pd.cut(
    score,
    bins=[-1, 35, 65, 101],
    labels=["Low", "Moderate", "High"]
)

X = data.drop(columns=["congestion"])
y = data["congestion"]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = RandomForestClassifier(
    n_estimators=150,
    random_state=42
)

model.fit(X_train, y_train)

predictions = model.predict(X_test)

print("Model training completed!")
print("Accuracy:", round(accuracy_score(y_test, predictions), 3))
print(classification_report(y_test, predictions))

# Save model
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/traffic_model.pkl")

print("Model saved to models/traffic_model.pkl")
