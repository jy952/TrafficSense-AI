import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CloudRain, Construction, Car } from "lucide-react";
import { api } from "@/services/api";
import type { Level } from "@/lib/mock-data";
import { Card, EmptyState, LevelBadge, PageHeader, QueryState } from "@/components/ui-kit";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts & Incidents — TrafficSense AI" },
      { name: "description", content: "Congestion warnings, incident severity, affected roads and predicted delays." },
      { property: "og:title", content: "Alerts & Incidents — TrafficSense AI" },
      { property: "og:description", content: "Congestion warnings, incident severity, affected roads and predicted delays." },
    ],
  }),
  component: AlertsPage,
});

const icons = { Accident: Car, Roadwork: Construction, Congestion: AlertTriangle, Weather: CloudRain };
const filters: ("all" | Level)[] = ["all", "severe", "high", "moderate", "low"];

function AlertsPage() {
  const q = useQuery({ queryKey: ["incidents"], queryFn: api.getIncidents });
  const [f, setF] = useState<"all" | Level>("all");
  return (
    <>
      <PageHeader title="Alerts & Incidents" description="Sample warnings and incidents with predicted delays." />
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((x) => (
          <button key={x} onClick={() => setF(x)} className={`rounded-full border px-3 py-1 text-xs capitalize ${f === x ? "border-primary bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent"}`}>{x}</button>
        ))}
      </div>
      <QueryState q={q}>
        {(d) => {
          const list = d.data.filter((i) => f === "all" || i.severity === f);
          if (!list.length) return <Card><EmptyState title="No incidents match this filter" /></Card>;
          return (
            <div className="space-y-3">
              {list.map((i) => {
                const Icon = icons[i.type];
                return (
                  <Card key={i.id} className="flex flex-wrap items-center gap-4">
                    <div className="rounded-lg bg-accent p-2.5 text-primary"><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{i.title}</div>
                      <div className="text-xs text-muted-foreground">{i.road} · {i.type} · {i.time}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">+{i.delay} min</div>
                      <div className="text-xs text-muted-foreground">predicted delay</div>
                    </div>
                    <LevelBadge level={i.severity} />
                  </Card>
                );
              })}
            </div>
          );
        }}
      </QueryState>
    </>
  );
}
