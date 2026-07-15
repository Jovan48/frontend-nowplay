import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, ListMusic, X } from "lucide-react";
import { usePlayer } from "@/lib/player-context";
import { cn } from "@/lib/utils";
import { useState } from "react";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function MusicPlayer() {
  const p = usePlayer();
  const track = p.current;
  const [queueOpen, setQueueOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-xl px-4 py-3">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4">
        {/* Track info */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
            {track && <img src={track.cover} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {track && p.isPlaying && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-primary">● Now Playing</span>
              )}
            </div>
            <div className="truncate text-sm font-semibold">{track?.title ?? "Nothing playing"}</div>
            <div className="truncate text-xs text-muted-foreground">{track?.artist ?? "Pick a track from your library"}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-4 text-muted-foreground">
            <button onClick={() => p.setShuffle(!p.shuffle)} className={cn("transition-colors hover:text-foreground", p.shuffle && "text-primary")} aria-label="Shuffle">
              <Shuffle className="h-4 w-4" />
            </button>
            <button onClick={p.prev} className="transition-colors hover:text-foreground" aria-label="Previous">
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              onClick={p.toggle}
              disabled={!track}
              className="play-button-glow grid h-9 w-9 place-items-center rounded-full bg-foreground text-background disabled:opacity-40"
              aria-label={p.isPlaying ? "Pause" : "Play"}
            >
              {p.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
            </button>
            <button onClick={p.next} className="transition-colors hover:text-foreground" aria-label="Next">
              <SkipForward className="h-5 w-5" />
            </button>
            <button onClick={() => p.setRepeat(!p.repeat)} className={cn("transition-colors hover:text-foreground", p.repeat && "text-primary")} aria-label="Repeat">
              <Repeat className="h-4 w-4" />
            </button>
          </div>
          <div className="flex w-full max-w-md items-center gap-2 text-[10px] tabular-nums text-muted-foreground">
            <span className="w-8 text-right">{fmt(p.progress * (track?.durationSec ?? 0))}</span>
            <div
              className="group relative h-1 flex-1 cursor-pointer rounded-full bg-muted"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const v = (e.clientX - rect.left) / rect.width;
                p.seek(Math.max(0, Math.min(1, v)));
              }}
            >
              <div
                className="h-full rounded-full bg-foreground group-hover:bg-primary transition-colors"
                style={{ width: `${p.progress * 100}%` }}
              />
            </div>
            <span className="w-8">{track?.duration ?? "0:00"}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center justify-end gap-3 text-muted-foreground">
          <div className="relative">
            <button
              onClick={() => setQueueOpen((v) => !v)}
              className={cn("hover:text-foreground transition-colors", queueOpen && "text-primary")}
              aria-label="Queue"
            >
              <ListMusic className="h-4 w-4" />
            </button>
            {queueOpen && (
              <div className="absolute bottom-10 right-0 z-50 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-card-elevated">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div>
                    <div className="text-sm font-bold text-foreground">Queue</div>
                    <div className="text-[11px] text-muted-foreground">{p.queue.length} track{p.queue.length === 1 ? "" : "s"}</div>
                  </div>
                  <button onClick={() => setQueueOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {p.queue.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-muted-foreground">Queue is empty.</div>
                  ) : (
                    p.queue.map((q) => {
                      const isCurrent = p.current?.id === q.id;
                      return (
                        <div
                          key={q.id}
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2 text-left hover:bg-elevated",
                            isCurrent && "bg-elevated/60",
                          )}
                        >
                          <button onClick={() => p.jumpTo(q.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                            <img src={q.cover} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
                            <div className="min-w-0">
                              <div className={cn("truncate text-xs font-semibold", isCurrent ? "text-primary" : "text-foreground")}>{q.title}</div>
                              <div className="truncate text-[11px] text-muted-foreground">{q.artist}</div>
                            </div>
                          </button>
                          <span className="text-[10px] tabular-nums text-muted-foreground">{q.duration}</span>
                          <button
                            onClick={() => p.removeFromQueue(q.id)}
                            className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                            aria-label="Remove"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
          <Volume2 className="h-4 w-4" />
          <div className="h-1 w-24 rounded-full bg-muted">
            <div className="h-full rounded-full bg-foreground" style={{ width: `${p.volume * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}