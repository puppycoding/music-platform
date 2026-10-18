
"use client";

import { useState } from "react";
import { useMusicPlayer } from "../music-player/providers/MusicPlayerProvider";
import QueueTrackList from "./components/QueueTrackList";

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
        <img
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

export default function UpNextPanel({
  isOpen,
  onToggle,
}: UpNextPanelProps) {
  const {
    currentSong,
    isPlaying,
    queue,
    playQueueItem,
    removeFromQueue,
  } = useMusicPlayer();

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="ปิดรายการคิว"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onToggle}
        className={`fixed inset-0 z-[70] bg-black/45 transition-opacity duration-200 ${isOpen
          ? "visible opacity-100"
          : "invisible pointer-events-none opacity-0"
          }`}
      />

      {/* Queue panel */}
      <aside
        aria-label="รายการเพลงถัดไป"
        aria-hidden={!isOpen}
        className={`fixed bottom-0 right-0 top-0 z-[80] flex w-[min(92vw,400px)] flex-col border-l border-white/[0.07] bg-[#14141a] text-white transition-transform duration-250 ease-out md:bottom-20 ${isOpen
          ? "translate-x-0"
          : "pointer-events-none translate-x-full"
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


        {/* Queue section heading */}
        <div className="flex shrink-0 items-center gap-4 px-5 pb-3 pt-1">
          <h3 className="shrink-0 text-sm font-medium text-white/60">
            เพลงถัดไป
          </h3>
          <div className="h-px flex-1 bg-white/[0.09]" />
        </div>

        {/* Scrollable queue */}
        <div className="queue-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
          {queue.length > 0 ? (
            <QueueTrackList
              queue={queue}
              playQueueItem={(queueId) => {
                playQueueItem(queueId);
                onToggle();
              }}
              removeFromQueue={removeFromQueue}
              onPlay={onToggle}
            />
          ) : (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <div className="mb-3 text-3xl text-white/25">
                ♫
              </div>
              <p className="text-sm text-white/65">
                ไม่มีเพลงถัดไป
              </p>
              <p className="mt-2 text-xs leading-5 text-white/35">
                เพิ่มเพลงจากเมนูจุดสามจุด
                <br />
                เพื่อเพิ่มเพลงลงในคิว
              </p>
            </div>
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
