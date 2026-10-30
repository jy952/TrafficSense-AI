import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Clock, Navigation, Star } from "lucide-react";
import { api } from "@/services/api";
import { locations, levelFromScore } from "@/lib/mock-data";
import { Button, Card, CardHeader, EmptyState, ErrorState, Field, LevelBadge, LoadingState, PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/routes")({
  head: () => ({
    meta: [
      { title: "Smart Route Recommendations — TrafficSense AI" },
      { name: "description", content: "Compare alternative routes by travel time and congestion." },
      { property: "og:title", content: "Smart Route Recommendations — TrafficSense AI" },
      { property: "og:description", content: "Compare alternative routes by travel time and congestion." },
    ],
  }),
  component: RoutesPage,
});

function RoutesPage() {
  const [origin, setOrigin] = useState(locations[0]!);
  const [dest, setDest] = useState(locations[2]!);
  const m = useMutation({ mutationFn: () => api.getRoutes(origin, dest) });
  const best = m.data ? Math.min(...m.data.data.map((r) => r.time)) : 0;

  return (
    <>
      <PageHeader title="Smart Route Recommendations" description="Compare alternatives between two locations." />
      <Card>
        <form className="grid items-end gap-4 md:grid-cols-[1fr_auto_1fr_auto]" onSubmit={(e) => { e.preventDefault(); m.mutate(); }}>
          <Field label="Origin">
            <select className="field" value={origin} onChange={(e) => setOrigin(e.target.value)}>{locations.map((l) => <option key={l}>{l}</option>)}</select>
          </Field>
          <ArrowRight className="mb-2.5 hidden h-4 w-4 text-muted-foreground md:block" />
          <Field label="Destination">
            <select className="field" value={dest} onChange={(e) => setDest(e.target.value)}>{locations.map((l) => <option key={l}>{l}</option>)}</select>
          </Field>
          <Button type="submit" disabled={origin === dest || m.isPending}><Navigation className="h-4 w-4" /> Find routes</Button>
        </form>
        {origin === dest && <p className="mt-2 text-xs text-high">Origin and destination must differ.</p>}
      </Card>

      <div className="mt-4">
        {m.isPending ? <Card><LoadingState label="Comparing routes…" /></Card>
          : m.isError ? <Card><ErrorState onRetry={() => m.mutate()} /></Card>
          : !m.data ? <Card><EmptyState title="No routes yet" hint="Choose an origin and destination." /></Card>
          : (
            <div className="grid gap-4 md:grid-cols-3">
              {m.data.data.map((r) => (
                <Card key={r.name} className={r.time === best ? "ring-2 ring-primary" : ""}>
                  <CardHeader title={r.name} subtitle={`${r.distance} km`} right={r.time === best ? <span className="flex items-center gap-1 text-xs text-primary"><Star className="h-3.5 w-3.5" /> Recommended</span> : undefined} />
                  <div className="flex items-end justify-between">
                    <div className="flex items-center gap-2 font-display text-3xl font-bold"><Clock className="h-5 w-5 text-muted-foreground" />{r.time}<span className="text-sm font-normal text-muted-foreground">min</span></div>
                    <LevelBadge level={levelFromScore(r.score)} />
                  </div>
                </Card>
              ))}
            </div>
          )}
      </div>
    </>
  );
}
