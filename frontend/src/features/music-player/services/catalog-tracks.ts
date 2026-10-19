import catalog from "@/data/music-catalog";
import {
  getSongYouTubeVideoId,
  type SongPlaybackSource,
} from "./player-service";
import type { MusicTrack } from "../types/player-types";

type TrackSource = SongPlaybackSource & {
  id: string;
  title: string;
  artist_ids?: string[];
  cover_url?: string | null;
  image_url?: string | null;
  duration_seconds?: number | null;
};

export function normalizeTracks(
  songs: readonly TrackSource[],
  artists: readonly { id: string; name: string }[],
): MusicTrack[] {
  const artistNames = new Map(
    artists.map((artist) => [artist.id, artist.name]),
  );
  return songs.map((song) => ({
    id: song.id,
    title: song.title,
    artistName:
      song.artist_ids
        ?.map((id) => artistNames.get(id))
        .filter(Boolean)
        .join(", ") || "ไม่ทราบศิลปิน",
    coverUrl: song.cover_url ?? song.image_url ?? null,
    durationSeconds:
      typeof song.duration_seconds === "number" &&
        Number.isFinite(song.duration_seconds) &&
        song.duration_seconds > 0
        ? song.duration_seconds
        : null,
    videoId: getSongYouTubeVideoId(song),
  }));
}

export const allSongs = normalizeTracks(catalog.songs, catalog.artists);
export const songsById = new Map(allSongs.map((song) => [song.id, song]));
