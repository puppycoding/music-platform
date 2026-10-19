"use client";

import Image from "next/image";
import { useState } from "react";
import TrackActions from "./TrackActions";
import { useMusicPlayer } from "@/features/music-player";
import type { QueueItem } from "@/features/music-player";

type QueueTrackListProps = {
  queue: QueueItem[];
  playQueueItem: (queueId: string) => void;
  removeFromQueue: (queueId: string) => void;
};

function SongCover({
  src,
  title,
  onRemove,
  onPlay,
}: {
  src: string | null | undefined;
  title: string;
  onRemove: () => void;
  onPlay: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group/cover relative h-[52px] w-[52px] shrink-0 overflow-visible">
      {/* ปกเพลง */}
      <button
        type="button"
        onClick={onPlay}
        aria-label={`เล่น ${title}`}
        className="relative block h-full w-full overflow-hidden rounded-md bg-[#29272e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
      >
        {src && !imageError ? (
          <Image
            fill
            sizes="52px"
            src={src}
            alt={`ปกเพลง ${title}`}
            loading="lazy"
            draggable={false}
            onError={() => setImageError(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl text-white/35">
            ♫
          </div>
        )}

        {/* แสดงปุ่มเล่นเมื่อ hover */}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover/cover:opacity-100">
          <PlayIcon />
        </span>
      </button>

      {/* ปุ่มลบมุมซ้ายบน */}
      <button
        type="button"
        aria-label={`นำ ${title} ออกจากคิว`}
        title="นำออกจากคิว"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        className="absolute -left-1.5 -top-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-[#f04452] text-white opacity-0 shadow-md shadow-black/30 transition duration-150 hover:scale-110 hover:bg-[#ff5965] focus:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white group-hover/cover:opacity-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M5 12h14" />
        </svg>
      </button>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 5.8c0-.8.9-1.3 1.6-.9l10 6.2a1.1 1.1 0 0 1 0 1.8l-10 6.2c-.7.4-1.6-.1-1.6-.9V5.8Z" />
    </svg>
  );
}

function DragIcon() {
  return (
    <svg
      width="15"
      height="18"
      viewBox="0 0 16 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5" cy="5" r="1.3" />
      <circle cx="11" cy="5" r="1.3" />
      <circle cx="5" cy="10" r="1.3" />
      <circle cx="11" cy="10" r="1.3" />
      <circle cx="5" cy="15" r="1.3" />
      <circle cx="11" cy="15" r="1.3" />
    </svg>
  );
}

export default function QueueTrackList({
  queue,
  playQueueItem,
  removeFromQueue,
}: QueueTrackListProps) {
  const { reorderQueue } = useMusicPlayer();

  const [draggedQueueId, setDraggedQueueId] = useState<string | null>(null);

  const [dragOverQueueId, setDragOverQueueId] = useState<string | null>(null);

  function handlePlay(queueId: string) {
    playQueueItem(queueId);
  }

  function handleDragStart(
    event: React.DragEvent<HTMLDivElement>,
    queueId: string,
  ) {
    setDraggedQueueId(queueId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", queueId);
  }

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>,
    queueId: string,
  ) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (draggedQueueId && draggedQueueId !== queueId) {
      setDragOverQueueId(queueId);
    }
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
    targetQueueId: string,
  ) {
    event.preventDefault();

    const sourceQueueId =
      event.dataTransfer.getData("text/plain") || draggedQueueId;

    if (!sourceQueueId || sourceQueueId === targetQueueId) {
      setDraggedQueueId(null);
      setDragOverQueueId(null);
      return;
    }

    // reorderQueue ใช้ index แบบ number
    const fromIndex = queue.findIndex((item) => item.queueId === sourceQueueId);

    const toIndex = queue.findIndex((item) => item.queueId === targetQueueId);

    if (fromIndex !== -1 && toIndex !== -1) {
      reorderQueue(fromIndex, toIndex);
    }

    setDraggedQueueId(null);
    setDragOverQueueId(null);
  }

  function handleDragEnd() {
    setDraggedQueueId(null);
    setDragOverQueueId(null);
  }

  if (queue.length === 0) {
    return (
      <div className="flex min-h-32 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.05] text-white/35">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>

        <p className="text-sm font-medium text-white/65">ไม่มีเพลงในคิว</p>

        <p className="text-xs leading-5 text-white/35">
          เพิ่มเพลงจากเมนูจุดสามจุด
          <br />
          เพื่อเพิ่มเพลงลงในคิว
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-0.5">
      {queue.map((item) => {
        const song = item.song;
        const queueId = item.queueId;

        const isDragging = draggedQueueId === queueId;
        const isDragOver = dragOverQueueId === queueId;

        return (
          <div
            key={queueId}
            draggable
            onDragStart={(event) => handleDragStart(event, queueId)}
            onDragOver={(event) => handleDragOver(event, queueId)}
            onDrop={(event) => handleDrop(event, queueId)}
            onDragEnd={handleDragEnd}
            className={`group relative flex min-w-0 items-center gap-3 rounded-xl px-2 py-2 transition-colors ${isDragOver ? "bg-white/[0.09]" : "hover:bg-white/[0.045]"
              } ${isDragging ? "opacity-40" : "opacity-100"}`}
          >
            {/* Drag handle */}
            <div
              className="flex w-4 shrink-0 cursor-grab items-center justify-center text-white/20 transition-colors group-hover:text-white/50 active:cursor-grabbing"
              title="ลากเพื่อจัดลำดับเพลง"
            >
              <DragIcon />
            </div>

            {/* Cover + ปุ่มลบมุมซ้ายบน */}
            <SongCover
              src={song.coverUrl}
              title={song.title}
              onPlay={() => handlePlay(queueId)}
              onRemove={() => {
                removeFromQueue(queueId);
              }}
            />

            {/* ชื่อเพลงและศิลปิน */}
            <button
              type="button"
              onClick={() => handlePlay(queueId)}
              className="min-w-0 flex-1 text-left focus-visible:outline-none"
            >
              <span className="block truncate text-[13px] font-medium leading-5 text-white/90 transition-colors group-hover:text-white">
                {song.title}
              </span>

              <span className="block truncate text-xs leading-5 text-white/40">
                {song.artistName || "ไม่ทราบศิลปิน"}
              </span>
            </button>

            <TrackActions
              title={song.title}
              durationSeconds={song.durationSeconds}
              actions={[
                {
                  label: "นำออกจากคิว",
                  onSelect: () => removeFromQueue(queueId),
                },
              ]}
            />
          </div>
        );
      })}
    </div>
  );
}
