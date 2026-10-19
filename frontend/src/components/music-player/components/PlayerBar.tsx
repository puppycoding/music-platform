
"use client";

import { useState } from "react";
import { useMusicPlayer } from "../providers/MusicPlayerProvider";
import UpNextPanel from "../../queue/UpNextPanel";
import PlayerVolume from "./PlayerVolume";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
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
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M6 5h2v14H6z" />
      <path d="M19 5v14L8 12z" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M16 5h2v14h-2z" />
      <path d="M5 5v14l11-7z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M7 4.5a1 1 0 0 1 1.5-.86l12 7.5a1 1 0 0 1 0 1.72l-12 7.5A1 1 0 0 1 7 19.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  );
}

function RepeatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11V9a3 3 0 0 1 3-3h15" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v2a3 3 0 0 1-3 3H3" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M4 6h13" />
      <path d="M4 11h13" />
      <path d="M4 16h9" />
      <path d="M18 14v7" />
      <path d="m15 18 3 3 3-3" />
    </svg>
  );
}

export default function PlayerBar() {
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const {
    songs,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    seekTo,
    playRandomSong,
    repeatOne,
    toggleRepeat,
    togglePlay,
    playNext,
    playPrevious,
  } = useMusicPlayer();

  const totalDuration =
    duration > 0 ? duration : currentSong?.durationSeconds ?? 0;

  const displayedTime = isSeeking ? seekTime : currentTime;

  const progress =
    totalDuration > 0
      ? Math.min(100, (displayedTime / totalDuration) * 100)
      : 0;

  function finishSeeking() {
    if (!isSeeking) return;

    seekTo(seekTime);
    setIsSeeking(false);
  }

  return (
    <>
      <footer
        className="
          fixed inset-x-0 bottom-0 z-[60]
          border-t border-white/[0.08]
          bg-[#100e17]/95
          text-white
          shadow-[0_-8px_30px_rgba(0,0,0,0.18)]
          backdrop-blur-2xl
        "
      >
        <div
          className="
            mx-auto grid min-h-[88px] w-full min-w-0
            grid-cols-[minmax(0,1fr)_auto]
            items-center gap-x-3 gap-y-2
            px-3 py-2.5
            sm:px-5
            md:grid-cols-[minmax(0,1fr)_minmax(280px,1.35fr)_minmax(0,1fr)]
            md:gap-x-5 md:px-6 md:py-3
          "
        >
          {/* ซ้าย: รูปปกและรายละเอียดเพลง */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#211b30] shadow-[0_0_16px_rgba(167,139,250,0.08)]">
              {currentSong?.coverUrl ? (
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#34244d] to-[#17121f] text-xl text-violet-300">
                  ♫
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold tracking-wide text-white">
                {currentSong?.title ?? "ยังไม่ได้เลือกเพลง"}
              </p>

              <p className="mt-1 truncate text-xs text-white/45">
                {currentSong?.artistName ?? "เลือกเพลงเพื่อเริ่มฟัง"}
              </p>
            </div>
          </div>

          {/* กลาง: ปุ่มควบคุมเพลงและ Progress Bar */}
          <div
            className="
              col-span-2 col-start-1 row-start-2
              mx-auto flex w-full min-w-0 max-w-[540px]
              flex-col gap-1.5
              md:col-span-1 md:col-start-2 md:row-start-1
              md:gap-2
            "
          >
            <div className="flex items-center justify-center gap-5 text-white/50 sm:gap-6">
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
                onClick={playRandomSong}
                className="hidden transition-colors hover:text-violet-300 disabled:opacity-25 sm:block"
              >
                <ShuffleIcon />
              </button>

              <button
                type="button"
                aria-label="เพลงก่อนหน้า"
                title="เพลงก่อนหน้า"
                disabled={!currentSong}
                onClick={playPrevious}
                className="transition-colors hover:text-white disabled:opacity-25"
              >
                <PreviousIcon />
              </button>

              <button
                type="button"
                aria-label={isPlaying ? "หยุดเพลงชั่วคราว" : "เล่นเพลง"}
                title={isPlaying ? "หยุดเพลงชั่วคราว" : "เล่นเพลง"}
                onClick={togglePlay}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#17121f] shadow-[0_0_18px_rgba(167,139,250,0.12)] transition-all hover:scale-105 hover:bg-violet-200 active:scale-95"
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>

              <button
                type="button"
                aria-label="เพลงถัดไป"
                title="เพลงถัดไป"
                disabled={!currentSong}
                onClick={playNext}
                className="transition-colors hover:text-white disabled:opacity-25"
              >
                <NextIcon />
              </button>

              <button
                type="button"
                aria-label="เล่นซ้ำ"
                title={repeatOne ? "ปิดเล่นซ้ำเพลงนี้" : "เล่นซ้ำเพลงนี้"}
                aria-pressed={repeatOne}
                onClick={toggleRepeat}
                className={`hidden sm:block ${repeatOne ? "text-violet-300" : "hover:text-violet-300"}`}
              >
                <RepeatIcon />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="w-8 shrink-0 text-right font-mono text-[10px] tabular-nums text-white/45">
                {formatTime(displayedTime)}
              </span>

              <div className="group relative flex h-4 min-w-0 flex-1 items-center">
                <div className="absolute inset-x-0 h-[3px] overflow-hidden rounded-full bg-white/[0.12] transition-all duration-200 group-hover:h-[5px]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 via-violet-400 to-fuchsia-400 shadow-[0_0_12px_rgba(167,139,250,0.55)]"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <input
                  type="range"
                  aria-label="ตำแหน่งเพลง"
                  min={0}
                  max={totalDuration || 1}
                  step={1}
                  value={Math.min(displayedTime, totalDuration || 1)}
                  disabled={!currentSong || totalDuration <= 0}
                  onPointerDown={() => {
                    setIsSeeking(true);
                    setSeekTime(currentTime);
                  }}
                  onChange={(event) => {
                    setIsSeeking(true);
                    setSeekTime(Number(event.currentTarget.value));
                  }}
                  onPointerUp={finishSeeking}
                  onPointerCancel={finishSeeking}
                  onKeyUp={(event) => {
                    if (
                      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        event.key,
                      )
                    ) {
                      const value = Number(event.currentTarget.value);
                      setSeekTime(value);
                      seekTo(value);
                      setIsSeeking(false);
                    }
                  }}
                  onBlur={finishSeeking}
                  className="
                    absolute inset-0 z-10 h-full w-full
                    cursor-pointer appearance-none bg-transparent
                    [&::-webkit-slider-runnable-track]:h-1
                    [&::-webkit-slider-runnable-track]:bg-transparent
                    [&::-webkit-slider-thumb]:mt-[-4px]
                    [&::-webkit-slider-thumb]:h-3
                    [&::-webkit-slider-thumb]:w-3
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-white
                    [&::-webkit-slider-thumb]:bg-violet-300
                    [&::-webkit-slider-thumb]:opacity-0
                    [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(167,139,250,0.9)]
                    group-hover:[&::-webkit-slider-thumb]:opacity-100
                    [&::-moz-range-thumb]:h-3
                    [&::-moz-range-thumb]:w-3
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:border-2
                    [&::-moz-range-thumb]:border-white
                    [&::-moz-range-thumb]:bg-violet-300
                    [&::-moz-range-thumb]:opacity-0
                    group-hover:[&::-moz-range-thumb]:opacity-100
                    disabled:cursor-not-allowed
                  "
                />
              </div>

              <span className="w-8 shrink-0 font-mono text-[10px] tabular-nums text-white/45">
                {formatTime(totalDuration)}
              </span>
            </div>
          </div>

          {/* ขวา: หัวใจ → ปรับเสียง → คิวเพลง */}
          <div className="col-start-2 row-start-1 flex min-w-0 items-center justify-end gap-2 text-white/60 sm:gap-3 md:col-start-3 md:row-start-1">
            {/* รายการโปรด */}
            <button
              type="button"
              aria-label={isFavorite ? "เลิกถูกใจเพลง" : "ถูกใจเพลง"}
              aria-pressed={isFavorite}
              title={isFavorite ? "เลิกถูกใจเพลง" : "ถูกใจเพลง"}
              onClick={() => setIsFavorite((value) => !value)}
              className={`
                flex h-9 w-9 shrink-0 items-center justify-center
                rounded-full transition-all duration-200
                hover:scale-110
                ${isFavorite
                  ? "text-fuchsia-400"
                  : "text-white/45 hover:text-fuchsia-300"
                }
              `}
            >
              <HeartIcon filled={isFavorite} />
            </button>

            {/* ปรับระดับเสียง */}
            <div className="hidden min-w-0 sm:block">
              <PlayerVolume />
            </div>

            {/* คิวเพลง */}
            <button
              type="button"
              aria-label={isQueueOpen ? "ปิดคิวเพลง" : "เปิดคิวเพลง"}
              title="รายการเพลงถัดไป"
              aria-expanded={isQueueOpen}
              onClick={() => setIsQueueOpen((open) => !open)}
              className={`
                flex h-10 w-10 shrink-0 items-center justify-center
                rounded-full border transition-all duration-200
                ${isQueueOpen
                  ? "border-violet-400/40 bg-violet-500/15 text-violet-300 shadow-[0_0_16px_rgba(139,92,246,0.15)]"
                  : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-300"
                }
              `}
            >
              <QueueIcon />
            </button>
          </div>
        </div>
      </footer>

      <UpNextPanel
        isOpen={isQueueOpen}
        onToggle={() => setIsQueueOpen(false)}
      />
    </>
  );
}
