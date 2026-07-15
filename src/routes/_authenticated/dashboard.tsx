import { createFileRoute, Link } from "@tanstack/react-router";
import { Music2, Disc3, TrendingUp, Award, Upload, Play } from "lucide-react";
import { CreatorShell } from "@/components/creator-shell";
import { albums, tracks, totalPlays, topSong, formatNumber, monthlyListeners } from "@/lib/mock-data";
import { usePlayer } from "@/lib/player-context";
import { useAuth } from "@/lib/auth-context";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Now Play for Creators" }] }),
  component: Dashboard,
});

function StatCard({ label, value, sub, Icon }: { label: string; value: string; sub: string; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="hover-lift rounded-2xl border border-border bg-card-gradient p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-black tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Dashboard() {
  const player = usePlayer();
  const { profile } = useAuth();
  const recent = tracks.slice(0, 6);
  const name = profile?.stage_name || "Creator";

  return (
    <CreatorShell>
      <div className="mb-8">
        <div className="text-sm text-muted-foreground">Welcome back</div>
        <h1 className="mt-1 text-3xl md:text-4xl font-black tracking-tight">Hey {name}, ready to release something?</h1>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total songs"        value={tracks.length.toString()} sub="Across 4 albums" Icon={Music2} />
        <StatCard label="Total albums"       value={albums.length.toString()} sub="1 in production" Icon={Disc3} />
        <StatCard label="Total plays"        value={formatNumber(totalPlays)} sub="+12.4% vs last month" Icon={TrendingUp} />
        <StatCard label="Top performing"     value={topSong.title} sub={`${formatNumber(topSong.plays)} plays`} Icon={Award} />
      </div>

      {/* Perf + Quick actions */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Performance</h3>
              <p className="text-xs text-muted-foreground">Monthly plays over the past year</p>
            </div>
            <div className="text-sm font-semibold text-primary">+12.4%</div>
          </div>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyListeners} margin={{ left: -20, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--color-elevated)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "var(--color-foreground)" }}
                />
                <Area type="monotone" dataKey="plays" stroke="var(--color-primary)" strokeWidth={2} fill="url(#g1)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card-gradient p-6 flex flex-col">
          <h3 className="text-lg font-bold">Quick upload</h3>
          <p className="mt-1 text-xs text-muted-foreground">Push a new track to your catalog in a couple of clicks.</p>
          <Link
            to="/upload"
            className="mt-6 group inline-flex items-center justify-center gap-2 rounded-full bg-primary-gradient px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 transition"
          >
            <Upload className="h-4 w-4" /> Upload a track
          </Link>
          <div className="mt-6 rounded-xl border border-border bg-background/40 p-4 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground">Editorial tip</div>
            Submit polished releases at least 3 weeks ahead for playlist consideration.
          </div>
        </div>
      </div>

      {/* Recent uploads */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-bold">Recently uploaded</h3>
          <Link to="/library" className="text-xs font-semibold text-muted-foreground hover:text-foreground">See library →</Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {recent.map((t) => (
            <button
              key={t.id}
              onClick={() => player.play(t, tracks)}
              className="hover-lift group text-left rounded-xl border border-border bg-card p-3"
            >
              <div className="relative overflow-hidden rounded-lg">
                <img src={t.cover} alt="" className="aspect-square w-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition grid place-items-center">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary shadow-glow">
                    <Play className="h-4 w-4 text-primary-foreground translate-x-[1px]" />
                  </div>
                </div>
              </div>
              <div className="mt-3 truncate text-sm font-semibold">{t.title}</div>
              <div className="truncate text-xs text-muted-foreground">{formatNumber(t.plays)} plays</div>
            </button>
          ))}
        </div>
      </div>

      {/* Albums */}
      <div className="mt-10">
        <div className="flex items-baseline justify-between">
          <h3 className="text-lg font-bold">Your albums</h3>
          <Link to="/albums" className="text-xs font-semibold text-muted-foreground hover:text-foreground">Manage →</Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {albums.map((a) => (
            <div key={a.id} className="hover-lift rounded-xl border border-border bg-card p-3">
              <img src={a.cover} alt="" className="aspect-square w-full rounded-lg object-cover" />
              <div className="mt-3 truncate text-sm font-semibold">{a.title}</div>
              <div className="truncate text-xs text-muted-foreground">{a.genre} · {new Date(a.releasedAt).getFullYear()}</div>
            </div>
          ))}
        </div>
      </div>
    </CreatorShell>
  );
}