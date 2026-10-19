/** Shared Thai-aware matching; keep normalization identical across discovery pages. */
export function normalizeSearchText(value: unknown): string {
  return String(value ?? "")
    .toLocaleLowerCase("th")
    .normalize("NFC")
    .trim();
}
