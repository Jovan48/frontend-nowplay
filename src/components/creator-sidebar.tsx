import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Music2, Upload, Disc3, User, BarChart3, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { title: "Library",   to: "/library",   icon: Music2 },
  { title: "Upload",    to: "/upload",    icon: Upload },
  { title: "Albums",    to: "/albums",    icon: Disc3 },
  { title: "Analytics", to: "/analytics", icon: BarChart3 },
  { title: "Profile",   to: "/profile",   icon: User },
] as const;

export function CreatorSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col gap-6 bg-sidebar text-sidebar-foreground border-r border-sidebar-border px-3 py-6">
      <Link to="/dashboard" className="flex items-center gap-2 px-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-gradient shadow-glow ring-1 ring-primary/40">
          <span className="text-[10px] font-black tracking-wider text-primary-foreground">CBM</span>
        </div>
        <div className="leading-tight">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight">Now Play</span>
            <Radio className="h-3 w-3 text-primary" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">for Creators</div>
        </div>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const active = pathname === it.to || (it.to !== "/dashboard" && pathname.startsWith(it.to));
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-primary")} />
              <span>{it.title}</span>
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl bg-card-gradient p-4 border border-border">
        <div className="text-xs font-semibold">Pro tip</div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
          Complete your artist profile to unlock editorial playlist submissions.
        </p>
      </div>
    </aside>
  );
}