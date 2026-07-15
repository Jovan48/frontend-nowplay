import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, Pencil, Trash2, Search, Filter } from "lucide-react";
import { CreatorShell } from "@/components/creator-shell";
import { formatNumber } from "@/lib/mock-data";
import { useLibrary } from "@/lib/library-context";
import { usePlayer } from "@/lib/player-context";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({ meta: [{ title: "Library — Now Play for Creators" }] }),
  component: Library,
});

function Library() {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string>("all");
  const player = usePlayer();
  const { tracks: allTracks } = useLibrary();

  const genres = useMemo(() => ["all", ...Array.from(new Set(allTracks.map((t) => t.genre)))], [allTracks]);
  const filtered = allTracks.filter((t) =>
    (genre === "all" || t.genre === genre) &&
    (q.trim() === "" || `${t.title} ${t.album}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <CreatorShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Music Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your complete catalog</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search songs or albums"
              className="h-10 w-72 rounded-full border border-border bg-elevated pl-9 pr-4 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={genre} onChange={(e) => setGenre(e.target.value)}
              className="h-10 rounded-full border border-border bg-elevated pl-9 pr-8 text-sm outline-none focus:border-primary/60"
            >
              {genres.map((g) => <option key={g} value={g}>{g === "all" ? "All genres" : g}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[40px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_90px_120px_120px] items-center gap-4 border-b border-border px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <div>#</div><div>Title</div><div>Album</div><div>Genre</div><div>Duration</div><div>Plays</div><div className="text-right">Actions</div>
        </div>
        {filtered.map((t, i) => {
          const isCurrent = player.current?.id === t.id;
          return (
          <div key={t.id}
            className={`group grid grid-cols-[40px_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_90px_120px_120px] items-center gap-4 px-5 py-3 text-sm border-b border-border last:border-none hover:bg-elevated transition-colors ${isCurrent ? "bg-elevated/60" : ""}`}>
            <div className="text-muted-foreground">
              <span className="group-hover:hidden">{i + 1}</span>
              <button onClick={() => player.play(t, filtered)} className="hidden group-hover:inline-flex text-primary" aria-label={`Play ${t.title}`}>
                <Play className="h-4 w-4" />
              </button>
            </div>
            <div className="flex min-w-0 items-center gap-3">
              <img src={t.cover} alt="" className="h-10 w-10 shrink-0 rounded object-cover" />
              <div className="min-w-0">
                <div className={`truncate font-semibold ${isCurrent ? "text-primary" : ""}`}>{t.title}</div>
                <div className="truncate text-xs text-muted-foreground">{t.artist}</div>
              </div>
            </div>
            <div className="truncate text-muted-foreground">{t.album}</div>
            <div className="truncate text-muted-foreground">{t.genre}</div>
            <div className="text-muted-foreground tabular-nums">{t.duration}</div>
            <div className="tabular-nums">{formatNumber(t.plays)}</div>
            <div className="flex justify-end gap-1 text-muted-foreground">
              <button onClick={() => toast("Edit sheet coming soon")} className="grid h-8 w-8 place-items-center rounded-full hover:bg-elevated hover:text-foreground">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => toast.success(`"${t.title}" removed (mock)`)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-elevated hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">No tracks match your search.</div>
        )}
      </div>
    </CreatorShell>
  );
}