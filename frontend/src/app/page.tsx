"use client";

import { sampleItems as getRandomSongs } from "@/lib/random";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import catalog from "../data/music-catalog";
import { useMusicPlayer } from "@/features/music-player";

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
  album?: string | { id?: string; cover_url?: string | null } | null;
  album_title?: string | null;
  album_name?: string | null;
};

type AlbumData = Album & {
  cover_url?: string | null;
  title?: string;
  id: string;
};

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
    typeof item.album === "object" && item.album ? item.album.id : null,
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
        entry.title?.trim().toLowerCase() === albumName.trim().toLowerCase(),
    );

    if (album?.cover_url) return album.cover_url;
  }

  return null;
}

function getArtistName(song: Song): string {
  const names = song.artist_ids
    .map((id) => catalog.artists.find((artist) => artist.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return names.join(", ") || "ไม่ทราบศิลปิน";
}

function MusicIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 3v12.2a3.8 3.8 0 1 1-2-3.35V6l10-2v11.2a3.8 3.8 0 1 1-2-3.35V3.5L12 5z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  );
}

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

  function handleAddToQueue() {
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
      className="group relative min-w-0 cursor-pointer rounded-lg border border-white/[0.08] bg-[#15111e] p-1.5 transition duration-300 hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-[#1b1528] hover:shadow-lg hover:shadow-violet-950/20 sm:rounded-xl sm:p-2"
    >
      <div className="relative aspect-square overflow-hidden rounded-md bg-gradient-to-br from-violet-950 via-purple-900 to-[#171220] sm:rounded-lg">
        {coverUrl && !imageError ? (
          <Image
            fill
            sizes="(max-width: 640px) 45vw, 200px"
            src={coverUrl}
            alt={`ปกเพลง ${song.title}`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(167,139,250,.35),transparent_55%)]">
            <MusicIcon className="h-8 w-8 text-violet-200/80 sm:h-10 sm:w-10" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
      </div>

      <div
        className="absolute right-2 top-2 z-50"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label={`ตัวเลือกเพิ่มเติมสำหรับเพลง ${song.title}`}
          aria-expanded={isMenuOpen}
          title="ตัวเลือกเพิ่มเติม"
          onClick={() => setActiveMenu(isMenuOpen ? null : song.id)}
          className={`flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-black/65 text-white backdrop-blur-md transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 ${isMenuOpen ? "opacity-100" : "md:opacity-0 md:group-hover:opacity-100"}`}
        >
          <MoreIcon />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 top-full z-[100] mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#191421] py-1 text-xs text-white shadow-2xl">
            <button
              type="button"
              onClick={handleAddToQueue}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-white/10"
            >
              <span className="text-violet-300">＋</span>เพิ่มเข้าคิว
            </button>
            <button
              type="button"
              onClick={() => void handleCopyTitle()}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-white/10"
            >
              <span className="text-violet-300">▢</span>คัดลอกชื่อเพลง
            </button>
            {song.artist_ids[0] && (
              <Link
                href={`/artists/${encodeURIComponent(song.artist_ids[0])}?returnTo=%2F`}
                onClick={() => {
                  sessionStorage.setItem(
                    "artistDetailReturnTo",
                    window.location.pathname + window.location.search,
                  );
                  setActiveMenu(null);
                }}
                className="flex w-full items-center gap-3 px-3.5 py-2.5 transition hover:bg-white/10"
              >
                <span className="text-violet-300">♬</span>ดูเพลงของศิลปิน
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="min-w-0 px-0.5 pb-0.5 pt-1.5">
        <button
          type="button"
          onClick={handlePlaySong}
          className="block w-full min-w-0 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          title={`เล่นเพลง ${song.title}`}
        >
          <h3 className="truncate text-[11px] font-semibold text-white transition-colors group-hover:text-violet-200 sm:text-xs">
            {song.title}
          </h3>
          <p className="mt-0.5 truncate text-[10px] text-white/50 sm:text-[11px]">
            {artistName}
          </p>
        </button>
      </div>
    </article>
  );
}

function SongListRow({
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
  const isMenuOpen = activeMenu === `list-${song.id}`;
  const menuId = `list-${song.id}`;

  function handleAddToQueue() {
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
    <article className="group relative flex min-w-0 items-center gap-3 border-t border-white/[0.12] py-2.5 sm:gap-4 sm:py-3">
      <button
        type="button"
        onClick={() => {
          playSong(song.id);
          setActiveMenu(null);
        }}
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#15111e] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:h-[60px] sm:w-[60px]"
        aria-label={`เล่นเพลง ${song.title}`}
      >
        {coverUrl && !imageError ? (
          <Image
            fill
            sizes="(max-width: 640px) 48px, 60px"
            src={coverUrl}
            alt={`ปกเพลง ${song.title}`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900 to-[#171220] text-violet-200">
            <MusicIcon className="h-5 w-5" />
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          playSong(song.id);
          setActiveMenu(null);
        }}
        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        title={`เล่นเพลง ${song.title}`}
      >
        <span className="block truncate text-sm font-semibold leading-5 text-white/90 transition-colors group-hover:text-violet-200 sm:text-base">
          {song.title}
        </span>
        <span className="mt-0.5 block truncate text-xs leading-4 text-white/60 sm:text-sm">
          {artistName}
        </span>
      </button>

      <div className="relative shrink-0">
        <button
          type="button"
          aria-label={`ตัวเลือกเพิ่มเติมสำหรับเพลง ${song.title}`}
          aria-expanded={isMenuOpen}
          title="ตัวเลือกเพิ่มเติม"
          onClick={(event) => {
            event.stopPropagation();
            setActiveMenu(isMenuOpen ? null : menuId);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
        >
          <MoreIcon />
        </button>
        {isMenuOpen && (
          <div
            className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#191421] py-1 text-xs text-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleAddToQueue}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-white/10"
            >
              <span className="text-violet-300">＋</span>เพิ่มเข้าคิว
            </button>
            <button
              type="button"
              onClick={() => void handleCopyTitle()}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-white/10"
            >
              <span className="text-violet-300">▢</span>คัดลอกชื่อเพลง
            </button>
            {song.artist_ids[0] && (
              <Link
                href={`/artists/${encodeURIComponent(song.artist_ids[0])}?returnTo=%2F`}
                onClick={() => {
                  sessionStorage.setItem(
                    "artistDetailReturnTo",
                    window.location.pathname + window.location.search,
                  );
                  setActiveMenu(null);
                }}
                className="flex w-full items-center gap-3 px-3.5 py-2.5 transition hover:bg-white/10"
              >
                <span className="text-violet-300">♬</span>ดูเพลงของศิลปิน
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function ArtistCard({ artist }: { artist: (typeof catalog.artists)[number] }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/artists/${encodeURIComponent(artist.id)}?returnTo=%2F`}
      onClick={() =>
        sessionStorage.setItem(
          "artistDetailReturnTo",
          window.location.pathname + window.location.search,
        )
      }
      className="group flex min-w-0 flex-col items-center rounded-xl border border-white/[0.08] bg-[#15111e] p-3 transition duration-300 hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-[#1b1528] hover:shadow-lg hover:shadow-violet-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:rounded-2xl sm:p-4"
      aria-label={`ดูรายละเอียดศิลปิน ${artist.name}`}
    >
      <div className="relative mb-3 aspect-square w-full max-w-28 overflow-hidden rounded-full bg-gradient-to-br from-violet-500/30 via-purple-900 to-[#171220] transition duration-300 sm:max-w-32">
        <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-violet-200">
          {artist.name.charAt(0)}
        </div>

        {artist.image_url && !imageError && (
          <Image
            src={artist.image_url}
            fill
            sizes="(max-width: 640px) 112px, 128px"
            unoptimized={!artist.image_url.startsWith("/")}
            alt={`รูปศิลปิน ${artist.name}`}
            loading="lazy"
            onError={() => setImageError(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      <p
        className="max-w-full truncate text-center text-xs font-semibold text-white transition-colors group-hover:text-violet-200 sm:text-sm"
        title={artist.name}
      >
        {artist.name}
      </p>

      <span className="mt-1.5 rounded-full border border-violet-300/15 bg-violet-300/[0.06] px-2.5 py-0.5 text-[10px] text-violet-200/70">
        ศิลปิน
      </span>
    </Link>
  );
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [listSongs, setListSongs] = useState<Song[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const featured = getRandomSongs(catalog.songs, 10);
      setSongs(featured);
      const featuredIds = new Set(featured.map((song) => song.id));
      const remainingSongs = catalog.songs.filter(
        (song) => !featuredIds.has(song.id),
      );
      setListSongs(
        getRandomSongs(
          remainingSongs.length ? remainingSongs : catalog.songs,
          12,
        ),
      );
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function shuffleSongs() {
    const featured = getRandomSongs(catalog.songs, 10);
    setSongs(featured);
    const featuredIds = new Set(featured.map((song) => song.id));
    const remainingSongs = catalog.songs.filter(
      (song) => !featuredIds.has(song.id),
    );
    setListSongs(
      getRandomSongs(
        remainingSongs.length ? remainingSongs : catalog.songs,
        12,
      ),
    );
    setActiveMenu(null);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  }

  return (
    <main
      className="min-h-screen overflow-x-clip bg-[#0b0911] text-white"
      onClick={() => {
        if (activeMenu) setActiveMenu(null);
      }}
    >
      <header className="relative -mx-4 mb-6 flex h-[73px] items-center overflow-hidden border-b border-white/[0.07] bg-gradient-to-r from-[#100c19] via-[#0b0911] to-[#151020] px-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
        {/* แสงตกแต่งพื้นหลัง */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-violet-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/3 top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-violet-400/20 to-transparent"
        />

        <div className="relative mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-3 sm:px-5 md:px-8">
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-white sm:text-base">
              Your Music Starts Here
              <span className="ml-1.5 inline-block">🎧</span>
            </h1>
          </div>

        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-10 px-5 pb-32 pt-6 md:space-y-14 md:px-10 md:pt-8">
        <section
          id="home"
          className="relative isolate min-h-[250px] overflow-hidden rounded-3xl border border-violet-300/10 bg-[radial-gradient(ellipse_at_80%_15%,rgba(139,92,246,.28),transparent_38%),linear-gradient(115deg,#211333_0%,#151020_52%,#0f0c17_100%)] p-6 shadow-[0_20px_60px_rgba(55,25,105,0.12)] sm:p-8 md:min-h-[290px] md:p-10"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 top-0 h-60 w-60 rounded-full border border-violet-300/10 md:right-20 md:top-8 md:h-72 md:w-72"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-2 top-8 h-44 w-44 rounded-full border border-violet-300/[0.07] md:right-28 md:top-16 md:h-56 md:w-56"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 right-10 h-52 w-52 rounded-full bg-purple-500/15 blur-3xl"
          />

          <div className="relative z-10 max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/[0.08] px-3 py-1.5 text-[9px] font-semibold tracking-[0.18em] text-violet-200 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,.8)]" />
              DISCOVER YOUR SOUND
            </div>

            <h2 className="text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl md:text-5xl">
              เพลงที่ใช่
              <br />
              <span className="bg-gradient-to-r from-violet-200 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
                ในวันที่เป็นคุณ
              </span>
            </h2>

            <p className="mt-4 max-w-sm text-xs leading-6 text-white/55 sm:text-sm sm:leading-7">
              ค้นพบศิลปินและเพลงโปรดของคุณ
              แล้วปล่อยให้เสียงเพลงเติมเต็มช่วงเวลาของคุณ
            </p>

            <button
              type="button"
              onClick={() =>
                document
                  .getElementById("songs")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-violet-300 px-5 py-2.5 text-xs font-bold text-[#1b1026] shadow-lg shadow-violet-950/30 transition hover:-translate-y-0.5 hover:bg-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:text-sm"
            >
              สำรวจเพลง
              <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-6 right-6 hidden items-end gap-1.5 opacity-60 md:flex"
          >
            {[28, 45, 34, 60, 40, 72, 38, 52, 30, 58, 36, 46, 25].map(
              (height, index) => (
                <span
                  key={index}
                  className="w-1.5 rounded-full bg-gradient-to-t from-violet-700 to-fuchsia-300"
                  style={{
                    height: `${height}px`,
                    opacity: 0.35 + (index % 4) * 0.15,
                  }}
                />
              ),
            )}
          </div>
        </section>

        <section id="songs" className="scroll-mt-6">
          <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6">
            <div>
              <p className="mb-1.5 text-[9px] font-bold tracking-[0.22em] text-violet-300 sm:text-[10px]">
                A LITTLE SOMETHING FOR YOU
              </p>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                เพลงที่น่าสนใจ
              </h2>
              <p className="mt-1.5 text-[11px] text-white/40 sm:text-xs">
                เลือกเพลงที่ตรงกับอารมณ์ของคุณวันนี้
              </p>
            </div>

            <button
              type="button"
              onClick={shuffleSongs}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-[11px] font-medium text-white/75 transition hover:border-violet-300/25 hover:bg-violet-400/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 sm:px-3.5 sm:text-xs"
              title="สุ่มเพลงใหม่"
            >
              <ShuffleIcon />
              <span>สุ่มใหม่</span>
            </button>
          </div>

          {songs.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-3">
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
          ) : (
            <div className="rounded-xl border border-white/[0.08] bg-[#15111e] px-4 py-8 text-center">
              <MusicIcon className="mx-auto h-8 w-8 text-violet-300" />
              <p className="mt-3 text-sm font-medium">ยังไม่มีเพลงในคลัง</p>
              <p className="mt-1 text-xs text-white/40">
                ตรวจสอบข้อมูลเพลงใน music-catalog
              </p>
            </div>
          )}
        </section>

        <section id="popular-list" className="scroll-mt-6">
          <div className="mb-3 sm:mb-4">
            <p className="mb-1.5 text-[9px] font-bold tracking-[0.22em] text-violet-300 sm:text-[10px]">
              MORE TO LISTEN
            </p>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              เพลงเพิ่มเติมสำหรับคุณ
            </h2>
            <p className="mt-1.5 text-[11px] text-white/40 sm:text-xs">
              เลือกฟังเพลงอื่น ๆ จากคลังเพลงของเรา
            </p>
          </div>

          {listSongs.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6">
              {listSongs.map((song) => (
                <SongListRow
                  key={song.id}
                  song={song}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  showToast={showToast}
                />
              ))}
            </div>
          ) : (
            <p className="border-t border-white/[0.12] py-5 text-sm text-white/45">
              ยังไม่มีเพลงในคลัง
            </p>
          )}
        </section>

        <section id="artists" className="scroll-mt-6 pb-2">
          <div className="mb-5 sm:mb-6">
            <p className="mb-1.5 text-[9px] font-bold tracking-[0.22em] text-violet-300 sm:text-[10px]">
              MEET THE ARTISTS
            </p>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              ศิลปินที่คุณอาจชอบ
            </h2>
            <p className="mt-1.5 text-[11px] text-white/40 sm:text-xs">
              ค้นพบเสียงและเรื่องราวจากศิลปินที่น่าติดตาม
            </p>
          </div>

          {artists.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-white/[0.07] bg-[#15111e] p-5 text-center text-xs text-white/45">
              ยังไม่มีข้อมูลศิลปิน
            </p>
          )}
        </section>

        <footer className="border-t border-white/[0.07] pt-5 text-center text-[11px] text-white/30">
          Music Platform
          <span className="mx-2 text-violet-400/60">✦</span>
          ค้นพบศิลปินและเพลงโปรดของคุณ
        </footer>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-28 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-white/10 bg-[#20182b] px-4 py-2.5 text-xs text-white shadow-2xl shadow-black/40"
          onClick={(event) => event.stopPropagation()}
        >
          {toast}
        </div>
      )}
    </main>
  );
}
