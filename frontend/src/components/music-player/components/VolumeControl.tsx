
"use client";

import { useState } from "react";

type VolumeControlProps = {
  volume: number;
  onVolumeChange: (volume: number) => void;
};

export default function VolumeControl({
  volume,
  onVolumeChange,
}: VolumeControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  // จำกัดค่าเสียงให้อยู่ระหว่าง 0-100
  const safeVolume = Math.min(100, Math.max(0, volume));

  return (
    <div className="relative flex items-center">
      {/* แถบปรับเสียง */}
      <div
        className={`overflow-hidden rounded-full border border-[#302a3b] bg-[#191522] transition-all duration-300 ease-in-out ${
          isOpen
            ? "mr-3 w-32 px-3 py-3 opacity-100 sm:w-36"
            : "mr-0 w-0 border-transparent px-0 py-3 opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <input
          type="range"
          min="0"
          max="100"
          value={safeVolume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          aria-label="ปรับระดับเสียง"
          aria-valuetext={`${safeVolume}%`}
          tabIndex={isOpen ? 0 : -1}
          style={{
            background: `linear-gradient(to right, #a78bfa 0%, #a78bfa ${safeVolume}%, #3a3447 ${safeVolume}%, #3a3447 100%)`,
          }}
          className="h-1.5 w-full cursor-pointer appearance-none rounded-full"
        />
      </div>

      {/* ปุ่มลำโพง */}
      <button
        type="button"
        aria-label={isOpen ? "ซ่อนแถบปรับเสียง" : "ปรับระดับเสียง"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="shrink-0 text-muted transition duration-200 hover:scale-110 hover:text-[#a78bfa]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M3 9v6h4l5 4V5L7 9H3z" />

          {safeVolume > 0 && (
            <path
              d={
                safeVolume < 50
                  ? "M16 9a5 5 0 0 1 0 6"
                  : "M16 9a5 5 0 0 1 0 6m2-9a9 9 0 0 1 0 12"
              }
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
    </div>
  );
}
