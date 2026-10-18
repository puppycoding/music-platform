
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMusicPlayer } from "../../components/music-player/providers/MusicPlayerProvider";
import catalog from "../../data/music-catalog";

type Artist = {
  id: string;
  name: string;
  country?: string;
  image_url?: string | null;
  spotify_artist_id?: string;
  spotify_url?: string;
  [key: string]: unknown;
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
  moods?: string[];
  duration_seconds?: number | null;
  status?: string;
  listen_url?: string;
  listen_provider?: string;
  providers?: {
    youtube?: {
      video_id?: string;
      url?: string;
      link_type?: string;
    };
  };
  [key: string]: unknown;
};

type MusicCatalog = {
  artists?: Artist[];
  songs?: Song[];
};

type SearchFilter = "all" | "songs" | "artists";

const musicCatalog = catalog as MusicCatalog;
const artists: Artist[] = musicCatalog.artists ?? [];
const songs: Song[] = musicCatalog.songs ?? [];

function normalize(value: unknown): string {
  return String(value ?? "")
    .toLocaleLowerCase("th")
    .normalize("NFC")
    .trim();
}

function getSongTitle(song: Song): string {
  return song.title ?? song.name ?? "ไม่ทราบชื่อเพลง";
}

function getArtistIds(song: Song): string[] {
  if (Array.isArray(song.artist_ids)) {
    return song.artist_ids;
  }

  if (song.artist_id) {
    return [song.artist_id];
  }

  return [];
}

function getArtistById(id: string): Artist | undefined {
  return artists.find((artist) => artist.id === id);
}

function getArtistName(song: Song): string {
  const names = getArtistIds(song)
    .map((id) => getArtistById(id)?.name)
    .filter((name): name is string => Boolean(name));

  return names.length > 0 ? names.join(", ") : "ไม่ทราบศิลปิน";
}

