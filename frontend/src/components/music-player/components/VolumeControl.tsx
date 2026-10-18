"use client";

import { useState } from "react";

type VolumeControlProps = {
  volume: number;
  onVolumeChange: (volume: number) => void;
};

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[18px] w-[18px]"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        <path d="m16 9 5 6m0-6-5 6" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-[18px] w-[18px]"
      aria-hidden="true"
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      {volume < 50 ? (
        <path d="M15 9a5 5 0 0 1 0 6" />
      ) : (
        <>
          <path d="M15 9a5 5 0 0 1 0 6" />
          <path d="M18 6a9 9 0 0 1 0 12" />
        </>
      )}
    </svg>
  );
}

export default function PlayerVolume({
  volume,
  onVolumeChange,
}: VolumeControlProps) {
  const [isOpen, setIsOpen] = useState(false);

  const safeVolume = Math.min(100, Math.max(0, volume));

  function toggleVolume() {
    setIsOpen((open) => !open);
  }

  return (
    <div
      className={`relative flex h-10 items-center rounded-full border transition-all duration-300 ${isOpen
          ? "gap-2 border-violet-400/25 bg-[#191323] px-2.5 shadow-[0_0_18px_rgba(139,92,246,0.08)]"
          : "gap-0 border-transparent bg-transparent px-0"
        }`}
    >
      {/* ปุ่มลำโพง */}
      <button
        type="button"
        aria-label={isOpen ? "ซ่อนแถบปรับเสียง" : "ปรับระดับเสียง"}
        aria-expanded={isOpen}
        aria-controls="player-volume-slider"
        title={`ระดับเสียง ${safeVolume}%`}
        onClick={toggleVolume}
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${isOpen
            ? "bg-violet-500/15 text-violet-300"
            : "text-white/60 hover:bg-white/[0.06] hover:text-violet-300"
          }`}
      >
        <VolumeIcon volume={safeVolume} />
      </button>

      {/* แถบปรับเสียง */}
      <div
        id="player-volume-slider"
        aria-hidden={!isOpen}
        className={`grid transition-all duration-300 ease-out ${isOpen
            ? "grid-cols-[112px_38px] opacity-100 sm:grid-cols-[124px_38px]"
            : "pointer-events-none grid-cols-[0px_0px] opacity-0"
          }`}
      >
        <div className="flex h-9 min-w-0 items-center px-1">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={safeVolume}
            tabIndex={isOpen ? 0 : -1}
            onChange={(event) =>
              onVolumeChange(Number(event.currentTarget.value))
            }
            aria-label="ปรับระดับเสียง"
            aria-valuetext={`${safeVolume}%`}
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #d946ef ${safeVolume}%, #383044 ${safeVolume}%, #383044 100%)`,
            }}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none transition-all
              focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#191323]
              [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:w-3.5
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-white
              [&::-webkit-slider-thumb]:bg-violet-300
              [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(167,139,250,0.7)]
              [&::-moz-range-thumb]:h-3.5
              [&::-moz-range-thumb]:w-3.5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:border-2
              [&::-moz-range-thumb]:border-white
              [&::-moz-range-thumb]:bg-violet-300
              [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(167,139,250,0.7)]"
          />
        </div>

        {/* ตัวเลขระดับเสียง */}
        <div className="flex items-center justify-end">
          <span className="min-w-[34px] rounded-md bg-white/[0.04] px-1 py-1 text-center font-mono text-[10px] tabular-nums text-violet-200">
            {safeVolume}%
          </span>
        </div>
      </div>
    </div>
  );
}