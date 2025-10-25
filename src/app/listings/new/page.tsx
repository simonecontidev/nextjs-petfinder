// src/app/listings/new/page.tsx
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ListingSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  animalType: z.enum(["DOG", "CAT", "BIRD", "REPTILE", "RABBIT", "OTHER"]),
  status: z.enum(["LOST", "FOUND", "RESOLVED"]).default("LOST"),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  photos: z.string().url("Deve essere un URL valido").optional().or(z.literal("")),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

async function createListing(formData: FormData) {
  "use server";

  const raw = {
    title: formData.get("title"),
    description: formData.get("description"),
    animalType: formData.get("animalType"),
    status: formData.get("status"),
    city: formData.get("city"),
    photos: formData.get("photos"),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  };

  const parsed = ListingSchema.safeParse(raw);
  if (!parsed.success) {
    // Torna alla pagina con un errore minimale via querystring
    const msg = encodeURIComponent("Controlla i campi: " + parsed.error.errors[0]?.message);
    redirect(`/listings/new?error=${msg}`);
  }

  const data = parsed.data;

  const created = await db.listing.create({
    data: {
      title: data.title,
      description: data.description,
      animalType: data.animalType,
      status: data.status,
      city: data.city || null,
      photos: data.photos || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    },
    select: { id: true },
  });

  // aggiorna la lista e vai al dettaglio
  revalidatePath("/listings");
  redirect(`/listings/${created.id}`);
}

export default async function NewListingPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Crea nuovo annuncio</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={createListing} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Titolo *</label>
          <input
            name="title"
            required
            minLength={3}
            maxLength={120}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
            placeholder="Es. Cane smarrito zona Retiro"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrizione *</label>
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
            placeholder="Descrivi l'animale, colore, collare, carattere, contatti..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo *</label>
            <select
              name="animalType"
              required
              className="w-full rounded-lg border px-3 py-2"
              defaultValue="DOG"
            >
              <option value="DOG">Dog</option>
              <option value="CAT">Cat</option>
              <option value="BIRD">Bird</option>
              <option value="REPTILE">Reptile</option>
              <option value="RABBIT">Rabbit</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stato *</label>
            <select
              name="status"
              required
              className="w-full rounded-lg border px-3 py-2"
              defaultValue="LOST"
            >
              <option value="LOST">Lost</option>
              <option value="FOUND">Found</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Città</label>
            <input
              name="city"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Es. Madrid"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Foto (URL)</label>
          <input
            name="photos"
            type="url"
            className="w-full rounded-lg border px-3 py-2"
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Latitudine</label>
            <input
              name="latitude"
              type="number"
              step="any"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Es. 40.4168"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitudine</label>
            <input
              name="longitude"
              type="number"
              step="any"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Es. -3.7038"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="rounded-lg bg-black px-5 py-2.5 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Pubblica annuncio
          </button>
        </div>
      </form>
    </main>
  );
}