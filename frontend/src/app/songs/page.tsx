"use client";

import { shuffleItems as shuffleSongs } from "@/lib/random";

import { normalizeSearchText as normalize } from "@/lib/search-text";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMusicPlayer } from "@/features/music-player";
import catalog from "../../data/music-catalog";

type Artist = {
  id: string;
  name: string;
};

type Song = {
  id?: string;
  title?: string;
  name?: string;
  artist_ids?: string[];
  artist_id?: string;
  album_id?: string;
  cover_url?: string;
  image_url?: string;
  providers?: {
    youtube?: {
      video_id?: string;
      url?: string;
      link_type?: string;
    };
  };
};

type MusicCatalog = {
  artists?: Artist[];
  songs?: Song[];
};

type SortMode =
  "random" | "title-asc" | "title-desc" | "artist-asc" | "artist-desc";

const musicCatalog = catalog as MusicCatalog;
const artists = musicCatalog.artists ?? [];
const songs = musicCatalog.songs ?? [];

const INITIAL_DISPLAY_COUNT = 100;
const LOAD_MORE_COUNT = 25;

function getSongTitle(song: Song): string {
  return song.title ?? song.name ?? "ไม่ทราบชื่อเพลง";
}

function getArtistIds(song: Song): string[] {
  if (Array.isArray(song.artist_ids)) return song.artist_ids;
  if (song.artist_id) return [song.artist_id];
  return [];
}

function getArtistName(song: Song): string {
  const names = getArtistIds(song)
    .map((id) => artists.find((artist) => artist.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  return names.length > 0 ? names.join(", ") : "ไม่ทราบศิลปิน";
}

function getSongCover(song: Song): string | undefined {
  if (song.cover_url) return song.cover_url;
  if (song.image_url) return song.image_url;

  const videoId = song.providers?.youtube?.video_id;

  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  return undefined;
}

function getSongKey(song: Song, index: number): string {
  return song.id ?? `${getSongTitle(song)}-${index}`;
}

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
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

function ShuffleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  );
}

function SortIcon({
  direction,
  className = "h-4 w-4",
}: {
  direction: "asc" | "desc" | null;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      {direction === "desc" ? (
        <path d="M12 5v14m-6-6 6 6 6-6" />
      ) : direction === "asc" ? (
        <path d="M12 19V5m-6 6 6-6 6 6" />
      ) : (
        <path d="M4 7h16M7 12h10m-7 5h4" />
      )}
    </svg>
  );
}

