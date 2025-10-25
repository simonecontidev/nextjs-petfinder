// src/app/listings/[id]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import MapDetail from "@/components/MapDetail";
import ClientTime from "@/components/ClientTime";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function ListingDetailPage(
  props: { params: Params } | { params: Promise<Params> }
) {
  const p = "then" in props.params ? await props.params : props.params;
  const id = p?.id;
  if (!id) notFound();

  // sessione utente (se loggato)
  const { user } = await getSession();

  // carica annuncio
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) notFound();

  // owner?
  const isOwner = !!user && listing.userId === user.userId;

  const createdIso = new Date(listing.createdAt).toISOString();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/listings" className="text-sm opacity-70 hover:opacity-100">
            ← Back to listings
          </Link>
          <h1 className="mt-3 text-3xl font-bold">{listing.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">
              {listing.animalType}
            </span>
            <span
              className={`rounded-full px-2 py-1 ${
                listing.status === "FOUND"
                  ? "bg-green-100 text-green-700"
                  : listing.status === "LOST"
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {listing.status}
            </span>
            {listing.city && <span className="opacity-80">📍 {listing.city}</span>}
            <span className="opacity-60">
              Posted: <ClientTime iso={createdIso} fallback={createdIso} />
            </span>
          </div>
        </div>

        {/* Azioni visibili SOLO al proprietario */}
        {isOwner && (
          <div className="shrink-0">
            <Link
              href={`/listings/${listing.id}/edit`}
              className="inline-block rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Edit
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border">
        <img
          src={listing.photos || "https://via.placeholder.com/1200x800"}
          alt={listing.title}
          className="h-[360px] w-full object-cover"
        />
      </div>

      <p className="mt-6 leading-relaxed opacity-90">{listing.description}</p>

      {listing.latitude != null && listing.longitude != null ? (
        <>
          <MapDetail lat={listing.latitude} lng={listing.longitude} title={listing.title} />
          <div className="mt-4">
            <a
              className="inline-block rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              href={`https://www.google.com/maps?q=${listing.latitude},${listing.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apri posizione su Google Maps
            </a>
          </div>
        </>
      ) : null}
    </main>
  );
}