const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const {
  durationSeconds,
  inspect,
  patchText,
  fetchDurations,
  atomicWrite,
  run,
} = require("../scripts/fill-youtube-durations.cjs");
const id = "_4mLDF0uNgQ";
const song = (duration = null) => ({
  id: "เพลง",
  duration_seconds: duration,
  providers: { youtube: { video_id: id } },
  title: 'ไทย "duration_seconds": null',
  metadata: { duration_seconds: null },
});
const response = (items, status = 200, headers = {}) => ({
  ok: status === 200,
  status,
  headers: new Headers(headers),
  json: async () => (status === 200 ? { items } : items),
});
const success = () =>
  response([{ id, contentDetails: { duration: "PT4M5S" } }]);
async function fixture(t, data) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "youtube-duration-"));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  const file = path.join(dir, "songs.json");
  const text =
    "\uFEFF" +
    JSON.stringify({ songs: data }, null, 2).replaceAll("\n", "\r\n") +
    "\r\n";
  await fs.writeFile(file, text);
  return { dir, file, text };
}
test("ISO durations: seconds, hours, days and invalid/live durations", () => {
  for (const [input, expected] of [
    ["PT4M5S", 245],
    ["PT45S", 45],
    ["P1DT2H3M4S", 93784],
    ["PT0S", null],
    ["PT", null],
    ["P", null],
    ["garbage", null],
    ["PT1.5S", null],
  ])
    assert.equal(durationSeconds(input), expected);
});
test("patch only missing duration, preserve BOM/CRLF/metadata and existing zero", async (t) => {
  const missing = song();
  delete missing.duration_seconds;
  const f = await fixture(t, [song(), song(0), song(123), missing]);
  const patch = patchText(
    f.text,
    inspect(f.text, f.file),
    new Map([[id, 245]]),
  );
  assert.equal(patch.count, 2);
  const expected = JSON.parse(f.text.slice(1));
  expected.songs[0].duration_seconds = 245;
  expected.songs[3].duration_seconds = 245;
  assert.deepEqual(JSON.parse(patch.text.slice(1)), expected);
  assert.ok(patch.text.startsWith("\uFEFF"));
  assert.ok(!/(?<!\r)\n/.test(patch.text));
  const nullOnly = await fixture(t, [song()]);
  assert.equal(
    patchText(nullOnly.text, inspect(nullOnly.text, "x"), new Map([[id, 245]]))
      .text,
    nullOnly.text.replace(
      '"duration_seconds": null',
      '"duration_seconds": 245',
    ),
  );
});
test("reject malformed, duplicate keys and invalid root", () => {
  for (const text of [
    "{",
    '{"songs":[],"songs":[]}',
    '{"songs":[{"id":"a","id":"b"}]}',
    "{}",
  ])
    assert.throws(() => inspect(text, "x"));
});
test("dry run deduplicates IDs, uses header key, never writes; write creates exact backup and is idempotent", async (t) => {
  const f = await fixture(t, [song(), song()]);
  let calls = 0;
  const fetchImpl = async (url, options) => {
    calls++;
    assert.equal(url.searchParams.get("id"), id);
    assert.ok(!url.href.includes("secret"));
    assert.equal(options.headers["X-Goog-Api-Key"], "secret");
    return success();
  };
  const opts = { dir: f.dir, key: "secret", fetchImpl, log() { } };
  assert.equal((await run(opts)).updated, 2);
  assert.equal(await fs.readFile(f.file, "utf8"), f.text);
  assert.deepEqual(await fs.readdir(f.dir), ["songs.json"]);
  await run({ ...opts, write: true });
  const backup = (await fs.readdir(f.dir)).find((n) => n.endsWith(".bak"));
  assert.equal(await fs.readFile(path.join(f.dir, backup), "utf8"), f.text);
  assert.equal((await run({ ...opts, write: true })).updated, 0);
  assert.equal(calls, 2);
});
test("API retries rate limit and network failure, respects Retry-After and budgets", async () => {
  let count = 0;
  const delays = [];
  const result = await fetchDurations([id], "key", {
    wait: async (ms) => delays.push(ms),
    fetchImpl: async () => {
      if (++count === 1) throw new Error("secret URL");
      return count === 2
        ? response({}, 429, { "retry-after": "3" })
        : success();
    },
  });
  assert.equal(result.durations.get(id), 245);
  assert.deepEqual(delays, [1000, 3000]);
  await assert.rejects(
    fetchDurations([id], "key", {
      maxRequests: 1,
      wait: async () => { },
      fetchImpl: async () => response({}, 500),
    }),
    /budget/,
  );
});
test("quota/auth/malformed response fail before writes; missing key safe", async (t) => {
  const f = await fixture(t, [song()]);
  for (const fetchImpl of [
    async () =>
      response({ error: { errors: [{ reason: "quotaExceeded" }] } }, 403),
    async () => response({}, 401),
    async () => ({ ok: true, json: async () => ({}) }),
  ]) {
    await assert.rejects(
      run({ dir: f.dir, write: true, key: "secret", fetchImpl, log() { } }),
    );
    assert.equal(await fs.readFile(f.file, "utf8"), f.text);
    assert.deepEqual(await fs.readdir(f.dir), ["songs.json"]);
  }
  await assert.rejects(
    run({ dir: f.dir, key: "", log() { } }),
    /YOUTUBE_API_KEY/,
  );
});
test("unavailable videos remain untouched and report unresolved; invalid IDs skipped", async (t) => {
  const bad = song();
  bad.providers.youtube.video_id = "bad";
  const f = await fixture(t, [song(), bad]);
  const result = await run({
    dir: f.dir,
    write: true,
    key: "key",
    fetchImpl: async () => response([]),
    log() { },
  });
  assert.equal(result.unresolved, 1);
  assert.equal(result.skipped, 1);
  assert.equal(await fs.readFile(f.file, "utf8"), f.text);
});
test("atomic write refuses stale source; write lock is respected", async (t) => {
  const f = await fixture(t, [song()]);
  await assert.rejects(atomicWrite(f.file, "stale", "replacement"), /changed/);
  await fs.writeFile(path.join(f.dir, ".youtube-duration.lock"), "");
  await assert.rejects(
    run({
      dir: f.dir,
      write: true,
      key: "key",
      fetchImpl: async () => success(),
      log() { },
    }),
    /EEXIST/,
  );
  assert.equal(await fs.readFile(f.file, "utf8"), f.text);
});
test("batches 51 unique IDs into two requests", async () => {
  const sizes = [];
  const ids = Array.from({ length: 51 }, (_, i) => String(i).padStart(11, "0"));
  await fetchDurations(ids, "key", {
    wait: async () => { },
    fetchImpl: async (url) => {
      sizes.push(url.searchParams.get("id").split(",").length);
      return response([]);
    },
  });
  assert.deepEqual(sizes, [50, 1]);
});