export default function SongsPage() {
  const { playSong, addToQueue } = useMusicPlayer();

  const [query, setQuery] = useState("");
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY_COUNT);
  const [sortMode, setSortMode] = useState<SortMode>("random");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  // สุ่มเพลงหลัง Mount เพื่อป้องกัน Hydration Error
  // เมื่อเข้าหน้าใหม่จะสุ่มรายการใหม่
  const refreshRecommendations = useCallback(() => {
    setRecommendedSongs(shuffleSongs(songs));
    setVisibleCount(INITIAL_DISPLAY_COUNT);
    setSortMode("random");
    setActiveMenu(null);
    setImageErrors({});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshRecommendations();
    }, 0);
    return () => clearTimeout(timer);
  }, [refreshRecommendations]);

  const filteredSongs = useMemo(() => {
    const searchText = normalize(query);

    const filtered = recommendedSongs.filter((song) => {
      if (!searchText) return true;

      return (
        normalize(getSongTitle(song)).includes(searchText) ||
        normalize(getArtistName(song)).includes(searchText)
      );
    });

    const sorted = [...filtered];

    switch (sortMode) {
      case "title-asc":
        sorted.sort((a, b) =>
          getSongTitle(a).localeCompare(getSongTitle(b), "th", {
            sensitivity: "base",
            numeric: true,
          }),
        );
        break;

      case "title-desc":
        sorted.sort((a, b) =>
          getSongTitle(b).localeCompare(getSongTitle(a), "th", {
            sensitivity: "base",
            numeric: true,
          }),
        );
        break;

      case "artist-asc":
        sorted.sort((a, b) =>
          getArtistName(a).localeCompare(getArtistName(b), "th", {
            sensitivity: "base",
            numeric: true,
          }),
        );
        break;

      case "artist-desc":
        sorted.sort((a, b) =>
          getArtistName(b).localeCompare(getArtistName(a), "th", {
            sensitivity: "base",
            numeric: true,
          }),
        );
        break;

      default:
        break;
    }

    return sorted;
  }, [query, recommendedSongs, sortMode]);

  const visibleSongs = useMemo(
    () => filteredSongs.slice(0, visibleCount),
    [filteredSongs, visibleCount],
  );

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  }

  function handlePlaySong(song: Song) {
    if (!song.id) {
      showToast("ไม่พบรหัสเพลง");
      return;
    }

    setActiveMenu(null);
    playSong(song.id);
  }

  function handleAddToQueue(song: Song) {
    if (!song.id) {
      showToast("ไม่พบรหัสเพลง");
      return;
    }

    addToQueue(song.id);
    setActiveMenu(null);
    showToast("เพิ่มเพลงเข้าคิวแล้ว");
  }

  async function copySongTitle(title: string) {
    try {
      await navigator.clipboard.writeText(title);
      showToast("คัดลอกชื่อเพลงแล้ว");
    } catch {
      showToast("คัดลอกไม่สำเร็จ กรุณาลองอีกครั้ง");
    }

    setActiveMenu(null);
  }

  function clearSearch() {
    setQuery("");
    setActiveMenu(null);
  }

  function toggleTitleSort() {
    setSortMode((current) =>
      current === "title-asc" ? "title-desc" : "title-asc",
    );
    setVisibleCount(INITIAL_DISPLAY_COUNT);
    setActiveMenu(null);
  }

  function toggleArtistSort() {
    setSortMode((current) =>
      current === "artist-asc" ? "artist-desc" : "artist-asc",
    );
    setVisibleCount(INITIAL_DISPLAY_COUNT);
    setActiveMenu(null);
  }

  function clearSort() {
    setSortMode("random");
    setVisibleCount(INITIAL_DISPLAY_COUNT);
    setActiveMenu(null);
  }

  const titleDirection =
    sortMode === "title-asc"
      ? "asc"
      : sortMode === "title-desc"
        ? "desc"
        : null;

  const artistDirection =
    sortMode === "artist-asc"
      ? "asc"
      : sortMode === "artist-desc"
        ? "desc"
        : null;

  const hasMore = visibleCount < filteredSongs.length;

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#0b0911] text-[#f7f4ff]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-56 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-violet-700/[0.12] blur-[130px]"
      />

      {/* Search bar */}
      <header className="sticky top-0 z-50 -mx-4 mb-6 border-b border-white/[0.055] bg-[#0b0911]/85 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:-mx-6 sm:px-6 md:-mx-10 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto flex h-12 max-w-2xl items-center gap-3 rounded-full border border-white/[0.09] bg-[#17131f]/90 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition focus-within:border-violet-400/60 focus-within:ring-4 focus-within:ring-violet-500/[0.08]">
            <SearchIcon className="h-[18px] w-[18px] shrink-0 text-zinc-400" />

            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveMenu(null);
              }}
              placeholder="ค้นหาเพลงหรือศิลปิน"
              aria-label="ค้นหาเพลงหรือศิลปิน"
              className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-search-cancel-button]:hidden"
            />

            {query.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="ล้างคำค้นหา"
                className="rounded-full p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="relative z-10 px-4 pb-32 pt-2 sm:px-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          {/* Page heading */}
          <section className="group relative isolate mb-8 overflow-hidden rounded-[26px] border border-[#6d3bb8]/30 bg-[#0d0818] px-6 py-8 shadow-[0_24px_80px_rgba(35,10,75,0.28)] sm:px-9 sm:py-10">
            {/* Deep purple background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[#24103f] via-[#160d27] to-[#09070f]"
            />

            {/* Grid pattern */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 opacity-[0.12]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(139,92,246,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.22) 1px, transparent 1px)",
                backgroundSize: "34px 34px",
                maskImage:
                  "linear-gradient(90deg, transparent, black 45%, black)",
              }}
            />

            {/* Deep royal purple glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#6d28d9]/20 blur-[90px]"
            />

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-32 right-1/4 h-56 w-56 rounded-full bg-[#86198f]/10 blur-[80px]"
            />

            {/* Decorative rings */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 top-1/2 hidden h-[340px] w-[340px] -translate-y-1/2 rounded-full border border-[#7c3aed]/20 sm:block"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-5 top-1/2 hidden h-[250px] w-[250px] -translate-y-1/2 rounded-full border border-[#6d28d9]/20 sm:block"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-7 top-1/2 hidden h-[160px] w-[160px] -translate-y-1/2 rounded-full border border-[#7c3aed]/15 sm:block"
            />

            {/* Diagonal light */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 hidden h-full w-[48%] opacity-30 sm:block"
              style={{
                background:
                  "linear-gradient(135deg, transparent 35%, rgba(109,40,217,0.18) 50%, transparent 65%)",
              }}
            />

            {/* Decorative lights */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[18%] top-[24%] hidden h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_14px_4px_rgba(124,58,237,0.5)] sm:block"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-[10%] bottom-[25%] hidden h-1 w-1 rounded-full bg-fuchsia-400 shadow-[0_0_12px_3px_rgba(192,38,211,0.4)] sm:block"
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Brand label */}
              <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-[#7c3aed]/30 bg-[#1b1030]/80 px-3.5 py-2 shadow-[0_4px_24px_rgba(109,40,217,0.12)] backdrop-blur-md transition-colors duration-300 group-hover:border-[#8b5cf6]/50">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#6d28d9]/40 to-[#86198f]/30 text-violet-300 ring-1 ring-[#8b5cf6]/20">
                  <MusicIcon className="h-3.5 w-3.5" />
                </span>

                <span className="text-[10px] font-semibold tracking-[0.2em] text-violet-200/90">
                  MUSIC PLATFORM
                </span>

                <span
                  aria-hidden="true"
                  className="ml-0.5 h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(192,38,211,0.65)]"
                />
              </div>

              {/* Heading */}
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                เพลงทั้งหมด
                <span className="ml-2 text-[#a78bfa]">.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#c4b5fd]/65 sm:text-base">
                ค้นพบเพลงที่คุณชื่นชอบ เลือกเพลงที่ใช่แล้วเริ่มฟังได้เลย
              </p>

              {/* Accent line */}
              <div className="mt-6 flex items-center gap-2">
                <div className="h-1 w-10 rounded-full bg-gradient-to-r from-[#6d28d9] to-[#a21caf] shadow-[0_0_12px_rgba(109,40,217,0.4)]" />
                <div className="h-1 w-3 rounded-full bg-[#6d28d9]/50" />
                <div className="h-1 w-1 rounded-full bg-[#7c3aed]/40" />
              </div>
            </div>
          </section>

          {/* Toolbar */}
          <section className="mb-6 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {query.trim() ? "ผลการค้นหา" : "ค้นพบเพลง"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {query.trim()
                    ? `ผลลัพธ์สำหรับ “${query.trim()}”`
                    : "เลือกการ์ดเพลงเพื่อเริ่มเล่น"}
                </p>
              </div>

              <button
                type="button"
                onClick={refreshRecommendations}
                className="inline-flex items-center gap-2 rounded-full border border-[#45365f] bg-[#252033] px-4 py-2.5 text-sm font-semibold text-violet-300 transition hover:border-violet-400 hover:bg-[#352b4a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                <ShuffleIcon />
                สุ่มใหม่
              </button>
            </div>

            {/* Sorting controls */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-zinc-500">
                เรียงตาม
              </span>

              <button
                type="button"
                onClick={clearSort}
                aria-pressed={sortMode === "random"}
                className={`rounded-full border px-3.5 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${sortMode === "random"
                  ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-[#17131f] text-zinc-300 hover:border-violet-400/30 hover:text-white"
                  }`}
              >
                ไม่มี
              </button>

              <button
                type="button"
                onClick={toggleTitleSort}
                aria-pressed={titleDirection !== null}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${titleDirection
                  ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-[#17131f] text-zinc-300 hover:border-violet-400/30 hover:text-white"
                  }`}
              >
                <SortIcon direction={titleDirection} />
                ชื่อเพลง
                {titleDirection && (
                  <span className="text-[11px] text-violet-300">
                    {titleDirection === "asc" ? "A–Z" : "Z–A"}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={toggleArtistSort}
                aria-pressed={artistDirection !== null}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${artistDirection
                  ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-[#17131f] text-zinc-300 hover:border-violet-400/30 hover:text-white"
                  }`}
              >
                <SortIcon direction={artistDirection} />
                ศิลปิน
                {artistDirection && (
                  <span className="text-[11px] text-violet-300">
                    {artistDirection === "asc" ? "A–Z" : "Z–A"}
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* Song grid */}
          {visibleSongs.length > 0 ? (
            <>
              <section className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
                {visibleSongs.map((song, index) => {
                  const key = getSongKey(song, index);
                  const title = getSongTitle(song);
                  const artistName = getArtistName(song);
                  const cover = getSongCover(song);
                  const imageFailed = Boolean(imageErrors[key]);
                  const menuOpen = activeMenu === key;

                  return (
                    <article key={key} className="group min-w-0">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => handlePlaySong(song)}
                          aria-label={`เล่นเพลง ${title}`}
                          className="relative block aspect-square w-full overflow-hidden rounded-2xl border border-white/[0.07] bg-[#191421] text-left shadow-[0_8px_28px_rgba(0,0,0,0.18)] outline-none transition duration-300 hover:-translate-y-1 hover:border-violet-300/30 hover:shadow-[0_16px_36px_rgba(124,58,237,0.14)] focus-visible:ring-2 focus-visible:ring-violet-400"
                        >
                          {cover && !imageFailed ? (
                            <Image
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                              src={cover}
                              alt={title}
                              loading={index < 10 ? "eager" : "lazy"}
                              decoding="async"
                              onError={() =>
                                setImageErrors((previous) => ({
                                  ...previous,
                                  [key]: true,
                                }))
                              }
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#49305d] via-[#292033] to-[#131019]">
                              <MusicIcon className="h-12 w-12 text-violet-300/80" />
                            </div>
                          )}

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
                        </button>

                        {/* Three-dot menu */}
                        <div className="absolute right-2 top-2 z-20">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenu((current) =>
                                current === key ? null : key,
                              )
                            }
                            aria-label={`ตัวเลือกเพิ่มเติมสำหรับเพลง ${title}`}
                            aria-expanded={menuOpen}
                            className="rounded-full border border-white/10 bg-black/45 p-2 text-white/80 backdrop-blur-md transition hover:bg-black/75 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                          >
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
                          </button>

                          {menuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-[#302a3b] bg-[#191522] py-1 shadow-xl">
                              <button
                                type="button"
                                onClick={() => handlePlaySong(song)}
                                className="w-full px-3 py-2.5 text-left text-sm text-violet-50 transition hover:bg-[#302a3b]"
                              >
                                เล่นเพลง
                              </button>

                              <button
                                type="button"
                                onClick={() => handleAddToQueue(song)}
                                className="w-full px-3 py-2.5 text-left text-sm text-violet-50 transition hover:bg-[#302a3b]"
                              >
                                เพิ่มเข้าคิว
                              </button>

                              <button
                                type="button"
                                onClick={() => void copySongTitle(title)}
                                className="w-full px-3 py-2.5 text-left text-sm text-violet-50 transition hover:bg-[#302a3b]"
                              >
                                คัดลอกชื่อเพลง
                              </button>

                              {getArtistIds(song)[0] && (
                                <Link
                                  href={`/artists/${encodeURIComponent(getArtistIds(song)[0])}`}
                                  onClick={() => setActiveMenu(null)}
                                  className="block px-3 py-2.5 text-sm text-violet-50 transition hover:bg-[#302a3b]"
                                >
                                  ดูศิลปิน
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 px-0.5 pt-3">
                        <button
                          type="button"
                          onClick={() => handlePlaySong(song)}
                          className="block w-full min-w-0 text-left"
                        >
                          <h3
                            title={title}
                            className="truncate text-sm font-semibold text-zinc-100 transition-colors group-hover:text-violet-200"
                          >
                            {title}
                          </h3>

                          <p
                            title={artistName}
                            className="mt-1 truncate text-xs text-zinc-500"
                          >
                            {artistName}
                          </p>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </section>

              {/* Load more */}
              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((current) =>
                        Math.min(
                          current + LOAD_MORE_COUNT,
                          filteredSongs.length,
                        ),
                      )
                    }
                    className="inline-flex min-w-44 items-center justify-center gap-2 rounded-full border border-violet-400/30 bg-[#211a30] px-6 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-300/60 hover:bg-[#302342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                  >
                    แสดงเพิ่มเติม
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <section className="rounded-2xl border border-white/[0.07] bg-[#191522] px-5 py-14 text-center">
              <SearchIcon className="mx-auto h-9 w-9 text-violet-300" />

              <h3 className="mt-4 text-lg font-semibold text-white">
                {query.trim() ? "ไม่พบเพลงที่ค้นหา" : "ยังไม่มีเพลงในคลัง"}
              </h3>

              <p className="mt-2 text-sm text-zinc-500">
                {query.trim()
                  ? "ลองค้นหาด้วยชื่อเพลงหรือชื่อศิลปินอื่น"
                  : "ตรวจสอบข้อมูลเพลงใน music-catalog"}
              </p>

              {query.trim() && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-5 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
                >
                  ล้างคำค้นหา
                </button>
              )}
            </section>
          )}

          <footer className="mt-10 border-t border-white/[0.07] pt-5 text-center text-xs text-zinc-600">
            Music Platform — Discover your next favorite song.
          </footer>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-28 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-[#45365f] bg-[#252033] px-5 py-3 text-sm text-white shadow-2xl"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
