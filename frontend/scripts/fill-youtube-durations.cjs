#!/usr/bin/env node
"use strict";
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { setTimeout: sleep } = require("node:timers/promises");
// Reuse the project's installed compiler for exact JSON token positions.
const ts = require("typescript");
const DEFAULT_DIR = path.resolve(__dirname, "../src/data/music-catalog/songs");

function durationSeconds(value) {
  const m =
    typeof value === "string" &&
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(value);
  if (!m || !m.slice(1).some(Boolean)) return null;
  const seconds =
    Number(m[1] || 0) * 86400 +
    Number(m[2] || 0) * 3600 +
    Number(m[3] || 0) * 60 +
    Number(m[4] || 0);
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds : null;
}

function inspect(text, name) {
  const data = JSON.parse(text.replace(/^\uFEFF/, ""));
  const source = ts.parseJsonText(name, text);
  if (source.parseDiagnostics.length) throw new Error(`Invalid JSON: ${name}`);
  function check(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const names = node.properties.map((p) => p.name.text);
      if (new Set(names).size !== names.length)
        throw new Error(`Duplicate JSON key: ${name}`);
    }
    ts.forEachChild(node, check);
  }
  check(source);
  const root = source.statements[0].expression;
  const songs = Array.isArray(data) ? data : data.songs;
  const array = ts.isArrayLiteralExpression(root)
    ? root
    : root.properties?.find((p) => p.name.text === "songs")?.initializer;
  if (!Array.isArray(songs) || !array || !ts.isArrayLiteralExpression(array))
    throw new Error(`Expected songs array: ${name}`);
  const candidates = [];
  let skipped = 0;
  songs.forEach((song, i) => {
    if (!song || typeof song !== "object" || Array.isArray(song))
      throw new Error(`Invalid song: ${name} #${i}`);
    if (
      song.duration_seconds !== null &&
      Object.hasOwn(song, "duration_seconds")
    )
      return;
    const id = song.providers?.youtube?.video_id;
    if (typeof id !== "string" || !/^[A-Za-z0-9_-]{11}$/.test(id)) {
      skipped++;
      return;
    }
    candidates.push({ song, node: array.elements[i], videoId: id });
  });
  return { source, data, candidates, skipped };
}

function patchText(text, parsed, durations) {
  const edits = [];
  for (const { node, videoId } of parsed.candidates) {
    const seconds = durations.get(videoId);
    if (!seconds) continue;
    const prop = node.properties.find(
      (p) => p.name.text === "duration_seconds",
    );
    if (prop)
      edits.push({
        start: prop.initializer.getStart(parsed.source),
        end: prop.initializer.end,
        value: String(seconds),
      });
    else {
      const last = node.properties.at(-1);
      const at = last ? last.end : node.getStart(parsed.source) + 1;
      const first = node.properties[0];
      const before = first
        ? text.slice(
          node.getStart(parsed.source) + 1,
          first.getStart(parsed.source),
        )
        : "";
      const separator = /\r?\n/.test(before) ? before : " ";
      edits.push({
        start: at,
        end: at,
        value: `${last ? "," : ""}${separator}"duration_seconds": ${seconds}`,
      });
    }
  }
  let result = text;
  for (const edit of edits.sort((a, b) => b.start - a.start))
    result = result.slice(0, edit.start) + edit.value + result.slice(edit.end);
  JSON.parse(result.replace(/^\uFEFF/, ""));
  return { text: result, count: edits.length };
}

async function fetchDurations(
  ids,
  key,
  { fetchImpl = fetch, wait = sleep, maxRequests = 100 } = {},
) {
  const durations = new Map();
  let requests = 0;
  for (let offset = 0; offset < ids.length; offset += 50) {
    const batch = ids.slice(offset, offset + 50);
    for (let attempt = 0; ; attempt++) {
      if (++requests > maxRequests)
        throw new Error("Request budget exceeded; no catalog files written.");
      let response;
      try {
        const url = new URL("https://www.googleapis.com/youtube/v3/videos");
        url.search = new URLSearchParams({
          part: "contentDetails",
          id: batch.join(","),
        }).toString();
        response = await fetchImpl(url, {
          headers: { "X-Goog-Api-Key": key },
          signal: AbortSignal.timeout(20000),
          redirect: "error",
        });
      } catch {
        if (attempt >= 3)
          throw new Error(
            "YouTube network/timeout failure; no catalog files written.",
          );
        await wait(1000 * 2 ** attempt);
        continue;
      }
      let body;
      try {
        body = await response.json();
      } catch {
        throw new Error(
          "Invalid YouTube JSON response; no catalog files written.",
        );
      }
      const reasons = (body.error?.errors || []).map((e) => e.reason);
      if (
        reasons.some((r) => ["quotaExceeded", "dailyLimitExceeded"].includes(r))
      )
        throw new Error(
          "YouTube daily quota exhausted; retry after quota resets. No catalog files written.",
        );
      if (!response.ok) {
        const retryable =
          response.status === 429 ||
          response.status >= 500 ||
          reasons.some((r) =>
            ["rateLimitExceeded", "userRateLimitExceeded"].includes(r),
          );
        if (!retryable || attempt >= 3)
          throw new Error(
            `YouTube HTTP ${response.status}; no catalog files written.`,
          );
        const raw = response.headers.get("retry-after");
        const retryMs =
          raw === null
            ? 0
            : /^\d+$/.test(raw)
              ? Number(raw) * 1000
              : Date.parse(raw) - Date.now();
        if (retryMs > 60000)
          throw new Error(
            "YouTube requests a long retry delay; rerun later. No catalog files written.",
          );
        await wait(
          Math.max(1000 * 2 ** attempt, Number.isFinite(retryMs) ? retryMs : 0),
        );
        continue;
      }
      if (!Array.isArray(body.items))
        throw new Error(
          "YouTube response has no items array; no catalog files written.",
        );
      for (const item of body.items) {
        const seconds = durationSeconds(item.contentDetails?.duration);
        if (batch.includes(item.id) && seconds) durations.set(item.id, seconds);
      }
      break;
    }
    if (offset + 50 < ids.length) await wait(250);
  }
  return { durations, requests };
}

