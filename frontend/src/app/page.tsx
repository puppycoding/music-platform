"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import catalog from "../data/music-catalog";
import { useMusicPlayer } from "../components/music/MusicPlayerProvider";

const artists = catalog.artists;

type Song = (typeof catalog.songs)[number];
type Album = (typeof catalog.albums)[number];

type SongData = Song & {
  cover_url?: string | null;
  cover_image?: string | null;
  image_url?: string | null;
  album_cover_url?: string | null;
  cover?: string | null;
  album_id?: string | null;
  album_ids?: string[] | null;
  album?:
    | string
    | {
        id?: string;
        cover_url?: string | null;
      }
    | null;
  album_title?: string | null;
  album_name?: string | null;
  providers?: {
    youtube?: {
      url?: string | null;
      search_url?: string | null;
    };
    spotify?: {
      url?: string | null;
      search_url?: string | null;
    };
  };
  listen_url?: string | null;
};

type AlbumData = Album & {
  cover_url?: string | null;
  title?: string;
  id: string;
};

/* =========================
   สุ่มเพลง
========================= */

function getRandomSongs<T>(songs: T[], count: number): T[] {
  const shuffled = [...songs];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/* =========================
   หารูปปกเพลง
========================= */

function getCoverUrl(song: Song): string | null {
  const item = song as SongData;

  const directCover =
    item.cover_url ||
    item.cover_image ||
    item.image_url ||
    item.album_cover_url ||
    (typeof item.cover === "string" ? item.cover : null) ||
    (typeof item.album === "object" && item.album
      ? item.album.cover_url
      : null);

  if (directCover) return directCover;

  const albumIds = [
    item.album_id,
    ...(item.album_ids ?? []),
    typeof item.album === "string" ? item.album : null,
    typeof item.album === "object" && item.album
      ? item.album.id
      : null,
  ].filter((id): id is string => Boolean(id));

  const albums = catalog.albums as AlbumData[];

  for (const albumId of albumIds) {
    const album = albums.find((entry) => entry.id === albumId);

    if (album?.cover_url) return album.cover_url;
  }

  const albumName = item.album_title || item.album_name;

  if (albumName) {
    const album = albums.find(
      (entry) =>
        entry.title?.trim().toLowerCase() ===
        albumName.trim().toLowerCase()
    );

    if (album?.cover_url) return album.cover_url;
  }

  return null;
}

/* =========================
   หาชื่อศิลปิน
========================= */

function getArtistName(song: Song): string {
  const artistNames = song.artist_ids
    .map(
      (artistId) =>
        catalog.artists.find((artist) => artist.id === artistId)?.name
    )
    .filter((name): name is string => Boolean(name));

  return artistNames.join(", ") || "ไม่ทราบศิลปิน";
}

/* =========================
   การ์ดเพลง
   คลิกตรงไหนก็เล่นเพลงได้
========================= */

function SongCard({ song }: { song: Song }) {
  const [imageError, setImageError] = useState(false);
  const { playSong } = useMusicPlayer();

  const coverUrl = getCoverUrl(song);
  const artistName = getArtistName(song);

  function handlePlaySong() {
    playSong(song.id);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`เล่นเพลง ${song.title}`}
      onClick={handlePlaySong}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handlePlaySong();
        }
      }}
      className="group min-w-0 cursor-pointer rounded-2xl border border-border bg-surface p-3 transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div className="relative mx-auto mb-3 aspect-square w-full max-w-36 overflow-hidden rounded-xl bg-surface-hover">
        {coverUrl && !imageError ? (
          <img
            src={coverUrl}
            alt={`ปกเพลง ${song.title}`}
            className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-950 via-purple-900 to-surface-hover">
            <span className="px-3 text-center text-4xl font-bold text-primary">
              {song.title.charAt(0)}
            </span>
          </div>
        )}

        <button
          type="button"
          aria-label={`เล่นเพลง ${song.title}`}
          onClick={(event) => {
            event.stopPropagation();
            handlePlaySong();
          }}
          className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg text-white shadow-lg transition hover:scale-110 hover:bg-primary-hover md:opacity-0 md:group-hover:opacity-100"
        >
          ▶
        </button>
      </div>

      <h3 className="truncate font-semibold" title={song.title}>
        {song.title}
      </h3>

      <p className="mt-1 truncate text-sm text-muted" title={artistName}>
        {artistName}
      </p>
    </article>
  );
}

