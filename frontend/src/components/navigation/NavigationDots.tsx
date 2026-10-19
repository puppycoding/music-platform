"use client";

export default function NavigationDots() {
  const dotClass =
    "group flex h-5 w-3 items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8b5cf6]/50";

  return (
    <div className="flex items-center gap-0">
      {/* จุดที่ 1: ย้อนกลับ */}
      <button
        type="button"
        onClick={() => window.history.back()}
        aria-label="ย้อนกลับ"
        title="ย้อนกลับ"
        className={dotClass}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#625c75] transition-all duration-200 group-hover:scale-125 group-hover:bg-[#a78bfa]" />
      </button>

      {/* จุดที่ 2: รีเฟรช */}
      <button
        type="button"
        onClick={() => window.location.reload()}
        aria-label="รีเฟรชหน้า"
        title="รีเฟรชหน้า"
        className={dotClass}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#80739f] transition-all duration-200 group-hover:scale-125 group-hover:bg-[#a78bfa]" />
      </button>

      {/* จุดที่ 3: ไปข้างหน้า */}
      <button
        type="button"
        onClick={() => window.history.forward()}
        aria-label="ไปข้างหน้า"
        title="ไปข้างหน้า"
        className={dotClass}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]/70 transition-all duration-200 group-hover:scale-125 group-hover:bg-[#c4b5fd]" />
      </button>
    </div>
  );
}
