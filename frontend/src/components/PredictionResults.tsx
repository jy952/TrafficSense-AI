import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PredictResult } from "@/lib/predict";
import { DemoBadge, LevelBadge, axisProps, chartTooltip, levelText } from "./ui-kit";

/** Results of one prediction. Works for both the FastAPI response and the demo model. */
export function PredictionResults({ result, live }: { result: PredictResult; live: boolean }) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className={`font-display text-5xl font-bold ${levelText[result.level]}`}>{result.congestionLabel}</div>
        <LevelBadge level={result.level} />
        <span className="text-sm text-muted-foreground">Confidence {result.confidence}%</span>
        {!live && <DemoBadge />}
      </div>

      <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
        <span>Model confidence</span>
        <span className="font-mono">{result.confidence}%</span>
      </div>
      <div className="mb-5 h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${result.confidence}%` }} />
      </div>

      {result.series ? (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={result.series}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" {...axisProps} />
            <YAxis domain={[0, 100]} {...axisProps} />
            <Tooltip {...chartTooltip} />
            <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={2.5} dot />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-xs text-muted-foreground">
          Your API returns a single prediction, so there is no time series to chart. Add a `series` array to the
          response and the trend chart appears here.
        </p>
      )}
    </div>
  );
}