/* =========================
   การ์ดศิลปิน
   คลิกเพื่อไปหน้ารายละเอียดศิลปิน
========================= */

function ArtistCard({
  artist,
}: {
  artist: (typeof catalog.artists)[number];
}) {
  const [imageError, setImageError] = useState(false);

  const showImage = Boolean(artist.image_url) && !imageError;

  return (
    <Link
      href={`/artists/${encodeURIComponent(artist.id)}?returnTo=%2F`}
      onClick={() => {
        sessionStorage.setItem(
          "artistDetailReturnTo",
          window.location.pathname + window.location.search
        );
      }}
      className="block min-w-0 rounded-2xl border border-border bg-surface p-4 transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`ดูรายละเอียดศิลปิน ${artist.name}`}
    >
      <div className="relative mx-auto mb-3 aspect-square w-full max-w-28 overflow-hidden rounded-full bg-gradient-to-br from-violet-950 via-purple-900 to-surface-hover">
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-primary">
          {artist.name.charAt(0)}
        </div>

        {showImage && (
          <img
            src={artist.image_url}
            alt={`รูปศิลปิน ${artist.name}`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      <p
        className="truncate text-center font-semibold"
        title={artist.name}
      >
        {artist.name}
      </p>

      <p className="mt-1 text-center text-sm text-muted">ศิลปิน</p>
    </Link>
  );
}

/* =========================
   หน้า Home
========================= */

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    // สุ่มเพลง 8 เพลงเมื่อหน้า Home เปิดขึ้น
    setSongs(getRandomSongs(catalog.songs, 8));
  }, []);

  function shuffleSongs() {
    setSongs(getRandomSongs(catalog.songs, 8));
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-5 py-4 md:px-10">
        <div>
          <p className="text-sm text-muted">ยินดีต้อนรับสู่</p>
          <h1 className="text-lg font-semibold">Music Platform</h1>
        </div>

        <button
          type="button"
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          เข้าสู่ระบบ
        </button>
      </header>

      <div className="mx-auto max-w-6xl space-y-12 px-5 py-10 pb-32 md:px-10">
        {/* Hero */}
        <section
          id="home"
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-violet-950 via-purple-950 to-background p-8 md:p-12"
        >
          <div className="relative z-10 max-w-xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
              Discover your sound
            </p>

            <h2 className="text-4xl font-bold leading-tight md:text-6xl">
              เพลงที่ใช่
              <br />
              ในวันที่เป็นคุณ
            </h2>

            <p className="mt-5 max-w-md leading-7 text-muted">
              ค้นพบศิลปินและเพลงโปรดของคุณ
              รวมเพลงที่ชอบไว้ในพื้นที่ของคุณเอง
            </p>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("songs")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="mt-8 rounded-full bg-primary px-7 py-3 font-semibold text-white transition hover:bg-primary-hover"
            >
              สำรวจเพลง
            </button>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
        </section>

        {/* เพลงที่น่าสนใจ */}
        <section id="songs">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-sm text-primary">MADE FOR YOU</p>

              <h2 className="text-2xl font-bold md:text-3xl">
                เพลงที่น่าสนใจ
              </h2>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <p className="text-sm text-muted">{songs.length} เพลง</p>

              <button
                type="button"
                onClick={shuffleSongs}
                className="rounded-full border border-border px-3 py-2 text-sm transition hover:bg-surface-hover"
                title="สุ่มเพลงใหม่"
              >
                <span aria-hidden="true">🔀</span> สุ่มใหม่
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {songs.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        </section>

        {/* ศิลปินที่คุณอาจชอบ */}
        <section id="artists" className="pb-8">
          <p className="mb-2 text-sm text-primary">ARTISTS</p>

          <h2 className="mb-6 text-2xl font-bold md:text-3xl">
            ศิลปินที่คุณอาจชอบ
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}