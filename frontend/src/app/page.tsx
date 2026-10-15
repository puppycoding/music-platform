"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import catalog from "../data/music-catalog";
import { useMusicPlayer } from "../components/music-player/providers/MusicPlayerProvider";

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

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
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
   ไอคอนสามจุด
========================= */

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

/* =========================
   การ์ดเพลง
   คลิกการ์ดเพื่อเล่นเพลง
   ปุ่มสามจุดเปิดเมนูเพิ่มเติม
========================= */


function SongCard({
  song,
  activeMenu,
  setActiveMenu,
  showToast,
}: {
  song: Song;
  activeMenu: string | null;
  setActiveMenu: (id: string | null) => void;
  showToast: (message: string) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const { playSong, addToQueue } = useMusicPlayer();

  const coverUrl = getCoverUrl(song);
  const artistName = getArtistName(song);
  const isMenuOpen = activeMenu === song.id;

  function handlePlaySong() {
    playSong(song.id);
    setActiveMenu(null);
  }

  function handleAddToQueue(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    try {
      addToQueue(song.id);
      setActiveMenu(null);
      showToast("เพิ่มเพลงเข้าคิวแล้ว");
    } catch (error) {
      console.error("เพิ่มเพลงเข้าคิวไม่สำเร็จ:", error);
      showToast("เพิ่มเพลงเข้าคิวไม่สำเร็จ");
    }
  }

  async function handleCopyTitle() {
    try {
      await navigator.clipboard.writeText(song.title);
      showToast("คัดลอกชื่อเพลงแล้ว");
    } catch {
      showToast("คัดลอกไม่สำเร็จ กรุณาลองอีกครั้ง");
    }

    setActiveMenu(null);
  }

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`เล่นเพลง ${song.title}`}
      onClick={handlePlaySong}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          handlePlaySong();
        }
      }}
      className="group relative min-w-0 cursor-pointer rounded-2xl border border-border bg-surface p-3 transition hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {/* รูปปกเพลง: แยก overflow-hidden ไว้เฉพาะกรอบรูป */}
      <div className="relative mx-auto mb-3 aspect-square w-full max-w-36">
        <div className="absolute inset-0 overflow-hidden rounded-xl bg-surface-hover">
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
        </div>

        {/* ปุ่มสามจุดและเมนู */}
        <div
          className="absolute bottom-2 right-2 z-50"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label={`ตัวเลือกเพิ่มเติมสำหรับเพลง ${song.title}`}
            aria-expanded={isMenuOpen}
            title="ตัวเลือกเพิ่มเติม"
            onClick={(event) => {
              event.stopPropagation();
              setActiveMenu(isMenuOpen ? null : song.id);
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/75 text-white shadow-lg backdrop-blur-sm transition hover:scale-110 hover:bg-primary ${
              isMenuOpen
                ? "bg-primary"
                : "md:opacity-0 md:group-hover:opacity-100"
            }`}
          >
            <MoreIcon />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface py-1 text-foreground shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleAddToQueue}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-surface-hover"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                >
                  <path d="M9 6h12M9 12h12M9 18h12" />
                  <path d="M3 6h.01M3 12h.01M3 18h.01" />
                  <path d="M17 15v6m-3-3h6" />
                </svg>
                เพิ่มเข้าคิว
              </button>

              <button
                type="button"
                onClick={() => void handleCopyTitle()}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition hover:bg-surface-hover"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4 shrink-0"
                  aria-hidden="true"
                >
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                </svg>
                คัดลอกชื่อเพลง
              </button>

              {song.artist_ids[0] && (
                <Link
                  href={`/artists/${encodeURIComponent(song.artist_ids[0])}?returnTo=%2F`}
                  onClick={(event) => {
                    event.stopPropagation();
                    sessionStorage.setItem(
                      "artistDetailReturnTo",
                      window.location.pathname + window.location.search
                    );
                    setActiveMenu(null);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm transition hover:bg-surface-hover"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4 shrink-0"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                  </svg>
                  ดูเพลงของศิลปิน
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ชื่อเพลงและศิลปิน */}
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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    // สุ่มเพลง 8 เพลงเมื่อหน้า Home เปิดขึ้น
    setSongs(getRandomSongs(catalog.songs, 8));
  }, []);

  function shuffleSongs() {
    setSongs(getRandomSongs(catalog.songs, 8));
    setActiveMenu(null);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  }

  return (
    <main
      className="min-h-screen bg-background text-foreground"
      onClick={() => {
        if (activeMenu) setActiveMenu(null);
      }}
    >
      {/* Header */}
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
              <SongCard
                key={song.id}
                song={song}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                showToast={showToast}
              />
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

      {/* Toast แจ้งเตือน */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-28 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-border bg-surface px-5 py-3 text-sm text-foreground shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          {toast}
        </div>
      )}
    </main>
  );
}