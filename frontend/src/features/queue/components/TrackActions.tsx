"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export function formatTrackDuration(seconds?: number | null) {
  if (
    typeof seconds !== "number" ||
    !Number.isFinite(seconds) ||
    seconds <= 0
  ) {
    return "--:--";
  }
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

type TrackAction = {
  label: string;
  onSelect: () => void;
  disabled?: boolean;
};

type TrackActionsProps = {
  title: string;
  durationSeconds: number | null;
  actions: TrackAction[];
};

/** Shared duration/menu affordance for rows with a parent `group` class. */
export default function TrackActions({
  title,
  durationSeconds,
  actions,
}: TrackActionsProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open)
      menuRef.current
        ?.querySelector<HTMLButtonElement>("button:not(:disabled)")
        ?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [open]);

  function closeMenu(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function handleKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const items = Array.from(
        menuRef.current?.querySelectorAll<HTMLButtonElement>(
          "button:not(:disabled)",
        ) ?? [],
      );
      const index = items.findIndex((item) => item === document.activeElement);
      const next = event.key === "ArrowDown" ? index + 1 : index - 1;
      items[(next + items.length) % items.length]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div
      className="relative ml-auto flex w-[76px] shrink-0 items-center justify-end [@media(hover:hover)]:w-11"
      onKeyDown={handleKeys}
    >
      <span
        className={`pr-9 text-[11px] tabular-nums text-white/40 transition-opacity [@media(hover:hover)]:pr-0 ${open ? "[@media(hover:hover)]:opacity-0" : "[@media(hover:hover)]:group-hover:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-0"}`}
      >
        {formatTrackDuration(durationSeconds)}
      </span>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`ตัวเลือกเพิ่มเติมสำหรับ ${title}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={`absolute right-0 flex h-8 w-8 items-center justify-center rounded-full text-white/65 transition-opacity hover:bg-[#c5a0ff]/10 hover:text-[#c5a0ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a0ff]/60 ${open ? "opacity-100" : "[@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:opacity-0 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="ปิดเมนู"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
            }}
          />
          <div
            id={menuId}
            ref={menuRef}
            role="menu"
            aria-label={`ตัวเลือกสำหรับ ${title}`}
            className="absolute bottom-full right-0 z-50 mb-2 w-44 rounded-xl border border-white/10 bg-[#24212b] p-1.5 shadow-2xl shadow-black/40"
          >
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  closeMenu(event.detail === 0);
                  action.onSelect();
                }}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-xs text-white/80 transition-colors hover:bg-[#c5a0ff]/10 hover:text-[#c5a0ff] focus-visible:bg-[#c5a0ff]/10 focus-visible:outline-none disabled:opacity-25"
              >
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
