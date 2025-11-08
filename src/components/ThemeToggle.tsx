// src/components/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  // Montiamo prima di leggere il tema per evitare mismatch di idratazione
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isDark = resolvedTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  if (!isMounted) return null;

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="
        group inline-flex items-center gap-2 rounded-full
        border border-[--header-border]
        bg-[--toggle-bg] text-[--toggle-fg]
        px-2.5 py-1.5 text-xs
        transition-all duration-300
        hover:shadow-[0_6px_18px_var(--shadow-aura)]
        active:scale-[0.98]
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[--brand-500]
      "
      aria-label={label}
      title={label}
      data-state={isDark ? "dark" : "light"}
      style={{
        // fallback per sicurezza se i CSS vars non sono caricati
        // (non influisce se hai già messo le vars in globals.css)
        background:
          "var(--toggle-bg, color-mix(in oklab, white 88%, #C05E2B 12%))",
        color: "var(--toggle-fg, #2A1B14)",
        borderColor:
          "var(--header-border, color-mix(in oklab, #0b0b0b 14%, transparent))",
      }}
    >
      {/* icone con transizione morbida */}
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        <LightModeIcon
          fontSize="inherit"
          className={`absolute transition-opacity duration-300 ${
            isDark ? "opacity-0" : "opacity-100"
          }`}
        />
        <DarkModeIcon
          fontSize="inherit"
          className={`absolute transition-opacity duration-300 ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
        />
      </span>

      <span
        className="
          relative inline-flex h-5 w-10 items-center rounded-full
          bg-[--thumb-track]
          transition-colors duration-300
        "
        style={{
          background:
            "var(--thumb-track, color-mix(in oklab, #402218 16%, white 84%))",
        }}
      >
        <span
          className="
            absolute left-0.5 top-0.5 h-4 w-4 rounded-full
            bg-[--thumb] shadow-sm transition-transform duration-300
          "
          style={{
            background: "var(--thumb, white)",
            transform: isDark ? "translateX(20px)" : "translateX(0px)",
          }}
        />
      </span>
    </button>
  );
}