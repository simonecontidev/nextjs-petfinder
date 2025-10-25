import { db } from "@/lib/db";
import Link from "next/link";
import MapSection from "@/components/MapSection";

export const dynamic = "force-dynamic";

// Tipo derivato dal modello Prisma
type ListingModel = Awaited<ReturnType<typeof db.listing.findMany>>[number];
type Pin = { id: string; lat: number; lng: number; title: string; city?: string | null };

export default async function ListingsPage() {
  const listings = await db.listing.findMany({ orderBy: { createdAt: "desc" } });

  const pins: Pin[] = listings
    .filter((l: ListingModel) => l.latitude != null && l.longitude != null)
    .map((l: ListingModel) => ({
      id: l.id,
      lat: l.latitude as number,
      lng: l.longitude as number,
      title: l.title,
      city: l.city ?? null,
    }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pet Listings</h1>
        <Link
          href="/listings/new"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          aria-label="Crea un nuovo annuncio"
        >
          + Nuovo annuncio
        </Link>
      </div>

      {/* Mappa client-side (render solo se ci sono coordinate) */}
      {pins.length > 0 && <MapSection pins={pins} />}

      {listings.length === 0 && (
        <p className="mt-8 text-gray-500 dark:text-gray-300">
          Nessun annuncio presente.{" "}
          <Link href="/listings/new" className="underline">
            Crea il primo →
          </Link>
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((item: ListingModel) => (
          <Link
            key={item.id}
            href={`/listings/${item.id}`}
            className="block rounded-2xl overflow-hidden border bg-white shadow hover:shadow-lg transition dark:bg-gray-800"
            aria-label={`Apri annuncio: ${item.title}`}
          >
            <img
              src={item.photos || "https://via.placeholder.com/400x300"}
              alt={item.title}
              className="h-56 w-full object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              {item.city && (
                <p className="text-sm text-gray-600 dark:text-gray-300">{item.city}</p>
              )}
              <p className="text-sm mt-1 opacity-80">{item.animalType}</p>
              <span
                className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                  item.status === "FOUND"
                    ? "bg-green-100 text-green-700"
                    : item.status === "LOST"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {item.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}