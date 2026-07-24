export type Track = {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumId: string;
  cover: string;
  duration: string;
  durationSec: number;
  plays: number;
  genre: string;
  releasedAt: string;
  trackNumber: number;
};

export type Album = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  genre: string;
  releasedAt: string;
  trackIds: string[];
};
