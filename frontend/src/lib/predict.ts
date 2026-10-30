// Contract layer for the FastAPI endpoint POST /api/predict.
// Kept separate from the service layer so the request/response mapping is easy to test and swap.
import { levelFromScore, levelLabel, roads, type Level } from "@/lib/mock-data";

/** What the Congestion Prediction form holds. `roadId` and `horizon` drive the demo model only. */
export interface PredictForm {
  roadId: string;
  horizon: number;
  volume: number;
  avgSpeed: number;
  rainfall: number;
  incident: boolean;
  hour: number;
}

/** Exactly the five fields the FastAPI endpoint accepts — nothing extra. */
export interface PredictPayload {
  vehicle_count: number;
  average_speed: number;
  rainfall: number;
  hour: number;
  active_incident: 0 | 1;
}

/** Normalised result the results panel renders, whether it came from the API or the demo model. */
export interface PredictResult {
  level: Level;
  congestionLabel: string;
  confidence: number; // 0-100
  dataMode: string;
  series?: { t: string; score: number }[]; // demo model only — the API returns a single prediction
}

const LEVELS: Level[] = ["low", "moderate", "high", "severe"];

export function toPredictPayload(form: PredictForm): PredictPayload {
  return {
    vehicle_count: Math.round(form.volume),
    average_speed: form.avgSpeed,
    rainfall: form.rainfall,
    hour: Math.round(form.hour),
    active_incident: form.incident ? 1 : 0,
  };
}

/**
 * Reads the documented response:
 * { "status": "success", "data_mode": "simulated_model",
 *   "prediction": { "predicted_congestion": "High", "confidence": 74.0 } }
 */
export function parsePredictResponse(raw: unknown): PredictResult {
  if (typeof raw !== "object" || raw === null) throw new Error("Unexpected response from /api/predict");
  const body = raw as Record<string, unknown>;
  if (body["status"] !== "success") throw new Error(`Backend returned status "${String(body["status"])}"`);
  const prediction = body["prediction"] as Record<string, unknown> | undefined;
  if (!prediction) throw new Error("Response is missing the `prediction` object");

  const label = String(prediction["predicted_congestion"] ?? "").trim();
  const normalized = label.toLowerCase() as Level;
  const rawConfidence = Number(prediction["confidence"]);

  return {
    level: LEVELS.includes(normalized) ? normalized : "moderate",
    congestionLabel: label || "Unknown",
    confidence: Number.isFinite(rawConfidence) ? Math.max(0, Math.min(100, Math.round(rawConfidence))) : 0,
    dataMode: String(body["data_mode"] ?? "unknown"),
  };
}

/** Placeholder model used until the backend is enabled — same shape, clearly marked as demo. */
export function demoPredict(form: PredictForm): PredictResult {
  const road = roads.find((r) => r.id === form.roadId) ?? roads[0]!;
  const base = road.score * 0.5 + form.volume / 60 + form.rainfall * 1.2 + (form.incident ? 12 : 0);
  const peak = [8, 9, 10, 17, 18, 19].includes(form.hour) ? 10 : 0;
  const score = Math.max(5, Math.min(98, Math.round(base + peak + form.horizon / 10)));
  const level = levelFromScore(score);

  return {
    level,
    congestionLabel: levelLabel[level],
    confidence: Math.max(55, Math.min(97, Math.round(92 - (form.horizon / 60) * 15))),
    dataMode: "demo",
    series: Array.from({ length: 5 }, (_, i) => ({
      t: `+${Math.round((form.horizon / 4) * i)}m`,
      score: Math.round(road.score + ((score - road.score) * i) / 4),
    })),
  };
}
