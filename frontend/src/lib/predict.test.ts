import { describe, expect, it } from "vitest";
import { demoPredict, parsePredictResponse, toPredictPayload, type PredictForm } from "./predict";

const form: PredictForm = {
  roadId: "r1",
  horizon: 30,
  volume: 1800,
  avgSpeed: 42,
  rainfall: 2,
  incident: true,
  hour: 18,
};

describe("toPredictPayload", () => {
  it("sends exactly the five fields the API accepts", () => {
    expect(Object.keys(toPredictPayload(form)).sort()).toEqual([
      "active_incident",
      "average_speed",
      "hour",
      "rainfall",
      "vehicle_count",
    ]);
  });

  it("maps form values to the API's field names and types", () => {
    expect(toPredictPayload(form)).toEqual({
      vehicle_count: 1800,
      average_speed: 42,
      rainfall: 2,
      hour: 18,
      active_incident: 1,
    });
  });

  it("sends active_incident as 0 when no incident is ticked", () => {
    expect(toPredictPayload({ ...form, incident: false }).active_incident).toBe(0);
  });

  it("sends vehicle_count and hour as whole numbers", () => {
    const p = toPredictPayload({ ...form, volume: 1800.6, hour: 8.4 });
    expect(p.vehicle_count).toBe(1801);
    expect(p.hour).toBe(8);
  });
});

describe("parsePredictResponse", () => {
  it("reads the congestion level and confidence from the documented response", () => {
    const r = parsePredictResponse({
      status: "success",
      data_mode: "simulated_model",
      prediction: { predicted_congestion: "High", confidence: 74.0 },
    });
    expect(r).toMatchObject({ level: "high", congestionLabel: "High", confidence: 74, dataMode: "simulated_model" });
    expect(r.series).toBeUndefined();
  });

  it("normalises Low and Moderate labels", () => {
    expect(parsePredictResponse({ status: "success", prediction: { predicted_congestion: "Low", confidence: 30 } }).level).toBe("low");
    expect(parsePredictResponse({ status: "success", prediction: { predicted_congestion: "Moderate", confidence: 30 } }).level).toBe("moderate");
  });

  it("rejects a non-success status and a missing prediction object", () => {
    expect(() => parsePredictResponse({ status: "error" })).toThrow(/status/);
    expect(() => parsePredictResponse({ status: "success" })).toThrow(/prediction/);
  });
});

describe("demoPredict", () => {
  it("returns the same shape as the API, marked as demo", () => {
    const r = demoPredict(form);
    expect(r.dataMode).toBe("demo");
    expect(r.congestionLabel).toBeTruthy();
    expect(r.confidence).toBeGreaterThanOrEqual(0);
    expect(r.series).toHaveLength(5);
  });
});
