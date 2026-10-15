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
          <Link
            href={`/artists/${encodeURIComponent(artistId)}`}
            className="text-sm text-violet-300 hover:text-violet-200"
          >
            ← กลับไปหน้าศิลปิน
          </Link>

          <div className="mt-8 rounded-2xl border border-[#302a3b] bg-[#191522] p-8 text-center">
            <h1 className="text-2xl font-bold">ไม่พบอัลบั้ม</h1>
            <p className="mt-2 text-zinc-400">
              ตรวจสอบลิงก์หรือเลือกอัลบั้มอื่น
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0b12] px-4 py-8 text-[#f5f3ff] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href={`/artists/${encodeURIComponent(artist.id)}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-violet-300"
        >
          <span aria-hidden="true">←</span>
          กลับไปหน้า {artist.name}
        </Link>

        {/* Album header */}
        <section className="mt-6 flex flex-col gap-6 rounded-3xl border border-[#302a3b] bg-gradient-to-br from-[#35234f] to-[#191522] p-5 sm:flex-row sm:items-end sm:p-8">
          <div className="relative aspect-square w-44 shrink-0 overflow-hidden rounded-2xl bg-[#211a2d] shadow-2xl sm:w-56">
            {album.cover_url && (
              <img
                src={album.cover_url}
                alt={album.title}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            )}

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="text-6xl text-white/20">♫</span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium uppercase tracking-wider text-violet-300">
              {album.album_type ?? "Album"}
            </p>

            <h1 className="mt-3 break-words text-3xl font-bold sm:text-5xl">
              {album.title}
            </h1>

            <Link
              href={`/artists/${encodeURIComponent(artist.id)}`}
              className="mt-3 inline-block text-violet-300 hover:text-violet-200"
            >
              {artist.name}
            </Link>

            <p className="mt-3 text-sm text-zinc-400">
              {album.release_year ?? "ไม่ระบุปี"} · {albumSongs.length} เพลง
            </p>
          </div>
        </section>

        {/* Song list */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">รายชื่อเพลง</h2>
            <p className="mt-1 text-sm text-zinc-400">
              คลิกเพลงเพื่อเล่น หรือกดจุดสามจุดเพื่อดูตัวเลือก
            </p>
          </div>

          {albumSongs.length === 0 ? (
            <div className="rounded-2xl border border-[#302a3b] bg-[#191522] p-8 text-center">
              <p className="text-zinc-400">
                ยังไม่มีเพลงในอัลบั้มนี้
              </p>
            </div>
          ) : (
            <div className="overflow-visible rounded-2xl border border-[#302a3b] bg-[#191522]">
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
                    className={`group flex items-center gap-3 border-b border-[#302a3b] px-3 py-3 transition last:border-b-0 sm:gap-4 sm:px-5 ${
                      isCurrentSong
                        ? "bg-violet-500/10"
                        : "hover:bg-white/5"
                    } ${
                      canPlay
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    {/* Track number */}
                    <span className="w-6 shrink-0 text-center text-sm text-zinc-500">
                      {isCurrentSong ? (
                        <span className="text-violet-300">♫</span>
                      ) : (
                        index + 1
                      )}
                    </span>

                    {/* Song cover */}
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#35234f] to-[#191522]">
                      {(song.cover_url || song.image_url) && (
                        <img
                          src={song.cover_url || song.image_url || ""}
                          alt={song.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
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
                    <div className="min-w-0 flex-1">
                      <p
                        className={`truncate font-medium ${
                          isCurrentSong
                            ? "text-violet-300"
                            : "text-white"
                        }`}
                      >
                        {song.title}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm text-zinc-400">
                          {artist.name}
                        </p>

                        {song.status === "draft" && (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">
                            Draft
                          </span>
                        )}

                        {!canPlay && (
                          <span className="text-xs text-zinc-500">
                            ยังไม่มีลิงก์เล่นเพลง
                          </span>
                        )}

                        {isThisSongPlaying && (
                          <span className="text-xs text-violet-300">
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
                        className="rounded-full p-2 text-zinc-400 transition hover:bg-violet-500/20 hover:text-violet-300"
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
                              void copySongTitle(song.title);
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