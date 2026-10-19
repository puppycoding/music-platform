const { test } = require("node:test");
const assert = require("node:assert/strict");
const Module = require("node:module");
test("YouTube construction ignores abandoned effects and stale callbacks, destroys active instance", async () => {
  const filename =
    require.resolve("../src/features/music-player/players/YouTubePlayer.tsx");
  const effects = [],
    layout = [],
    instances = [];
  let notified = 0,
    destroyed = 0;
  const previousWindow = global.window,
    previousDocument = global.document;
  const hooks = {
    useCallback: (fn) => fn,
    useRef: (value) => ({ current: value }),
    useState: (initial) => [initial, () => { }],
    useEffect: (fn) => effects.push(fn),
    useLayoutEffect: (fn) => layout.push(fn),
  };
  const load = Module._load;
  Module._load = function (request, parent, ...args) {
    if (request === "react" && parent?.filename === filename) return hooks;
    return load.call(this, request, parent, ...args);
  };
  let Player;
  try {
    delete require.cache[filename];
    Player = require(filename).default;
  } finally {
    Module._load = load;
  }
  global.window = {
    YT: {
      Player: class {
        constructor(id, options) {
          this.options = options;
          instances.push(this);
        }
        destroy() {
          destroyed++;
        }
        setVolume() { }
      },
      PlayerState: { PLAYING: 1 },
    },
  };
  global.document = { createElement: () => ({ id: "" }) };
  try {
    const output = Player({ onReady: () => notified++ });
    output.props.ref.current = { appendChild() { }, replaceChildren() { } };
    layout.forEach((fn) => fn());
    const cleanup = effects[0]();
    cleanup();
    const cleanupActive = effects[0]();
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(instances.length, 1);
    const active = instances[0];
    active.options.events.onReady({ target: active });
    assert.equal(notified, 1);
    cleanupActive();
    assert.equal(destroyed, 1);
    active.options.events.onReady({ target: active });
    assert.equal(notified, 1);
  } finally {
    global.window = previousWindow;
    global.document = previousDocument;
  }
});
