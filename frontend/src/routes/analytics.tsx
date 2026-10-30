import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/services/api";
import { Card, CardHeader, PageHeader, QueryState, chartTooltip, axisProps } from "@/components/ui-kit";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Traffic Analytics — TrafficSense AI" },
      { name: "description", content: "Hourly and daily traffic patterns, historical congestion and peak-hour insights." },
      { property: "og:title", content: "Traffic Analytics — TrafficSense AI" },
      { property: "og:description", content: "Hourly and daily traffic patterns, historical congestion and peak-hour insights." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const q = useQuery({ queryKey: ["analytics"], queryFn: api.getAnalytics });
  return (
    <>
      <PageHeader title="Traffic Analytics" description="Patterns and trends from the sample dataset." />
      <QueryState q={q}>
        {({ data }) => {
          const sorted = [...data.hourly].sort((a, b) => b.congestion - a.congestion);
          return (
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader title="Hourly congestion pattern" subtitle="Typical weekday" />
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.hourly}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="hour" {...axisProps} interval={2} />
                    <YAxis {...axisProps} />
                    <Tooltip {...chartTooltip} cursor={{ fill: "var(--accent)" }} />
                    <Bar dataKey="congestion" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card>
                <CardHeader title="Peak-hour insights" />
                <ul className="space-y-3 text-sm">
                  <li className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Busiest hour</div><div className="font-display text-xl font-semibold text-severe">{sorted[0]?.hour}</div></li>
                  <li className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Morning peak</div><div className="font-semibold">08:00 – 10:00</div></li>
                  <li className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Evening peak</div><div className="font-semibold">17:00 – 20:00</div></li>
                  <li className="rounded-lg border p-3"><div className="text-xs text-muted-foreground">Quietest hour</div><div className="font-semibold text-low">{sorted[sorted.length - 1]?.hour}</div></li>
                </ul>
              </Card>
              <Card>
                <CardHeader title="Daily pattern" subtitle="Average congestion by weekday" />
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={data.daily}>
                    <XAxis dataKey="day" {...axisProps} />
                    <YAxis {...axisProps} />
                    <Tooltip {...chartTooltip} cursor={{ fill: "var(--accent)" }} />
                    <Bar dataKey="congestion" fill="var(--high)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader title="Historical congestion" subtitle="Monthly average, this year vs last year" />
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.historical}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" {...axisProps} />
                    <YAxis {...axisProps} />
                    <Tooltip {...chartTooltip} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line dataKey="thisYear" name="This year" stroke="var(--primary)" strokeWidth={2} />
                    <Line dataKey="lastYear" name="Last year" stroke="var(--muted-foreground)" strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          );
        }}
      </QueryState>
    </>
  );
}
