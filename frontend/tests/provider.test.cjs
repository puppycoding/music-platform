// Exercise actual Provider commands with synchronous hook storage and mocked media controls.
// This is a command/state harness, not a React renderer or browser playback test.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
const filename =
  require.resolve("../src/features/music-player/providers/MusicPlayerProvider.tsx");
function harness() {
  const slots = [];
  let cursor = 0;
  const effects = [];
  const hooks = {
    createContext: () => ({ Provider: () => null }),
    useContext: () => null,
    useState(initial) {
      const i = cursor++;
      if (!(i in slots))
        slots[i] = typeof initial === "function" ? initial() : initial;
      return [
        slots[i],
        (value) => {
          slots[i] = typeof value === "function" ? value(slots[i]) : value;
        },
      ];
    },
    useRef(initial) {
      const i = cursor++;
      return slots[i] ?? (slots[i] = { current: initial });
    },
    useCallback: (fn) => fn,
    useMemo: (fn) => fn(),
    useEffect: (fn) => {
      effects.push(fn);
    },
  };
  const load = Module._load;
  Module._load = function (request, parent, ...args) {
    if (request === "react" && parent?.filename === filename) return hooks;
    return load.call(this, request, parent, ...args);
  };
  delete require.cache[filename];
  let Provider;
  try {
    Provider = require(filename).default;
  } finally {
    Module._load = load;
  }
  let output;
  function render() {
    cursor = 0;
    output = Provider({ children: null });
    return output.props.value;
  }
  render();
  const cleanups = effects.splice(0).map((fn) => fn());
  const controls = {
    loads: [],
    seek: [],
    play() { },
    pause() { },
    loadVideo(id) {
      this.loads.push(id);
    },
    seekTo(seconds) {
      this.seek.push(seconds);
    },
  };
  output.props.children[1].props.onControlsReady(controls);
  output.props.children[1].props.onReady();
  return {
    render,
    controls,
    media: () => output.props.children[1].props,
    dispose: () => cleanups.forEach((fn) => fn?.()),
  };
}
test("actual provider: queue priority, rapid add/Next, move then ended, repeat, previous, reorder, shuffle", async () => {
  const h = harness();
  try {
    await new Promise((resolve) => setTimeout(resolve, 5));
    let p = h.render();
    assert.deepEqual(p.playingNext, [], "Playing Next starts empty outside an album");
    const albumTracks = p.songs.filter((s) => s.videoId);
    const [a, b, c] = albumTracks;
    p.playAlbumSong(a.id, albumTracks.map((song) => song.id));
    p = h.render();
    p.addToQueue(b.id);
    p.addToQueue(b.id);
    p.addToQueue(c.id);
    p = h.render();
    assert.deepEqual(
      p.queue.map((q) => q.song.id),
      [b.id, c.id],
    );
    p.reorderQueue(0, 1);
    p = h.render();
    assert.equal(p.queue[0].song.id, c.id);
    p.playNext();
    p.playNext();
    p = h.render();
    assert.equal(p.currentSong.id, b.id);
    assert.equal(p.queue.length, 0);
    p.playPrevious();
    p = h.render();
    assert.equal(p.currentSong.id, c.id);
    h.media().onProgress({ currentTime: 4, duration: 200 });
    p = h.render();
    p.playPrevious();
    assert.equal(h.controls.seek.at(-1), 0);
    p = h.render();
    p.playAlbumSong(a.id, albumTracks.map((song) => song.id));
    p = h.render();
    const moved = p.playingNext[0].id;
    p.movePlayingNextToQueue(moved);
    p.movePlayingNextToQueue(moved);
    h.media().onStateChange("ended");
    p = h.render();
    assert.equal(p.currentSong.id, moved);
    assert.equal(p.queue.length, 0);
    p.addToQueue(a.id);
    p.toggleRepeat();
    h.media().onStateChange("ended");
    p = h.render();
    assert.equal(p.currentSong.id, moved);
    assert.equal(p.queue.length, 1);
    p.playNext();
    p = h.render();
    assert.equal(p.currentSong.id, a.id);
    assert.equal(p.queue.length, 0);
    const next = p.playingNext[0].id;
    p.playRandomSong();
    p = h.render();
    assert.equal(p.currentSong.id, next);
    const list = p.playingNext.map((s) => s.id);
    assert.deepEqual(
      h.render().playingNext.map((s) => s.id),
      list,
    );
    const originalIds = p.playingNext.map((s) => s.id);
    const originalRandom = Math.random;
    Math.random = () => 0;
    p.reshufflePlayingNext();
    Math.random = originalRandom;
    p = h.render();
    assert.notDeepEqual(
      p.playingNext.map((s) => s.id),
      originalIds,
      "shuffle should reorder the album remainder",
    );
    assert.equal(p.playingNext.length, originalIds.length);
    assert.deepEqual(
      new Set(p.playingNext.map((s) => s.id)),
      new Set(originalIds),
    );
    assert(!p.playingNext.some((s) => s.id === p.currentSong.id));
    assert(
      p.playingNext.every(
        (s) => !p.queue.some((item) => item.song.id === s.id),
      ),
    );
    const volume = p.volume;
    p.setVolume(NaN);
    assert.equal(h.render().volume, volume);
  } finally {
    h.dispose();
  }
});

