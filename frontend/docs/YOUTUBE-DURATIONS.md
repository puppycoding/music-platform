# Fill missing YouTube durations

Run from `frontend` with Node 20+ and the project's existing dependencies installed. No new dependencies: Node fetch/filesystem/test APIs and the already-installed TypeScript JSON parser are used. No app/player code is involved.

Enable YouTube Data API v3 for your Google Cloud project and provide its key in the current shell environment (for example, `$env:YOUTUBE_API_KEY = <your key>` in PowerShell; replace the placeholder with a quoted value). Do not save it in source control. The script reads only the process environment, not `.env` files, and sends the key in a request header. Errors never print raw API messages or URLs.

```powershell
node scripts/fill-youtube-durations.cjs --dry-run
node scripts/fill-youtube-durations.cjs --write
node scripts/fill-youtube-durations.cjs --dry-run --max-requests 10
```

Default is dry-run: it fetches real durations and lists proposed song changes but creates no files. Without a key it reports scan counts, then exits with an actionable error. `--write` is the only mode that changes catalog files. Unknown flags and conflicting modes fail. Re-running is safe: existing values, including zero, empty strings and invalid non-null values, are deliberately preserved for separate review.

Only direct `*.json` files in `src/data/music-catalog/songs` are scanned, in sorted order. Legacy `music-catalog2.json`/`music-catalog3.json`, artists and albums are excluded. JSON must contain a root songs array or be an array itself. Malformed JSON, duplicate keys and symlink entries abort before fetching/writing. Only songs with absent/null `duration_seconds` and an explicit valid 11-character `providers.youtube.video_id` are eligible; URLs are not scraped or guessed. IDs are deduplicated across all files, requested in batches of 50, and mapped back to all matching songs. ISO 8601 days/hours/minutes/seconds become positive integer seconds. Deleted/private/unavailable videos and zero/live/invalid durations are reported and left untouched. This is the video duration, which can include intros/outros.

API reference: [videos.list](https://developers.google.com/youtube/v3/docs/videos/list), [contentDetails.duration](https://developers.google.com/youtube/v3/docs/videos#contentDetails.duration). Each list call currently costs 1 quota unit; retries also consume requests. Default budget: 100 total requests per run including retries. Batches are spaced by 250ms. Network timeouts (20s), HTTP 429/5xx and rate-limit errors retry up to three times with exponential backoff, honoring Retry-After up to 60s; longer delays stop the run. Daily quota errors and other HTTP errors stop immediately. All fetching finishes before writing, so API failures never partially update files.

Existing JSON bytes are preserved except the duration value tokens; absent properties are inserted using nearby whitespace. BOM, CRLF/LF, indentation, escaped strings, ordering and unrelated metadata remain intact. Before each replacement the original file is checked for concurrent edits, a unique adjacent `*.json.<uuid>.bak` containing the exact original is created and synced, then a synced same-directory temporary file is renamed over the original. Backups are never overwritten or removed automatically. Restore a selected backup by copying its contents back to the original JSON after reviewing any later edits. Do not commit backups or keys.

Writes hold `.youtube-duration.lock` to prevent simultaneous writer runs. After a hard crash, inspect the files and backups and ensure no script is running before manually deleting a stale lock. Temporary files may also remain after a hard crash. A write failure can leave earlier files updated (atomicity is per file, not across the whole catalog); use reported backups to restore if needed. Optimistic file checks cannot completely prevent an unrelated editor racing the final rename; avoid editing catalogs while applying. Rename failures preserve the original and backup. Atomic rename and file syncing do not guarantee durability of directory entries across a power loss on every filesystem.

Exit codes: 0 complete, 1 failure, 2 some songs skipped for invalid/missing video IDs or some requested videos unresolved. Code 2 may still have applied available durations in write mode; inspect the summary. Fix metadata/access issues and rerun. No overwrite/force option exists.

Tests (mocked API, temporary catalog files only):

```powershell
node --test tests/youtube-durations.test.cjs
npm test
```
