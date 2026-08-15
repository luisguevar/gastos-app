"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";

type Mode = "light" | "dark";

function currentMode(): Mode {
  if (typeof document === "undefined") return "dark";
  const forced = document.documentElement.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({
  className,
  iconSize = 16,
}: {
  className?: string;
  iconSize?: number;
}) {
  const [mode, setMode] = useState<Mode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMode(currentMode());
  }, []);

  function toggle() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // localStorage no disponible; el cambio aplica solo a esta sesión.
    }
    setMode(next);
  }

  const isDark = mode === "dark";
  const Icon = isDark ? IconSun : IconMoon;
  const label = isDark ? "Modo claro" : "Modo oscuro";

  return (
    <button
      type="button"
      onClick={toggle}
      className={className}
      aria-label={label}
      suppressHydrationWarning
    >
      <Icon size={iconSize} />
      {mounted ? label : "Tema"}
    </button>
  );
}
