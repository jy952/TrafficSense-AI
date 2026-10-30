// DEMO DATA — illustrative values only. Replace with responses from the FastAPI backend.
export type Level = "low" | "moderate" | "high" | "severe";

export interface Road {
  id: string;
  name: string;
  score: number; // 0-100
  speed: number; // km/h
  freeFlowSpeed: number; // km/h
  lengthKm: number;
  lanes: number;
  coords: [number, number][];
}

export const levelFromScore = (s: number): Level =>
  s < 35 ? "low" : s < 60 ? "moderate" : s < 80 ? "high" : "severe";

export const levelLabel: Record<Level, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  severe: "Severe",
};

export const MAP_CENTER: [number, number] = [17.385, 78.4867];

export const roads: Road[] = [
  { id: "r1", name: "Outer Ring Road (Gachibowli)", score: 82, speed: 18, freeFlowSpeed: 60, lengthKm: 6.2, lanes: 8, coords: [[17.44, 78.35], [17.42, 78.37], [17.40, 78.38]] },
  { id: "r2", name: "Necklace Road", score: 41, speed: 36, freeFlowSpeed: 50, lengthKm: 3.1, lanes: 4, coords: [[17.41, 78.465], [17.42, 78.475], [17.425, 78.48]] },
  { id: "r3", name: "Mehdipatnam Flyover", score: 67, speed: 24, freeFlowSpeed: 55, lengthKm: 2.8, lanes: 4, coords: [[17.395, 78.43], [17.39, 78.44], [17.385, 78.455]] },
  { id: "r4", name: "Hitech City Main Road", score: 74, speed: 21, freeFlowSpeed: 50, lengthKm: 3.4, lanes: 6, coords: [[17.45, 78.38], [17.445, 78.39], [17.44, 78.40]] },
  { id: "r5", name: "Begumpet Road", score: 29, speed: 44, freeFlowSpeed: 50, lengthKm: 3.6, lanes: 4, coords: [[17.44, 78.46], [17.443, 78.475], [17.445, 78.49]] },
  { id: "r6", name: "MG Road (Secunderabad)", score: 55, speed: 30, freeFlowSpeed: 45, lengthKm: 2.5, lanes: 4, coords: [[17.435, 78.495], [17.44, 78.5], [17.445, 78.51]] },
  { id: "r7", name: "LB Nagar Ring Road", score: 88, speed: 12, freeFlowSpeed: 60, lengthKm: 3.0, lanes: 6, coords: [[17.35, 78.54], [17.345, 78.55], [17.34, 78.56]] },
];

export const forecast = [
  { t: "Now", actual: 62, predicted: 62 },
  { t: "+15m", predicted: 68 },
  { t: "+30m", predicted: 74 },
  { t: "+45m", predicted: 77 },
  { t: "+60m", predicted: 71 },
  { t: "+90m", predicted: 58 },
  { t: "+120m", predicted: 46 },
];

export const hourly = Array.from({ length: 24 }, (_, h) => {
  const peak = Math.exp(-((h - 9) ** 2) / 4) * 55 + Math.exp(-((h - 18.5) ** 2) / 5) * 65;
  return { hour: `${String(h).padStart(2, "0")}:00`, congestion: Math.round(15 + peak), volume: Math.round(400 + peak * 40) };
});

export const daily = [
  { day: "Mon", congestion: 64 }, { day: "Tue", congestion: 61 }, { day: "Wed", congestion: 66 },
  { day: "Thu", congestion: 63 }, { day: "Fri", congestion: 72 }, { day: "Sat", congestion: 48 }, { day: "Sun", congestion: 35 },
];

export const historical = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((m, i) => ({
  month: m,
  thisYear: [58, 60, 57, 62, 65, 70, 74, 69, 66][i],
  lastYear: [55, 56, 58, 59, 60, 64, 68, 66, 63][i],
}));

export interface Incident {
  id: string;
  title: string;
  road: string;
  severity: Level;
  delay: number;
  type: "Accident" | "Roadwork" | "Congestion" | "Weather";
  time: string;
}

export const incidents: Incident[] = [
  { id: "i1", title: "Multi-vehicle collision", road: "LB Nagar Ring Road", severity: "severe", delay: 25, type: "Accident", time: "12 min ago" },
  { id: "i2", title: "Predicted heavy congestion", road: "Outer Ring Road (Gachibowli)", severity: "high", delay: 18, type: "Congestion", time: "20 min ago" },
  { id: "i3", title: "Lane closure for resurfacing", road: "Mehdipatnam Flyover", severity: "moderate", delay: 9, type: "Roadwork", time: "1 h ago" },
  { id: "i4", title: "Waterlogging reported", road: "Hitech City Main Road", severity: "high", delay: 14, type: "Weather", time: "1 h ago" },
  { id: "i5", title: "Signal timing adjustment", road: "Begumpet Road", severity: "low", delay: 3, type: "Roadwork", time: "2 h ago" },
];

export const xaiFactors = [
  { factor: "Traffic volume", weight: 0.38 },
  { factor: "Peak hour", weight: 0.24 },
  { factor: "Rainfall", weight: 0.17 },
  { factor: "Road incidents", weight: 0.14 },
  { factor: "Day of week", weight: 0.07 },
];

export const locations = ["Gachibowli", "Hitech City", "Secunderabad", "Begumpet", "Mehdipatnam", "LB Nagar", "Banjara Hills"];

export const emissions = daily.map((d) => ({
  day: d.day,
  co2: Math.round(d.congestion * 1.9),
  fuel: Math.round(d.congestion * 0.85),
}));
