# Architecture

## Boundaries

- src/app: existing App Router routes and page-specific presentation. Route names and JSX/CSS are preserved.
- src/components/navigation: navigation shared across pages.
- src/features/music-player: public provider/hook/types in index.ts; player controls in components/PlayerBar.tsx; media adapters in players/; pure business rules in services/.
- src/features/queue: queue presentation, track action menus and drag interactions. Uses player public API; no second source of queue state.
- src/data/music-catalog: original JSON and aggregation. types.ts derives types directly from the real catalog. Legacy music-catalog2/3.json are retained, not imported by the active aggregation.
- tests: Node built-in tests; existing TypeScript compiler transpiles real source. Provider command harness substitutes hook storage and media controls; it does not substitute for React/browser lifecycle tests.

## Data and state flow

JSON -> catalog index -> catalog-tracks normalization and song lookup -> MusicPlayerProvider -> context consumers.
User commands -> synchronous refs -> React state -> UI. YouTube events -> latest committed callbacks -> provider commands/state. Progress updates every 500 ms.

## Queue invariants

Queue has priority over Playing Next. IDs remain original; queueId identifies queue entries. Repeated adds of an already queued song do nothing. Moving a recommendation removes it and refills the tail without changing the current track. fillPlayingNext preserves valid visible order, excludes current and queued tracks, caps at ten unique playable songs, and handles small/empty catalogs. Queue/refill transactions publish both refs before state updates.
Next uses the first displayed recommendation when queue is empty. Repeat One on ended replays current without consuming queue; manual Next still advances. Previous follows actual history or seeks to zero when time exceeds three seconds. Shuffle preserves existing one-click advance behavior.

## Media lifecycle

YouTube async construction is guarded by an effect generation token; cleanup invalidates pending construction and events, destroys the instance and clears its captured container. Callback refs synchronize in layout effect after React commits.

## Extending

Keep playlists/favorites/history persistence behind a feature boundary when implemented. Swap catalog access/normalization at the data boundary for an API; do not spread JSON transforms into controls. Do not add speculative infrastructure. Shared UI should be extracted only for genuinely identical behavior; keep differing page cards separate.

Shared pure Thai search normalization and Fisher-Yates sampling live in src/lib. Page-specific view types remain local and are structurally checked against actual catalog data.
