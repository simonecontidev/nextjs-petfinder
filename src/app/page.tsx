// src/app/page.tsx
import Link from "next/link";

const animalTypes = [
  { key: "DOG",  label: "Dog",  emoji: "🐶" },
  { key: "CAT",  label: "Cat",  emoji: "🐱" },
  { key: "BIRD", label: "Bird", emoji: "🐦" },
  { key: "RABBIT", label: "Rabbit", emoji: "🐰" },
  { key: "REPTILE", label: "Reptile", emoji: "🦎" },
  { key: "OTHER", label: "Other", emoji: "🐾" },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-[90vh]">
      {/* HERO */}
      <section
        className="
          relative overflow-hidden
          bg-[var(--surface-soft)]
          text-[var(--on-surface)]
        "
      >
        {/* warm radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(1200px 500px at 70% -20%, var(--brand-100), transparent 60%), radial-gradient(900px 400px at -10% 10%, var(--brand-50), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              🐾 PetFinder
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg md:text-xl text-[var(--on-surface)]/80">
              Find and report <strong>lost or found pets</strong> in your area.
              Browse active listings or create a new post if you’ve seen or lost an animal.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/listings"
                className="
                  inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold
                  bg-[var(--brand)] text-[var(--on-brand)]
                  shadow-sm transition hover:brightness-[0.98]
                  focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40
                "
              >
                Browse listings
                <span aria-hidden>→</span>
              </Link>

              <Link
                href="/listings/new"
                className="
                  inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold
                  bg-[var(--surface-elev)] text-[var(--on-surface)] border border-[var(--surface-border)]
                  hover:bg-[var(--surface-strong)] transition
                  focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30
                "
              >
                Report a pet
              </Link>

              <Link
                href="/about"
                className="
                  inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold
                  border border-[var(--surface-border)]
                  text-[var(--on-surface)]
                  hover:bg-[var(--surface-strong)] transition
                  focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/30
                "
              >
                About
              </Link>
            </div>
          </div>

          {/* Quick search */}
          <div
            className="
              mx-auto mt-10 max-w-3xl
              rounded-2xl border border-[var(--surface-border)]
              bg-[var(--surface-elev)] p-4 md:p-5 shadow-sm
            "
          >
            <form action="/listings" method="GET" className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="md:col-span-6">
                <label className="block text-sm mb-1 text-[var(--on-surface)]">
                  City (optional)
                </label>
                <input
                  name="city"
                  placeholder="e.g., Barcelona"
                  className="
                    w-full rounded-lg border px-3 py-2
                    bg-[var(--surface-soft)] border-[var(--surface-border)]
                    text-[var(--on-surface)] placeholder:text-[var(--on-surface)]/45
                    focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/35
                  "
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm mb-1 text-[var(--on-surface)]">
                  Animal
                </label>
                <select
                  name="animalType"
                  className="
                    w-full rounded-lg border px-3 py-2
                    bg-[var(--surface-soft)] border-[var(--surface-border)]
                    text-[var(--on-surface)]
                    focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/35
                  "
                  defaultValue=""
                >
                  <option value="">All</option>
                  {animalTypes.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 self-end">
                <button
                  className="
                    w-full rounded-lg px-4 py-2 text-sm font-semibold
                    bg-[var(--brand)] text-[var(--on-brand)]
                    hover:brightness-[0.98] transition
                    focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40
                  "
                >
                  Search
                </button>
              </div>
            </form>
            <p className="mt-2 text-xs text-[var(--on-surface)]/60">
              Tip: leave city empty to browse everything nearby.
            </p>
          </div>
        </div>
      </section>

      {/* CATEGORIES QUICK NAV */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-xl font-semibold text-[var(--on-surface)]">Browse by category</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {animalTypes.map((a) => (
            <Link
              key={a.key}
              href={`/listings?animalType=${a.key}`}
              className="
                group rounded-xl border border-[var(--surface-border)]
                bg-[var(--surface-elev)] p-4 text-center shadow-sm transition
                hover:bg-[var(--surface-strong)]
                focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/25
              "
            >
              <div className="text-2xl">{a.emoji}</div>
              <div className="mt-2 font-medium text-[var(--on-surface)] group-hover:opacity-90">
                {a.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-xl font-semibold text-[var(--on-surface)]">How it works</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          <li className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-elev)] p-5">
            <div className="text-2xl">1️⃣</div>
            <h3 className="mt-2 font-semibold">Create a listing</h3>
            <p className="mt-1 text-sm text-[var(--on-surface)]/70">
              Share details, last seen location, and photos.
            </p>
          </li>
          <li className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-elev)] p-5">
            <div className="text-2xl">2️⃣</div>
            <h3 className="mt-2 font-semibold">Spread the word</h3>
            <p className="mt-1 text-sm text-[var(--on-surface)]/70">
              Neighbors can browse and add helpful comments.
            </p>
          </li>
          <li className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface-elev)] p-5">
            <div className="text-2xl">3️⃣</div>
            <h3 className="mt-2 font-semibold">Resolve & update</h3>
            <p className="mt-1 text-sm text-[var(--on-surface)]/70">
              Mark as <span className="font-medium">FOUND</span> or{" "}
              <span className="font-medium">RESOLVED</span> when there’s news.
            </p>
          </li>
        </ol>
      </section>

      {/* CTA STRIP */}
      <section
        className="
          mx-auto max-w-6xl px-6 pb-16
        "
      >
        <div
          className="
            flex flex-col items-start justify-between gap-4 rounded-2xl
            border border-[var(--surface-border)] bg-[var(--surface-elev)] p-6
            sm:flex-row sm:items-center
          "
        >
          <div>
            <h3 className="text-lg font-semibold text-[var(--on-surface)]">
              Lost or found a pet?
            </h3>
            <p className="mt-1 text-sm text-[var(--on-surface)]/70">
              Create a listing — it takes less than a minute.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/listings/new"
              className="
                inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold
                bg-[var(--brand)] text-[var(--on-brand)]
                hover:brightness-[0.98] transition
                focus:outline-none focus:ring-2 focus:ring-[var(--brand)]/40
              "
            >
              + New listing
            </Link>
            <Link
              href="/listings"
              className="
                inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold
                border border-[var(--surface-border)]
                text-[var(--on-surface)]
                bg-[var(--surface-soft)] hover:bg-[var(--surface-strong)] transition
              "
            >
              Browse
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER MINI */}
      <footer className="pb-10 text-center text-sm text-[var(--on-surface)]/60">
        © {new Date().getFullYear()} PetFinder — Built with care.
      </footer>
    </main>
  );
}