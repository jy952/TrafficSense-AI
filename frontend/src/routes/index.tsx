import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gauge, Car, Route as RouteIcon, Siren } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/services/api";
import { levelFromScore } from "@/lib/mock-data";
import { Card, CardHeader, PageHeader, QueryState, StatCard, LevelBadge, chartTooltip, axisProps } from "@/components/ui-kit";
import { LazyTrafficMap } from "@/components/LazyTrafficMap";
import { XaiPanel } from "@/components/XaiPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — TrafficSense AI" },
      { name: "description", content: "City-wide congestion score, speeds, incidents and short-term forecast." },
      { property: "og:title", content: "Dashboard — TrafficSense AI" },
      { property: "og:description", content: "City-wide congestion score, speeds, incidents and short-term forecast." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const roads = useQuery({ queryKey: ["roads"], queryFn: api.getRoads });
  const forecast = useQuery({ queryKey: ["forecast"], queryFn: api.getForecast });
  const incidents = useQuery({ queryKey: ["incidents"], queryFn: api.getIncidents });

  const r = roads.data?.data ?? [];
  const score = r.length ? Math.round(r.reduce((a, b) => a + b.score, 0) / r.length) : 0;
  const speed = r.length ? Math.round(r.reduce((a, b) => a + b.speed, 0) / r.length) : 0;

  return (
    <>
      <PageHeader title="Traffic Control Dashboard" description="City-wide overview of congestion, speed and incidents." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Congestion score" value={roads.isPending ? "—" : score} unit="/ 100" tone={levelFromScore(score)} hint="Average across monitored roads" icon={<Gauge className="h-4 w-4" />} />
        <StatCard label="Average speed" value={roads.isPending ? "—" : speed} unit="km/h" hint="Mean corridor speed" icon={<Car className="h-4 w-4" />} />
        <StatCard label="Monitored roads" value={roads.isPending ? "—" : r.length} hint="Corridors in the demo network" icon={<RouteIcon className="h-4 w-4" />} />
        <StatCard label="Active incidents" value={incidents.isPending ? "—" : incidents.data?.data.length ?? 0} tone="high" hint="Accidents, works, weather" icon={<Siren className="h-4 w-4" />} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Traffic map preview" subtitle="Sample corridors coloured by congestion" right={<Link to="/map" className="text-xs text-primary hover:underline">Open map →</Link>} />
          <QueryState q={roads}>{(d) => <LazyTrafficMap roads={d.data} height={320} interactive={false} />}</QueryState>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Congestion forecast" subtitle="Next 2 hours, city average (illustrative)" />
          <QueryState q={forecast}>
            {(d) => (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={d.data}>
                  <defs>
                    <linearGradient id="fc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" {...axisProps} />
                  <YAxis domain={[0, 100]} {...axisProps} />
                  <Tooltip {...chartTooltip} />
                  <Area type="monotone" dataKey="predicted" stroke="var(--primary)" fill="url(#fc)" strokeWidth={2} />
                  <Line dataKey="actual" stroke="var(--low)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </QueryState>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Most congested roads" />
          <QueryState q={roads}>
            {(d) => (
              <ul className="divide-y divide-border">
                {[...d.data].sort((a, b) => b.score - a.score).slice(0, 5).map((x) => (
                  <li key={x.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span>{x.name}</span>
                    <span className="flex items-center gap-3"><span className="font-mono text-muted-foreground">{x.speed} km/h</span><LevelBadge level={levelFromScore(x.score)} /></span>
                  </li>
                ))}
              </ul>
            )}
          </QueryState>
        </Card>
        <XaiPanel />
      </div>
    </>
  );
}
