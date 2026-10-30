import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { Road } from "@/lib/mock-data";
import { LoadingState } from "./ui-kit";

const TrafficMap = lazy(() => import("./TrafficMap"));

export function LazyTrafficMap(props: { roads: Road[]; height?: number; interactive?: boolean; selectedId?: string | null; onSelect?: (id: string) => void }) {
  const fallback = <div style={{ height: props.height ?? 420 }} className="rounded-lg bg-surface"><LoadingState label="Loading map…" /></div>;
  return (
    <ClientOnly fallback={fallback}>
      <Suspense fallback={fallback}>
        <TrafficMap {...props} />
      </Suspense>
    </ClientOnly>
  );
}
