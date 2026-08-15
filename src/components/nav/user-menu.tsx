"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconChevronDown, IconLogout, IconSettings } from "@tabler/icons-react";
import { signOut } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/nav/theme-toggle";

export function UserMenu({
  email,
  variant,
}: {
  email: string;
  variant: "desktop" | "mobile";
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initial = (email.trim().charAt(0) || "?").toUpperCase();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const avatar = (
    <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-gold text-xs font-semibold text-gold-ink">
      {initial}
    </span>
  );

  const rowClass =
    "flex w-full items-center gap-2 py-1 text-sm text-ink-muted transition-colors hover:text-ink";

  return (
    <div ref={rootRef} className="relative">
      {variant === "desktop" ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border border-line py-[5px] pl-[5px] pr-[10px] transition-colors hover:border-gold/60"
        >
          {avatar}
          <IconChevronDown size={16} className="text-ink-muted" />
        </button>
      ) : (
        <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Cuenta">
          {avatar}
        </button>
      )}

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-line bg-card px-[18px] py-[14px] shadow-lg">
          <p className="truncate text-sm text-ink">{email}</p>
          <div className="my-3 border-t border-line" />
          <Link href="/configuracion" onClick={() => setOpen(false)} className={rowClass}>
            <IconSettings size={16} />
            Configuración
          </Link>
          <ThemeToggle className={`mt-2 ${rowClass}`} iconSize={16} />
          <form action={signOut}>
            <button
              type="submit"
              className="mt-2 flex w-full items-center gap-2 py-1 text-sm text-ink-muted transition-colors hover:text-danger-ink"
            >
              <IconLogout size={16} />
              Salir
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
