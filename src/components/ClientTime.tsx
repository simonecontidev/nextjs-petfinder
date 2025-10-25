"use client";

import { useEffect, useState } from "react";

export default function ClientTime({
  iso,
  fallback,
}: {
  iso: string;
  fallback?: string;
}) {
  const [text, setText] = useState(fallback ?? iso);

  useEffect(() => {
    // Evita setState sincrono nell'effect: sposta al prossimo frame
    const id = requestAnimationFrame(() => {
      try {
        const d = new Date(iso);
        setText(d.toLocaleString());
      } catch {
        // mantieni fallback
      }
    });
    return () => cancelAnimationFrame(id);
  }, [iso]);

  return <time dateTime={iso}>{text}</time>;
}