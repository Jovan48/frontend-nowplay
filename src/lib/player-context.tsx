import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Track } from "./mock-data";

type PlayerContextValue = {
  current: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number; // 0..1
  shuffle: boolean;
  repeat: boolean;
  volume: number; // 0..1
  play: (track: Track, queue?: Track[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  setShuffle: (v: boolean) => void;
  setRepeat: (v: boolean) => void;
  setVolume: (v: number) => void;
  seek: (v: number) => void;
  jumpTo: (trackId: string) => void;
  removeFromQueue: (trackId: string) => void;
};

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const offsetRef = useRef<number>(0);

  const tick = useCallback(() => {
    if (!current) return;
    const elapsed = (performance.now() - startRef.current) / 1000 + offsetRef.current;
    const p = Math.min(1, elapsed / current.durationSec);
    setProgress(p);
    if (p >= 1) {
      if (repeat) { offsetRef.current = 0; startRef.current = performance.now(); }
      else { doNext(); return; }
    }
    rafRef.current = requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, repeat]);

  useEffect(() => {
    if (isPlaying && current) {
      startRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isPlaying, current, tick]);

  function doNext() {
    if (!current || queue.length === 0) { setPlaying(false); return; }
    const idx = queue.findIndex((t) => t.id === current.id);
    let nextIdx = shuffle ? Math.floor(Math.random() * queue.length) : idx + 1;
    if (nextIdx >= queue.length) nextIdx = 0;
    const nxt = queue[nextIdx];
    setCurrent(nxt);
    offsetRef.current = 0;
    setProgress(0);
    startRef.current = performance.now();
  }

  const value = useMemo<PlayerContextValue>(() => ({
    current, queue, isPlaying, progress, shuffle, repeat, volume,
    play: (track, q) => {
      setCurrent(track);
      if (q) setQueue(q);
      else if (queue.length === 0) setQueue([track]);
      offsetRef.current = 0;
      setProgress(0);
      setPlaying(true);
    },
    toggle: () => {
      if (!current) return;
      if (isPlaying) {
        offsetRef.current += (performance.now() - startRef.current) / 1000;
        setPlaying(false);
      } else {
        startRef.current = performance.now();
        setPlaying(true);
      }
    },
    next: doNext,
    prev: () => {
      if (!current) return;
      const idx = queue.findIndex((t) => t.id === current.id);
      const p = idx <= 0 ? queue.length - 1 : idx - 1;
      if (queue[p]) { setCurrent(queue[p]); offsetRef.current = 0; setProgress(0); startRef.current = performance.now(); }
    },
    setShuffle, setRepeat, setVolume,
    seek: (v) => { if (current) { offsetRef.current = v * current.durationSec; startRef.current = performance.now(); setProgress(v); } },
    jumpTo: (id) => {
      const t = queue.find((x) => x.id === id);
      if (!t) return;
      setCurrent(t);
      offsetRef.current = 0;
      setProgress(0);
      startRef.current = performance.now();
      setPlaying(true);
    },
    removeFromQueue: (id) => {
      setQueue((q) => q.filter((t) => t.id !== id));
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [current, queue, isPlaying, progress, shuffle, repeat, volume]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}