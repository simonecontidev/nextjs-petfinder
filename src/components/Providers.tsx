"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"      // aggiunge/rimuove la classe "dark" su <html>
      defaultTheme="system"  // segue il tema di sistema alla prima visita
      enableSystem
    >
      {children}
    </ThemeProvider>
  );
}