test("album playback lists only the remaining album tracks in order", async () => {
  const h = harness();
  try {
    await new Promise((resolve) => setTimeout(resolve, 5));
    let p = h.render();
    const [first, second, third, unrelated] = p.songs.filter((s) => s.videoId);

    p.playAlbumSong(second.id, [first.id, second.id, third.id, unrelated.id]);
    p = h.render();

    assert.equal(p.currentSong.id, second.id);
    assert.deepEqual(p.playingNext.map((song) => song.id), [third.id, unrelated.id]);

    p.playNext();
    p = h.render();
    assert.equal(p.currentSong.id, third.id);
    assert.deepEqual(p.playingNext.map((song) => song.id), [unrelated.id]);
  } finally {
    h.dispose();
  }
});

test("actual provider: AutoPlay is separate and plays after Playing Next drains", async () => {
  const h = harness();
  try {
    await new Promise((resolve) => setTimeout(resolve, 5));
    let p = h.render();
    const firstSong = p.songs.find((song) => song.videoId);
    p.playSong(firstSong.id);
    p = h.render();
    p.toggleAutoPlay();
    p = h.render();

    assert.equal(p.autoPlayEnabled, true);
    assert.equal(p.autoPlayTracks.length, 10);
    assert(
      p.autoPlayTracks.every(
        (song) =>
          song.id !== p.currentSong.id &&
          !p.playingNext.some((next) => next.id === song.id),
      ),
    );

    const queuedSong = p.songs.find(
      (song) =>
        song.videoId &&
        song.id !== p.currentSong.id &&
        !p.playingNext.some((next) => next.id === song.id) &&
        !p.autoPlayTracks.some((next) => next.id === song.id),
    );
    p.addToQueue(queuedSong.id);
    p = h.render();
    p.playNext();
    p = h.render();
    assert.equal(p.currentSong.id, queuedSong.id);

    while (p.playingNext.length > 0) {
      p.playPlayingNext(p.playingNext[0].id);
      p = h.render();
    }
    const nextAutoPlayId = p.autoPlayTracks[0].id;
    p.playNext();
    p = h.render();
    assert.equal(p.currentSong.id, nextAutoPlayId);
    assert.equal(p.autoPlayTracks[0]?.id === nextAutoPlayId, false);

    p.toggleAutoPlay();
    p = h.render();
    assert.equal(p.autoPlayEnabled, false);
    assert.equal(p.autoPlayTracks.length, 0);
  } finally {
    h.dispose();
  }
});
