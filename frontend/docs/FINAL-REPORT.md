# รายงาน Music Platform Refactoring — 19 ตุลาคม 2026

ทำงานกับโปรเจกต์จริง C:\Users\User\Desktop\music-platform ไม่สร้างโปรเจกต์ทดแทน ไม่เพิ่ม dependencies ไม่ commit และไม่ push

## 1. ภาพรวม

ย้าย Music Player และ Queue ตาม feature โดย build หลังย้ายแต่ละกลุ่ม แยก catalog normalization และ queue/history rules ออกจาก Provider รวม utilities ที่ซ้ำ เพิ่ม tests และเอกสาร รักษา JSX, CSS, routes, IDs, JSON และ public assets

## 2. โครงสร้างใหม่

src/app: routes และ UI เฉพาะหน้า; src/components/navigation: shared navigation; src/features/music-player: playback/state/media adapters; src/features/queue: Queue UI; src/data/music-catalog: ข้อมูลและ typed aggregation; src/lib: pure utilities ร่วม ดู FILE-STRUCTURE.md สำหรับรายชื่อไฟล์ครบ รวม configuration, tests, docs และ assets (ย่อเฉพาะ .git/node_modules/.next ซึ่งเป็น internals/dependencies/build output)

## 3. ไฟล์ที่ย้าย 14 รายการ (paths จาก frontend)

| เดิม                                                          | ใหม่                                                        |
| ------------------------------------------------------------- | ----------------------------------------------------------- |
| src/components/music-player/components/PlayerBar.tsx          | src/features/music-player/components/PlayerBar.tsx          |
| src/components/music-player/components/PlayerVolume.tsx       | src/features/music-player/components/PlayerVolume.tsx       |
| src/components/music-player/components/VolumeControl.tsx      | src/features/music-player/components/VolumeControl.tsx      |
| src/components/music-player/players/AppleMusicPlayer.tsx      | src/features/music-player/players/AppleMusicPlayer.tsx      |
| src/components/music-player/players/SpotifyPlayer.tsx         | src/features/music-player/players/SpotifyPlayer.tsx         |
| src/components/music-player/players/YouTubePlayer.tsx         | src/features/music-player/players/YouTubePlayer.tsx         |
| src/components/music-player/providers/MusicPlayerProvider.tsx | src/features/music-player/providers/MusicPlayerProvider.tsx |
| src/components/music-player/services/player-service.ts        | src/features/music-player/services/player-service.ts        |
| src/components/music-player/services/playing-next.ts          | src/features/music-player/services/playing-next.ts          |
| src/components/music-player/types/player-types.ts             | src/features/music-player/types/player-types.ts             |
| src/components/queue/components/QueueTrackList.tsx            | src/features/queue/components/QueueTrackList.tsx            |
| src/components/queue/components/TrackActions.tsx              | src/features/queue/components/TrackActions.tsx              |
| src/components/queue/hooks/useQueueReorder.ts                 | src/features/queue/hooks/useQueueReorder.ts                 |
| src/components/queue/UpNextPanel.tsx                          | src/features/queue/UpNextPanel.tsx                          |

## 4. ไฟล์ที่ลบและการจัดกลุ่ม

A: ลบ src/components/PlayerBar.tsx ซึ่งเป็น comment ทั้งหมด ไม่มี runtime exports และไม่มี active imports ส่วน PlayerBar ที่ใช้งานจริงยังอยู่ครบใน feature
B: เก็บ music-catalog2/3.json, starter SVGs, รูป artist สำรอง, Spotify/AppleMusic stubs, useQueueReorder และ navigation utilities ที่ไม่ยืนยันว่าเลิกใช้ถาวร จึงไม่ลบ
C: เก็บ routes, player/queue, JSON และ assets ที่ใช้งานทั้งหมด
Git แสดง D ที่ path เดิมอีก 14 รายการเนื่องจากย้ายไป features ไม่ใช่ลบฟีเจอร์

