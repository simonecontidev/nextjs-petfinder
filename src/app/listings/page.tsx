import { db } from "@/lib/db";
import Link from "next/link";
import MapSection from "@/components/MapSection";
import FiltersClient from "@/components/FiltersClient";

export const dynamic = "force-dynamic";

const animalTypes = ["DOG", "CAT", "BIRD", "REPTILE", "RABBIT", "OTHER"] as const;
const statuses = ["LOST", "FOUND", "RESOLVED"] as const;

type ListingModel = Awaited<ReturnType<typeof db.listing.findMany>>[number];
type Pin = { id: string; lat: number; lng: number; title: string; city?: string | null };

function toEnum<T extends readonly string[]>(
  value: string | undefined,
  allowed: T
): T[number] | undefined {
  return allowed.includes((value ?? "") as any) ? (value as T[number]) : undefined;
}

// Unwrap per Next 16 (searchParams talvolta come Promise)
async function unwrapSearchParams(
  props:
    | { searchParams?: { [key: string]: string | string[] | undefined } }
    | { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  const sp =
    "searchParams" in props
      ? "then" in (props as any).searchParams
        ? await (props as any).searchParams
        : (props as any).searchParams
      : undefined;

  const get = (k: string) => {
    const v = sp?.[k];
    if (Array.isArray(v)) return v[0];
    return (v ?? "") as string;
  };

  return {
    animalType: get("animalType"),
    status: get("status"),
    city: get("city"),
  };
}

export default async function ListingsPage(
  props:
    | { searchParams?: { [key: string]: string | string[] | undefined } }
    | { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  // 1) leggi query (default: tutti i post)
  const raw = await unwrapSearchParams(props);
  const qAnimal = toEnum(raw.animalType || undefined, animalTypes);
  const qStatus = toEnum(raw.status || undefined, statuses);
  const qCity = (raw.city ?? "").trim();

  // 2) costruisci filtro server-side (SQLite-friendly)
  const where: any = {};
  if (qAnimal) where.animalType = qAnimal;
  if (qStatus) where.status = qStatus;
  if (qCity) where.city = { contains: qCity }; // LIKE (ASCII-insensitive)

  // 3) query
  const listings = await db.listing.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

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
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Pet Listings</h1>
        <Link
          href="/listings/new"
          className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          + Nuovo annuncio
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            {/* Mini mappa (coerente con i risultati filtrati) */}
            {pins.length > 0 && <MapSection pins={pins} />}

            {/* Filtri auto-apply */}
            <FiltersClient
              animalOptions={animalTypes}
              statusOptions={statuses}
              initial={{ animalType: qAnimal, status: qStatus, city: qCity }}
            />
          </div>
        </aside>

        {/* LISTA */}
        <section className="lg:col-span-8">
          {listings.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">
              Nessun annuncio trovato. Prova a rimuovere qualche filtro.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {listings.map((item: ListingModel) => (
                <Link
                  key={item.id}
                  href={`/listings/${item.id}`}
                  className="block overflow-hidden rounded-2xl border bg-white shadow transition hover:shadow-lg dark:bg-gray-800"
                >
                  <img
                    src={item.photos || "https://via.placeholder.com/400x300"}
                    alt={item.title}
                    className="h-52 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    {item.city && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.city}
                      </p>
                    )}
                    <p className="mt-1 text-sm opacity-80">{item.animalType}</p>
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
          )}
        </section>
      </div>
    </main>
  );
}