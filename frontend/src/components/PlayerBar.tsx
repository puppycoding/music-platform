// // ไม่ได้ใช้

// "use client";

// import { useMusicPlayer } from "./music/MusicPlayerProvider";
// import PlayerVolume from "./PlayerVolume";
// import UpNextPanel from "./queue/UpNextPanel";

// export default function PlayerBar() {
//   const {
//     currentSong,
//     isPlaying,
//     togglePlay,
//     playNext,
//     playPrevious,
//   } = useMusicPlayer();

//   return (
//     <footer className="fixed inset-x-0 bottom-0 z-50 flex min-h-20 items-center justify-between gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur md:left-60 md:px-10">
//       {/* เพลงที่กำลังเล่น */}
//       <div className="flex min-w-0 flex-1 items-center gap-3">
//         <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-surface-hover">
//           {currentSong?.coverUrl ? (
//             <img
//               src={currentSong.coverUrl}
//               alt={`ปกเพลง ${currentSong.title}`}
//               className="h-full w-full object-cover"
//             />
//           ) : (
//             <div className="flex h-full w-full items-center justify-center text-xl text-primary">
//               ♪
//             </div>
//           )}
//         </div>

//         <div className="min-w-0">
//           <p className="truncate text-sm font-semibold">
//             {currentSong?.title ?? "ยังไม่ได้เลือกเพลง"}
//           </p>
//           <p className="truncate text-xs text-muted">
//             {currentSong?.artistName ?? "กดปุ่มเล่นบนการ์ดเพื่อเปิดเพลง"}
//           </p>
//         </div>
//       </div>

//       {/* ปุ่มควบคุมเพลง */}
//       <div className="flex shrink-0 items-center gap-3 text-muted sm:gap-5">
//         <button
//           type="button"
//           onClick={playPrevious}
//           disabled={!currentSong}
//           aria-label="เพลงก่อนหน้า"
//           title="เพลงก่อนหน้า"
//           className="transition hover:text-[#a78bfa] disabled:opacity-40"
//         >
//           <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
//             <path d="M6 5h2v14H6zM19 6v12L9 12z" />
//           </svg>
//         </button>

//         <button
//           type="button"
//           onClick={togglePlay}
//           aria-label={isPlaying ? "หยุดเพลงชั่วคราว" : "เล่นเพลง"}
//           title={isPlaying ? "หยุดเพลงชั่วคราว" : "เล่นเพลง"}
//           className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary-hover"
//         >
//           {isPlaying ? (
//             <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
//               <path d="M7 5h4v14H7zM15 5h4v14h-4z" />
//             </svg>
//           ) : (
//             <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor">
//               <path d="M8 5v14l11-7z" />
//             </svg>
//           )}
//         </button>

//         <button
//           type="button"
//           onClick={playNext}
//           disabled={!currentSong}
//           aria-label="เพลงถัดไป"
//           title="เพลงถัดไป"
//           className="transition hover:text-[#a78bfa] disabled:opacity-40"
//         >
//           <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
//             <path d="M16 5h2v14h-2zM5 6v12l10-6z" />
//           </svg>
//         </button>
//       </div>

//       {/* คิวเพลงและระดับเสียง */}
//       <div className="flex shrink-0 items-center gap-3 text-muted sm:gap-4">
//         <UpNextPanel />
//         <PlayerVolume />
//       </div>
//     </footer>
//   );
// }
