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

// Deterministic pseudo-covers using CSS gradients encoded as data URIs.
// Keeps zero external deps and looks polished at any size.
function cover(a: string, b: string, label: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/>
    </linearGradient></defs>
    <rect width='400' height='400' fill='url(#g)'/>
    <text x='24' y='372' font-family='Inter,sans-serif' font-size='28' font-weight='800'
      fill='rgba(255,255,255,0.92)' letter-spacing='-0.5'>${label}</text>
    <circle cx='320' cy='90' r='42' fill='rgba(255,255,255,0.12)'/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const albums: Album[] = [
  {
    id: "a1",
    title: "Midnight Frequencies",
    artist: "Nova Reyes",
    cover: cover("#1DB954", "#064e2b", "Midnight Freq."),
    genre: "Electronic",
    releasedAt: "2026-03-14",
    trackIds: ["t1", "t2", "t3", "t4"],
  },
  {
    id: "a2",
    title: "Neon Cathedral",
    artist: "Nova Reyes",
    cover: cover("#8b5cf6", "#1e1b4b", "Neon Cathedral"),
    genre: "Synthwave",
    releasedAt: "2025-11-02",
    trackIds: ["t5", "t6", "t7"],
  },
  {
    id: "a3",
    title: "Analog Hearts",
    artist: "Nova Reyes",
    cover: cover("#f97316", "#7c2d12", "Analog Hearts"),
    genre: "Indie Pop",
    releasedAt: "2025-06-21",
    trackIds: ["t8", "t9", "t10"],
  },
  {
    id: "a4",
    title: "Sessions Vol. 1",
    artist: "Nova Reyes",
    cover: cover("#06b6d4", "#0c4a6e", "Sessions Vol.1"),
    genre: "Lo-Fi",
    releasedAt: "2024-12-08",
    trackIds: ["t11", "t12"],
  },
];

export const tracks: Track[] = [
  { id: "t1",  title: "Skyline Drift",        albumId: "a1", trackNumber: 1, durationSec: 214, plays: 1_284_910, genre: "Electronic" },
  { id: "t2",  title: "Afterhours",           albumId: "a1", trackNumber: 2, durationSec: 198, plays: 942_100,   genre: "Electronic" },
  { id: "t3",  title: "Signal Bloom",         albumId: "a1", trackNumber: 3, durationSec: 236, plays: 651_284,   genre: "Electronic" },
  { id: "t4",  title: "Frequency 528",        albumId: "a1", trackNumber: 4, durationSec: 271, plays: 502_411,   genre: "Electronic" },
  { id: "t5",  title: "Cathedral Doors",      albumId: "a2", trackNumber: 1, durationSec: 245, plays: 812_009,   genre: "Synthwave" },
  { id: "t6",  title: "Chrome Rain",          albumId: "a2", trackNumber: 2, durationSec: 218, plays: 604_552,   genre: "Synthwave" },
  { id: "t7",  title: "Ultraviolet",          albumId: "a2", trackNumber: 3, durationSec: 262, plays: 448_010,   genre: "Synthwave" },
  { id: "t8",  title: "Paper Tigers",         albumId: "a3", trackNumber: 1, durationSec: 189, plays: 388_120,   genre: "Indie Pop" },
  { id: "t9",  title: "Slow Weekends",        albumId: "a3", trackNumber: 2, durationSec: 205, plays: 274_902,   genre: "Indie Pop" },
  { id: "t10", title: "Analog Hearts",        albumId: "a3", trackNumber: 3, durationSec: 232, plays: 219_884,   genre: "Indie Pop" },
  { id: "t11", title: "Downtown 3am",         albumId: "a4", trackNumber: 1, durationSec: 176, plays: 148_311,   genre: "Lo-Fi" },
  { id: "t12", title: "Rooftop Study",        albumId: "a4", trackNumber: 2, durationSec: 192, plays: 121_450,   genre: "Lo-Fi" },
].map((t) => {
  const album = albums.find((a) => a.id === t.albumId)!;
  const min = Math.floor(t.durationSec / 60);
  const sec = (t.durationSec % 60).toString().padStart(2, "0");
  return {
    ...t,
    artist: album.artist,
    album: album.title,
    cover: album.cover,
    duration: `${min}:${sec}`,
    releasedAt: album.releasedAt,
  };
});

export const totalPlays = tracks.reduce((s, t) => s + t.plays, 0);
export const topSong = tracks.slice().sort((a, b) => b.plays - a.plays)[0];

export const monthlyListeners = [
  { month: "Jan", listeners: 42_000, plays: 190_000 },
  { month: "Feb", listeners: 51_000, plays: 232_000 },
  { month: "Mar", listeners: 68_000, plays: 301_000 },
  { month: "Apr", listeners: 74_000, plays: 358_000 },
  { month: "May", listeners: 88_000, plays: 412_000 },
  { month: "Jun", listeners: 102_000, plays: 496_000 },
  { month: "Jul", listeners: 121_000, plays: 588_000 },
  { month: "Aug", listeners: 138_000, plays: 641_000 },
  { month: "Sep", listeners: 154_000, plays: 712_000 },
  { month: "Oct", listeners: 172_000, plays: 802_000 },
  { month: "Nov", listeners: 188_000, plays: 878_000 },
  { month: "Dec", listeners: 214_000, plays: 964_000 },
];

export const topCountries = [
  { country: "United States", plays: 1_982_301 },
  { country: "United Kingdom", plays: 1_121_820 },
  { country: "Germany", plays: 902_540 },
  { country: "Brazil", plays: 812_100 },
  { country: "Japan", plays: 674_300 },
];

export const notifications = [
  { id: "n1", text: "Skyline Drift passed 1M plays 🎉", time: "2h" },
  { id: "n2", text: "New follower milestone: 50,000", time: "1d" },
  { id: "n3", text: "Midnight Frequencies added to editorial playlist", time: "3d" },
];

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// Admin mock: extra creators for admin panel.
export const platformCreators = [
  { id: "c1", name: "Nova Reyes",     genre: "Electronic", releases: 4,  plays: totalPlays,  status: "Active" as const },
  { id: "c2", name: "Kai Ito",        genre: "Hip-Hop",    releases: 3,  plays: 812_442,     status: "Active" as const },
  { id: "c3", name: "Sable & Gold",   genre: "Indie",      releases: 2,  plays: 421_809,     status: "Active" as const },
  { id: "c4", name: "DJ Umbra",       genre: "House",      releases: 6,  plays: 1_204_120,   status: "Active" as const },
  { id: "c5", name: "Marisol",        genre: "Latin Pop",  releases: 5,  plays: 998_331,     status: "Review" as const },
  { id: "c6", name: "Fieldnotes",     genre: "Ambient",    releases: 2,  plays: 189_402,     status: "Active" as const },
];