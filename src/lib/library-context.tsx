import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { albums as seedAlbums, tracks as seedTracks, type Album, type Track } from "./mock-data";

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

  useEffect(() => { setState(load()); }, []);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<LibraryValue>(() => {
    const albums: Album[] = seedAlbums.map((a) => ({ ...a, ...(state.overrides[a.id] ?? {}) }));
    const merged: Track[] = [...seedTracks, ...state.extraTracks].map((t) => {
      const album = albums.find((a) => a.id === t.albumId);
      if (!album) return t;
      // If album cover was overridden and this track didn't ship a custom cover, sync it.
      const override = state.overrides[album.id];
      const cover = override?.cover ?? t.cover;
      return { ...t, cover, album: album.title, artist: album.artist };
    });

    return {
      albums,
      tracks: merged,
      addTrack: ({ title, albumId, genre, trackNumber, coverDataUrl, durationSec }) => {
        const album = seedAlbums.find((a) => a.id === albumId)!;
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
          artist: album.artist,
          album: album.title,
          cover: coverDataUrl ?? album.cover,
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
    };
  }, [state]);

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used within LibraryProvider");
  return ctx;
}