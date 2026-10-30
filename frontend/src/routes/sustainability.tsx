import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Factory, Fuel, Leaf, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/services/api";
import { Card, CardHeader, PageHeader, QueryState, StatCard, chartTooltip, axisProps } from "@/components/ui-kit";

export const Route = createFileRoute("/sustainability")({
  head: () => ({
    meta: [
      { title: "Sustainability Insights — TrafficSense AI" },
      { name: "description", content: "Estimated emissions, fuel waste and savings from congestion reduction." },
      { property: "og:title", content: "Sustainability Insights — TrafficSense AI" },
      { property: "og:description", content: "Estimated emissions, fuel waste and savings from congestion reduction." },
    ],
  }),
  component: SustainabilityPage,
});

function SustainabilityPage() {
  const q = useQuery({ queryKey: ["sustainability"], queryFn: api.getSustainability });
  return (
    <>
      <PageHeader title="Sustainability Insights" description="Rough estimates of the environmental cost of congestion." />
      <QueryState q={q}>
        {({ data }) => {
          const co2 = data.reduce((a, b) => a + b.co2, 0);
          const fuel = data.reduce((a, b) => a + b.fuel, 0);
          return (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Weekly CO₂ from idling" value={co2} unit="tonnes" tone="high" icon={<Factory className="h-4 w-4" />} />
                <StatCard label="Fuel wasted" value={fuel} unit="kL" tone="moderate" icon={<Fuel className="h-4 w-4" />} />
                <StatCard label="Potential CO₂ saving" value={Math.round(co2 * 0.18)} unit="tonnes" tone="low" hint="If congestion drops 20%" icon={<TrendingDown className="h-4 w-4" />} />
                <StatCard label="Trees equivalent" value={Math.round(co2 * 0.18 * 45)} tone="low" hint="Annual absorption equivalent" icon={<Leaf className="h-4 w-4" />} />
              </div>
              <Card className="mt-4">
                <CardHeader title="Daily emissions and fuel waste" subtitle="Estimated from congestion levels (illustrative factors)" />
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" {...axisProps} />
                    <YAxis {...axisProps} />
                    <Tooltip {...chartTooltip} cursor={{ fill: "var(--accent)" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="co2" name="CO₂ (t)" fill="var(--high)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="fuel" name="Fuel (kL)" fill="var(--moderate)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </>
          );
        }}
      </QueryState>
    </>
  );
}
