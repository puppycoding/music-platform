
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMusicPlayer } from "../../components/music-player/providers/MusicPlayerProvider";
import catalog from "../../data/music-catalog";

type Artist = {
  id: string;
  name: string;
  country?: string;
  spotify_artist_id?: string;
  spotify_url?: string;
  image_url?: string;
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

function getArtistCover(artist: Artist): string | undefined {
  return artist.image_url || undefined;
}

function getCover(song: Song): string | undefined {
  if (song.cover_url) {
    return song.cover_url;
  }

  if (song.image_url) {
    return song.image_url;
  }

  const youtubeId = song.providers?.youtube?.video_id;

  if (youtubeId) {
    return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  }

  return undefined;
}

function getSongKey(song: Song, index: number): string {
  return song.id ?? `${getSongTitle(song)}-${index}`;
}

function SearchIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function MusicIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
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

function getRandomSongs(source: Song[], count = 12): Song[] {
  const shuffled = [...source];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * ใช้ลำดับเพลงจาก catalog สำหรับการแสดงผลครั้งแรก
 * เพื่อให้ Server และ Client แสดงผลตรงกัน
 */
function getInitialSongs(source: Song[], count = 12): Song[] {
  return source.slice(0, Math.min(count, source.length));
}

export default function SearchPage() {
  const { playSong, addToQueue } = useMusicPlayer();

  const [query, setQuery] = useState("");

  // ใช้ลำดับคงที่ในรอบแรก เพื่อป้องกัน Hydration mismatch
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>(() =>
    getInitialSongs(songs, 12)
  );

  const [imageErrors, setImageErrors] = useState<
    Record<string, boolean>
  >({});

  const [toast, setToast] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const matchedArtists = useMemo(() => {
    const searchText = normalize(query);

    if (!searchText) {
      return [];
    }

    return artists.filter((artist) =>
      normalize(artist.name).includes(searchText)
    );
  }, [query]);

  const matchedArtistIds = useMemo(
    () => new Set(matchedArtists.map((artist) => artist.id)),
    [matchedArtists]
  );

  const filteredSongs = useMemo(() => {
    const searchText = normalize(query);

    if (!searchText) {
      return recommendedSongs;
    }

    return songs.filter((song) => {
      const titleMatches = normalize(
        getSongTitle(song)
      ).includes(searchText);

      const artistMatches = getArtistIds(song).some((id) => {
        const artist = getArtistById(id);

        return (
          matchedArtistIds.has(id) ||
          normalize(artist?.name).includes(searchText)
        );
      });

      return titleMatches || artistMatches;
    });
  }, [query, matchedArtistIds, recommendedSongs]);

  async function copySongTitle(title: string) {
    try {
      await navigator.clipboard.writeText(title);

      setToast("คัดลอกชื่อเพลงแล้ว");

      window.setTimeout(() => {
        setToast("");
      }, 2000);
    } catch {
      setToast("คัดลอกไม่สำเร็จ กรุณาลองอีกครั้ง");

      window.setTimeout(() => {
        setToast("");
      }, 2500);
    }
  }

  function clearSearch() {
    setQuery("");
    setActiveMenu(null);
  }

  function handlePlaySong(song: Song) {
    if (!song.id) {
      setToast("ไม่พบรหัสเพลง");
      window.setTimeout(() => setToast(""), 2000);
      return;
    }

    playSong(song.id);
    setActiveMenu(null);
  }

  // เพิ่มเพลงเข้าคิวโดยไม่เปลี่ยนเพลงที่กำลังเล่น
  function handleAddToQueue(song: Song) {
    if (!song.id) {
      setToast("ไม่พบรหัสเพลง");
      window.setTimeout(() => setToast(""), 2000);
      return;
    }

    addToQueue(song.id);
    setToast("เพิ่มเพลงเข้าคิวแล้ว");
    setActiveMenu(null);

    window.setTimeout(() => setToast(""), 2000);
  }

  return (
    <main className="min-h-screen bg-[#0d0b12] text-[#f5f3ff]">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-30 border-b border-[#302a3b] bg-[#13101b]/95 px-4 py-4 backdrop-blur-xl sm:px-6 md:left-60 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#302a3b] bg-[#191522] px-4 transition focus-within:border-[#8b5cf6]">
            <SearchIcon className="h-5 w-5 shrink-0 text-[#a1a1aa]" />

            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveMenu(null);
              }}
              placeholder="ค้นหาชื่อเพลงหรือศิลปิน..."
              aria-label="ค้นหาชื่อเพลงหรือศิลปิน"
              className="h-12 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#777180] sm:text-base"
            />

            {query.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="ล้างคำค้นหา"
                className="shrink-0 rounded-full p-2 text-[#a1a1aa] transition hover:bg-[#302a3b] hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="px-4 pb-32 pt-28 sm:px-6 md:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium tracking-[0.2em] text-[#a78bfa]">
              FIND YOUR NEXT FAVORITE
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ค้นหาเพลง
            </h1>

            <p className="mt-2 text-sm text-[#a1a1aa] sm:text-base">
              ค้นหาเพลงหรือศิลปินที่คุณชื่นชอบ
            </p>
          </div>

          {/* Artist results */}
          {matchedArtists.length > 0 && (
            <section className="mb-10">
              <div className="mb-4 flex items-end justify-between gap-3">
                <h2 className="text-xl font-bold">ศิลปิน</h2>

                <span className="text-sm text-[#a1a1aa]">
                  {matchedArtists.length} ศิลปิน
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {matchedArtists.map((artist) => {
                  const imageKey = `artist-${artist.id}`;
                  const artistCover = getArtistCover(artist);

                  return (
                    <Link
                      key={artist.id}
                      href={`/artists/${encodeURIComponent(artist.id)}?returnTo=%2Fsearch`}
                      onClick={() => {
                        sessionStorage.setItem(
                          "artistDetailReturnTo",
                          window.location.pathname + window.location.search
                        );
                      }}
                      className="group block min-w-0 rounded-2xl border border-[#302a3b] bg-[#191522] p-3 text-left transition hover:bg-[#252033]"
                    >
                      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-[#252033]">
                        {artistCover && !imageErrors[imageKey] ? (
                          <img
                            src={artistCover}
                            alt={artist.name}
                            loading="lazy"
                            onError={() =>
                              setImageErrors((previous) => ({
                                ...previous,
                                [imageKey]: true,
                              }))
                            }
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#35234f] to-[#191522]">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="h-12 w-12 text-[#a78bfa]"
                              aria-hidden="true"
                            >
                              <circle cx="12" cy="8" r="4" />
                              <path d="M4 21a8 8 0 0 1 16 0" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <p className="truncate font-semibold">
                        {artist.name}
                      </p>

                      <p className="mt-1 text-xs text-[#a1a1aa]">
                        ศิลปิน
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Song results */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">
                  {query ? "ผลการค้นหาเพลง" : "เพลงแนะนำ"}
                </h2>

                <p className="mt-1 text-sm text-[#a1a1aa]">
                  {query
                    ? `ผลลัพธ์สำหรับ “${query}”`
                    : "ลองค้นหาเพลงหรือศิลปินที่คุณชอบ"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm text-[#a1a1aa]">
                  {filteredSongs.length} เพลง
                </span>

                {!query.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setRecommendedSongs(getRandomSongs(songs, 12));
                      setActiveMenu(null);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-[#45365f] bg-[#252033] px-3 py-2 text-xs font-semibold text-[#c4b5fd] transition hover:border-[#8b5cf6] hover:bg-[#352b4a] sm:text-sm"
                    aria-label="สุ่มเพลงแนะนำใหม่"
                    title="สุ่มเพลงแนะนำใหม่"
                  >
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

                    <span>สุ่มใหม่</span>
                  </button>
                )}
              </div>
            </div>

            {filteredSongs.length > 0 ? (
              <div className="overflow-visible rounded-2xl border border-[#302a3b] bg-[#191522]">
                {filteredSongs.map((song, index) => {
                  const key = getSongKey(song, index);
                  const imageKey = `song-${key}`;
                  const title = getSongTitle(song);
                  const artistIds = getArtistIds(song);
                  const firstArtist = getArtistById(artistIds[0]);
                  const cover = getCover(song);

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
                      className={`group flex min-w-0 cursor-pointer items-center gap-3 px-3 py-3 transition hover:bg-[#252033] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8b5cf6] sm:gap-4 sm:px-5 ${
                        index !== filteredSongs.length - 1
                          ? "border-b border-[#302a3b]"
                          : ""
                      }`}
                    >
                      {/* Song cover */}
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#252033] sm:h-14 sm:w-14">
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
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#35234f] to-[#191522]">
                            <MusicIcon className="h-6 w-6 text-[#a78bfa]" />
                          </div>
                        )}
                      </div>

                      {/* Song title and artist */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-sm font-semibold text-[#f5f3ff] sm:text-base"
                          title={title}
                        >
                          {title}
                        </p>

                        <p
                          className="mt-1 truncate text-xs text-[#a1a1aa] sm:text-sm"
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
                          className="rounded-full p-2 text-[#a1a1aa] transition hover:bg-[#352b4a] hover:text-white"
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
                            {/* เพิ่มเข้าคิว */}
                            <button
                              type="button"
                              onClick={() => handleAddToQueue(song)}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#f5f3ff] transition hover:bg-[#302a3b]"
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

                            {/* คัดลอกชื่อเพลง */}
                            <button
                              type="button"
                              onClick={() => {
                                void copySongTitle(title);
                                setActiveMenu(null);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#f5f3ff] transition hover:bg-[#302a3b]"
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

                            {/* ดูเพลงของศิลปิน */}
                            {firstArtist?.name && (
                              <button
                                type="button"
                                onClick={() => {
                                  setQuery(firstArtist.name);
                                  setActiveMenu(null);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#f5f3ff] transition hover:bg-[#302a3b]"
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
              <div className="rounded-2xl border border-[#302a3b] bg-[#191522] px-5 py-14 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#252033]">
                  <SearchIcon className="h-8 w-8 text-[#a78bfa]" />
                </div>

                <h3 className="text-lg font-semibold">
                  ไม่พบเพลงที่ค้นหา
                </h3>

                <p className="mt-2 text-sm text-[#a1a1aa]">
                  ลองค้นหาด้วยชื่อเพลงหรือชื่อศิลปินอื่น
                </p>

                <button
                  type="button"
                  onClick={clearSearch}
                  className="mt-5 rounded-full bg-[#8b5cf6] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a78bfa]"
                >
                  ดูเพลงทั้งหมด
                </button>
              </div>
            )}
          </section>

          {/* Footer */}
          <footer className="mt-10 border-t border-[#302a3b] pt-5 text-center text-xs text-[#777180]">
            Moodify — Discover music that matches you.
          </footer>
        </div>
      </div>

      {/* Copy notification */}
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
