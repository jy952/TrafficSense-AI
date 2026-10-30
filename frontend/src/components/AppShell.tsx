import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Map, BrainCircuit, BarChart3, Route as RouteIcon, Siren, Leaf, Bell, Search, PanelLeftClose, PanelLeftOpen, Activity, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/map", label: "Live Traffic Map", icon: Map },
  { to: "/prediction", label: "Congestion Prediction", icon: BrainCircuit },
  { to: "/analytics", label: "Traffic Analytics", icon: BarChart3 },
  { to: "/routes", label: "Smart Routes", icon: RouteIcon },
  { to: "/alerts", label: "Alerts & Incidents", icon: Siren },
  { to: "/sustainability", label: "Sustainability", icon: Leaf },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  const sidebar = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {nav.map((n) => {
        const active = path === n.to;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setMobileOpen(false)}
            title={n.label}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              collapsed && "md:justify-center md:px-0",
            )}
          >
            <n.icon className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && "md:hidden")}>{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen w-full">
      {mobileOpen && <div className="fixed inset-0 z-30 bg-background/70 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-surface transition-all md:sticky md:top-0 md:h-screen",
          collapsed ? "md:w-16" : "md:w-64",
          mobileOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full md:translate-x-0",
        )}
      >
        <div className={cn("flex h-16 items-center gap-2 border-b px-4", collapsed && "md:justify-center md:px-0")}>
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground"><Activity className="h-4 w-4" /></div>
          <div className={cn("leading-tight", collapsed && "md:hidden")}>
            <div className="font-display font-bold">TrafficSense AI</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Congestion Prediction</div>
          </div>
        </div>
        {sidebar}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="m-3 hidden items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs text-muted-foreground hover:bg-accent md:flex"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> Collapse</>}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <button className="rounded-md p-2 hover:bg-accent md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input className="field pl-9" placeholder="Search roads, junctions, incidents…" />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <span className="h-2 w-2 rounded-full bg-moderate" /> Demo mode
            </span>
            <Link to="/alerts" className="relative rounded-md p-2 hover:bg-accent" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-severe" />
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold">TS</div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