## 5. ไฟล์ที่เพิ่ม (ไม่นับปลายทางย้าย)

- ARCHITECTURE.md
- CONTRIBUTING.md
- docs/AUDIT.md
- docs/FILE-STRUCTURE.md
- docs/FINAL-REPORT.md
- docs/baseline-files.json
- docs/baseline-ref.txt
- docs/data-audit.json
- docs/git-status.txt
- docs/moves-music-player.json
- docs/moves-queue.json
- docs/route-validation.json
- scripts/audit-data.cjs
- scripts/validate-source.cjs
- src/features/music-player/index.ts
- src/features/music-player/services/catalog-tracks.ts
- src/features/music-player/services/queue-service.ts
- src/lib/random.ts
- src/lib/search-text.ts
- tests/catalog.test.cjs
- tests/player.test.cjs
- tests/provider.test.cjs
- tests/register.cjs
- tests/youtube-lifecycle.test.cjs

## 6. ลดโค้ดซ้ำ

รวม Fisher-Yates shuffle/sampling จาก 4 หน้าใน src/lib/random.ts และ Thai search normalization จาก 3 หน้าใน src/lib/search-text.ts รวม playback source types ที่ซ้ำกัน ใช้ shared catalog types ที่ derive จาก JSON จริง

## 7. ความเสถียร

YouTube initialization ใช้ generation token ป้องกัน async construction/events หลัง cleanup; callback refs synchronize หลัง commit ด้วย layout effect; cleanup จับ container ที่ถูกต้อง Recommendation initialization ของ 4 หน้ามี cancellable timer หลัง hydration เพิ่ม guard เพลงซ้ำใน queue และ NaN volume; reorder ปฏิเสธ fractional/NaN indices; ลบ unsafe double casts ใน Provider/catalog views

## 8. Architecture

Provider ยังคงเป็น state owner เดิม มี synchronous refs ให้ Next/ended เห็นคิวล่าสุด Pure services จัดการ queue/history และ catalog adapter พร้อม lookup map เปิด public API สำหรับ provider/hook/types โดย services ไม่พึ่ง Queue UI ไม่เขียน player ใหม่ ไม่สร้างฟีเจอร์อนาคตหรือโฟลเดอร์ว่าง

## 9. Developer Experience

ปรับ README ทั้ง root/frontend เพิ่ม ARCHITECTURE.md, CONTRIBUTING.md และ AGENTS.md โดยเก็บ Next generated rules เพิ่ม scripts typecheck, test, audit:data, validate:source ใช้ Node built-in runner กับ TypeScript เดิม ไม่มี dependency เพิ่ม อนุญาต CommonJS require เฉพาะ tooling tests/scripts ใน ESLint

## 10. TypeScript

npm run typecheck ผ่าน และ Production Build ตรวจ TypeScript ผ่านหลังแก้ไข

## 11. ESLint

npm run lint ผ่าน exit 0: 0 errors, 11 warnings เรื่อง next/no-img-element ที่มีอยู่เดิม ไม่ปิดคำเตือน เริ่มต้นมี 12 errors/12 warnings แก้ render-time refs, initialization effects และ cleanup warning แล้ว

## 12. Production Build

npm run build ผ่านหลังย้ายแต่ละ feature และหลังแก้ logic/utilities Routes เดิมครบ: /, /artists, /artists/[artistId], /artists/[artistId]/albums/[albumId], /search, /songs

## 13. Automated Tests

npm test ผ่าน 17/17: queue ordering/priority, duplicate prevention, rapid Next, move then ended, repeat ไม่กินคิว/manual Next ข้ามได้, Previous/history/restart, shuffle, stable recommendations/refill, small/empty catalog, missing duration, invalid reorder, URL handling, data relationships, stale YouTube effects/callbacks และ utilities
Provider/media tests เป็น hook-storage harness กับ mocked controls เรียก source จริง ไม่ใช่ React renderer หรือการเล่นเสียงจริง

