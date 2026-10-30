import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { api, isBackendEnabled } from "@/services/api";
import { roads } from "@/lib/mock-data";
import type { PredictForm } from "@/lib/predict";
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  PageHeader,
} from "@/components/ui-kit";
import { PredictionResults } from "@/components/PredictionResults";
import { XaiPanel } from "@/components/XaiPanel";

export const Route = createFileRoute("/prediction")({
  head: () => ({
    meta: [
      { title: "Congestion Prediction — TrafficSense AI" },
      { name: "description", content: "Predict congestion for a road 15, 30 or 60 minutes ahead." },
      { property: "og:title", content: "Congestion Prediction — TrafficSense AI" },
      { property: "og:description", content: "Predict congestion for a road 15, 30 or 60 minutes ahead." },
    ],
  }),
  component: PredictionPage,
});

const INITIAL: PredictForm = {
  roadId: roads[0]!.id,
  horizon: 30,
  volume: 1800,
  avgSpeed: 42,
  rainfall: 2,
  incident: false,
  hour: 18,
};

function PredictionPage() {
  const [form, setForm] = useState<PredictForm>(INITIAL);
  const m = useMutation({ mutationFn: api.predict });
  const live = isBackendEnabled("predict");
  const set = <K extends keyof PredictForm>(k: K, v: PredictForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <PageHeader title="Congestion Prediction" description="Enter conditions and get a short-term congestion estimate." />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Prediction inputs" />
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); m.mutate(form); }}>
            <Field label="Road">
              <select className="field" value={form.roadId} onChange={(e) => set("roadId", e.target.value)}>
                {roads.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </Field>
            <Field label="Prediction horizon">
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((h) => (
                  <button type="button" key={h} onClick={() => set("horizon", h)}
                    className={`rounded-md border py-2 text-sm ${form.horizon === h ? "border-primary bg-primary/15 text-primary" : "hover:bg-accent"}`}>
                    {h} min
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Traffic volume (vehicles/hour)">
              <input type="number" min={0} className="field" value={form.volume} onChange={(e) => set("volume", Number(e.target.value))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Average speed (km/h)">
                <input type="number" min={0} className="field" value={form.avgSpeed} onChange={(e) => set("avgSpeed", Number(e.target.value))} />
              </Field>
              <Field label="Rainfall (mm)">
                <input type="number" min={0} className="field" value={form.rainfall} onChange={(e) => set("rainfall", Number(e.target.value))} />
              </Field>
            </div>
            <div className="grid grid-cols-2 items-end gap-3">
              <Field label="Hour of day">
                <input type="number" min={0} max={23} className="field" value={form.hour} onChange={(e) => set("hour", Number(e.target.value))} />
              </Field>
              <label className="flex items-center gap-2 pb-2 text-sm">
                <input type="checkbox" checked={form.incident} onChange={(e) => set("incident", e.target.checked)} className="accent-primary" />
                Active incident
              </label>
            </div>
            {live && (
              <p className="text-xs text-muted-foreground">
                Sent to the API: volume, average speed, rainfall, hour and incident. Road and horizon are not part of
                the request.
              </p>
            )}
            <Button type="submit" className="w-full" disabled={m.isPending}><Sparkles className="h-4 w-4" /> Predict congestion</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Predicted congestion"
            subtitle={m.data?.demo
              ? "Demo estimate from a placeholder formula — not a trained model"
              : `From your FastAPI model — data_mode: ${m.data?.data.dataMode ?? "n/a"}`}
          />
          {m.isPending ? <LoadingState label="Running prediction…" />
            : m.isError ? <ErrorState message={(m.error as Error).message} onRetry={() => m.mutate(form)} />
            : !m.data ? <EmptyState title="No prediction yet" hint="Fill in the inputs and press Predict." />
            : <PredictionResults result={m.data.data} live={!m.data.demo} />}
        </Card>
      </div>
      <div className="mt-4"><XaiPanel /></div>
    </>
  );
}
