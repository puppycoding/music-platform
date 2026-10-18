
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useMusicPlayer } from "../../../../../components/music-player/providers/MusicPlayerProvider";
import catalog from "../../../../../data/music-catalog";

type Artist = {
  id: string;
  name: string;
};

type Album = {
  id: string;
  title: string;
  artist_ids?: string[];
  release_year?: number | null;
  album_type?: string;
  cover_url?: string | null;
};

type Song = {
  id: string;
  title: string;
  artist_ids?: string[];
  album_id?: string | null;
  cover_url?: string | null;
  image_url?: string | null;
  duration_seconds?: number | null;
  status?: string;
  providers?: {
    youtube?: {
      video_id?: string | null;
      url?: string | null;
    };
  };
  listen_url?: string | null;
};

type Catalog = {
  artists: Artist[];
  albums: Album[];
  songs: Song[];
};

const musicCatalog = catalog as unknown as Catalog;

export default function AlbumDetailPage() {
  const params = useParams<{
    artistId: string;
    albumId: string;
  }>();

  const artistId = decodeURIComponent(params.artistId ?? "");
  const albumId = decodeURIComponent(params.albumId ?? "");

  const {
    songs: playerSongs,
    currentSong,
    isPlaying,
    playSong,
    addToQueue,
  } = useMusicPlayer();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const artist = (musicCatalog.artists ?? []).find(
    (item) => item.id === artistId
  );

  const album = (musicCatalog.albums ?? []).find(
    (item) =>
      item.id === albumId &&
      item.artist_ids?.includes(artistId)
  );

  const albumSongs = (musicCatalog.songs ?? []).filter(
    (song) => song.album_id === albumId
  );

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

  function handleAddToQueue(song: Song) {
    const playerTrack = playerSongs.find(
      (track) => track.id === song.id
    );

    if (!playerTrack) {
      setToast("ไม่พบเพลงในระบบเล่นเพลง");
      window.setTimeout(() => setToast(""), 2000);
      setActiveMenu(null);
      return;
    }

    try {
      addToQueue(song.id);
      setToast("เพิ่มเพลงเข้าคิวแล้ว");
    } catch (error) {
      console.error("เพิ่มเพลงเข้าคิวไม่สำเร็จ:", error);
      setToast("เพิ่มเพลงเข้าคิวไม่สำเร็จ");
    }

    setActiveMenu(null);
    window.setTimeout(() => setToast(""), 2000);
  }

  if (!artist || !album) {
    return (
      <main className="min-h-screen bg-[#0d0b12] px-4 py-12 text-[#f5f3ff] sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#302a3b] bg-gradient-to-br from-[#21182f] via-[#191522] to-[#121019] p-10 text-center shadow-xl sm:p-14">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/10 text-4xl text-violet-300">
              ♫
            </div>
            <h1 className="mt-6 text-2xl font-bold sm:text-3xl">
              ไม่พบอัลบั้ม
            </h1>
            <p className="mt-3 text-sm text-zinc-400">
              ตรวจสอบลิงก์หรือเลือกอัลบั้มอื่น
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0b12] px-4 py-6 text-[#f5f3ff] sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Album header */}
        <section className="relative isolate overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#35234f] via-[#21182f] to-[#15111d] shadow-2xl shadow-black/20">
          {/* Decorative background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-24 -z-10 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-28 left-1/3 -z-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl"
          />

          <div className="flex flex-col gap-6 p-5 sm:flex-row sm:items-end sm:gap-8 sm:p-8 lg:gap-10 lg:p-10">
            {/* Album cover */}
            <div className="relative mx-auto aspect-square w-48 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#45315f] to-[#191522] shadow-2xl shadow-black/40 sm:mx-0 sm:w-56 lg:w-64">
              {album.cover_url && (
                <img
                  src={album.cover_url}
                  alt={album.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="text-7xl text-white/20">♫</span>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            {/* Album information */}
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-violet-200">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
                {album.album_type ?? "Album"}
              </div>

              <h1 className="mt-4 break-words text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                {album.title}
              </h1>

              <Link
                href={`/artists/${encodeURIComponent(artist.id)}`}
                className="mt-4 inline-flex max-w-full items-center justify-center gap-2 text-base font-semibold text-violet-300 transition hover:text-violet-200 sm:justify-start sm:text-lg"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-400/15 text-xs">
                  ♫
                </span>
                <span className="truncate">{artist.name}</span>
              </Link>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-400 sm:justify-start">
                <span className="rounded-lg border border-white/[0.08] bg-black/15 px-3 py-1.5">
                  {album.release_year ?? "ไม่ระบุปี"}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="rounded-lg border border-white/[0.08] bg-black/15 px-3 py-1.5">
                  {albumSongs.length} เพลง
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Song list */}
        <section className="mt-10 sm:mt-12">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-violet-400" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Tracklist
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                รายชื่อเพลง
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                คลิกเพลงเพื่อเล่น หรือกดจุดสามจุดเพื่อดูตัวเลือก
              </p>
            </div>

            <span className="self-start rounded-full border border-[#302a3b] bg-[#191522] px-3 py-1.5 text-xs font-medium text-zinc-400 sm:self-auto">
              {albumSongs.length} เพลงทั้งหมด
            </span>
          </div>

          {albumSongs.length === 0 ? (
            <div className="rounded-2xl border border-[#302a3b] bg-gradient-to-br from-[#191522] to-[#14111b] p-10 text-center sm:p-14">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-3xl text-violet-300">
                ♫
              </div>
              <p className="mt-4 font-medium text-zinc-300">
                ยังไม่มีเพลงในอัลบั้มนี้
              </p>
            </div>
          ) : (
            <div className="overflow-visible rounded-2xl border border-[#302a3b] bg-[#15121c]/90 p-2 shadow-xl shadow-black/10 sm:p-3">
              {albumSongs.map((song, index) => {
                const playerTrack = playerSongs.find(
                  (track) => track.id === song.id
                );

                const isCurrentSong = currentSong?.id === song.id;
                const isThisSongPlaying = isCurrentSong && isPlaying;
                const canPlay = Boolean(playerTrack?.videoId);
                const menuIsOpen = activeMenu === song.id;

                const handlePlay = () => {
                  if (canPlay) {
                    playSong(song.id);
                  }
                };

                return (
                  <div
                    key={song.id}
                    role="button"
                    tabIndex={canPlay ? 0 : -1}
                    aria-disabled={!canPlay}
                    aria-label={`เล่นเพลง ${song.title}`}
                    onClick={handlePlay}
                    onKeyDown={(event) => {
                      if (
                        canPlay &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        handlePlay();
                      }
                    }}
                    className={`group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition duration-200 sm:gap-4 sm:px-4 ${isCurrentSong
                        ? "border-violet-400/20 bg-violet-500/[0.10]"
                        : "hover:border-white/[0.06] hover:bg-white/[0.035]"
                      } ${canPlay
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60"
                      }`}
                  >
                    {/* Track number */}
                    <span className="w-6 shrink-0 text-center text-sm tabular-nums text-zinc-500">
                      {isCurrentSong ? (
                        <span className="text-lg text-violet-300">♫</span>
                      ) : (
                        index + 1
                      )}
                    </span>

                    {/* Song cover */}
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#35234f] to-[#191522] ring-1 ring-white/[0.06] sm:h-14 sm:w-14">
                      {(song.cover_url || song.image_url) && (
                        <img
                          src={song.cover_url || song.image_url || ""}
                          alt={song.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                      )}

                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xl text-white/30">
                        ♫
                      </div>
                    </div>

                    {/* Song title and artist */}
                    <div className="min-w-0 flex-1 py-0.5">
                      <p
                        className={`truncate font-semibold transition-colors ${isCurrentSong
                            ? "text-violet-300"
                            : "text-zinc-100 group-hover:text-white"
                          }`}
                      >
                        {song.title}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm text-zinc-400">
                          {artist.name}
                        </p>

                        {song.status === "draft" && (
                          <span className="rounded-full border border-amber-400/15 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                            Draft
                          </span>
                        )}

                        {!canPlay && (
                          <span className="text-xs text-zinc-500">
                            ยังไม่มีลิงก์เล่นเพลง
                          </span>
                        )}

                        {isThisSongPlaying && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300">
                            <span className="flex h-3 items-end gap-0.5">
                              <span className="h-2 w-0.5 animate-pulse rounded-full bg-violet-300" />
                              <span className="h-3 w-0.5 animate-pulse rounded-full bg-violet-300 [animation-delay:150ms]" />
                              <span className="h-1.5 w-0.5 animate-pulse rounded-full bg-violet-300 [animation-delay:300ms]" />
                            </span>
                            กำลังเล่น
                          </span>
                        )}
                      </div>
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
                            current === song.id ? null : song.id
                          )
                        }
                        aria-label={`ตัวเลือกเพิ่มเติมสำหรับเพลง ${song.title}`}
                        aria-expanded={menuIsOpen}
                        className={`rounded-full p-2.5 transition ${menuIsOpen
                            ? "bg-violet-500/20 text-violet-300"
                            : "text-zinc-400 hover:bg-violet-500/15 hover:text-violet-300"
                          }`}
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

                      {menuIsOpen && (
                        <div className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-[#393047] bg-[#201a2b] py-1.5 shadow-2xl shadow-black/40">
                          {/* เพิ่มเข้าคิว */}
                          <button
                            type="button"
                            onClick={() => handleAddToQueue(song)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#f5f3ff] transition hover:bg-violet-500/10"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4 shrink-0 text-violet-300"
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
                              void copySongTitle(song.title);
                              setActiveMenu(null);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#f5f3ff] transition hover:bg-violet-500/10"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-4 w-4 shrink-0 text-violet-300"
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
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Copy notification */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-[#45365f] bg-[#252033] px-5 py-3 text-sm text-white shadow-2xl"
        >
          {toast}
        </div>
      )}
    </main>
  );
}
