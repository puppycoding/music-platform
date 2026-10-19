import type { MusicTrack } from "../types/player-types";

/** Preserve the visible order; only draw new tracks for vacant slots. */
export function fillPlayingNext(
  existing: MusicTrack[],
  songs: MusicTrack[],
  currentId?: string,
  seen = new Set<string>(),
  random = Math.random,
  excludedIds: ReadonlySet<string> = new Set(),
): MusicTrack[] {
  const playable = [...new Map(
    songs
      .filter(song => song.videoId && song.id !== currentId && !excludedIds.has(song.id))
      .map(song => [song.id, song]),
  ).values()];
  const target = Math.min(10, playable.length);
  const validIds = new Set(playable.map(song => song.id));
  const result = existing.filter((song, index) =>
    validIds.has(song.id) &&
    existing.findIndex(item => item.id === song.id) === index,
  ).slice(0, target);
  const reserved = new Set(result.map(song => song.id));
  for (const id of reserved) seen.add(id);
  if (currentId) seen.add(currentId);
  while (result.length < target) {
    const available = playable.filter(song => !reserved.has(song.id));
    let candidates = available.filter(song => !seen.has(song.id));
    if (!candidates.length) {
      seen.clear();
      for (const id of reserved) seen.add(id);
      if (currentId) seen.add(currentId);
      candidates = available;
    }
    const song = candidates[Math.floor(random() * candidates.length)];
    result.push(song);
    reserved.add(song.id);
    seen.add(song.id);
  }
  return result;
}
