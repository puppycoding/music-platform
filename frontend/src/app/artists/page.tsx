"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import catalog from "../../data/music-catalog";

type Artist = {
  id: string;
  name: string;
  image_url?: string | null;
  country?: string;
  [key: string]: unknown;
};

type Catalog = {
  artists?: Artist[];
};

type SortMode = "random" | "asc" | "desc";

const artists = ((catalog as unknown as Catalog).artists ?? []).filter(
  (artist) =>
    typeof artist?.id === "string" &&
    artist.id.length > 0 &&
    typeof artist?.name === "string" &&
    artist.name.length > 0
);

const INITIAL_DISPLAY_COUNT = 100;
const LOAD_MORE_COUNT = 25;

function normalize(value: unknown): string {
  return String(value ?? "")
    .toLocaleLowerCase("th")
    .normalize("NFC")
    .trim();
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function shuffleArtists(source: Artist[]): Artist[] {
  const shuffled = [...source];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
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

function ArtistCard({
  artist,
  index,
}: {
  artist: Artist;
  index: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);

  const imageUrl =
    typeof artist.image_url === "string" &&
      artist.image_url.trim().length > 0
      ? artist.image_url.trim()
      : null;

  return (
    <Link
      href={`/artists/${encodeURIComponent(artist.id)}`}
      aria-label={`ดูผลงานของ ${artist.name}`}
      className="artist-card group block min-w-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0b0910]"
      style={{
        animationDelay: `${Math.min(index, 12) * 55}ms`,
      }}
    >
      <div className="artist-artwork relative aspect-square overflow-hidden rounded-2xl bg-[#191321] shadow-[0_8px_28px_rgba(0,0,0,0.18)] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_16px_36px_rgba(124,58,237,0.14)]">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#382747] via-[#201a2c] to-[#100e16]">
          <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <span className="relative select-none text-6xl font-bold tracking-[-0.08em] text-white/[0.22] sm:text-7xl">
            {getInitials(artist.name)}
          </span>
        </div>

        {imageUrl && !imageFailed && (
          <Image
            src={imageUrl}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
            unoptimized={!imageUrl.startsWith("/")}
            alt={artist.name}
            loading={index < 8 ? "eager" : "lazy"}
            decoding="async"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          />
        )}

        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-b from-black/[0.03] via-transparent to-black/50" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] p-3.5 sm:p-4">
          <span className="inline-flex items-center rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[9px] font-medium tracking-[0.16em] text-white/80 backdrop-blur-md">
            ARTIST
          </span>
        </div>
      </div>

      <div className="px-1 pb-1 pt-3.5">
        <h2
          title={artist.name}
          className="truncate text-[14px] font-semibold tracking-[-0.02em] text-zinc-200 transition-colors duration-300 group-hover:text-white sm:text-base"
        >
          {artist.name}
        </h2>

        <div className="mt-2 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-violet-400 transition-shadow duration-300 group-hover:shadow-[0_0_8px_rgba(167,139,250,0.9)]" />
          <span className="text-[11px] text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
            สำรวจผลงาน
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ArtistsPage() {
  const [query, setQuery] = useState("");
  const [recommendedArtists, setRecommendedArtists] = useState<Artist[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_DISPLAY_COUNT);
  const [sortMode, setSortMode] = useState<SortMode>("random");

  const refreshRecommendations = useCallback(() => {
    setRecommendedArtists(shuffleArtists(artists));
    setVisibleCount(INITIAL_DISPLAY_COUNT);
    setSortMode("random");
  }, []);

  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  const filteredArtists = useMemo(() => {
    const searchText = normalize(query);

    const filtered = recommendedArtists.filter((artist) => {
      if (!searchText) return true;
      return normalize(artist.name).includes(searchText);
    });

    const sorted = [...filtered];

    if (sortMode === "asc") {
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name, "th", {
          sensitivity: "base",
          numeric: true,
        })
      );
    } else if (sortMode === "desc") {
      sorted.sort((a, b) =>
        b.name.localeCompare(a.name, "th", {
          sensitivity: "base",
          numeric: true,
        })
      );
    }

    return sorted;
  }, [query, recommendedArtists, sortMode]);

  const visibleArtists = useMemo(
    () => filteredArtists.slice(0, visibleCount),
    [filteredArtists, visibleCount]
  );

  function clearSearch() {
    setQuery("");
    setVisibleCount(INITIAL_DISPLAY_COUNT);
  }

  function toggleAlphabeticalSort() {
    setSortMode((current) => (current === "asc" ? "desc" : "asc"));
    setVisibleCount(INITIAL_DISPLAY_COUNT);
  }

  function clearSort() {
    setSortMode("random");
    setVisibleCount(INITIAL_DISPLAY_COUNT);
  }

  const sortDirection =
    sortMode === "asc" ? "asc" : sortMode === "desc" ? "desc" : null;

  const hasMore = visibleCount < filteredArtists.length;

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#0b0911] text-[#f7f4ff]">
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
                setVisibleCount(INITIAL_DISPLAY_COUNT);
              }}
              placeholder="ค้นหาศิลปิน"
              aria-label="ค้นหาศิลปิน"
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

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-56 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-violet-700/[0.12] blur-[130px]"
      />

      <div className="relative z-10 px-4 pb-32 pt-2 sm:px-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          {/* Hero banner */}
          <section className="group relative isolate mb-8 overflow-hidden rounded-[26px] border border-[#6d3bb8]/30 bg-[#0d0818] px-6 py-8 shadow-[0_24px_80px_rgba(35,10,75,0.28)] sm:px-9 sm:py-10">
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

            {/* Purple and magenta glow */}
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

              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    ศิลปินทั้งหมด<span className="ml-2 text-[#a78bfa]">.</span>
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-[#c4b5fd]/65 sm:text-base">
                    ค้นพบเสียงเพลงและเรื่องราวจากศิลปินที่คุณชื่นชอบ
                  </p>
                </div>

                <div className="hidden items-center gap-2 pb-1 md:flex">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.7)]" />
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
                    Discover your sound
                  </span>
                </div>
              </div>

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
                  {query.trim() ? "ผลการค้นหา" : "ค้นพบศิลปิน"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {query.trim()
                    ? `ผลลัพธ์สำหรับ “${query.trim()}”`
                    : "เลือกศิลปินเพื่อสำรวจผลงาน"}
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
                onClick={toggleAlphabeticalSort}
                aria-pressed={sortDirection !== null}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 ${sortDirection
                  ? "border-violet-400/50 bg-violet-500/15 text-violet-200"
                  : "border-white/10 bg-[#17131f] text-zinc-300 hover:border-violet-400/30 hover:text-white"
                  }`}
              >
                <SortIcon direction={sortDirection} />
                ตามตัวอักษร
                {sortDirection && (
                  <span className="text-[11px] text-violet-300">
                    {sortDirection === "asc" ? "A–Z" : "Z–A"}
                  </span>
                )}
              </button>
            </div>
          </section>

          {/* Artist grid */}
          {visibleArtists.length > 0 ? (
            <>
              <section aria-label="ศิลปิน">
                <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleArtists.map((artist, index) => (
                    <ArtistCard
                      key={artist.id}
                      artist={artist}
                      index={index}
                    />
                  ))}
                </div>
              </section>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((current) =>
                        Math.min(
                          current + LOAD_MORE_COUNT,
                          filteredArtists.length
                        )
                      )
                    }
                    className="inline-flex min-w-44 items-center justify-center gap-2 rounded-full border border-violet-400/30 bg-[#211a30] px-6 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-300/60 hover:bg-[#302342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                  >
                    ดูเพิ่มเติม
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
            <div className="rounded-2xl border border-white/[0.07] bg-[#191522] px-5 py-14 text-center">
              <div className="text-center">
                <SearchIcon className="mx-auto mb-4 h-9 w-9 text-violet-300" />

                <p className="text-sm text-zinc-400">
                  {query.trim()
                    ? "ไม่พบศิลปินที่ค้นหา"
                    : "ยังไม่มีข้อมูลศิลปิน"}
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
              </div>
            </div>
          )}

          <footer className="mt-10 border-t border-white/[0.07] pt-5 text-center text-xs text-zinc-600">
            Music Platform — Discover your next favorite artist.
          </footer>
        </div>
      </div>

      <style jsx>{`
        .artist-card {
          animation: artist-enter 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) both;
        }

        @keyframes artist-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .artist-card {
            animation: none;
          }

          .artist-artwork {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