async function atomicWrite(file, original, replacement) {
  const stat = await fs.lstat(file);
  if (
    !stat.isFile() ||
    stat.isSymbolicLink() ||
    (await fs.readFile(file, "utf8")) !== original
  )
    throw new Error(`File changed or unsafe: ${file}`);
  const token = randomUUID();
  const backup = `${file}.${token}.bak`;
  const temp = `${file}.${token}.tmp`;
  async function save(target, text) {
    const handle = await fs.open(target, "wx", stat.mode);
    try {
      await handle.writeFile(text, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
  }
  await save(backup, original);
  try {
    await save(temp, replacement);
    if ((await fs.readFile(file, "utf8")) !== original)
      throw new Error(`File changed before replacement: ${file}`);
    await fs.rename(temp, file);
  } finally {
    await fs.rm(temp, { force: true });
  }
  return backup;
}

async function run({
  dir = DEFAULT_DIR,
  write = false,
  key = process.env.YOUTUBE_API_KEY,
  maxRequests = 100,
  log = console.log,
  ...network
} = {}) {
  const entries = (await fs.readdir(dir, { withFileTypes: true }))
    .filter((e) => e.name.endsWith(".json"))
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) throw new Error(`Unsafe JSON entry: ${entry.name}`);
    const file = path.join(dir, entry.name);
    const text = await fs.readFile(file, "utf8");
    files.push({ file, text, parsed: inspect(text, file) });
  }
  const ids = [
    ...new Set(files.flatMap((f) => f.parsed.candidates.map((c) => c.videoId))),
  ];
  const candidates = files.reduce((n, f) => n + f.parsed.candidates.length, 0);
  const skipped = files.reduce((n, f) => n + f.parsed.skipped, 0);
  log(
    `${write ? "WRITE" : "DRY RUN"}: ${files.length} files, ${candidates} missing durations, ${ids.length} unique video IDs, ${skipped} skipped (no valid video ID).`,
  );
  if (!ids.length) return { updated: 0, unresolved: 0, skipped };
  if (!key)
    throw new Error(
      "Set YOUTUBE_API_KEY in the environment. Scan complete; no files written.",
    );
  if (Math.ceil(ids.length / 50) > maxRequests)
    throw new Error("Request budget too small; no API calls made.");
  const { durations, requests } = await fetchDurations(ids, key, {
    maxRequests,
    ...network,
  });
  const unresolved = ids.filter((id) => !durations.has(id));
  for (const id of unresolved)
    log(`Unavailable or non-positive duration: ${id}`);
  const plans = files
    .map((f) => ({ ...f, patch: patchText(f.text, f.parsed, durations) }))
    .filter((f) => f.patch.count);
  let lock;
  const lockPath = path.join(dir, ".youtube-duration.lock");
  try {
    if (write && plans.length) lock = await fs.open(lockPath, "wx");
    // Preflight all sources before the first write. Each file is checked again during replacement.
    for (const f of plans)
      if ((await fs.readFile(f.file, "utf8")) !== f.text)
        throw new Error(`File changed: ${f.file}`);
    for (const f of plans) {
      for (const c of f.parsed.candidates)
        if (durations.has(c.videoId))
          log(
            `${path.basename(f.file)}: ${c.song.id || c.videoId} -> ${durations.get(c.videoId)}s`,
          );
      if (write)
        log(`Backup: ${await atomicWrite(f.file, f.text, f.patch.text)}`);
    }
  } finally {
    if (lock) {
      await lock.close();
      await fs.unlink(lockPath);
    }
  }
  const updated = plans.reduce((n, f) => n + f.patch.count, 0);
  log(
    `${write ? "Updated" : "Would update"} ${updated} songs; ${unresolved.length} unresolved video IDs; ${requests} requests.`,
  );
  return { updated, unresolved: unresolved.length, skipped };
}

async function main(args) {
  if (args.includes("--help")) {
    console.log(
      "node scripts/fill-youtube-durations.cjs [--dry-run | --write] [--max-requests N]\nDefault: dry-run. Reads YOUTUBE_API_KEY.",
    );
    return;
  }
  let write = false,
    dry = false,
    maxRequests = 100;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--write") write = true;
    else if (args[i] === "--dry-run") dry = true;
    else if (args[i] === "--max-requests" && /^\d+$/.test(args[i + 1] || ""))
      maxRequests = Number(args[++i]);
    else throw new Error("Unknown or invalid argument. Use --help.");
  }
  if (write && dry) throw new Error("Choose either --write or --dry-run.");
  if (!Number.isSafeInteger(maxRequests) || maxRequests < 1)
    throw new Error("Request budget must be a positive integer.");
  const result = await run({ write, maxRequests });
  if (result.unresolved || result.skipped) process.exitCode = 2;
}
if (require.main === module)
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
module.exports = {
  durationSeconds,
  inspect,
  patchText,
  fetchDurations,
  atomicWrite,
  run,
};
