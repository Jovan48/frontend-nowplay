import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Album, Track } from "./types";

type AlbumOverride = Partial<Pick<Album, "title" | "genre" | "cover" | "releasedAt">>;

type LibraryValue = {
  albums: Album[];
  tracks: Track[];
  addTrack: (input: {
    title: string;
    albumId: string;
    genre: string;
    trackNumber: number;
    coverDataUrl?: string;
    durationSec?: number;
  }) => Track;
  updateAlbum: (id: string, patch: AlbumOverride) => void;
};

const LibraryContext = createContext<LibraryValue | undefined>(undefined);

const LS_KEY = "npc.library.v1";

type Persisted = {
  overrides: Record<string, AlbumOverride>;
  extraTracks: Track[];
};

function load(): Persisted {
  if (typeof window === "undefined") return { overrides: {}, extraTracks: [] };
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return { overrides: {}, extraTracks: [] };
    return JSON.parse(raw) as Persisted;
  } catch {
    return { overrides: {}, extraTracks: [] };
  }
}

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>({ overrides: {}, extraTracks: [] });

  useEffect(() => {
    setState(load());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<LibraryValue>(() => ({
    albums: [],
    tracks: state.extraTracks,
    addTrack: ({ title, albumId, genre, trackNumber, coverDataUrl, durationSec }) => {
      const durSec = durationSec ?? 210;
      const min = Math.floor(durSec / 60);
      const sec = (durSec % 60).toString().padStart(2, "0");
      const t: Track = {
        id: `u_${Date.now()}`,
        title,
        albumId,
        trackNumber,
        durationSec: durSec,
        duration: `${min}:${sec}`,
        plays: 0,
        genre,
        artist: "Backend catalog",
        album: "Imported album",
        cover: coverDataUrl ?? "",
        releasedAt: new Date().toISOString().slice(0, 10),
      };
      setState((s) => ({
        overrides: coverDataUrl
          ? { ...s.overrides, [albumId]: { ...(s.overrides[albumId] ?? {}), cover: coverDataUrl } }
          : s.overrides,
        extraTracks: [...s.extraTracks, t],
      }));
      return t;
    },
    updateAlbum: (id, patch) => {
      setState((s) => ({ ...s, overrides: { ...s.overrides, [id]: { ...(s.overrides[id] ?? {}), ...patch } } }));
    },
  }), [state]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}