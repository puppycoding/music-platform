# Music Platform frontend

Thai music discovery and YouTube playback built with Next.js 16.4.0 App Router, React 19.3.0, strict TypeScript and Tailwind CSS 4. Catalog: four artists, 61 albums, 217 songs. No backend or persistence is introduced.

## Run

Use Node.js 24 (validated on 24.14.1) and npm. From frontend, run npm ci for a fresh install, then npm run dev. Existing dependencies were reused during the refactor; none were added.

- npm run dev: development server
- npm run build: production build
- npm start: serve production build
- npm run typecheck: strict TypeScript
- npm run lint: ESLint (existing image warnings remain)
- npm test: dependency-free business-rule and provider-command tests
- npm run audit:data: validate catalog relationships, local assets and URL syntax; missing durations reported without modifying data

See ARCHITECTURE.md, CONTRIBUTING.md, AGENTS.md and docs/AUDIT.md. Test harnesses do not verify remote YouTube availability or replace browser regression testing. The existing /saved link has no implemented route; do not silently invent a feature during refactoring.

For this refactor, npm run validate:source checks import resolution, cycles, unchanged JSX/data/styles/assets against the pinned baseline commit. Keep that commit available.
