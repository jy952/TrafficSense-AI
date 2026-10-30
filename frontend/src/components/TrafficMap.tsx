// Browser-only: imports Leaflet. Load via LazyTrafficMap.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { MAP_CENTER, levelFromScore, levelLabel, type Road } from "@/lib/mock-data";

const colors = { low: "#22c55e", moderate: "#eab308", high: "#f97316", severe: "#ef4444" }; // Leaflet needs literal colors

export interface TrafficMapProps {
  roads: Road[];
  height?: number;
  interactive?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export default function TrafficMap({ roads, height = 420, interactive = true, selectedId, onSelect }: TrafficMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const lines = useRef(new Map<string, L.Polyline>());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { center: MAP_CENTER, zoom: 12, scrollWheelZoom: interactive, dragging: interactive, zoomControl: interactive });
    mapRef.current = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    roads.forEach((r) => {
      const lvl = levelFromScore(r.score);
      // wide invisible hit area makes thin lines easy to click/tap
      const hit = L.polyline(r.coords, { color: "#000", opacity: 0, weight: 24 }).addTo(map);
      const line = L.polyline(r.coords, { color: colors[lvl], weight: 7, opacity: 0.85 })
        .bindTooltip(`${r.name} · ${levelLabel[lvl]} (demo)`, { sticky: true })
        .addTo(map);
      const select = () => onSelectRef.current?.(r.id);
      hit.on("click", select);
      line.on("click", select);
      if (onSelectRef.current) {
        hit.getElement()?.setAttribute("style", "cursor:pointer");
      }
      L.circleMarker(r.coords[1] ?? MAP_CENTER, { radius: 5, color: "#fff", fillColor: colors[lvl], fillOpacity: 1, weight: 2, interactive: false }).addTo(map);
      lines.current.set(r.id, line);
    });
    return () => {
      lines.current.clear();
      mapRef.current = null;
      map.remove();
    };
  }, [roads, interactive]);

  useEffect(() => {
    lines.current.forEach((line, id) => {
      const active = id === selectedId;
      line.setStyle({ weight: active ? 11 : 7, opacity: selectedId && !active ? 0.45 : 0.9 });
      if (active) {
        line.bringToFront();
        mapRef.current?.flyToBounds(line.getBounds(), { padding: [80, 80], maxZoom: 14, duration: 0.6 });
      }
    });
  }, [selectedId, roads]);

  return <div ref={ref} style={{ height, width: "100%" }} />;
}