function getSongCover(song: Song): string | undefined {
  if (song.cover_url) return song.cover_url;
  if (song.image_url) return song.image_url;

  const youtubeId = song.providers?.youtube?.video_id;

  if (youtubeId) {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  return undefined;
}

function getSongKey(song: Song, index: number): string {
  return song.id ?? `${getSongTitle(song)}-${index}`;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function getRandomItems<T>(source: T[], count: number): T[] {
  const shuffled = [...source];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

function getRandomSongs(source: Song[], count = 12): Song[] {
  return getRandomItems(source, count);
}

function getRandomArtists(source: Artist[], count = 6): Artist[] {
  return getRandomItems(source, count);
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

function ArtistIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
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

function ArtistCard({
  artist,
  index,
  imageFailed,
  onImageError,
}: {
  artist: Artist;
  index: number;
  imageFailed: boolean;
  onImageError: () => void;
}) {
  const imageUrl =
    typeof artist.image_url === "string" && artist.image_url.trim()
      ? artist.image_url.trim()
      : undefined;

  return (
    <Link
      href={`/artists/${encodeURIComponent(artist.id)}?returnTo=%2Fsearch`}
      onClick={() => {
        try {
          sessionStorage.setItem(
            "artistDetailReturnTo",
            window.location.pathname + window.location.search
          );
        } catch {
          // ไม่ขัดขวางการนำทางหาก sessionStorage ใช้งานไม่ได้
        }
      }}
      aria-label={`ดูผลงานของ ${artist.name}`}
      className="artist-card group block min-w-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#191421] shadow-[0_8px_28px_rgba(0,0,0,0.18)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_16px_36px_rgba(124,58,237,0.14)]">
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#49305d] via-[#292033] to-[#131019]">
          <span className="text-5xl font-bold tracking-tight text-white/25 sm:text-6xl">
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
            loading={index < 6 ? "eager" : "lazy"}
            decoding="async"
            onError={onImageError}
            className="absolute inset-0 z-[1] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}

        <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/60 via-transparent to-white/[0.03]" />

        <div className="absolute inset-x-0 bottom-0 z-[3] p-3">
          <span className="inline-flex rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[9px] font-semibold tracking-[0.15em] text-white/90 backdrop-blur-md">
            ARTIST
          </span>
        </div>
      </div>

      <div className="px-0.5 pt-3">
        <h3
          title={artist.name}
          className="truncate text-sm font-semibold text-zinc-200 transition-colors group-hover:text-white sm:text-[15px]"
        >
          {artist.name}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">ศิลปิน</p>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const { playSong, addToQueue } = useMusicPlayer();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");

  // ใช้ข้อมูลชุดเดียวกันใน Server Render และ Client Render
  // แล้วค่อยสุ่มหลังหน้าเว็บ Mount เพื่อป้องกัน Hydration Error
  const [recommendedArtists, setRecommendedArtists] =
    useState<Artist[]>(artists.slice(0, 6));

  const [recommendedSongs, setRecommendedSongs] =
    useState<Song[]>(songs.slice(0, 12));

  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    setRecommendedArtists(getRandomArtists(artists, 6));
    setRecommendedSongs(getRandomSongs(songs, 12));
  }, []);

  const searchText = normalize(query);
  const hasQuery = searchText.length > 0;

  const matchedArtists = useMemo(() => {
    if (filter === "songs") return [];

    if (hasQuery) {
      return artists.filter((artist) =>
        normalize(artist.name).includes(searchText)
      );
    }

    if (filter === "artists") {
      return recommendedArtists.slice(0, 2);
    }

    return recommendedArtists;
  }, [searchText, hasQuery, filter, recommendedArtists]);

  const matchedArtistIds = useMemo(
    () => new Set(matchedArtists.map((artist) => artist.id)),
    [matchedArtists]
  );

  const filteredSongs = useMemo(() => {
    if (filter === "artists") return [];

    if (!hasQuery) {
      return recommendedSongs;
    }

    return songs.filter((song) => {
      const titleMatches = normalize(getSongTitle(song)).includes(searchText);

      const artistMatches = getArtistIds(song).some((id) => {
        const artist = getArtistById(id);

        return (
          matchedArtistIds.has(id) ||
          normalize(artist?.name).includes(searchText)
        );
      });

      return titleMatches || artistMatches;
    });
  }, [filter, hasQuery, searchText, matchedArtistIds, recommendedSongs]);

  function showToast(message: string, duration = 2000) {
    setToast(message);
    window.setTimeout(() => setToast(""), duration);
  }

  async function copySongTitle(title: string) {
    try {
      await navigator.clipboard.writeText(title);
      showToast("คัดลอกชื่อเพลงแล้ว");
    } catch {
      showToast("คัดลอกไม่สำเร็จ กรุณาลองอีกครั้ง", 2500);
    }
  }

  function clearSearch() {
    setQuery("");
    setFilter("all");
    setActiveMenu(null);
  }

  function handlePlaySong(song: Song) {
    if (!song.id) {
      showToast("ไม่พบรหัสเพลง");
      return;
    }

    playSong(song.id);
    setActiveMenu(null);
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

  // สุ่มเฉพาะศิลปิน ไม่เปลี่ยนรายการเพลง
  function refreshArtistRecommendations() {
    setRecommendedArtists(getRandomArtists(artists, 6));
    setActiveMenu(null);
  }

  // สุ่มเฉพาะเพลง ไม่เปลี่ยนรายการศิลปิน
  function refreshSongRecommendations() {
    setRecommendedSongs(getRandomSongs(songs, 12));
    setActiveMenu(null);
  }

  const showSearchResults = hasQuery;
  const showAllArtistsLink = !showSearchResults;
  const showAllSongsLink = !showSearchResults;

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#0b0911] text-[#f7f4ff]">
      {/* แสงพื้นหลัง */}
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
              placeholder="ค้นหาเพลง ศิลปิน หรืออัลบั้ม"
              aria-label="ค้นหาเพลง ศิลปิน หรืออัลบั้ม"
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
          {/* Hero: แสดงทุกแท็บเมื่อยังไม่ได้ค้นหา */}
          {!hasQuery && (
            <section className="group relative mb-9 min-h-[190px] overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#17102e] shadow-[0_24px_80px_rgba(55,25,105,0.18)] sm:min-h-[230px]">
              <img
                src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1800&q=85"
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
                loading="eager"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#10091f] via-[#190d32]/90 to-[#291044]/35" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10091d]/70 via-transparent to-transparent" />

              <div className="relative z-10 flex min-h-[190px] items-center px-6 py-7 sm:min-h-[230px] sm:px-10">
                <div className="max-w-2xl">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200/15 bg-violet-200/[0.08] px-3 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-violet-100">
                    <MusicIcon className="h-4 w-4" />
                    <span>MUSIC PLATFORM</span>
                  </div>

                  <h1 className="max-w-xl text-[27px] font-bold leading-[1.2] tracking-tight sm:text-4xl">
                    เพลงที่ใช่ อยู่ใกล้แค่ปลายนิ้ว
                  </h1>

                  <p className="mt-3 max-w-lg text-sm leading-6 text-violet-100/75 sm:text-[15px]">
                    ค้นพบเพลงและศิลปินที่คุณชื่นชอบในที่เดียว
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-fuchsia-100/75">
                    <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_10px_#e879f9]" />
                    ค้นพบเพลงใหม่ที่เข้ากับอารมณ์ของคุณ
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Filter tabs */}
          <div className="mb-8 flex flex-wrap items-center gap-2">
            {(
              [
                { id: "all", label: "ทั้งหมด" },
                { id: "songs", label: "เพลง" },
                { id: "artists", label: "ศิลปิน" },
              ] as const
            ).map((item) => {
              const selected = filter === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setFilter(item.id);
                    setActiveMenu(null);
                  }}
                  aria-pressed={selected}
                  className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${selected
                    ? "bg-violet-500 text-white shadow-[0_5px_22px_rgba(139,92,246,0.22)]"
                    : "border border-white/[0.08] bg-white/[0.035] text-zinc-400 hover:border-violet-300/30 hover:bg-white/[0.07] hover:text-white"
                    }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Artist results */}
          {filter !== "songs" && (
            <section className="mb-10">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {hasQuery
                      ? "ศิลปินที่ตรงกับการค้นหา"
                      : "ศิลปินที่คุณอาจรู้จัก"}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    {hasQuery
                      ? "เลือกศิลปินเพื่อดูรายละเอียดและผลงาน"
                      : filter === "artists"
                        ? "ลองทำความรู้จักกับศิลปินแนะนำ"
                        : "ศิลปินที่คัดมาให้คุณสำรวจต่อได้ทันที"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* <span className="shrink-0 text-xs text-zinc-500">
                    {matchedArtists.length} รายการ
                  </span> */}

                  {/* ลำดับปุ่ม: สุ่มใหม่ ก่อนแสดงทั้งหมด */}
                  {!hasQuery && (filter === "all" || filter === "artists") && (
                    <button
                      type="button"
                      onClick={refreshArtistRecommendations}
                      className="inline-flex items-center gap-2 rounded-full border border-[#45365f] bg-[#252033] px-3 py-2 text-xs font-semibold text-violet-300 transition hover:border-violet-400 hover:bg-[#352b4a] sm:text-sm"
                      aria-label="สุ่มศิลปินแนะนำใหม่"
                    >
                      <ShuffleIcon />
                      สุ่มใหม่
                    </button>
                  )}

                  {showAllArtistsLink && (
                    <Link
                      href="/artists"
                      className="rounded-full border border-white/[0.09] px-3 py-2 text-xs font-semibold text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-400/[0.08] sm:text-sm"
                    >
                      แสดงทั้งหมด
                    </Link>
                  )}
                </div>
              </div>

              {matchedArtists.length > 0 ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
                  {matchedArtists.map((artist, index) => {
                    const imageKey = `artist-${artist.id}`;

                    return (
                      <ArtistCard
                        key={artist.id}
                        artist={artist}
                        index={index}
                        imageFailed={Boolean(imageErrors[imageKey])}
                        onImageError={() =>
                          setImageErrors((previous) => ({
                            ...previous,
                            [imageKey]: true,
                          }))
                        }
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-10 text-center">
                  <ArtistIcon className="mx-auto h-10 w-10 text-zinc-500" />
                  <h3 className="mt-4 text-lg font-semibold text-white">
                    ไม่พบศิลปิน
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    ลองค้นหาด้วยชื่อศิลปินอื่น
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Song results */}
          {filter !== "artists" && (
            <section>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    {hasQuery ? "เพลงที่ตรงกับการค้นหา" : "เพลงแนะนำ"}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    {hasQuery
                      ? `ผลลัพธ์สำหรับ “${query.trim()}”`
                      : "เลือกเพลงเพื่อเล่น หรือเพิ่มเข้าในคิว"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {hasQuery && (
                    <span className="text-xs text-zinc-500">
                      {filteredSongs.length} เพลง
                    </span>
                  )}

                  {!hasQuery && (
                    <>
                      {/* ลำดับปุ่ม: สุ่มใหม่ ก่อนแสดงทั้งหมด */}
                      <button
                        type="button"
                        onClick={refreshSongRecommendations}
                        className="inline-flex items-center gap-2 rounded-full border border-[#45365f] bg-[#252033] px-3 py-2 text-xs font-semibold text-violet-300 transition hover:border-violet-400 hover:bg-[#352b4a] sm:text-sm"
                        aria-label="สุ่มเพลงแนะนำใหม่"
                      >
                        <ShuffleIcon />
                        สุ่มใหม่
                      </button>

                      {showAllSongsLink && (
                        <Link
                          href="/songs"
                          className="rounded-full border border-white/[0.09] px-3 py-2 text-xs font-semibold text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-400/[0.08] sm:text-sm"
                        >
                          แสดงทั้งหมด
                        </Link>
                      )}
                    </>
                  )}
                </div>
              </div>

              {filteredSongs.length > 0 ? (
                <div className="overflow-visible rounded-[22px] border border-white/[0.075] bg-[#13101a]/95 shadow-[0_18px_55px_rgba(0,0,0,0.16)]">
                  {filteredSongs.map((song, index) => {
                    const key = getSongKey(song, index);
                    const imageKey = `song-${key}`;
                    const title = getSongTitle(song);
                    const artistIds = getArtistIds(song);
                    const firstArtist = getArtistById(artistIds[0]);
                    const cover = getSongCover(song);

                    return (
                      <div
                        key={key}
                        role="button"
                        tabIndex={0}
                        aria-label={`เล่นเพลง ${title}`}
                        onClick={() => handlePlaySong(song)}
                        onKeyDown={(event) => {
                          if (
                            event.target === event.currentTarget &&
                            (event.key === "Enter" || event.key === " ")
                          ) {
                            event.preventDefault();
                            handlePlaySong(song);
                          }
                        }}
                        className={`group flex min-w-0 cursor-pointer items-center gap-3 px-3.5 py-3.5 transition duration-200 hover:bg-violet-400/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500 sm:gap-4 sm:px-5 ${index !== filteredSongs.length - 1
                          ? "border-b border-white/[0.055]"
                          : ""
                          }`}
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#252033] ring-1 ring-white/[0.08] shadow-md sm:h-[54px] sm:w-[54px]">
                          {cover && !imageErrors[imageKey] ? (
                            <img
                              src={cover}
                              alt={title}
                              loading="lazy"
                              onError={() =>
                                setImageErrors((previous) => ({
                                  ...previous,
                                  [imageKey]: true,
                                }))
                              }
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#35234f] to-[#191522]">
                              <MusicIcon className="h-6 w-6 text-violet-300" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-medium text-zinc-100 transition-colors group-hover:text-white"
                            title={title}
                          >
                            {title}
                          </p>

                          <p
                            className="mt-1 truncate text-xs text-zinc-400"
                            title={getArtistName(song)}
                          >
                            {getArtistName(song)}
                          </p>
                        </div>

                        {/* Three-dot menu */}
                        <div
                          className="relative shrink-0"
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenu((current) =>
                                current === key ? null : key
                              )
                            }
                            aria-label={`ตัวเลือกเพิ่มเติมสำหรับเพลง ${title}`}
                            aria-expanded={activeMenu === key}
                            className="rounded-full p-2 text-zinc-400 transition hover:bg-[#352b4a] hover:text-white"
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

                          {activeMenu === key && (
                            <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-[#302a3b] bg-[#191522] py-1 shadow-xl">
                              <button
                                type="button"
                                onClick={() => handleAddToQueue(song)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-violet-50 transition hover:bg-[#302a3b]"
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
                                onClick={() => {
                                  void copySongTitle(title);
                                  setActiveMenu(null);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-violet-50 transition hover:bg-[#302a3b]"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  className="h-4 w-4 shrink-0"
                                  aria-hidden="true"
                                >
                                  <rect
                                    x="8"
                                    y="8"
                                    width="12"
                                    height="12"
                                    rx="2"
                                  />
                                  <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                                </svg>
                                คัดลอกชื่อเพลง
                              </button>

                              {firstArtist && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setQuery(firstArtist.name);
                                    setFilter("all");
                                    setActiveMenu(null);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-violet-50 transition hover:bg-[#302a3b]"
                                >
                                  <ArtistIcon className="h-4 w-4 shrink-0" />
                                  ดูเพลงของศิลปิน
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/[0.07] bg-[#191522] px-5 py-14 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#252033]">
                    <SearchIcon className="h-8 w-8 text-violet-300" />
                  </div>

                  <h3 className="text-lg font-semibold">
                    {hasQuery ? "ไม่พบเพลงที่ค้นหา" : "ยังไม่มีเพลงแนะนำ"}
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    {hasQuery
                      ? "ลองค้นหาด้วยชื่อเพลงหรือชื่อศิลปินอื่น"
                      : "ตรวจสอบข้อมูลเพลงในแค็ตตาล็อก"}
                  </p>

                  {hasQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="mt-5 rounded-full bg-violet-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
                    >
                      ดูเพลงทั้งหมด
                    </button>
                  )}
                </div>
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

      <style jsx>{`
        .artist-card {
          animation: artist-enter 0.45s ease-out both;
        }

        @keyframes artist-enter {
          from {
            opacity: 0;
            transform: translateY(8px);
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
        }
      `}</style>
    </main>
  );
}
