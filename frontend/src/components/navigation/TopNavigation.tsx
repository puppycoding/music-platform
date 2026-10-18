"use client";

import { useRouter } from "next/navigation";

function ArrowLeftIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export default function TopNavigation() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0d0b12]/90 backdrop-blur-xl">
      <div className="flex h-[76px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Back / Forward */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="ย้อนกลับ"
            title="ย้อนกลับ"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#c4b5fd] transition hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-white active:scale-95"
          >
            <ArrowLeftIcon />
          </button>

          <button
            type="button"
            onClick={() => router.forward()}
            aria-label="ไปข้างหน้า"
            title="ไปข้างหน้า"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[#c4b5fd] transition hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-white active:scale-95"
          >
            <ArrowRightIcon />
          </button>
        </div>

        {/* Search */}
        <a
          href="/search"
          aria-label="ไปหน้าค้นหาเพลง"
          className="group flex h-11 min-w-0 max-w-[620px] flex-1 items-center gap-3 rounded-full border border-white/[0.08] bg-[#17131f] px-4 text-[#a1a1aa] transition hover:border-violet-400/30 hover:bg-[#1c1727] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <SearchIcon />
          <span className="truncate text-sm">
            ค้นหาเพลง ศิลปิน หรืออัลบั้ม...
          </span>
          <span className="ml-auto hidden shrink-0 rounded-md border border-white/10 px-2 py-1 text-[10px] text-[#777180] sm:block">
            SEARCH
          </span>
        </a>

        {/* Right side */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <div
            className="hidden h-9 w-px bg-white/[0.08] sm:block"
            aria-hidden="true"
          />

          <button
            type="button"
            aria-label="บัญชีผู้ใช้"
            title="บัญชีผู้ใช้"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-violet-500/20 to-indigo-500/10 text-sm font-semibold text-violet-200 transition hover:border-violet-400/40 hover:bg-violet-500/15"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c.7-3.5 3.2-5.5 7-5.5s6.3 2 7 5.5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