## 14. UI และ Runtime Regression

validate:source ผ่าน 31 TS/TSX files ไม่พบ unresolved local imports/circular dependencies เทียบ AST พบ JSX ของ TSX เดิมเหมือนเดิม CSS/JSON/public assets ไม่เปลี่ยน
HTTP smoke test build สุดท้ายผ่าน 69 URL (4 หน้าหลัก + 4 artist + 61 album) ทุก URL เป็น HTTP 200 ไม่มี Application error marker ดู route-validation.json
ตรวจเบราว์เซอร์ desktop viewport ที่เครื่องมือให้ ภาพ 767×505: Home, Search, Artists, Artist Detail, Album Detail, Songs และ Queue Panel; ย้าย Playing Next เข้าคิวแล้วเติมท้ายครบ 10; ปิด/เปิด panel ลำดับคงเดิม; เลือกเพลงจากคิวเปลี่ยน Now Playing; YouTube รายงานเวลาเพิ่ม 0:03 → 0:10 และ duration 3:31; Pause เปลี่ยนปุ่มกลับ Play; ค้นหา guncharlie พบ 20 เพลงและศิลปินที่ตรง ภาพ music-platform-ui.png เป็น Songs page หลัง refactor

## 15. ยังไม่ได้ทดสอบครบ

ไม่มี screenshot baseline ก่อนเริ่ม จึงไม่ได้เทียบ pixel ก่อน–หลัง ไม่รับรอง UI เหมือนเดิม 100% ยังไม่ได้ทดสอบ mobile/touch จริง (tool ไม่มี viewport control), keyboard ทุก flow, drag reorder บน browser, เพลงจบจริงทั้งเพลง, playback ทุกวิดีโอ, ทุก loading/error state หรือทุก browser

## 16. ความเสี่ยงและข้อมูลที่รายงานโดยไม่แก้อัตโนมัติ

4 artists, 61 albums, 217 songs ไม่มี duplicate IDs/missing references/local asset errors พบ 206 เพลงไม่มี duration ใน JSON จึงแสดง --:-- ในคิวตามเดิม รายการครบใน data-audit.json ไม่แก้ข้อมูลต้นฉบับ ตรวจรูปแบบ cover URLs/video IDs แล้ว แต่ไม่ได้ตรวจ remote reachability และสิทธิ์ embed ของทุกวิดีโอ
ลิงก์ /saved มีอยู่เดิมแต่ไม่มี route เก็บไว้เพราะการลบเมนูหรือสร้าง feature ใหม่ต้องตัดสินใจด้าน product ไม่เปลี่ยน UI อัตโนมัติ Page-specific UI/view models ที่พฤติกรรมต่างกันยังแยกไว้ เพื่อลดความเสี่ยงจาก abstraction เกินจำเป็น

## 17. Git Status

ก่อนเริ่ม working tree สะอาด หลังงานมี modified/deleted-old-path/untracked-new-path ดู docs/git-status.txt ยังไม่ stage/commit/push ไม่มีงานค้างก่อนเริ่มที่ถูกเขียนทับ git diff --check ผ่านด้วย Git config เดิม มี warnings ว่า LF จะถูกแปลงเป็น CRLF เมื่อ Git เขียนไฟล์ และ npm แจ้งเวอร์ชันใหม่ ไม่เปลี่ยน Git global config หรืออัปเดต npm

## 18. ก่อน Push

Review diff รวม untracked features/tests/scripts/docs ให้ครบ เพื่อให้ staged diff แสดง renames ทดสอบ mobile/touch, keyboard, drag reorder และ continuous/ended playback กับ YouTube จริงเพิ่มเติม ตัดสินใจ /saved กับข้อมูล duration แยกจาก refactor รัน commands ใน CONTRIBUTING.md แล้วจึง commit/push ด้วยตนเอง
