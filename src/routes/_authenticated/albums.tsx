import { createFileRoute } from "@tanstack/react-router";
import { CreatorShell } from "@/components/creator-shell";
import { formatNumber } from "@/lib/mock-data";
import { useLibrary } from "@/lib/library-context";
import { Pencil, Trash2, Play, Plus, Volume2 } from "lucide-react";
import { usePlayer } from "@/lib/player-context";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/albums")({
  head: () => ({ meta: [{ title: "Albums — Now Play for Creators" }] }),
  component: AlbumsPage,
});

function AlbumsPage() {
  const player = usePlayer();
  const { albums, tracks, updateAlbum } = useLibrary();
  const [activeId, setActiveId] = useState(albums[0].id);
  const [editOpen, setEditOpen] = useState(false);
  const active = albums.find((a) => a.id === activeId)!;
  const activeTracks = tracks.filter((t) => t.albumId === active.id).sort((a,b) => a.trackNumber - b.trackNumber);
  const totalPlays = activeTracks.reduce((s, t) => s + t.plays, 0);

  return (
    <CreatorShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Album Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organize your releases and manage tracklists</p>
        </div>
        <button onClick={() => toast("Create-album flow coming soon")} className="inline-flex items-center gap-2 rounded-full bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 transition">
          <Plus className="h-4 w-4" /> New album
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Album grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {albums.map((a) => (
            <button
              key={a.id}
              onClick={() => setActiveId(a.id)}
              className={`hover-lift text-left rounded-2xl border p-3 transition-colors ${
                a.id === activeId ? "border-primary/60 bg-elevated" : "border-border bg-card"
              }`}
            >
              <img src={a.cover} alt="" className="aspect-square w-full rounded-lg object-cover" />
              <div className="mt-3 truncate text-sm font-semibold">{a.title}</div>
              <div className="truncate text-xs text-muted-foreground">{a.genre} · {new Date(a.releasedAt).getFullYear()}</div>
            </button>
          ))}
        </div>

        {/* Album detail */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start gap-5">
            <img src={active.cover} alt="" className="h-32 w-32 rounded-xl object-cover shadow-card-elevated" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Album</div>
              <h2 className="mt-1 text-2xl font-black tracking-tight">{active.title}</h2>
              <div className="mt-1 text-sm text-muted-foreground">
                {active.artist} · {active.genre} · {new Date(active.releasedAt).toLocaleDateString(undefined, { year:"numeric", month:"long", day:"numeric"})}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => player.play(activeTracks[0], activeTracks)} className="inline-flex items-center gap-2 rounded-full bg-primary-gradient px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
                  <Play className="h-3.5 w-3.5" /> Play
                </button>
                <button onClick={() => setEditOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold hover:bg-elevated">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button onClick={() => toast.success("Album archived (mock)")} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs font-semibold text-destructive hover:bg-elevated">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
            <div>{activeTracks.length} tracks</div>
            <div>{formatNumber(totalPlays)} total plays</div>
          </div>

          <ul className="mt-3 divide-y divide-border rounded-xl border border-border overflow-hidden">
            {activeTracks.map((t) => {
              const isCurrent = player.current?.id === t.id;
              return (
              <li key={t.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-elevated ${isCurrent ? "bg-elevated/60" : ""}`}>
                <div className="w-6 text-center text-xs tabular-nums">
                  {isCurrent ? (
                    <NowPlayingBars playing={player.isPlaying} />
                  ) : (
                    <span className="text-muted-foreground">{t.trackNumber}</span>
                  )}
                </div>
                <button onClick={() => player.play(t, activeTracks)} className="grid h-8 w-8 place-items-center rounded-full bg-elevated hover:bg-primary hover:text-primary-foreground transition">
                  <Play className="h-3.5 w-3.5" />
                </button>
                <img src={t.cover} alt="" className="h-9 w-9 rounded object-cover" />
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-semibold ${isCurrent ? "text-primary" : ""}`}>
                    {t.title}
                    {isCurrent && <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary"><Volume2 className="h-3 w-3" /> Now playing</span>}
                  </div>
                </div>
                <div className="hidden sm:block text-xs tabular-nums text-muted-foreground">{formatNumber(t.plays)}</div>
                <div className="text-xs tabular-nums text-muted-foreground">{t.duration}</div>
              </li>
              );
            })}
          </ul>
        </div>
      </div>

      <EditAlbumDialog
        key={active.id}
        open={editOpen}
        onOpenChange={setEditOpen}
        album={active}
        onSave={(patch) => { updateAlbum(active.id, patch); setEditOpen(false); toast.success("Album updated"); }}
      />
    </CreatorShell>
  );
}

function NowPlayingBars({ playing }: { playing: boolean }) {
  return (
    <span className="inline-flex h-4 items-end gap-[2px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm bg-primary"
          style={{
            height: playing ? "100%" : "30%",
            animation: playing ? `npc-bars 900ms ease-in-out ${i * 120}ms infinite` : undefined,
          }}
        />
      ))}
      <style>{`@keyframes npc-bars { 0%,100%{height:30%} 50%{height:100%} }`}</style>
    </span>
  );
}

function EditAlbumDialog({
  open, onOpenChange, album, onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  album: { id: string; title: string; genre: string; releasedAt: string; cover: string };
  onSave: (patch: { title?: string; genre?: string; releasedAt?: string; cover?: string }) => void;
}) {
  const [title, setTitle] = useState(album.title);
  const [genre, setGenre] = useState(album.genre);
  const [releasedAt, setReleasedAt] = useState(album.releasedAt);
  const [cover, setCover] = useState<string>(album.cover);

  async function onFile(f: File | null) {
    if (!f) return;
    const dataUrl: string = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.onerror = rej;
      r.readAsDataURL(f);
    });
    setCover(dataUrl);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit album</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <img src={cover} alt="" className="h-24 w-24 rounded-lg object-cover" />
            <label className="text-xs text-muted-foreground cursor-pointer rounded-md border border-dashed border-border px-3 py-2 hover:bg-elevated">
              Change cover
              <input type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <label className="block">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Genre</div>
              <input value={genre} onChange={(e) => setGenre(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60" />
            </label>
            <label className="block">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Release date</div>
              <input type="date" value={releasedAt.slice(0,10)} onChange={(e) => setReleasedAt(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60" />
            </label>
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-elevated">Cancel</button>
          <button
            onClick={() => onSave({ title: title.trim() || album.title, genre, releasedAt, cover })}
            className="rounded-full bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110"
          >
            Save changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}