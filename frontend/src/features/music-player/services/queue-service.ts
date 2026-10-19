import type { QueueItem } from "../types/player-types";

export function reorderQueueItems(
  items: QueueItem[],
  from: number,
  to: number,
): QueueItem[] {
  if (
    !Number.isInteger(from) ||
    !Number.isInteger(to) ||
    from < 0 ||
    to < 0 ||
    from >= items.length ||
    to >= items.length ||
    from === to
  )
    return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Repeated add actions must not enqueue the same track twice. */
export function canEnqueue(
  items: readonly QueueItem[],
  songId: string,
): boolean {
  return !items.some((item) => item.song.id === songId);
}

export function appendHistory(
  history: readonly string[],
  index: number,
  songId: string,
): string[] {
  const next = history.slice(0, index + 1);
  if (next.at(-1) !== songId) next.push(songId);
  return next;
}
