import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CreatorShell } from "@/components/creator-shell";
import { apiClient } from "@/lib/api-client";
import { Shield, Trash2, EyeOff, Users, Music2, Disc3, Flag, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type CreatorRow = {
  id: string;
  name: string;
  genre: string;
  releases: number;
  plays: number;
  status: "Active" | "Review";
};

type AnalyticsSummary = {
  totalPlays?: number;
};

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Now Play for Creators" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [tab, setTab] = useState<"creators" | "content">("creators");
  const { data: tracksData = [], isPending: tracksLoading, isError: tracksError } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => apiClient.get<Record<string, unknown>[]>("/api/tracks/"),
  });
  const { data: albumsData = [], isPending: albumsLoading, isError: albumsError } = useQuery({
    queryKey: ["albums"],
    queryFn: () => apiClient.get<Record<string, unknown>[]>("/api/albums/"),
  });
  const { data: creatorsData = [], isPending: creatorsLoading, isError: creatorsError } = useQuery({
    queryKey: ["creators"],
    queryFn: async () => {
      try {
        return await apiClient.get<Record<string, unknown>[]>("/api/creators/");
      } catch {
        return [];
      }
    },
  });
  const { data: analyticsData, isPending: analyticsLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => apiClient.get<AnalyticsSummary>("/api/analytics/"),
  });

  const tracks = useMemo(() => (tracksData ?? []).map((track) => normalizeTrack(track as Record<string, unknown>)), [tracksData]);
  const albums = useMemo(() => (albumsData ?? []).map((album) => normalizeAlbum(album as Record<string, unknown>)), [albumsData]);
  const creators = useMemo(() => (creatorsData ?? []).map((creator) => normalizeCreator(creator as Record<string, unknown>)), [creatorsData]);
  const totalPlatformPlays = analyticsData?.totalPlays ?? tracks.reduce((sum, track) => sum + track.plays, 0);
  const loading = tracksLoading || albumsLoading || creatorsLoading || analyticsLoading;
  const hasError = tracksError || albumsError || creatorsError;

  if (loading) {
    return (
      <CreatorShell>
        <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading catalog data from the backend...
          </div>
        </div>
      </CreatorShell>
    );
  }

  if (hasError) {
    return (
      <CreatorShell>
        <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
          We could not reach the backend catalog yet. Once the API is available, the admin dashboard will populate automatically.
        </div>
      </CreatorShell>
    );
  }

  return (
    <CreatorShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Shield className="h-3.5 w-3.5" /> Admin
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Platform management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Monitor the content catalog and creator records from the backend.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Creators" value={creators.length.toString()} Icon={Users} />
        <Kpi label="Total songs" value={tracks.length.toString()} Icon={Music2} />
        <Kpi label="Total albums" value={albums.length.toString()} Icon={Disc3} />
        <Kpi label="Platform plays" value={formatNumber(totalPlatformPlays)} Icon={Flag} />
      </div>

      <div className="mt-8 flex items-center gap-1 rounded-full border border-border bg-card p-1 w-fit">
        {(["creators", "content"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
              tab === t ? "bg-primary-gradient text-primary-foreground shadow-glow" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "creators" ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_100px_120px_120px_120px] gap-4 border-b border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Creator</div><div>Genre</div><div>Releases</div><div>Plays</div><div>Status</div><div className="text-right">Actions</div>
          </div>
          {creators.length > 0 ? creators.map((c) => (
            <div key={c.id} className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_100px_120px_120px_120px] items-center gap-4 border-b border-border last:border-none px-5 py-3 text-sm hover:bg-elevated">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-gradient text-primary-foreground text-xs font-bold">
                  {c.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}
                </div>
                <div className="truncate font-semibold">{c.name}</div>
              </div>
              <div className="text-muted-foreground">{c.genre}</div>
              <div className="tabular-nums">{c.releases}</div>
              <div className="tabular-nums">{formatNumber(c.plays)}</div>
              <div>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  c.status === "Active" ? "bg-primary/10 text-primary" : "bg-yellow-500/10 text-yellow-400"
                }`}>{c.status}</span>
              </div>
              <div className="flex justify-end gap-1 text-muted-foreground">
                <button onClick={() => toast.info("Creator moderation actions will connect to the backend once the endpoint is available.")} className="grid h-8 w-8 place-items-center rounded-full hover:bg-elevated hover:text-foreground"><EyeOff className="h-4 w-4" /></button>
                <button onClick={() => toast.info("Removal actions will be wired to the API next.")} className="grid h-8 w-8 place-items-center rounded-full hover:bg-elevated hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-start gap-2 px-5 py-10 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Backend ready
              </div>
              <p>No creator rows are available yet. Once the backend exposes creator records, they will appear here automatically.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          {tracks.length > 0 ? tracks.slice(0, 8).map((t) => (
            <div key={t.id} className="flex items-center gap-4 border-b border-border last:border-none px-5 py-3 hover:bg-elevated">
              <img src={t.cover} alt="" className="h-10 w-10 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{t.title}</div>
                <div className="truncate text-xs text-muted-foreground">{t.artist} · {t.album}</div>
              </div>
              <div className="hidden sm:block text-xs tabular-nums text-muted-foreground">{formatNumber(t.plays)} plays</div>
              <button onClick={() => toast.info(`"${t.title}" removal will be connected to the backend when the delete endpoint is ready.`)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-elevated">
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          )) : (
            <div className="px-5 py-10 text-sm text-muted-foreground">No songs are available from the backend yet. Upload a track to populate this view.</div>
          )}
        </div>
      )}
    </CreatorShell>
  );
}

function normalizeTrack(payload: Record<string, unknown>) {
  return {
    id: String(payload.id ?? ""),
    title: String(payload.title ?? "Untitled"),
    artist: String(payload.artist ?? ""),
    album: String(payload.album ?? payload.albumTitle ?? "Untitled album"),
    cover: String(payload.cover ?? ""),
    plays: Number(payload.plays ?? 0),
  };
}

function normalizeAlbum(payload: Record<string, unknown>) {
  return {
    id: String(payload.id ?? ""),
    title: String(payload.title ?? "Untitled album"),
    genre: String(payload.genre ?? ""),
  };
}

function normalizeCreator(payload: Record<string, unknown>): CreatorRow {
  return {
    id: String(payload.id ?? ""),
    name: String(payload.name ?? payload.stage_name ?? "Pending creator"),
    genre: String(payload.genre ?? "Unspecified"),
    releases: Number(payload.releases ?? 0),
    plays: Number(payload.plays ?? 0),
    status: (payload.status as CreatorRow["status"]) ?? "Review",
  };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function Kpi({ label, value, Icon }: { label: string; value: string; Icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl border border-border bg-card-gradient p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-black tracking-tight">{value}</div>
    </div>
  );
}