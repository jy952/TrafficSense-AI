import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { levelFromScore, type Level } from "@/lib/mock-data";
import { Card, CardHeader, PageHeader, QueryState, LevelBadge, levelBg } from "@/components/ui-kit";
import { LazyTrafficMap } from "@/components/LazyTrafficMap";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live Traffic Map — TrafficSense AI" },
      { name: "description", content: "Interactive OpenStreetMap view of road congestion indicators." },
      { property: "og:title", content: "Live Traffic Map — TrafficSense AI" },
      { property: "og:description", content: "Interactive OpenStreetMap view of road congestion indicators." },
    ],
  }),
  component: MapPage,
});

const legend: Level[] = ["low", "moderate", "high", "severe"];

function MapPage() {
  const roads = useQuery({ queryKey: ["roads"], queryFn: api.getRoads });
  return (
    <>
      <PageHeader title="Live Traffic Map" description="Sample road segments with congestion indicators. Not a real-time feed." />
      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="xl:col-span-3">
          <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {legend.map((l) => (
              <span key={l} className="flex items-center gap-2"><span className={`h-2 w-6 rounded ${levelBg[l]}`} />{l.charAt(0).toUpperCase() + l.slice(1)}</span>
            ))}
          </div>
          <QueryState q={roads}>{(d) => <LazyTrafficMap roads={d.data} height={560} />}</QueryState>
        </Card>
        <Card>
          <CardHeader title="Road segments" subtitle="Click a line on the map for details" />
          <QueryState q={roads} isEmpty={(d) => d.data.length === 0}>
            {(d) => (
              <ul className="space-y-3">
                {d.data.map((r) => (
                  <li key={r.id} className="rounded-lg border p-3">
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{r.speed} km/h · score {r.score}</span>
                      <LevelBadge level={levelFromScore(r.score)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </Card>
      </div>
    </>
  );
}
