/**
 * Types สำหรับ Music Platform
 * ไฟล์: src/data/music-catalog/types.ts
 */

/* =========================
   Artist
========================= */

export interface Artist {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  image_url?: string;
  bio?: string;
  description?: string;
  genres?: string[];
  country?: string;
  social_links?: Record<string, string>;
  [key: string]: unknown;
}

/* =========================
   Album
========================= */

export interface Album {
  id: string;
  title: string;
  artist_id?: string;
  artist_name?: string;
  release_date?: string;
  release_year?: number;
  cover?: string;
  cover_url?: string;
  image?: string;
  image_url?: string;
  total_tracks?: number;
  album_type?: string;
  genres?: string[];
  [key: string]: unknown;
}

/* =========================
   Song
========================= */

export interface Song {
  id: string;
  title: string;
  artist_id?: string;
  artist_name?: string;
  album_id?: string | null;
  album_title?: string | null;
  duration?: number;
  duration_seconds?: number;
  duration_ms?: number;
  release_date?: string;
  release_year?: number;
  genre?: string;
  genres?: string[];
  cover?: string;
  cover_url?: string;
  image?: string;
  image_url?: string;
  youtube_url?: string;
  youtube_id?: string;
  youtube_direct_link?: string;
  spotify_url?: string;
  spotify_id?: string;
  lyrics?: string;
  [key: string]: unknown;
}

/* =========================
   Data Quality
========================= */

export interface MusicCatalogDataQuality {
  songs_total: number;
  artists_total: number;
  albums_total: number;
  [key: string]: unknown;
}

/* =========================
   Music Catalog
========================= */

export interface MusicCatalog {
  artists: Artist[];
  albums: Album[];
  songs: Song[];
  data_quality: MusicCatalogDataQuality;
}