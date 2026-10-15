"use client";

import { useState } from "react";
import { useMusicPlayer } from "../../music-player/providers/MusicPlayerProvider";
import type { QueueItem } from "../../music-player/types/player-types";

type QueueTrackListProps = {
  queue: QueueItem[];
  playQueueItem: (queueId: string) => void;
  removeFromQueue: (queueId: string) => void;
  onPlay: () => void;
};

function SongCover({
  src,
  title,
}: {
  src: string | null | undefined;
  title: string;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#45345f] to-[#211a30]">
      {src && !imageError ? (
        <img
          src={src}
          alt={`ปกเพลง ${title}`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-[#c4b5fd]">
          <span className="text-2xl">♫</span>
          <span className="text-[9px]">Music</span>
        </div>
      )}
    </div>
  );
}

function formatDuration(seconds: number | undefined) {
  const safeSeconds = Math.max(0, seconds || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function QueueTrackList({
  queue,
  playQueueItem,
  removeFromQueue,
  onPlay,
}: QueueTrackListProps) {
  const { reorderQueue } = useMusicPlayer();

  const [draggedQueueId, setDraggedQueueId] = useState<string | null>(
    null,
  );
  const [dragOverQueueId, setDragOverQueueId] = useState<string | null>(
    null,
  );

  if (queue.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mb-3 text-3xl text-[#777180]">♫</div>

        <p className="text-sm text-[#a1a1aa]">
          ยังไม่มีเพลงในคิว
        </p>

        <p className="mt-2 text-xs text-[#777180]">
          กดเมนูสามจุดของเพลง แล้วเลือกเพิ่มเข้าคิว
        </p>
      </div>
    );
  }

  function handleDragStart(
    event: React.DragEvent<HTMLButtonElement>,
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

    if (queueId !== draggedQueueId) {
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

    const fromIndex = queue.findIndex(
      (item) => item.queueId === sourceQueueId,
    );

    const toIndex = queue.findIndex(
      (item) => item.queueId === targetQueueId,
    );

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

  return (
    <div className="space-y-2">
      {queue.map((item, index) => {
        const song = item.song;
        const isDragging = draggedQueueId === item.queueId;
        const isDragOver = dragOverQueueId === item.queueId;

        return (
          <div
            key={item.queueId}
            onDragOver={(event) => handleDragOver(event, item.queueId)}
            onDrop={(event) => handleDrop(event, item.queueId)}
            className={`group flex items-center gap-3 rounded-xl border p-2 transition ${
              isDragOver
                ? "border-[#a78bfa] bg-[#302641]"
                : "border-transparent hover:border-[#3a304b] hover:bg-[#252033]"
            } ${isDragging ? "opacity-40" : ""}`}
          >
            <button
              type="button"
              draggable
              onDragStart={(event) =>
                handleDragStart(event, item.queueId)
              }
              onDragEnd={handleDragEnd}
              aria-label={`ลากเพื่อจัดลำดับ ${song.title}`}
              title="ลากเพื่อจัดลำดับเพลง"
              className="flex h-8 w-5 shrink-0 cursor-grab items-center justify-center text-[#777180] transition hover:text-[#c4b5fd] active:cursor-grabbing"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="8" cy="5" r="1.5" />
                <circle cx="16" cy="5" r="1.5" />
                <circle cx="8" cy="12" r="1.5" />
                <circle cx="16" cy="12" r="1.5" />
                <circle cx="8" cy="19" r="1.5" />
                <circle cx="16" cy="19" r="1.5" />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => {
                playQueueItem(item.queueId);
                onPlay();
              }}
              aria-label={`เล่น ${song.title} ทันที`}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <span className="w-4 shrink-0 text-center text-xs text-[#777180]">
                {index + 1}
              </span>

              <SongCover
                src={song.coverUrl}
                title={song.title}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#f4f1fa] transition group-hover:text-[#c4b5fd]">
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

            <button
              type="button"
              aria-label={`ลบ ${song.title} ออกจากคิว`}
              title="นำออกจากคิว"
              onClick={() => removeFromQueue(item.queueId)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#777180] transition hover:bg-[#3a2635] hover:text-red-400"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M4 7h16" />
                <path d="M10 11v6M14 11v6" />
                <path d="m5 7 1 13h12l1-13" />
                <path d="M9 7V4h6v3" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}