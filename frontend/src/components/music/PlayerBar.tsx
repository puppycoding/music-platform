"use client";

import { useMusicPlayer } from "./MusicPlayerProvider";
import UpNextPanel from "../UpNextPanel";
import PlayerVolume from "../PlayerVolume";

function ShuffleIcon() {
  return (
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
      <path d="m16 3 5 0v5" />
      <path d="M4 20 21 3" />
      <path d="m16 16 5 5v-5" />
      <path d="M15 15 21 21" />
      <path d="m4 4 5 5" />
    </svg>
  );
}

function PreviousIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 5h2v14H6z" />
      <path d="M19 5v14L8 12z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M16 5h2v14h-2z" />
      <path d="M5 5v14l11-7z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M7 4.5a1 1 0 0 1 1.5-.86l12 7.5a1 1 0 0 1 0 1.72l-12 7.5A1 1 0 0 1 7 19.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  );
}

function RepeatIcon() {
  return (
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
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11V9a3 3 0 0 1 3-3h15" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v2a3 3 0 0 1-3 3H3" />
    </svg>
  );
}

export default function PlayerBar() {
  const {
    songs,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    playNext,
    playPrevious,
  } = useMusicPlayer();

  function shuffleSong() {
    const playableSongs = songs.filter(
      (song) =>
        Boolean(song.videoId) &&
        song.id !== currentSong?.id,
    );

    if (playableSongs.length === 0) return;

    const randomIndex = Math.floor(
      Math.random() * playableSongs.length,
    );

    playSong(playableSongs[randomIndex].id);
  }

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 flex min-h-20 items-center border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-xl md:left-60 md:px-6">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 md:grid-cols-[minmax(0,1fr)_minmax(300px,1.2fr)_minmax(0,1fr)] md:gap-4">

        {/* ซ้าย: เพลงที่กำลังเล่น */}
        <div className="flex min-w-0 items-center gap-3">
          {currentSong ? (
            <>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#252033]">
                {currentSong.coverUrl ? (
                  <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl">
                    🎵
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {currentSong.title}
                </p>
                <p className="truncate text-xs text-muted">
                  {currentSong.artistName}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#252033] text-[#a78bfa]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  ยังไม่ได้เลือกเพลง
                </p>
                <p className="truncate text-xs text-muted">
                  กดปุ่มเล่นบนการ์ดเพื่อเปิดเพลง
                </p>
              </div>
            </>
          )}
        </div>

        {/* กลาง: ปุ่มควบคุมเพลง */}
        <div className="col-span-2 col-start-1 row-start-2 flex w-fit max-w-full items-center justify-center justify-self-center gap-4 rounded-full px-5 py-2.5 text-muted sm:gap-5 sm:px-6 md:col-span-1 md:col-start-2 md:row-start-1 md:gap-4 md:px-5 md:py-2.5">
          <button
            type="button"
            aria-label="สุ่มเพลง"
            title="สุ่มเพลง"
            disabled={
              !currentSong ||
              !songs.some(
                (song) =>
                  Boolean(song.videoId) &&
                  song.id !== currentSong.id,
              )
            }
            onClick={shuffleSong}
            className="hidden transition hover:scale-110 hover:text-[#a78bfa] disabled:opacity-40 sm:block"
          >
            <ShuffleIcon />
          </button>

          <button
            type="button"
            aria-label="เพลงก่อนหน้า"
            title="เพลงก่อนหน้า"
            onClick={playPrevious}
            disabled={!currentSong}
            className="transition hover:scale-110 hover:text-[#a78bfa] disabled:opacity-40"
          >
            <PreviousIcon />
          </button>

          <button
            type="button"
            aria-label={isPlaying ? "หยุดเพลงชั่วคราว" : "เล่นเพลง"}
            title={isPlaying ? "หยุดเพลงชั่วคราว" : "เล่นเพลง"}
            onClick={togglePlay}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition hover:scale-110 hover:text-[#a78bfa]"
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            type="button"
            aria-label="เพลงถัดไป"
            title="เพลงถัดไป"
            onClick={playNext}
            disabled={!currentSong}
            className="transition hover:scale-110 hover:text-[#a78bfa] disabled:opacity-40"
          >
            <NextIcon />
          </button>

          <button
            type="button"
            aria-label="เล่นซ้ำ"
            title="เล่นซ้ำยังไม่เปิดใช้งาน"
            disabled
            className="hidden transition hover:scale-110 hover:text-[#a78bfa] disabled:opacity-40 sm:block"
          >
            <RepeatIcon />
          </button>
        </div>

        {/* ขวา: คิวเพลงและระดับเสียง */}
        <div className="col-start-2 row-start-1 flex min-w-0 items-center justify-end gap-3 text-muted sm:gap-4 md:col-start-3 md:row-start-1">
          <UpNextPanel />
          <PlayerVolume />
        </div>
      </div>
    </footer>
  );
}