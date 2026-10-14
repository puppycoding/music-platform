import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

import MusicPlayerProvider from "../components/music/MusicPlayerProvider";
import PlayerBar from "../components/music/PlayerBar";

export const metadata: Metadata = {
  title: "MUSIC PLATFORM",
  description: "ค้นพบศิลปินและเพลงโปรดของคุณ",
};

// ไอคอนเพลง
function MusicIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

// ไอคอนค้นหา
function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="bg-background text-foreground">
        <MusicPlayerProvider>
          {/* Sidebar ด้านซ้าย */}
          <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col overflow-y-auto border-r border-[#302a3b] bg-[#13101b] p-6 md:flex">
            {/* โลโก้ MUSIC PLATFORM */}
            <Link href="/" className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/20">
                <MusicIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="whitespace-nowrap text-[15px] font-extrabold tracking-[0.12em] text-white">
                  MUSIC
                </p>
                <p className="mt-1 text-[10px] font-medium tracking-[0.16em] text-[#a78bfa]">
                  PLATFORM
                </p>
              </div>
            </Link>

            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#777180]">
              Menu
            </p>

            <nav className="space-y-2">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#a1a1aa] transition hover:bg-[#252033] hover:text-white"
              >
                <span className="text-lg">🏠</span>
                หน้าแรก
              </Link>

              <Link
                href="/search"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#a1a1aa] transition hover:bg-[#252033] hover:text-white"
              >
                <SearchIcon className="h-5 w-5" />
                ค้นหาเพลง
              </Link>

              <Link
                href="/artists"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#a1a1aa] transition hover:bg-[#252033] hover:text-white"
              >
                <MusicIcon className="h-5 w-5" />
                ศิลปิน
              </Link>
            </nav>

            <div className="my-7 border-t border-[#302a3b]" />

            {/* Your Library */}
            <div>
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#777180]">
                Your Library
              </p>

              <div className="rounded-xl bg-[#191522] p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#252033]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-5 w-5 text-[#a78bfa]"
                    aria-hidden="true"
                  >
                    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
                    <path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20" />
                  </svg>
                </div>

                <p className="text-sm font-medium">เพลงของคุณ</p>
                <p className="mt-1 text-xs leading-5 text-[#a1a1aa]">
                  เพลงที่บันทึกไว้จะอยู่ที่นี่
                </p>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <p className="text-xs leading-5 text-[#777180]">
                Moodify — Discover music that matches you.
              </p>
            </div>
          </aside>

          {/* พื้นที่เนื้อหาหลักของแต่ละหน้า */}
          <div className="min-h-screen pb-24 md:ml-60">
            {children}
          </div>

          {/* Player Bar ด้านล่าง */}
          <PlayerBar />
        </MusicPlayerProvider>
      </body>
    </html>
  );
}