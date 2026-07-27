import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreatorShell } from "@/components/creator-shell";
import { apiClient } from "@/lib/api-client";
import { Pencil, Trash2, Play, Plus, Volume2 } from "lucide-react";
import { usePlayer } from "@/lib/player-context";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

type AlbumRecord = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  genre: string;
  releasedAt: string;
};

type TrackRecord = {
  id: string;
  title: string;
  albumId: string;
  cover: string;
  plays: number;
  trackNumber: number;
  duration: string;
};

export const Route = createFileRoute("/_authenticated/albums")({
  head: () => ({ meta: [{ title: "Albums — Now Play for Creators" }] }),
  component: AlbumsPage,
});

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function normalizeAlbum(payload: Record<string, unknown>): AlbumRecord {
  return {
    id: String(payload.id ?? ""),
    title: String(payload.title ?? "Untitled album"),
    artist: String(payload.artist ?? ""),
    cover: String(payload.cover ?? ""),
    genre: String(payload.genre ?? ""),
    releasedAt: String(payload.releasedAt ?? payload.released_at ?? ""),
  };
}

function normalizeTrack(payload: Record<string, unknown>): TrackRecord {
  return {
    id: String(payload.id ?? ""),
    title: String(payload.title ?? "Untitled"),
    albumId: String(payload.albumId ?? payload.album_id ?? ""),
    cover: String(payload.cover ?? ""),
    plays: Number(payload.plays ?? 0),
    trackNumber: Number(payload.trackNumber ?? payload.track_number ?? 0),
    duration: String(payload.duration ?? "0:00"),
  };
}

function ensureArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data && Array.isArray((data as { results: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

function AlbumsPage() {
  const player = usePlayer();
  const queryClient = useQueryClient();
  const { data: albumsData } = useQuery({
    queryKey: ["albums"],
    queryFn: () => apiClient.get<unknown>("/api/albums/"),
  });
  const { data: tracksData } = useQuery({
    queryKey: ["tracks"],
    queryFn: () => apiClient.get<unknown>("/api/tracks/"),
  });
  const albums = ensureArray<Record<string, unknown>>(albumsData).map(normalizeAlbum);
  const tracks = ensureArray<Record<string, unknown>>(tracksData).map(normalizeTrack);
  const [activeId, setActiveId] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!albums.length) return;
    setActiveId((current) => (current && albums.some((album) => album.id === current) ? current : albums[0].id));
  }, [albums]);
  
  const active = albums.find((album) => album.id === activeId) ?? albums[0];
  const activeTracks = active ? tracks.filter((track) => track.albumId === active.id).sort((a, b) => a.trackNumber - b.trackNumber) : [];
  const totalPlays = activeTracks.reduce((sum, track) => sum + track.plays, 0);

  return (
    <CreatorShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Album Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organize your releases and manage tracklists</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 transition cursor-pointer">
          <Plus className="h-4 w-4" /> New album
        </button>
      </div>

      {!active ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary mb-4">
            <Plus className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold">No albums yet</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
            You haven't created any albums in your catalog. Create your first album to organize your tracks.
          </p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Your First Album
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <div className="grid gap-4 sm:grid-cols-2">
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => setActiveId(album.id)}
                className={`hover-lift text-left rounded-2xl border p-3 transition-colors ${
                  album.id === activeId ? "border-primary/60 bg-elevated" : "border-border bg-card"
                }`}
              >
                <img src={album.cover} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <div className="mt-3 truncate text-sm font-semibold">{album.title}</div>
                <div className="truncate text-xs text-muted-foreground">{album.genre} · {album.releasedAt ? new Date(album.releasedAt).getFullYear() : new Date().getFullYear()}</div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-start gap-5">
              <img src={active.cover} alt="" className="h-32 w-32 rounded-xl object-cover shadow-card-elevated" />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Album</div>
                <h2 className="mt-1 text-2xl font-black tracking-tight">{active.title}</h2>
                <div className="mt-1 text-sm text-muted-foreground">
                  {active.artist} · {active.genre} · {active.releasedAt ? new Date(active.releasedAt).toLocaleDateString(undefined, { year:"numeric", month:"long", day:"numeric"}) : "Unreleased"}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => activeTracks[0] && player.play(activeTracks[0], activeTracks)} className="inline-flex items-center gap-2 rounded-full bg-primary-gradient px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
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
              {activeTracks.map((track) => {
                const isCurrent = player.current?.id === track.id;
                return (
                  <li key={track.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-elevated ${isCurrent ? "bg-elevated/60" : ""}`}>
                    <div className="w-6 text-center text-xs tabular-nums">
                      {isCurrent ? (
                        <NowPlayingBars playing={player.isPlaying} />
                      ) : (
                        <span className="text-muted-foreground">{track.trackNumber}</span>
                      )}
                    </div>
                    <button onClick={() => player.play(track, activeTracks)} className="grid h-8 w-8 place-items-center rounded-full bg-elevated hover:bg-primary hover:text-primary-foreground transition">
                      <Play className="h-3.5 w-3.5" />
                    </button>
                    <img src={track.cover} alt="" className="h-9 w-9 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-sm font-semibold ${isCurrent ? "text-primary" : ""}`}>
                        {track.title}
                        {isCurrent && <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary"><Volume2 className="h-3 w-3" /> Now playing</span>}
                      </div>
                    </div>
                    <div className="hidden sm:block text-xs tabular-nums text-muted-foreground">{formatNumber(track.plays)}</div>
                    <div className="text-xs tabular-nums text-muted-foreground">{track.duration}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {active && (
        <EditAlbumDialog
          key={active.id}
          open={editOpen}
          onOpenChange={setEditOpen}
          album={active}
          onSave={() => { setEditOpen(false); toast.success("Album updated"); }}
        />
      )}

      <CreateAlbumDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => {
          setCreateOpen(false);
          queryClient.invalidateQueries({ queryKey: ["albums"] });
        }}
      />
    </CreatorShell>
  );
}

function NowPlayingBars({ playing }: { playing: boolean }) {
  return (
    <span className="inline-flex h-4 items-end gap-[2px]">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="w-[3px] rounded-sm bg-primary"
          style={{
            height: playing ? "100%" : "30%",
            animation: playing ? `npc-bars 900ms ease-in-out ${index * 120}ms infinite` : undefined,
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

export function CreateAlbumDialog({
  open, onOpenChange, onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: (newAlbum?: Record<string, unknown>) => void;
}) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Electronic");
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function onFile(f: File | null) {
    setCover(f);
    if (f) setCoverPreview(URL.createObjectURL(f));
    else setCoverPreview(null);
  }

  async function handleCreate() {
    if (!title.trim()) {
      toast.error("Please provide an album title");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("genre", genre);
      formData.append("release_date", releaseDate);
      if (cover) formData.append("cover", cover);

      const res = await apiClient.post<Record<string, unknown>>("/api/albums/", formData as unknown as BodyInit);
      toast.success(`Album "${title}" created successfully!`);
      setTitle("");
      setCover(null);
      setCoverPreview(null);
      onSuccess(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to create album");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create new album</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 rounded-lg bg-elevated border border-border grid place-items-center overflow-hidden">
              {coverPreview ? <img src={coverPreview} alt="" className="h-full w-full object-cover" /> : <Plus className="h-6 w-6 text-muted-foreground" />}
            </div>
            <label className="text-xs text-muted-foreground cursor-pointer rounded-md border border-dashed border-border px-3 py-2 hover:bg-elevated">
              Upload cover image
              <input type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
          <label className="block">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Album Title</div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Midnight Horizon" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Genre</div>
              <select value={genre} onChange={(e) => setGenre(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60">
                {["Electronic","Synthwave","Indie Pop","Lo-Fi","Hip-Hop","House","Ambient","Latin Pop"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Release Date</div>
              <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60" />
            </label>
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-elevated">Cancel</button>
          <button
            disabled={submitting}
            onClick={handleCreate}
            className="rounded-full bg-primary-gradient px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create album"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}