"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!isMounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="fixed top-6 right-6 flex items-center justify-center w-10 h-10 rounded-full border border-gray-400 dark:border-gray-600 hover:scale-110 transition"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <LightModeIcon fontSize="small" className="text-yellow-300" />
      ) : (
        <DarkModeIcon fontSize="small" className="text-gray-700" />
      )}
    </button>
  );
}