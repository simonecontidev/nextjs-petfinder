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
  const cols = sp.get("cols") || "2";          // 1 | 2 | 3 (grid only)
  const sort = sp.get("sort") || "latest";     // latest | oldest | status
  const perPage = sp.get("perPage") || "12";   // 6 | 12 | 24

  const update = (kv: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(kv).forEach(([k, v]) => setParam(next, k, v));
    // reset page when changing view/cols/sort/perPage
    if (kv.view || kv.cols || kv.sort || kv.perPage) next.set("page", "1");
    router.push(`${pathname}?${next.toString()}`);
  };

  const groupBase =
    "flex items-center overflow-hidden rounded-xl border bg-[var(--surface-soft)] " +
    "border-[var(--surface-border)] shadow-[0_1px_0_rgba(0,0,0,0.04)] " +
    "backdrop-blur supports-[backdrop-filter]:bg-[color:var(--surface-soft)]";

  const tabBase =
    "px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-2 " +
    "focus-visible:ring-[var(--brand-400)] focus-visible:ring-offset-0 " +
    "disabled:opacity-50 disabled:cursor-not-allowed";

  const tabActive =
    "bg-[var(--brand-50)] text-[var(--brand-ink)] " +
    "dark:bg-[var(--brand-900)] dark:text-[var(--brand-ink)]";

  const tabIdle = "text-[var(--on-surface)] hover:bg-[var(--surface-strong)]";

  const selectBase =
    "ml-2 rounded-lg border px-2 py-1 text-sm transition-colors " +
    "bg-[var(--surface-soft)] border-[var(--surface-border)] " +
    "text-[var(--on-surface)] hover:bg-[var(--surface-strong)] " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]";

  return (
    <div className="flex flex-wrap items-center gap-3 text-[var(--on-surface)]">
      {/* View */}
      <div className={groupBase} role="tablist" aria-label="Change view">
        {["grid", "list"].map((v) => {
          const active = view === v;
          return (
            <button
              key={v}
              type="button"
              aria-pressed={active}
              role="tab"
              onClick={() => update({ view: v })}
              className={`${tabBase} ${active ? tabActive : tabIdle}`}
            >
              {v === "grid" ? "Grid" : "List"}
            </button>
          );
        })}
      </div>

      {/* Cols (grid only) */}
      {view === "grid" && (
        <div className={groupBase} role="tablist" aria-label="Columns">
          {["1", "2", "3"].map((c) => {
            const active = cols === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={active}
                role="tab"
                onClick={() => update({ cols: c })}
                className={`${tabBase} ${active ? tabActive : tabIdle}`}
                title={`${c} column${c === "1" ? "" : "s"}`}
              >
                {c} col
              </button>
            );
          })}
        </div>
      )}

      {/* Sort */}
      <label className="text-sm inline-flex items-center">
        <span className="opacity-80">Sort</span>
        <select
          className={selectBase}
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
        >
          <option value="latest">Latest</option>
          <option value="oldest">Oldest</option>
          <option value="status">Status</option>
        </select>
      </label>

      {/* Per page */}
      <label className="text-sm inline-flex items-center">
        <span className="opacity-80">Per page</span>
        <select
          className={selectBase}
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