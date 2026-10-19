/** Fisher-Yates shuffle of a copy; callers retain control over when to randomize. */
export function shuffleItems<T>(
  source: readonly T[],
  random = Math.random,
): T[] {
  const shuffled = [...source];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
export function sampleItems<T>(source: readonly T[], count: number): T[] {
  return shuffleItems(source).slice(0, count);
}
