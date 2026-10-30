import { Link } from "@tanstack/react-router";
import { BrainCircuit, Gauge, Car, Ruler, Clock, X } from "lucide-react";
import { levelFromScore, type Road } from "@/lib/mock-data";
import { Card, DemoBadge, LevelBadge, levelBg, levelText } from "./ui-kit";
import { cn } from "@/lib/utils";

export function RoadDetails({ road, onClose }: { road: Road; onClose: () => void }) {
  const lvl = levelFromScore(road.score);
  const travel = Math.round((road.lengthKm / road.speed) * 60);
  const freeFlow = Math.round((road.lengthKm / road.freeFlowSpeed) * 60);
  const stats = [
    { icon: Gauge, label: "Congestion score", value: `${road.score}/100`, tone: levelText[lvl] },
    { icon: Car, label: "Average speed", value: `${road.speed} km/h` },
    { icon: Ruler, label: "Segment length", value: `${road.lengthKm} km` },
    { icon: Clock, label: "Travel time", value: `${travel} min`, hint: `+${travel - freeFlow} min vs free flow` },
  ];
  return (
    <Card>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{road.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{road.lanes} lanes · free-flow {road.freeFlowSpeed} km/h</p>
        </div>
        <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Close details"><X className="h-4 w-4" /></button>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2"><LevelBadge level={lvl} /><DemoBadge /></div>
      <div className="mb-4 h-2 rounded-full bg-muted"><div className={cn("h-2 rounded-full", levelBg[lvl])} style={{ width: `${road.score}%` }} /></div>
      <dl className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border p-3">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><s.icon className="h-3.5 w-3.5" />{s.label}</dt>
            <dd className={cn("mt-1 font-display text-lg font-semibold", s.tone)}>{s.value}</dd>
            {s.hint && <dd className="text-xs text-muted-foreground">{s.hint}</dd>}
          </div>
        ))}
      </dl>
      <Link to="/prediction" search={{ road: road.id }} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        <BrainCircuit className="h-4 w-4" /> Forecast this road
      </Link>
    </Card>
  );
}
