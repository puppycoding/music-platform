"use client";

import Image from "next/image";
import { useState } from "react";
import { useMusicPlayer } from "@/features/music-player";
import QueueTrackList from "./components/QueueTrackList";
import TrackActions from "./components/TrackActions";

type UpNextPanelProps = {
  isOpen: boolean;
  onToggle: () => void;
};

function SongCover({
  src,
  title,
  className = "",
}: {
  src: string | null | undefined;
  title: string;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#29272e] ${className}`}
    >
      {src && !imageError ? (
        <Image
          fill
          sizes="64px"
          src={src}
          alt={`ปกเพลง ${title}`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="text-xl text-white/40">♫</span>
      )}
    </div>
  );
}

function PlayingIndicator() {
  return (
    <div
      className="flex h-5 items-end gap-[3px] text-[#c5a0ff]"
      aria-label="กำลังเล่น"
    >
      <span className="h-2 w-[3px] animate-pulse rounded-full bg-current" />
      <span className="h-5 w-[3px] animate-pulse rounded-full bg-current [animation-delay:150ms]" />
      <span className="h-3 w-[3px] animate-pulse rounded-full bg-current [animation-delay:300ms]" />
    </div>
  );
}

export default function UpNextPanel({ isOpen, onToggle }: UpNextPanelProps) {
  const {
    currentSong,
    isPlaying,
    queue,
    playingNext,
    autoPlayTracks,
    autoPlayEnabled,
    playPlayingNext,
    playAutoPlayTrack,
    reshufflePlayingNext,
    repeatOne,
    toggleRepeat,
    toggleAutoPlay,
    movePlayingNextToQueue,
    addToQueue,
    playQueueItem,
    removeFromQueue,
  } = useMusicPlayer();

  return (
    <>
      {/* Backdrop stays visual only so the rest of the app remains usable. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-0 z-[70] bg-transparent transition-opacity duration-200 ${isOpen
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
          }`}
      />

      {/* Queue panel */}
      <aside
        aria-label="รายการเพลงถัดไป"
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={`fixed bottom-[135px] right-0 top-0 z-[80] flex w-[min(88vw,320px)] flex-col border-l border-white/[0.07] bg-[#14141a]/90 text-white backdrop-blur-xl transition-transform duration-250 ease-out md:bottom-[89px] ${isOpen ? "translate-x-0" : "pointer-events-none translate-x-full"
          }`}
      >
        {/* Header */}

        <header className="flex shrink-0 items-center justify-between px-5 pb-4 pt-5">
          <h2 className="text-lg font-bold tracking-tight text-white">
            Now Playing
          </h2>

          <button
            type="button"
            aria-label="Close queue"
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl leading-none text-white/45 transition-colors duration-200 hover:bg-[#c5a0ff]/10 hover:text-[#c5a0ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a0ff]/60"
          >
            ×
          </button>
        </header>

        {/* Current song */}
        <section className="shrink-0 px-4 pb-4">
          {currentSong ? (
            <div className="flex items-center gap-3 rounded-xl bg-[#22212a] p-3">
              <SongCover
                key={currentSong.id}
                src={currentSong.coverUrl}
                title={currentSong.title}
                className="h-16 w-16 rounded-lg"
              />

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#c5a0ff]">
                  NOW PLAYING
                </p>

                <p
                  className={`truncate text-sm font-semibold ${isPlaying ? "text-white" : "text-white/80"
                    }`}
                  title={currentSong.title}
                >
                  {currentSong.title}
                </p>

                <p
                  className="mt-1 truncate text-xs text-white/50"
                  title={currentSong.artistName}
                >
                  {currentSong.artistName}
                </p>
              </div>

              {isPlaying && (
                <div className="ml-1 shrink-0">
                  <PlayingIndicator />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-[#22212a] p-3">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-2xl text-white/30">
                ♫
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-white/75">
                  ยังไม่มีเพลงที่กำลังเล่น
                </p>
                <p className="mt-1 text-xs text-white/40">
                  เลือกเพลงเพื่อเริ่มฟัง
                </p>
              </div>
            </div>
          )}
        </section>

        <section
          aria-label="ควบคุมการเล่นเพลง"
          className="shrink-0 px-4 pb-4"
        >
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              aria-label="สุ่มเพลงในรายการเล่นต่อใหม่"
              title="สุ่มเพลงในรายการเล่นต่อใหม่"
              onClick={reshufflePlayingNext}
              disabled={playingNext.length === 0}
              className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-full bg-white/[0.07] py-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a0ff]/70 disabled:cursor-not-allowed disabled:opacity-35"
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
                <path d="m16 3 5 0v5" />
                <path d="M4 20 21 3" />
                <path d="m16 16 5 5v-5" />
                <path d="M15 15 21 21" />
                <path d="m4 4 5 5" />
              </svg>
              <span className="text-[10px] leading-none">สุ่ม</span>
            </button>

            <button
              type="button"
              aria-label="วนเพลงปัจจุบัน"
              aria-pressed={repeatOne}
              title={repeatOne ? "ปิดการวนเพลง" : "วนเพลงปัจจุบัน"}
              onClick={toggleRepeat}
              disabled={!currentSong}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-full py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a0ff]/70 disabled:cursor-not-allowed disabled:opacity-35 ${repeatOne ? "bg-[#c5a0ff]/20 text-[#c5a0ff]" : "bg-white/[0.07] text-white/60 hover:bg-white/10 hover:text-white"}`}
            >
              <span className="relative">
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
                {repeatOne && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-[#14141a] px-0.5 text-[8px] font-bold leading-3">
                    1
                  </span>
                )}
              </span>
              <span className="text-[10px] leading-none">วนเพลง</span>
            </button>

            <button
              type="button"
              aria-label="เล่นอัตโนมัติ"
              aria-pressed={autoPlayEnabled}
              title={autoPlayEnabled ? "ปิดเล่นอัตโนมัติ" : "เปิดเล่นอัตโนมัติ"}
              onClick={toggleAutoPlay}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-full py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a0ff]/70 ${autoPlayEnabled ? "bg-[#c5a0ff]/20 text-[#c5a0ff]" : "bg-white/[0.07] text-white/60 hover:bg-white/10 hover:text-white"}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M3 12c0-2.2 1.7-4 3.8-4 4.1 0 6.3 8 10.4 8 2.1 0 3.8-1.8 3.8-4s-1.7-4-3.8-4c-4.1 0-6.3 8-10.4 8C4.7 16 3 14.2 3 12Z" />
              </svg>
              <span className="text-[10px] leading-none">อัตโนมัติ</span>
            </button>

            <button
              type="button"
              aria-label="AutoMix ยังไม่รองรับกับตัวเล่น YouTube"
              title="AutoMix ยังไม่รองรับกับตัวเล่น YouTube"
              disabled
              className="flex min-w-0 cursor-not-allowed flex-col items-center justify-center gap-1 rounded-full bg-white/[0.04] py-2 text-white/25"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="9" cy="12" r="6" />
                <circle cx="15" cy="12" r="6" />
                <circle cx="18" cy="12" r="2" fill="currentColor" />
              </svg>
              <span className="text-[10px] leading-none">AutoMix</span>
            </button>
          </div>
        </section>

        <div
          key={isOpen ? "open" : "closed"}
          className="queue-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4"
        >
          <section aria-label="คิว" className="mb-5">
            <h3 className="flex items-center justify-between border-t border-white/10 px-2 py-3 text-sm font-semibold">
              คิว{" "}
              <span className="text-xs font-normal text-white/40">
                {queue.length} เพลง
              </span>
            </h3>
            {queue.length > 0 && (
              <QueueTrackList
                queue={queue}
                playQueueItem={playQueueItem}
                removeFromQueue={removeFromQueue}
              />
            )}
          </section>
          <section aria-label="เล่นต่อ">
            <h3 className="border-t border-white/10 px-2 py-3 text-sm font-semibold">
              เล่นต่อ
            </h3>
            <div className="space-y-0.5">
              {playingNext.map((song, index) => (
                <div
                  key={song.id}
                  className="group relative flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[#c5a0ff]/10"
                >
                  <span className="w-4 shrink-0 text-center text-[11px] tabular-nums text-white/30">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => playPlayingNext(song.id)}
                    aria-label={`เล่น ${song.title}`}
                    className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a0ff]"
                  >
                    <SongCover
                      src={song.coverUrl}
                      title={song.title}
                      className="h-[52px] w-[52px]"
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => playPlayingNext(song.id)}
                    className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a0ff]"
                  >
                    <span className="block truncate text-[13px] font-medium text-white/90 group-hover:text-[#c5a0ff]">
                      {song.title}
                    </span>
                    <span className="mt-1 block truncate text-xs text-white/40">
                      {song.artistName}
                    </span>
                  </button>
                  <TrackActions
                    title={song.title}
                    durationSeconds={song.durationSeconds}
                    actions={[
                      {
                        label: "เพิ่มไปยังคิว",
                        onSelect: () => movePlayingNextToQueue(song.id),
                      },
                    ]}
                  />
                </div>
              ))}
              {playingNext.length === 0 && (
                <p className="px-2 py-3 text-xs text-white/40">
                  ไม่มีเพลงอื่นที่เล่นได้ในคลัง
                </p>
              )}
            </div>
          </section>
          {autoPlayEnabled && (
            <section aria-label="เล่นอัตโนมัติ" className="mt-5">
              <h3 className="flex items-center justify-between border-t border-white/10 px-2 py-3 text-sm font-semibold">
                <span>เล่นอัตโนมัติ</span>
                <span className="text-base font-normal text-[#c5a0ff]" aria-hidden="true">
                  ∞
                </span>
              </h3>
              <div className="space-y-0.5">
                {autoPlayTracks.map((song, index) => (
                  <div
                    key={song.id}
                    className="group relative flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[#c5a0ff]/10"
                  >
                    <span className="w-4 shrink-0 text-center text-[11px] tabular-nums text-white/30">
                      {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => playAutoPlayTrack(song.id)}
                      aria-label={`เล่น ${song.title}`}
                      className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a0ff]"
                    >
                      <SongCover
                        src={song.coverUrl}
                        title={song.title}
                        className="h-[52px] w-[52px]"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => playAutoPlayTrack(song.id)}
                      className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a0ff]"
                    >
                      <span className="block truncate text-[13px] font-medium text-white/90 group-hover:text-[#c5a0ff]">
                        {song.title}
                      </span>
                      <span className="mt-1 block truncate text-xs text-white/40">
                        {song.artistName}
                      </span>
                    </button>
                    <TrackActions
                      title={song.title}
                      durationSeconds={song.durationSeconds}
                      actions={[
                        {
                          label: "เพิ่มไปยังคิว",
                          onSelect: () => addToQueue(song.id),
                        },
                      ]}
                    />
                  </div>
                ))}
                {autoPlayTracks.length === 0 && (
                  <p className="px-2 py-3 text-xs text-white/40">
                    ไม่มีเพลงแนะนำที่เล่นได้ในคลัง
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Minimal footer */}
        <footer className="flex shrink-0 items-center gap-4 px-5 py-4">
          <div className="h-px flex-1 bg-white/[0.09]" />
          <span className="text-sm text-white/40">♫</span>
          <p className="whitespace-nowrap text-[11px] text-white/40">
            อีกหลายเพลงรอคุณอยู่
          </p>
          <div className="h-px flex-1 bg-white/[0.09]" />
        </footer>
      </aside>

      <style jsx>{`
        .queue-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .queue-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </>
  );
}
