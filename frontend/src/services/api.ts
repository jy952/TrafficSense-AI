// API service layer. All backend calls live here.
// Base URL comes from VITE_API_BASE_URL (public, non-secret). Default: local FastAPI.
// VITE_USE_BACKEND selects which endpoints are served by FastAPI:
//   "true" / "all"  -> every endpoint
//   "predict"       -> only /api/predict (comma-separated list for more)
// Endpoints not listed stay on demo data, so pages whose API doesn't exist yet still work.
import * as mock from "@/lib/mock-data";
import { explainFactors, type ExplainInput, type Factor } from "@/lib/explain";
import {
  demoPredict,
  parsePredictResponse,
  toPredictPayload,
  type PredictForm,
  type PredictResult,
} from "@/lib/predict";

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:8000";

export interface ApiResult<T> {
  data: T;
  demo: boolean;
}

const BACKEND_ENDPOINTS = ((import.meta.env["VITE_USE_BACKEND"] as string | undefined) ?? "").trim().toLowerCase();

/** True when `endpoint` should be served by FastAPI instead of demo data. */
export function isBackendEnabled(endpoint: string): boolean {
  if (BACKEND_ENDPOINTS === "true" || BACKEND_ENDPOINTS === "all") return true;
  return BACKEND_ENDPOINTS.split(",").map((s) => s.trim()).filter(Boolean).includes(endpoint);
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = 8000): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

async function withFallback<T>(
  endpoint: string,
  path: string,
  fallback: () => T,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  if (isBackendEnabled(endpoint)) {
    // When the backend is enabled, errors surface to the UI's error state.
    return { data: await request<T>(path, init), demo: false };
  }
  await new Promise((r) => setTimeout(r, 350)); // simulate latency for loading states
  return { data: fallback(), demo: true };
}

export const api = {
  getRoads: () => withFallback("roads", "/api/roads", () => mock.roads),
  getForecast: () => withFallback("forecast", "/api/forecast", () => mock.forecast),
  getAnalytics: () =>
    withFallback("analytics", "/api/analytics", () => ({
      hourly: mock.hourly,
      daily: mock.daily,
      historical: mock.historical,
    })),
  getIncidents: () => withFallback("incidents", "/api/incidents", () => mock.incidents),
  /** Without input: generic city-wide factors. With input: factors for that prediction. Both illustrative in demo mode. */
  getExplanation: (input?: ExplainInput) =>
    input
      ? withFallback<Factor[]>("explain", "/api/explain", () => explainFactors(input), {
          method: "POST",
          body: JSON.stringify(input),
        })
      : withFallback<Factor[]>("explain", "/api/explain", () =>
          mock.xaiFactors.map((f) => ({ ...f, effect: "increases" as const })),
        ),
  getSustainability: () => withFallback("sustainability", "/api/sustainability", () => mock.emissions),

  /**
   * POST /api/predict — sends exactly the five fields the endpoint accepts:
   * vehicle_count, average_speed, rainfall, hour, active_incident (0|1).
   * `roadId` and `horizon` are not sent; they only drive the demo model.
   */
  predict: async (form: PredictForm): Promise<ApiResult<PredictResult>> => {
    if (isBackendEnabled("predict")) {
      // 30s: a sleeping free-tier backend can take a while to wake up.
      const raw = await request<unknown>(
        "/api/predict",
        { method: "POST", body: JSON.stringify(toPredictPayload(form)) },
        30000,
      );
      return { data: parsePredictResponse(raw), demo: false };
    }
    await new Promise((r) => setTimeout(r, 350));
    return { data: demoPredict(form), demo: true };
  },

  getRoutes: (origin: string, destination: string) =>
    withFallback(
      "routes",
      `/api/routes?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`,
      () => {
        const seed = (origin.length * 7 + destination.length * 3) % 10;
        return [
          { name: "Via Outer Ring Road", distance: 18.4, time: 34 + seed, score: 72 },
          { name: "Via City Center", distance: 14.2, time: 41 + seed, score: 84 },
          { name: "Via Necklace Road", distance: 16.9, time: 29 + seed, score: 38 },
        ];
      },
    ),
};
