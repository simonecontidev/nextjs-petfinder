import { db } from "@/lib/db";
import Link from "next/link";
import MapSection from "@/components/MapSection";
import FiltersClient from "@/components/FiltersClient";
import MapToggle from "@/components/MapToggle";
import ListingsViewControls from "@/components/ListingsViewControls";

export const dynamic = "force-dynamic";

const animalTypes = ["DOG", "CAT", "BIRD", "REPTILE", "RABBIT", "OTHER"] as const;
const statuses = ["LOST", "FOUND", "RESOLVED"] as const;

type ListingModel = Awaited<ReturnType<typeof db.listing.findMany>>[number];
type Pin = { id: string; lat: number; lng: number; title: string; city?: string | null };

function toEnum<T extends readonly string[]>(value: string | undefined, allowed: T): T[number] | undefined {
  return allowed.includes((value ?? "") as any) ? (value as T[number]) : undefined;
}

// unwrap searchParams (Next 16 safeguard)
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

  const get = (k: string, def = "") => {
    const v = sp?.[k];
    if (Array.isArray(v)) return v[0] ?? def;
    return (v ?? def) as string;
  };

  return {
    animalType: get("animalType"),
    status: get("status"),
    city: get("city"),
    showMap: get("showMap", "1"),
    view: get("view", "grid"),      // grid | list
    cols: get("cols", "2"),         // 1 | 2 | 3
    sort: get("sort", "latest"),    // latest | oldest | status
    page: parseInt(get("page", "1") || "1", 10),
    perPage: Math.min(Math.max(parseInt(get("perPage", "12") || "12", 10), 1), 48),
  };
}

function badgeClasses(status: string) {
  return status === "FOUND"
    ? "bg-green-100 text-green-700"
    : status === "LOST"
    ? "bg-red-100 text-red-700"
    : "bg-gray-100 text-gray-700";
}

export default async function ListingsPage(
  props:
    | { searchParams?: { [key: string]: string | string[] | undefined } }
    | { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }
) {
  // 1) Query params
  const raw = await unwrapSearchParams(props);
  const qAnimal = toEnum(raw.animalType || undefined, animalTypes);
  const qStatus = toEnum(raw.status || undefined, statuses);
  const qCity = (raw.city ?? "").trim();
  const showMap = (raw.showMap ?? "1") !== "0";
  const view = raw.view === "list" ? "list" : "grid";
  const cols = ["1", "2", "3"].includes(raw.cols) ? raw.cols : "2";
  const page = isFinite(raw.page) && raw.page > 0 ? raw.page : 1;
  const perPage = raw.perPage;

  // 2) Costruisci filtro
  const where: any = {};
  if (qAnimal) where.animalType = qAnimal;
  if (qStatus) where.status = qStatus;
  if (qCity) where.city = { contains: qCity };

  // 3) Ordinamento
  let orderBy: any = { createdAt: "desc" as const };
  if (raw.sort === "oldest") orderBy = { createdAt: "asc" as const };
  else if (raw.sort === "status") orderBy = [{ status: "asc" as const }, { createdAt: "desc" as const }];

  // 4) Conteggio per paginazione
  const total = await db.listing.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(page, totalPages);
  const skip = (current - 1) * perPage;

  // 5) Query
  const listings = await db.listing.findMany({
    where,
    orderBy,
    skip,
    take: perPage,
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

  // 6) Classi responsive grid
  const gridCols =
    view === "list"
      ? "grid-cols-1"
      : cols === "1"
      ? "grid-cols-1"
      : cols === "3"
      ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2"; // default 2

  // 7) Helpers paginazione
  const makePageHref = (p: number) => {
    const params = new URLSearchParams({
      ...((qAnimal && { animalType: qAnimal }) || {}),
      ...((qStatus && { status: qStatus }) || {}),
      ...(qCity ? { city: qCity } : {}),
      ...(showMap ? {} : { showMap: "0" }),
      view,
      cols,
      sort: raw.sort,
      perPage: String(perPage),
      page: String(p),
    } as any);
    return `/listings?${params.toString()}`;
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Pet Listings</h1>
        <div className="flex flex-wrap items-center gap-3">
          <ListingsViewControls />
          <MapToggle />
          <Link
            href="/listings/new"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            + New listing
          </Link>
        </div>
      </div>

      {/* Risultati / info riga */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-300">
        {total} result{total !== 1 ? "s" : ""} • page {current} of {totalPages}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            {showMap && pins.length > 0 && <MapSection pins={pins} />}
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
              No listings found. Try removing some filters.
            </p>
          ) : view === "list" ? (
            // LIST VIEW (card più larga e descrizione compatta, se servirà)
            <ul className="space-y-4">
              {listings.map((item: ListingModel) => (
                <li key={item.id} className="overflow-hidden rounded-2xl border bg-white shadow hover:shadow-lg dark:bg-gray-800">
                  <Link href={`/listings/${item.id}`} className="flex gap-4">
                    <img
                      src={item.photos || "https://via.placeholder.com/200x150"}
                      alt={item.title}
                      className="h-36 w-48 object-cover"
                    />
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClasses(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-1 text-sm opacity-80">{item.animalType}{item.city ? ` • ${item.city}` : ""}</div>
                      {item.createdAt && (
                        <div className="mt-1 text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            // GRID VIEW
            <div className={`grid gap-6 ${gridCols}`}>
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
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badgeClasses(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    {item.city && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{item.city}</p>
                    )}
                    <p className="mt-1 text-sm opacity-80">{item.animalType}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* PAGINAZIONE */}
          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-between">
              <Link
                href={makePageHref(Math.max(1, current - 1))}
                aria-disabled={current === 1}
                className={`rounded-md border px-3 py-2 text-sm ${current === 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                ← Prev
              </Link>
              <span className="text-sm">Page {current} / {totalPages}</span>
              <Link
                href={makePageHref(Math.min(totalPages, current + 1))}
                aria-disabled={current === totalPages}
                className={`rounded-md border px-3 py-2 text-sm ${current === totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
              >
                Next →
              </Link>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}