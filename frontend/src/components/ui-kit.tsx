import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";
import { levelLabel, type Level } from "@/lib/mock-data";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("card-surface p-5", className)}>{children}</div>;
}

export function CardHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function PageHeader({ title, description, demo = true }: { title: string; description: string; demo?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {demo && <DemoBadge />}
    </div>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-moderate/40 bg-moderate/10 px-3 py-1 text-xs font-medium text-moderate">
      <FlaskConical className="h-3.5 w-3.5" /> Demo data — not live
    </span>
  );
}

const levelStyles: Record<Level, string> = {
  low: "bg-low/15 text-low border-low/30",
  moderate: "bg-moderate/15 text-moderate border-moderate/30",
  high: "bg-high/15 text-high border-high/30",
  severe: "bg-severe/15 text-severe border-severe/30",
};
export const levelText: Record<Level, string> = { low: "text-low", moderate: "text-moderate", high: "text-high", severe: "text-severe" };
export const levelBg: Record<Level, string> = { low: "bg-low", moderate: "bg-moderate", high: "bg-high", severe: "bg-severe" };
export const levelVar: Record<Level, string> = { low: "var(--low)", moderate: "var(--moderate)", high: "var(--high)", severe: "var(--severe)" };

export function LevelBadge({ level }: { level: Level }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", levelStyles[level])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", levelBg[level])} />
      {levelLabel[level]}
    </span>
  );
}

export function StatCard({ label, value, unit, hint, icon, tone }: { label: string; value: ReactNode; unit?: string; hint?: string; icon: ReactNode; tone?: Level }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="rounded-lg bg-accent p-2 text-primary">{icon}</span>
      </div>
      <div className={cn("mt-3 font-display text-3xl font-bold", tone && levelText[tone])}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export function LoadingState({ label = "Loading data…" }: { label?: string }) {
  return (
    <div className="flex h-48 items-center justify-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-sm">
      <AlertTriangle className="h-6 w-6 text-severe" />
      <p className="font-medium">Couldn't reach the backend</p>
      <p className="text-xs text-muted-foreground">{message ?? "Check that FastAPI is running on localhost:8000."}</p>
      {onRetry && <Button variant="outline" onClick={onRetry}>Retry</Button>}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
      <Inbox className="h-6 w-6" />
      <p className="font-medium text-foreground">{title}</p>
      {hint && <p className="text-xs">{hint}</p>}
    </div>
  );
}

export function Button({ variant = "primary", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" && "border border-border bg-transparent hover:bg-accent",
        variant === "ghost" && "hover:bg-accent",
        className,
      )}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

/** Wraps a query result into loading / error / empty / content states. */
export function QueryState<T>({ q, isEmpty, empty, children }: {
  q: { isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown; data?: T };
  isEmpty?: (d: NonNullable<T>) => boolean;
  empty?: ReactNode;
  children: (d: NonNullable<T>) => ReactNode;
}) {
  if (q.isPending) return <LoadingState />;
  if (q.isError) return <ErrorState message={(q.error as Error)?.message} onRetry={() => q.refetch()} />;
  if (q.data === undefined || q.data === null) return <LoadingState />;
  const data = q.data as NonNullable<T>;
  if (isEmpty?.(data)) return <>{empty ?? <EmptyState title="No data yet" />}</>;
  return <>{children(data)}</>;
}

export const chartTooltip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "var(--foreground)" },
};
export const axisProps = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;
