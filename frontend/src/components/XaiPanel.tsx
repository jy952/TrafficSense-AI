import { useQuery } from "@tanstack/react-query";
import { Brain, TrendingDown, TrendingUp } from "lucide-react";
import { api } from "@/services/api";
import type { ExplainInput } from "@/lib/explain";
import { Card, CardHeader, DemoBadge, EmptyState, QueryState } from "./ui-kit";

/** Explainable-AI panel. Pass `input` to explain a specific prediction; omit for city-wide factors. */
export function XaiPanel({ input, requireInput = false }: { input?: ExplainInput; requireInput?: boolean }) {
  const q = useQuery({
    queryKey: ["explain", input ?? null],
    queryFn: () => api.getExplanation(input),
    enabled: !requireInput || !!input,
  });
  return (
    <Card>
      <CardHeader
        title="Explainable AI — Why this prediction?"
        subtitle="Illustrative explanation only, not real model attributions. Real feature importances (e.g. SHAP) appear once a trained model is connected."
        right={<Brain className="h-5 w-5 text-primary" />}
      />
      {requireInput && !input ? (
        <EmptyState title="No prediction to explain yet" hint="Run a prediction to see contributing factors." />
      ) : (
        <QueryState q={q} isEmpty={(r) => r.data.length === 0}>
          {(r) => (
            <>
              {r.demo && <div className="mb-4"><DemoBadge /></div>}
              <ul className="space-y-3">
                {r.data.map((f) => (
                  <li key={f.factor}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {f.effect === "increases" ? <TrendingUp className="h-3.5 w-3.5 text-high" /> : <TrendingDown className="h-3.5 w-3.5 text-low" />}
                        {f.factor}
                        <span className="text-xs text-muted-foreground">{f.effect} congestion</span>
                      </span>
                      <span className="font-mono text-muted-foreground">{Math.round(f.weight * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className={`h-2 rounded-full transition-all ${f.effect === "increases" ? "bg-primary" : "bg-low"}`} style={{ width: `${f.weight * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </QueryState>
      )}
    </Card>
  );
}
