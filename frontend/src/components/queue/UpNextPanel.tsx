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
  className,
}: {
  src: string | null | undefined;
  title: string;
  className: string;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-[#45345f] to-[#211a30] ${className}`}
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
        <span className="text-xl text-[#c4b5fd]">♫</span>
      )}
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
      {/* พื้นหลังสำหรับคลิกปิด */}
      {isOpen && (
        <button
          type="button"
          aria-label="ปิดรายการคิว"
          onClick={onToggle}
          className="fixed inset-0 z-[70] cursor-default bg-black/30"
        />
      )}

      {/* Sidebar ด้านขวา */}
      <aside
        aria-label="รายการเพลงถัดไป"
        aria-hidden={!isOpen}
        className={`fixed bottom-20 right-0 top-0 z-[80] flex w-[min(90vw,380px)] flex-col border-l border-white/10 bg-[#211f29] text-white shadow-[-18px_0_60px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-in-out md:bottom-20 ${
          isOpen
            ? "translate-x-0"
            : "translate-x-full pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-4 pt-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              กำลังเล่นถัดไป
            </h2>

            <p className="mt-1 text-xs text-white/50">
              {queue.length > 0
                ? `${queue.length} เพลงในคิว`
                : "คิวเพลงของคุณ"}
            </p>
          </div>

          <button
            type="button"
            aria-label="ปิดคิวเพลง"
            onClick={onToggle}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl text-white/70 transition hover:bg-white/20 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mx-5 h-px shrink-0 bg-white/10" />

        {/* เพลงปัจจุบัน */}
        {currentSong && (
          <div className="shrink-0 px-5 pb-4 pt-4">
            <p className="mb-3 text-[11px] font-semibold tracking-wide text-white/45">
              กำลังเล่น
            </p>

            <div className="flex items-center gap-3">
              <SongCover
                src={currentSong.coverUrl}
                title={currentSong.title}
                className="h-14 w-14"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#c4b5fd]">
                  {currentSong.title}
                </p>

                <p className="mt-1 truncate text-xs text-white/50">
                  {currentSong.artistName}
                </p>
              </div>

              {isPlaying && (
                <div
                  className="flex h-5 shrink-0 items-end gap-[3px]"
                  aria-label="กำลังเล่น"
                >
                  <span className="h-2 w-[3px] animate-pulse rounded-full bg-[#c4b5fd]" />
                  <span className="h-4 w-[3px] animate-pulse rounded-full bg-[#c4b5fd] [animation-delay:150ms]" />
                  <span className="h-3 w-[3px] animate-pulse rounded-full bg-[#c4b5fd] [animation-delay:300ms]" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mx-5 h-px shrink-0 bg-white/10" />

        {/* หัวข้อรายการคิว */}
        <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
          <h3 className="text-sm font-semibold text-white/90">
            เพลงถัดไป
          </h3>

          <span className="text-xs text-white/40">
            {queue.length} เพลง
          </span>
        </div>

        {/* รายการเพลงในคิว */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4">
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
            <div className="px-3 py-10 text-center">
              <div className="mb-3 text-3xl text-white/30">
                ♫
              </div>

              <p className="text-sm text-white/60">
                ยังไม่มีเพลงในคิว
              </p>

              <p className="mt-2 text-xs leading-5 text-white/35">
                เพิ่มเพลงจากเมนูของเพลงที่คุณชอบ
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/[0.08] px-5 py-3">
          <p className="text-center text-[10px] text-white/30">
            Music Platform
          </p>
        </div>
      </aside>
    </>
  );
}