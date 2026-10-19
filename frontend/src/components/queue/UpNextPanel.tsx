
"use client";

import { useState } from "react";
import { useMusicPlayer } from "../music-player/providers/MusicPlayerProvider";
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
    playingNext,
    playPlayingNext,
    movePlayingNextToQueue,
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
        inert={!isOpen}
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


        <div key={isOpen ? "open" : "closed"} className="queue-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
          <section aria-label="คิว" className="mb-5">
            <h3 className="flex items-center justify-between border-t border-white/10 px-2 py-3 text-sm font-semibold">
              คิว <span className="text-xs font-normal text-white/40">{queue.length} เพลง</span>
            </h3>
            {queue.length > 0 && (
              <QueueTrackList
                queue={queue}
                playQueueItem={playQueueItem}
                removeFromQueue={removeFromQueue}
                onPlay={onToggle}
              />
            )}
          </section>
          <section aria-label="เล่นต่อ">
            <h3 className="flex items-center justify-between border-t border-white/10 px-2 py-3 text-sm font-semibold">
              เล่นต่อ <span className="text-xs font-normal text-[#c5a0ff]">สุ่มอัตโนมัติ · {playingNext.length} เพลง</span>
            </h3>
            <div className="space-y-0.5">
              {playingNext.map((song, index) => (
                <div key={song.id} className="group relative flex w-full items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[#c5a0ff]/10">
                  <span className="w-4 shrink-0 text-center text-[11px] tabular-nums text-white/30">{index + 1}</span>
                  <button
                    type="button"
                    onClick={() => { playPlayingNext(song.id); onToggle(); }}
                    aria-label={`เล่น ${song.title}`}
                    className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a0ff]"
                  >
                    <SongCover src={song.coverUrl} title={song.title} className="h-[52px] w-[52px]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { playPlayingNext(song.id); onToggle(); }}
                    className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a0ff]"
                  >
                    <span className="block truncate text-[13px] font-medium text-white/90 group-hover:text-[#c5a0ff]">{song.title}</span>
                    <span className="mt-1 block truncate text-xs text-white/40">{song.artistName}</span>
                  </button>
                  <TrackActions
                    title={song.title}
                    durationSeconds={song.durationSeconds}
                    actions={[{ label: "เพิ่มไปยังคิว", onSelect: () => movePlayingNextToQueue(song.id) }]}
                  />
                </div>
              ))}
              {playingNext.length === 0 && <p className="px-2 py-3 text-xs text-white/40">ไม่มีเพลงอื่นที่เล่นได้ในคลัง</p>}
            </div>
          </section>
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
