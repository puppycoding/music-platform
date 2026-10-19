"use client";

import { useRouter } from "next/navigation";

type BackForwardButtonsProps = {
  variant?: "sidebar" | "inline";
};

export default function BackForwardButtons({
  variant = "sidebar",
}: BackForwardButtonsProps) {
  const router = useRouter();

  const buttonClass =
    "group flex h-8 w-8 items-center justify-center rounded-full text-[#a1a1aa] transition-all duration-200 hover:bg-[#8b5cf6]/20 hover:text-white active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6]";

  return (
    <div
      className={`flex items-center gap-1 ${variant === "sidebar" ? "" : "shrink-0"
        }`}
    >
      <button
        type="button"
        onClick={() => router.back()}
        className={buttonClass}
        aria-label="ย้อนกลับ"
        title="ย้อนกลับ"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px] transition-transform duration-200 group-hover:-translate-x-0.5"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => window.history.forward()}
        className={buttonClass}
        aria-label="ไปข้างหน้า"
        title="ไปข้างหน้า"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px] transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
