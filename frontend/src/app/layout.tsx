
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

import MusicPlayerProvider from "../components/music-player/providers/MusicPlayerProvider";
import PlayerBar from "../components/music-player/components/PlayerBar";
import NavigationDots from "../components/navigation/NavigationDots";

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

// ไอคอนรายการเพลง
function SongsIcon({ className = "h-5 w-5" }: { className?: string }) {
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
      <path d="M9 18V6l12-2v12" />
      <path d="M9 10l12-2" />
      <ellipse cx="6" cy="18" rx="3" ry="2.5" />
      <ellipse cx="18" cy="16" rx="3" ry="2.5" />
    </svg>
  );
}

// ไอคอนคลังเพลง
function LibraryIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21z" />
      <path d="M4 5.5v13A2.5 2.5 0 0 1 6.5 16H20" />
    </svg>
  );
}

// สไตล์ร่วมของเมนูหลัก
const navLinkClass =
  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#a1a1aa] transition-colors duration-200 hover:bg-[#252033] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]";

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

            {/* MENU และปุ่มย้อนกลับ/ไปข้างหน้า */}
            <div className="mb-3 flex items-center justify-between">
              <p className="px-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#777180]">
                Menu
              </p>
              <NavigationDots />
            </div>

            {/* เมนูหลัก */}
            <nav className="space-y-2">
              <Link href="/" className={navLinkClass}>
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105"
                  aria-hidden="true"
                >
                  <path d="M12 2.1 1 12h3v9h7v-6h2v6h7v-9h3L12 2.1Zm0 2.69 6 5.4V19h-3v-6H9v6H6v-8.81l6-5.4Z" />
                </svg>
                <span>หน้าแรก</span>
              </Link>

              <Link href="/search" className={navLinkClass}>
                <SearchIcon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                <span>ค้นหาเพลง</span>
              </Link>

              <Link href="/artists" className={navLinkClass}>
                <MusicIcon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                <span>ศิลปิน</span>
              </Link>

              <Link href="/songs" className={navLinkClass}>
                <SongsIcon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105" />
                <span>เพลง</span>
              </Link>
            </nav>

            <div className="my-7 border-t border-[#302a3b]" />


            {/* Your Library */}
            <section>
              <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.15em] text-[#777180]">
                Your Library
              </p>

              <Link
                href="/saved"
                className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#a1a1aa] transition-colors duration-200 hover:bg-[#252033] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]"
              >
                <LibraryIcon className="h-5 w-5 shrink-0 text-[#a78bfa] transition-transform duration-200 group-hover:scale-105" />
                <span>เพลงที่คุณบันทึก</span>
              </Link>
            </section>


            {/* Footer ของ Sidebar */}
            <div className="mt-auto pt-8">
              <p className="text-xs font-semibold tracking-wide text-[#a78bfa]">
                MUSIC PLATFORM
              </p>
              <p className="mt-2 text-xs leading-5 text-[#777180]">
                ค้นพบศิลปินและเพลงโปรดของคุณ
              </p>
            </div>
          </aside>

          {/* พื้นที่เนื้อหาหลักของแต่ละหน้า */}
          <main className="min-h-screen pb-24 md:ml-60">
            {children}
          </main>

          {/* Player Bar ด้านล่าง */}
          <PlayerBar />
        </MusicPlayerProvider>
      </body>
    </html>
  );
}
