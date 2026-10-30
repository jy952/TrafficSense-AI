// ILLUSTRATIVE explanation only — a hand-written heuristic, not real model attributions (e.g. SHAP).
// Replace with the response of the FastAPI /api/explain endpoint once a trained model exists.
export interface ExplainInput {
  volume: number;
  rainfall: number;
  hour: number;
  incident: boolean;
  horizon: number;
}

export interface Factor {
  factor: string;
  weight: number; // share of total, 0-1
  effect: "increases" | "decreases";
}

export const PEAK_HOURS = [8, 9, 10, 17, 18, 19];

export function explainFactors(input: ExplainInput): Factor[] {
  const raw = [
    { factor: "Traffic volume", value: Math.min(input.volume / 3000, 1) * 4, effect: "increases" as const },
    { factor: "Peak hour", value: PEAK_HOURS.includes(input.hour) ? 2.5 : 0.4, effect: PEAK_HOURS.includes(input.hour) ? ("increases" as const) : ("decreases" as const) },
    { factor: "Rainfall", value: Math.min(input.rainfall / 10, 1) * 2 + 0.1, effect: "increases" as const },
    { factor: "Road incidents", value: input.incident ? 2.2 : 0.2, effect: input.incident ? ("increases" as const) : ("decreases" as const) },
    { factor: "Forecast horizon", value: input.horizon / 60, effect: "increases" as const },
  ];
  const total = raw.reduce((a, b) => a + b.value, 0) || 1;
  return raw
    .map((r) => ({ factor: r.factor, weight: r.value / total, effect: r.effect }))
    .sort((a, b) => b.weight - a.weight);
}
