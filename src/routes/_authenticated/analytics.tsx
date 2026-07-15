import { createFileRoute } from "@tanstack/react-router";
import { CreatorShell } from "@/components/creator-shell";
import { tracks, monthlyListeners, topCountries, totalPlays, formatNumber, albums } from "@/lib/mock-data";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, Users, Play, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Now Play for Creators" }] }),
  component: Analytics,
});

function Analytics() {
  const topSongs = tracks.slice().sort((a,b) => b.plays - a.plays).slice(0, 6);
  const monthlyListenersLatest = monthlyListeners.at(-1)!.listeners;
  const albumsPerf = albums.map((a) => ({
    name: a.title.length > 14 ? a.title.slice(0, 12) + "…" : a.title,
    plays: tracks.filter(t => t.albumId === a.id).reduce((s, t) => s + t.plays, 0),
  }));

  return (
    <CreatorShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Understand how your catalog is performing</p>
        </div>
        <div className="text-xs text-muted-foreground">Last updated a few moments ago</div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total plays" value={formatNumber(totalPlays)} delta="+12.4%" Icon={Play} />
        <KpiCard label="Monthly listeners" value={formatNumber(monthlyListenersLatest)} delta="+8.1%" Icon={Users} />
        <KpiCard label="Followers" value="52.4K" delta="+4.6%" Icon={TrendingUp} />
        <KpiCard label="Save rate" value="9.8%" delta="+1.2%" Icon={Sparkles} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Plays &amp; listeners</h3>
            <div className="flex items-center gap-3 text-xs">
              <Legend color="var(--color-primary)" label="Plays" />
              <Legend color="var(--color-chart-2)" label="Listeners" />
            </div>
          </div>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <AreaChart data={monthlyListeners} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="p1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="p2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v)=>formatNumber(v as number)} />
                <Tooltip contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="plays" stroke="var(--color-primary)" strokeWidth={2} fill="url(#p1)" />
                <Area type="monotone" dataKey="listeners" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#p2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold">Album performance</h3>
          <p className="text-xs text-muted-foreground">Plays per album</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer>
              <BarChart data={albumsPerf} layout="vertical" margin={{ left: 0, right: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={90} stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "var(--color-elevated)" }} contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="plays" fill="var(--color-primary)" radius={[6,6,6,6]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold">Most played songs</h3>
          <ul className="mt-4 divide-y divide-border">
            {topSongs.map((t, i) => {
              const pct = (t.plays / topSongs[0].plays) * 100;
              return (
                <li key={t.id} className="flex items-center gap-4 py-3">
                  <div className="w-6 text-center text-xs font-semibold text-muted-foreground tabular-nums">{i+1}</div>
                  <img src={t.cover} alt="" className="h-10 w-10 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{t.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{t.album}</div>
                  </div>
                  <div className="hidden sm:block w-40">
                    <div className="h-1.5 rounded-full bg-elevated">
                      <div className="h-full rounded-full bg-primary-gradient" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="w-20 text-right text-xs tabular-nums">{formatNumber(t.plays)}</div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="text-lg font-bold">Top countries</h3>
          <ul className="mt-4 space-y-3">
            {topCountries.map((c) => (
              <li key={c.country}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{c.country}</span>
                  <span className="tabular-nums text-muted-foreground">{formatNumber(c.plays)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-elevated">
                  <div className="h-full rounded-full bg-primary-gradient" style={{ width: `${(c.plays / topCountries[0].plays) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CreatorShell>
  );
}

function KpiCard({ label, value, delta, Icon }: { label: string; value: string; delta: string; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="hover-lift rounded-2xl border border-border bg-card-gradient p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-black tracking-tight">{value}</div>
      <div className="mt-1 text-xs font-semibold text-primary">{delta} vs last month</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} /> {label}
    </span>
  );
}