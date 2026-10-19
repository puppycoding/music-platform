# Contributing

Use PascalCase for React components, useCamelCase for hooks, and descriptive kebab-case for service files. Keep strict TypeScript and avoid unsafe double casts. Pure rules belong in services; React synchronization belongs in hooks/providers. Keep feature types nearby and derive catalog types from actual JSON.

Use @/features/music-player for provider, hook and shared playback types. PlayerBar is a dedicated UI entry at features/music-player/components/PlayerBar. Use relative imports inside features. Never make provider/services depend on queue UI. Preserve App Router file conventions.

For a new feature, add only folders with real code. Share UI only where behavior matches. Do not change colors, classes, spacing, responsive behavior, IDs, routes or catalog data as a refactor side effect. Keep image warnings visible until an intentional image migration can be reviewed.

Before committing, run npm run typecheck, npm run lint, npm test, npm run audit:data, npm run build and git diff --check. Review runtime navigation, search, desktop/mobile controls, queue ordering, rapid Next, repeat and actual YouTube playback. Tests use Node 24 on this machine; provider harness does not prove browser playback.

Before deleting a file, trace static/dynamic imports, framework conventions, scripts, tests, CSS URLs and public asset references. Retain uncertain files and ask before deleting them. Never overwrite pre-existing work, run destructive Git cleanup, change data automatically, or push without instruction.

For this refactor, npm run validate:source checks import resolution, cycles, unchanged JSX/data/styles/assets against the pinned baseline commit. Keep that commit available.
