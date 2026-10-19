<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project rules

- App Router pages stay in src/app; shared navigation in src/components; player/queue in src/features; catalog in src/data/music-catalog. Read ARCHITECTURE.md for flow.
- Preserve original routes, JSX/CSS, IDs, assets and catalog JSON. No speculative features, dependencies or global state libraries.
- Use the player public API; services must stay independent of UI. Keep synchronous refs for commands and React state for presentation.
- Queue before Playing Next; stable unique recommendation order, max 10; current/queued songs excluded. Moving to queue must not change current track. Repeat-ended must not consume queue; manual Next advances; Previous follows real history.
- Refactor small groups and build after each move. Confirm all runtime/framework/script/asset references before deleting. Retain uncertain files. Preserve existing uncommitted work. Never reset/clean/push automatically.
- Validate npm run typecheck, npm run lint, npm test, npm run audit:data, npm run build and git diff --check. Report warnings and browser/manual gaps honestly. See CONTRIBUTING.md.
