import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { UploadCloud, Music, Image as ImageIcon, CheckCircle2, Plus } from "lucide-react";
import { CreatorShell } from "@/components/creator-shell";
import { apiClient } from "@/lib/api-client";
import { CreateAlbumDialog } from "@/routes/_authenticated/albums";
import { toast } from "sonner";

type AlbumOption = {
  id: string;
  title: string;
};

export const Route = createFileRoute("/_authenticated/upload")({
  head: () => ({ meta: [{ title: "Upload — Now Play for Creators" }] }),
  component: UploadPage,
});

function ensureArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data && Array.isArray((data as { results: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

function UploadPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: albumsData } = useQuery({
    queryKey: ["albums"],
    queryFn: () => apiClient.get<unknown>("/api/albums/"),
  });
  const albums = ensureArray<Record<string, unknown>>(albumsData).map((album) => ({ id: String(album.id ?? ""), title: String(album.title ?? "Untitled album") }));
  const [releaseType, setReleaseType] = useState<"single" | "album">("single");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Electronic");
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [albumId, setAlbumId] = useState("");
  const [trackNumber, setTrackNumber] = useState(1);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [createAlbumOpen, setCreateAlbumOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (albums.length && !albumId) setAlbumId(albums[0].id);
  }, [albums, albumId]);

  async function onCoverChange(f: File | null) {
    setCover(f);
    if (f) setCoverPreview(URL.createObjectURL(f));
    else setCoverPreview(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const selectedFile = e.dataTransfer.files?.[0];
    if (selectedFile && selectedFile.type.startsWith("audio/")) setFile(selectedFile);
    else toast.error("Please drop an audio file");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return toast.error("Please add an audio file");
    if (!title.trim()) return toast.error("Please add a title");
    if (releaseType === "album" && !albumId) return toast.error("Please select an album or create a new one");
    setUploading(true); setProgress(0);
    try {
      for (let value = 0; value <= 100; value += 5) {
        await new Promise((resolve) => setTimeout(resolve, 40));
        setProgress(value);
      }
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("genre", genre);
      formData.append("release_type", releaseType);
      if (releaseType === "album" && albumId) {
        formData.append("albumId", albumId);
        formData.append("trackNumber", String(trackNumber));
      } else {
        formData.append("trackNumber", "1");
      }
      if (file) formData.append("file", file);
      if (cover) formData.append("cover", cover);
      await apiClient.post("/api/tracks/", formData as unknown as BodyInit);
      setProgress(100);
      toast.success(`"${title}" uploaded as a ${releaseType}!`);
      setTimeout(() => navigate({ to: "/library" }), 700);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <CreatorShell>
      <div className="max-w-5xl">
        <h1 className="text-3xl font-black tracking-tight">Upload Music</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add a new track to your catalog. Drag files in or browse.</p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Left: dropzone + cover */}
          <div className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
                dragging ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-elevated"
              }`}
            >
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="mt-4 text-sm font-semibold">Drop your MP3 here</div>
              <div className="mt-1 text-xs text-muted-foreground">or click to browse — MP3, WAV, FLAC up to 100MB</div>
              {file && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-elevated px-3 py-1.5 text-xs">
                  <Music className="h-3.5 w-3.5 text-primary" /> {file.name}
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="audio/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>

            <label className="block rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-elevated overflow-hidden">
                  {coverPreview ? <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">Cover Artwork</div>
                  <div className="text-xs text-muted-foreground">JPG or PNG, 1400×1400 recommended</div>
                </div>
              </div>
              <input type="file" accept="image/*" hidden onChange={(e) => onCoverChange(e.target.files?.[0] ?? null)} />
              <div className="mt-3 grid place-items-center rounded-md border border-dashed border-border py-3 text-xs text-muted-foreground cursor-pointer hover:bg-elevated">
                Click to choose image
              </div>
            </label>
          </div>

          {/* Right: metadata */}
          <div className="space-y-4">
            <div className="grid gap-4 rounded-2xl border border-border bg-card p-6">
              {/* Release Type Toggle */}
              <Field label="Release Type">
                <div className="mt-1 flex rounded-lg bg-elevated p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => setReleaseType("single")}
                    className={`flex-1 rounded-md py-2 text-xs font-bold transition ${
                      releaseType === "single"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    🎵 Single
                  </button>
                  <button
                    type="button"
                    onClick={() => setReleaseType("album")}
                    className={`flex-1 rounded-md py-2 text-xs font-bold transition ${
                      releaseType === "album"
                        ? "bg-card text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    💿 Album Track
                  </button>
                </div>
              </Field>

              <Field label="Song title">
                <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120}
                  className="h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. Skyline Drift" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Genre">
                  <select value={genre} onChange={(e) => setGenre(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none">
                    {["Electronic","Synthwave","Indie Pop","Lo-Fi","Hip-Hop","House","Ambient","Latin Pop"].map((g)=>
                      <option key={g}>{g}</option>
                    )}
                  </select>
                </Field>
                <Field label="Release date">
                  <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none" />
                </Field>
              </div>

              {releaseType === "album" ? (
                <div className="grid gap-4 sm:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
                  <Field label="Album">
                    <div className="flex gap-2">
                      <select value={albumId} onChange={(e) => setAlbumId(e.target.value)} className="h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none">
                        {albums.length === 0 && <option value="">No albums available</option>}
                        {albums.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
                      </select>
                      <button
                        type="button"
                        onClick={() => setCreateAlbumOpen(true)}
                        className="inline-flex items-center gap-1 shrink-0 rounded-lg border border-border bg-elevated px-3 h-11 text-xs font-semibold hover:bg-card transition"
                        title="Create new album"
                      >
                        <Plus className="h-4 w-4" /> New
                      </button>
                    </div>
                  </Field>
                  <Field label="Track #">
                    <input type="number" min={1} value={trackNumber} onChange={(e) => setTrackNumber(Number(e.target.value))}
                      className="h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm outline-none" />
                  </Field>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-elevated/40 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Single Release Mode:</span> This track will be published as a standalone single.
                </div>
              )}
            </div>

            {(uploading || progress > 0) && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{uploading ? "Uploading…" : "Upload complete"}</span>
                  <span className="tabular-nums text-muted-foreground">{progress}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary-gradient transition-all" style={{ width: `${progress}%` }} />
                </div>
                {!uploading && progress === 100 && (
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-primary">
                    <CheckCircle2 className="h-4 w-4" /> Redirecting to your library…
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => navigate({ to: "/library" })} className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-elevated">
                Cancel
              </button>
              <button disabled={uploading} type="submit" className="rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110 transition disabled:opacity-50">
                {uploading ? "Uploading…" : "Publish track"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <CreateAlbumDialog
        open={createAlbumOpen}
        onOpenChange={setCreateAlbumOpen}
        onSuccess={(newAlbum) => {
          setCreateAlbumOpen(false);
          queryClient.invalidateQueries({ queryKey: ["albums"] });
          if (newAlbum?.id) {
            setAlbumId(String(newAlbum.id));
          }
        }}
      />
    </CreatorShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}