const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  fillPlayingNext,
  retainPlayingNext,
} = require("../src/features/music-player/services/playing-next.ts");
const {
  canEnqueue,
  reorderQueueItems,
  appendHistory,
} = require("../src/features/music-player/services/queue-service.ts");
const {
  normalizeTracks,
} = require("../src/features/music-player/services/catalog-tracks.ts");
const {
  getYouTubeVideoId,
  getPlaybackSource,
} = require("../src/features/music-player/services/player-service.ts");
const track = (id) => ({
  id,
  title: id,
  videoId: "abcdefghijk",
  artistName: "A",
  coverUrl: null,
  durationSeconds: null,
});
const songs = Array.from({ length: 15 }, (_, i) => track(String(i)));

test("Playing Next: ten real playable unique songs, excluding current and queue", () => {
  const next = fillPlayingNext(
    [],
    [...songs, track("1"), { ...track("bad"), videoId: null }],
    "0",
    new Set(),
    () => 0,
    new Set(["1", "2"]),
  );
  assert.equal(next.length, 10);
  assert.equal(new Set(next.map((s) => s.id)).size, 10);
  assert(
    next.every((s) => songs.includes(s) && !["0", "1", "2"].includes(s.id)),
  );
});
test("visible order survives render/panel-equivalent refresh without random draws", () => {
  const next = fillPlayingNext([], songs, "0", new Set(), () => 0);
  assert.deepEqual(
    fillPlayingNext(next, songs, "0", new Set(), () => {
      throw Error("unexpected redraw");
    }),
    next,
  );
});
test("moving a recommendation to queue retains remaining order and refills the tail", () => {
  const before = fillPlayingNext([], songs, "0", new Set(), () => 0);
  const moved = before[3];
  const after = fillPlayingNext(
    before,
    songs,
    "0",
    new Set(),
    () => 0,
    new Set([moved.id]),
  );
  assert.deepEqual(
    after.slice(0, 9),
    before.filter((s) => s.id !== moved.id),
  );
  assert.equal(after.length, 10);
});
test("AutoPlay keeps the remaining order without refilling consumed slots", () => {
  const existing = songs.slice(0, 4);
  const retained = retainPlayingNext(
    existing,
    songs,
    "0",
    new Set(["2"]),
  );
  assert.deepEqual(retained.map((song) => song.id), ["1", "3"]);
});
for (const size of [0, 1, 2, 5, 10])
  test("small/empty catalog " + size, () => {
    const input = songs.slice(0, size);
    const next = fillPlayingNext([], input, input[0]?.id, new Set(), () => 0);
    assert.equal(next.length, Math.max(0, size - 1));
    assert(!next.some((s) => s.id === input[0]?.id));
  });
test("reordering is immutable and rejects fractional, NaN and invalid indices", () => {
  const items = songs.slice(0, 3).map((song) => ({ queueId: song.id, song }));
  assert.deepEqual(
    reorderQueueItems(items, 0, 2).map((i) => i.song.id),
    ["1", "2", "0"],
  );
  assert.equal(items[0].song.id, "0");
  for (const index of [-1, 3, NaN, 0.5])
    assert.equal(reorderQueueItems(items, index, 1), items);
  assert.equal(canEnqueue(items, "0"), false);
  assert.equal(canEnqueue(items, "new"), true);
});
test("history preserves real traversal and truncates forward history on selection", () => {
  assert.deepEqual(appendHistory(["a", "b", "c"], 1, "d"), ["a", "b", "d"]);
  assert.deepEqual(appendHistory(["a"], 0, "a"), ["a"]);
});
test("normalization resolves artists and missing/invalid duration without mutating input", () => {
  const input = [
    { id: "a", title: "A", artist_ids: ["artist"], duration_seconds: null },
    { id: "b", title: "B", duration_seconds: NaN },
  ];
  const copy = structuredClone(input);
  const result = normalizeTracks(input, [{ id: "artist", name: "Artist" }]);
  assert.equal(result[0].artistName, "Artist");
  assert(result.every((s) => s.durationSeconds === null));
  assert.deepEqual(input, copy);
});
test("YouTube URLs and unsafe playback URLs", () => {
  for (const url of [
    "https://youtu.be/abcdefghijk",
    "https://youtube.com/watch?v=abcdefghijk",
    "https://youtube.com/shorts/abcdefghijk",
    "https://youtube-nocookie.com/embed/abcdefghijk",
  ])
    assert.equal(getYouTubeVideoId(url), "abcdefghijk");
  assert.equal(
    getYouTubeVideoId("https://youtube.com.evil.test/watch?v=x"),
    null,
  );
  assert.equal(
    getPlaybackSource({
      listen_provider: "spotify",
      listen_url: "javascript:alert(1)",
    }),
    null,
  );
});

const { shuffleItems } = require("../src/lib/random.ts");
const { normalizeSearchText } = require("../src/lib/search-text.ts");
test("shared shuffle keeps input and identities, Thai search keeps normalization", () => {
  const input = ["a", "b", "c"];
  const shuffled = shuffleItems(input, () => 0);
  assert.deepEqual(input, ["a", "b", "c"]);
  assert.deepEqual([...shuffled].sort(), input);
  assert.equal(normalizeSearchText("  GUNCHARLIE  "), "guncharlie");
  assert.equal(normalizeSearchText(null), "");
});
