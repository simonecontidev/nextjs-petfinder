"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Props = {
  animalOptions: readonly string[];
  statusOptions: readonly string[];
  initial: {
    animalType?: string;
    status?: string;
    city?: string;
  };
};

export default function FiltersClient({ animalOptions, statusOptions, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // state controllato (valori iniziali dai searchParams attuali)
  const [animalType, setAnimalType] = useState(initial.animalType ?? "");
  const [status, setStatus] = useState(initial.status ?? "");
  const [city, setCity] = useState(initial.city ?? "");

  // aggiorna URL (e quindi ricarica server component) senza scroll
  const applyParams = (next: { animalType?: string; status?: string; city?: string }) => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    const setOrDelete = (key: string, val?: string) => {
      if (val && val.trim() !== "") params.set(key, val);
      else params.delete(key);
    };

    setOrDelete("animalType", next.animalType);
    setOrDelete("status", next.status);
    setOrDelete("city", next.city);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // onChange immediato per select
  useEffect(() => {
    applyParams({ animalType, status, city }); // city verrà sovrascritta dal debounce sotto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalType, status]);

  // debounce per input city (per non navigare ad ogni tasto)
  useEffect(() => {
    const t = setTimeout(() => applyParams({ animalType, status, city }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const reset = () => {
    setAnimalType("");
    setStatus("");
    setCity("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="rounded-2xl border p-4 dark:border-gray-700">
      <h2 className="mb-3 text-base font-semibold">Filtri</h2>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm">Tipo di animale</label>
          <select
            value={animalType}
            onChange={(e) => setAnimalType(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900"
          >
            <option value="">Tutti</option>
            {animalOptions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm">Stato</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900"
          >
            <option value="">Tutti</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm">Città</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Madrid, Barcelona..."
            className="w-full rounded-lg border px-3 py-2 dark:bg-gray-900"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}