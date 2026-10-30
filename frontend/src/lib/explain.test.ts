import { describe, expect, it } from "vitest";
import { explainFactors } from "./explain";
import { levelFromScore } from "./mock-data";

describe("explainFactors", () => {
  it("weights sum to 100%", () => {
    const f = explainFactors({ volume: 1800, rainfall: 2, hour: 18, incident: false, horizon: 30 });
    expect(f.reduce((a, b) => a + b.weight, 0)).toBeCloseTo(1, 5);
  });
  it("an active incident raises the incident factor", () => {
    const base = { volume: 1800, rainfall: 2, hour: 12, horizon: 30 };
    const off = explainFactors({ ...base, incident: false }).find((x) => x.factor === "Road incidents")!;
    const on = explainFactors({ ...base, incident: true }).find((x) => x.factor === "Road incidents")!;
    expect(on.weight).toBeGreaterThan(off.weight);
  });
});

describe("levelFromScore", () => {
  it("maps thresholds", () => {
    expect(levelFromScore(34)).toBe("low");
    expect(levelFromScore(35)).toBe("moderate");
    expect(levelFromScore(60)).toBe("high");
    expect(levelFromScore(80)).toBe("severe");
  });
});
