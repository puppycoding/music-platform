const { test } = require("node:test");
const assert = require("node:assert/strict");
const { auditData } = require("../scripts/audit-data.cjs");
const catalog = require("../src/data/music-catalog/index.ts").default;
test("catalog relationships and local assets", () => {
  const result = auditData(catalog);
  assert.deepEqual(result.errors, []);
});
test("auditor detects duplicate IDs and missing references", () => {
  const result = auditData({
    artists: [{ id: "a" }, { id: "a" }],
    albums: [],
    songs: [
      {
        id: "s",
        artist_ids: ["missing"],
        album_id: "absent",
        duration_seconds: -1,
      },
    ],
  });
  assert.equal(result.errors.length, 4);
});
