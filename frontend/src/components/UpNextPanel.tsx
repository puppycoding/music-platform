
"use client";

import { useState } from "react";
import { useMusicPlayer } from "./music/MusicPlayerProvider";

export default function UpNextPanel() {
  const [isOpen, setIsOpen] = useState(false);

  const { songs, currentSong, playSong } = useMusicPlayer();

  // หาเพลงปัจจุบันใน catalog
  const currentIndex = currentSong
    ? songs.findIndex((song) => song.id === currentSong.id)
    : -1;

  // แสดงเพลงที่อยู่ถัดจากเพลงปัจจุบัน
  // ถ้ายังไม่ได้เลือกเพลง ให้แสดงเพลงทั้งหมดที่เล่นได้
  const nextSongs = (
    currentIndex >= 0
      ? songs.slice(currentIndex + 1)
      : songs
  )
    .filter((song) => Boolean(song.videoId))
    .slice(0, 20);

  function selectSong(songId: string) {
    playSong(songId);
    setIsOpen(false);
  }

  function formatDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return (
    <>
      {/* ปุ่มเปิดรายการเพลง */}
      <button
        type="button"
        aria-label="รายการเพลง"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="transition hover:scale-110 hover:text-[#a78bfa]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M9 6h11" />
          <path d="M9 12h11" />
          <path d="M9 18h11" />
          <circle cx="4" cy="6" r="0.7" fill="currentColor" />
          <circle cx="4" cy="12" r="0.7" fill="currentColor" />
          <circle cx="4" cy="18" r="0.7" fill="currentColor" />
        </svg>
      </button>

      {/* พื้นหลังด้านหลังแผง */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* แผง Up Next ด้านขวา */}
      <aside
        aria-label="รายการเพลงถัดไป"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-[70] flex h-dvh w-[min(100%,380px)] flex-col border-l border-[#302a3b] bg-[#171320] text-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#302a3b] px-5 py-5">
          <div>
            <h2 className="text-lg font-bold">Up Next</h2>
            <p className="mt-1 text-xs text-[#a1a1aa]">
              {currentSong ? "รายการเพลงจาก Music Catalog" : "เลือกเพลงที่ต้องการฟัง"}
            </p>
          </div>

          <button
            type="button"
            aria-label="ปิดรายการเพลง"
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-[#a1a1aa] transition hover:bg-[#252033] hover:text-[#a78bfa]"
          >
            ×
          </button>
        </div>

        {/* เพลงที่กำลังเล่น */}
        <div className="shrink-0 border-b border-[#302a3b] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">
            Now Playing
          </p>

          {currentSong ? (
            <div className="flex items-center gap-3 rounded-xl bg-[#252033] p-3">
              {currentSong.coverUrl ? (
                <img
                  src={currentSong.coverUrl}
                  alt={`ปกเพลง ${currentSong.title}`}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[#34294a] text-2xl text-[#a78bfa]">
                  ♪
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {currentSong.title}
                </p>
                <p className="mt-1 truncate text-xs text-[#a1a1aa]">
                  {currentSong.artistName}
                </p>
              </div>

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 shrink-0 text-[#a78bfa]"
                aria-hidden="true"
              >
                <rect x="5" y="4" width="4" height="16" rx="1" />
                <rect x="15" y="4" width="4" height="16" rx="1" />
              </svg>
            </div>
          ) : (
            <div className="rounded-xl bg-[#252033] px-4 py-5 text-center">
              <p className="text-sm text-[#a1a1aa]">
                ยังไม่ได้เลือกเพลง
              </p>
              <p className="mt-1 text-xs text-[#777180]">
                เลือกเพลงจากหน้าแรกเพื่อเริ่มฟัง
              </p>
            </div>
          )}
        </div>

        {/* รายการเพลง เลื่อนขึ้นลงได้ */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">เพลงถัดไป</h3>

            <span className="rounded-full bg-[#252033] px-2.5 py-1 text-xs text-[#a1a1aa]">
              {nextSongs.length} เพลง
            </span>
          </div>

          {nextSongs.length > 0 ? (
            <div className="space-y-2">
              {nextSongs.map((song, index) => (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => selectSong(song.id)}
                  className="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[#252033]"
                >
                  <span className="w-4 shrink-0 text-center text-xs text-[#777180] group-hover:hidden">
                    {index + 1}
                  </span>

                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="hidden h-4 w-4 shrink-0 text-[#a78bfa] group-hover:block"
                    aria-hidden="true"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>

                  {song.coverUrl ? (
                    <img
                      src={song.coverUrl}
                      alt={`ปกเพลง ${song.title}`}
                      loading="lazy"
                      className="h-11 w-11 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#34294a] text-lg text-[#a78bfa]">
                      ♪
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#f4f1fa]">
                      {song.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#a1a1aa]">
                      {song.artistName}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs text-[#777180]">
                    {formatDuration(song.durationSeconds)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-[#a1a1aa]">
                {currentSong
                  ? "ไม่มีเพลงถัดไปในรายการ"
                  : "ยังไม่มีรายการเพลง"}
              </p>
              <p className="mt-2 text-xs text-[#777180]">
                เพลงที่มี YouTube video ID จะแสดงที่นี่
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[#302a3b] px-5 py-4">
          <p className="text-xs text-[#777180]">
            Moodify · Your music, your mood.
          </p>
        </div>
      </aside>
    </>
  );
}
