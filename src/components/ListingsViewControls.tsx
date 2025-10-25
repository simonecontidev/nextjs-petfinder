// components/ListingsViewControls.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

function setParam(sp: URLSearchParams, key: string, value?: string) {
  if (!value) sp.delete(key);
  else sp.set(key, value);
}

export default function ListingsViewControls() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const view = sp.get("view") || "grid";       // grid | list
  const cols = sp.get("cols") || "2";          // 1 | 2 | 3 (solo grid)
  const sort = sp.get("sort") || "latest";     // latest | oldest | status
  const perPage = sp.get("perPage") || "12";   // 6 | 12 | 24

  const update = (kv: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(kv).forEach(([k, v]) => setParam(next, k, v));
    // reset pagina se cambio vista/ordinamento
    if (kv.view || kv.cols || kv.sort || kv.perPage) next.set("page", "1");
    router.push(`${pathname}?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* View */}
      <div className="flex items-center rounded-lg border">
        {["grid", "list"].map((v) => (
          <button
            key={v}
            onClick={() => update({ view: v })}
            className={`px-3 py-2 text-sm ${view === v ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""}`}
          >
            {v === "grid" ? "Grid" : "List"}
          </button>
        ))}
      </div>

      {/* Cols (solo grid) */}
      {view === "grid" && (
        <div className="flex items-center rounded-lg border">
          {["1", "2", "3"].map((c) => (
            <button
              key={c}
              onClick={() => update({ cols: c })}
              className={`px-3 py-2 text-sm ${cols === c ? "bg-gray-100 dark:bg-gray-800 font-medium" : ""}`}
              title={`${c} col`}
            >
              {c} col
            </button>
          ))}
        </div>
      )}

      {/* Sort */}
      <label className="text-sm">
        Sort{" "}
        <select
          className="ml-2 rounded-md border px-2 py-1 text-sm"
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="status">Status</option>
        </select>
      </label>

      {/* Per page */}
      <label className="text-sm">
        Per page{" "}
        <select
          className="ml-2 rounded-md border px-2 py-1 text-sm"
          value={perPage}
          onChange={(e) => update({ perPage: e.target.value })}
        >
          <option value="6">6</option>
          <option value="12">12</option>
          <option value="24">24</option>
        </select>
      </label>
    </div>
  );
}