# Initial audit

Git working tree was clean. Next 16.4.0, React 19.3.0; no test runner or test script. Baseline build and TypeScript pass. ESLint: 12 errors, 12 warnings (4 recommendation initialization effects, 8 render-time ref writes; image warnings and cleanup warning).

Routes: /, /artists, /artists/[artistId], /artists/[artistId]/albums/[albumId], /search, /songs. Existing /saved navigation has no route; preserved pending product decision.

Plan: move player then queue into features, build after each group; extract catalog adaptation and pure queue/history operations; retain UI markup and JSON; add dependency-free behavioral tests; document architecture and audit data.

Cleanup: commented-out components/PlayerBar.tsx is confirmed inactive. Legacy JSON, public starter SVGs, alternate artist images, unused provider stubs and navigation utilities remain potentially unused and are retained.
