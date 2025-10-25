// src/app/listings/new/page.tsx
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Max 5MB, jpg/png/webp
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const ListingSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  animalType: z.enum(["DOG", "CAT", "BIRD", "REPTILE", "RABBIT", "OTHER"]),
  status: z.enum(["LOST", "FOUND", "RESOLVED"]).default("LOST"),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  // URL opzionale: se carichi un file, l’URL viene ignorato
  photos: z.string().url().optional().or(z.literal("")),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Tipo file non valido. Usa JPG/PNG/WebP.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("File troppo grande (max 5MB).");
  }

  const ext =
    file.type === "image/png" ? "png" :
    file.type === "image/webp" ? "webp" : "jpg";

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const name = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, name);
  await fs.writeFile(filePath, buffer);

  return `/uploads/${name}`;
}

async function createListing(formData: FormData) {
  "use server";

  // ✅ protezione: solo loggati possono creare
  const { user: actionUser } = await getSession();
  if (!actionUser) redirect("/login");

  const file = formData.get("photo") as File | null;

  const raw = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    animalType: String(formData.get("animalType") ?? ""),
    status: String(formData.get("status") ?? ""),
    city: String(formData.get("city") ?? ""),
    photos: String(formData.get("photos") ?? ""),
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
  };

  const parsed = ListingSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = encodeURIComponent(
      "Controlla i campi: " + (parsed.error.errors[0]?.message ?? "Errore")
    );
    redirect(`/listings/new?error=${msg}`);
  }

  let photoUrl: string | null = null;
  try {
    if (file && typeof file === "object" && file.size > 0) {
      photoUrl = await saveUploadedImage(file);
    } else if (parsed.data.photos) {
      photoUrl = parsed.data.photos;
    }
  } catch (e: any) {
    const msg = encodeURIComponent(e?.message ?? "Errore upload immagine");
    redirect(`/listings/new?error=${msg}`);
  }

  const created = await db.listing.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      animalType: parsed.data.animalType,
      status: parsed.data.status,
      city: parsed.data.city || null,
      photos: photoUrl,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      userId: actionUser.userId, // ✅ collega l’annuncio all’utente loggato
    },
    select: { id: true },
  });

  revalidatePath("/listings");
  redirect(`/listings/${created.id}`);
}

export default async function NewListingPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  // ✅ protezione: se non loggato, manda a /login
  const { user } = await getSession();
  if (!user) redirect("/login");

  const error = searchParams?.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Crea nuovo annuncio</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={createListing} encType="multipart/form-data" className="space-y-5">
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

        {/* Upload file + URL alternativo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Foto (file)</label>
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="w-full rounded-lg border px-3 py-2 bg-white file:mr-3 file:rounded file:border file:px-3 file:py-1"
            />
            <p className="mt-1 text-xs opacity-70">JPG/PNG/WebP — max 5MB</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Oppure URL immagine</label>
            <input
              name="photos"
              type="url"
              className="w-full rounded-lg border px-3 py-2"
              placeholder="https://..."
            />
            <p className="mt-1 text-xs opacity-70">Se carichi un file, l’URL viene ignorato.</p>
          </div>
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