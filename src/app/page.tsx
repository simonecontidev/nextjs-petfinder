// src/app/page.tsx
import Link from "next/link";
import { db } from "@/lib/db";
import MapTeaser from "@/components/MapTeaser";

export const dynamic = "force-dynamic";

// Tipi di supporto
type ListingModel = Awaited<ReturnType<typeof db.listing.findMany>>[number];
type Pin = { id: string; lat: number; lng: number; title: string; city?: string | null };

// Badge per status
function badgeClasses(status: string) {
  return status === "FOUND"
    ? "bg-green-100 text-green-700"
    : status === "LOST"
    ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-700";
}

export default async function HomePage() {
  // 1) Ultimi listing (prendiamo 12 per riempire 4/6 colonne su due righe)
  const latest = await db.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  // 2) Pin per teaser mappa (solo quelli con coordinate)
  const pins: Pin[] = latest
    .filter((l) => l.latitude != null && l.longitude != null)
    .slice(0, 15) // limita a 15 per performance
    .map((l) => ({
      id: l.id,
      lat: l.latitude as number,
      lng: l.longitude as number,
      title: l.title,
      city: l.city ?? null,
    }));

  return (
    <main className="px-6">
      {/* HERO */}
      <section className="mx-auto max-w-6xl min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-[var(--on-surface)]">
          🐾 PetFinder
        </h1>

        <p className="text-lg md:text-xl text-[var(--on-surface)]/80 max-w-2xl mb-8">
          Find and report <strong>lost or found pets</strong> in your area. Browse active listings
          or create a new post if you’ve seen or lost an animal.
        </p>

        <div className="flex gap-4">
          <Link
            href="/listings"
            className="rounded-full px-6 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2
                       bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90"
          >
            Browse Listings
          </Link>

          <Link
            href="/about"
            className="rounded-full px-6 py-3 text-sm font-semibold border transition focus:outline-none focus:ring-2 focus:ring-offset-2
                       border-[var(--surface-border)] text-[var(--on-surface)] hover:bg-[var(--surface)]/60"
          >
            About
          </Link>
        </div>
      </section>

      {/* MAP TEASER */}
      {pins.length > 0 && (
        <section className="mx-auto max-w-6xl mb-12">
          <h2 className="text-xl font-semibold mb-3 text-[var(--on-surface)]">
            Recent map sightings
          </h2>
          <p className="text-sm text-[var(--on-surface)]/70 mb-4">
            A quick look at the most recent posts with a location. Click a pin to open the listing.
          </p>

          {/* Il componente mostra una mini mappa interattiva */}
          <MapTeaser pins={pins} />
        </section>
      )}

      {/* LATEST LISTINGS */}
      <section className="mx-auto max-w-6xl mb-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--on-surface)]">Latest listings</h2>
          <Link
            href="/listings"
            className="text-sm underline hover:no-underline text-[var(--on-surface)]/80"
          >
            View all →
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="text-[var(--on-surface)]/70">
            No listings yet. Be the first to report a lost or found pet.
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {latest.map((item: ListingModel) => (
              <Link
                key={item.id}
                href={`/listings/${item.id}`}
                className="block overflow-hidden rounded-2xl border bg-white shadow transition hover:shadow-lg
                           dark:bg-gray-800 border-[var(--surface-border)]"
              >
                <img
                  src={item.photos || "https://via.placeholder.com/400x300"}
                  alt={item.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-[var(--on-surface)]">
                      {item.title}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClasses(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  {item.city && (
                    <p className="text-sm text-[var(--on-surface)]/70">{item.city}</p>
                  )}
                  <p className="mt-1 text-sm opacity-80">{item.animalType}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER MINI */}
      <footer className="mx-auto max-w-6xl pb-10 text-sm text-[var(--on-surface)]/60">
        © {new Date().getFullYear()} PetFinder. All rights reserved.
      </footer>
    </main>
  );
}