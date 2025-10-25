// src/app/listings/[id]/edit/page.tsx
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

// Opzioni consentite (DB salva stringhe)
const AnimalTypes = ["DOG", "CAT", "BIRD", "REPTILE", "RABBIT", "OTHER"] as const;
const Statuses = ["LOST", "FOUND", "RESOLVED"] as const;

// 👇 Tratta stringhe vuote come undefined per numeri opzionali
const emptyToUndef = (v: unknown) => (v === "" ? undefined : v);

const ListingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(3).max(120),
  description: z.string().min(10).max(2000),
  animalType: z.enum(AnimalTypes),
  status: z.enum(Statuses),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  photos: z.string().url().optional().or(z.literal("")),
  latitude: z.preprocess(emptyToUndef, z.number().optional()),
  longitude: z.preprocess(emptyToUndef, z.number().optional()),
});

// Upload locale (sviluppo/self-host; in prod meglio un servizio esterno)
const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Tipo file non valido (JPG/PNG/WebP).");
  if (file.size > MAX_SIZE) throw new Error("File troppo grande (max 5MB).");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${crypto.randomBytes(16).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/${name}`;
}

// ✅ Server Action: update sicuro (owner-only)
async function updateListing(formData: FormData) {
  "use server";
  const { user } = await getSession();
  if (!user) redirect("/login");

  const id = String(formData.get("id") ?? "");
  const current = await db.listing.findUnique({ where: { id } });
  if (!current) notFound();
  if (current.userId !== user.userId) redirect("/dashboard");

  const raw = {
    id,
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
    const firstMsg = parsed.error.issues[0]?.message ?? "Errore";
    const msg = encodeURIComponent("Controlla i campi: " + firstMsg);
    redirect(`/listings/${id}/edit?error=${msg}`);
  }

  // Immagine: priorità al file, poi URL, altrimenti mantieni l'attuale
  const file = formData.get("photo") as File | null;
  let photoUrl = current.photos ?? null;
  try {
    if (file && typeof file === "object" && file.size > 0) {
      photoUrl = await saveUploadedImage(file);
    } else if (parsed.data.photos) {
      photoUrl = parsed.data.photos;
    }
  } catch (e: unknown) {
    const msg = encodeURIComponent(e instanceof Error ? e.message : "Errore upload immagine");
    redirect(`/listings/${id}/edit?error=${msg}`);
  }

  await db.listing.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      animalType: parsed.data.animalType,
      status: parsed.data.status,
      city: parsed.data.city || null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      photos: photoUrl,
    },
  });

  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
  revalidatePath("/dashboard");
  redirect(`/listings/${id}`);
}

type Params = { id: string };

export default async function EditListingPage(
  props:
    | { params: Params; searchParams?: { error?: string } }
    | { params: Promise<Params>; searchParams?: { error?: string } }
) {
  const p = "then" in props.params ? await props.params : props.params;
  const id = p?.id;
  if (!id) notFound();

  const { user } = await getSession();
  if (!user) redirect("/login");

  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) notFound();
  if (listing.userId !== user.userId) redirect("/dashboard");

  const error =
    "searchParams" in props && props.searchParams?.error
      ? decodeURIComponent(props.searchParams.error!)
      : null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Modifica annuncio</h1>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form action={updateListing} encType="multipart/form-data" className="space-y-5">
        <input type="hidden" name="id" value={listing.id} />

        <div>
          <label className="block text-sm font-medium mb-1">Titolo *</label>
          <input
            name="title"
            defaultValue={listing.title}
            required
            minLength={3}
            maxLength={120}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrizione *</label>
          <textarea
            name="description"
            defaultValue={listing.description}
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo *</label>
            <select
              name="animalType"
              defaultValue={listing.animalType}
              required
              className="w-full rounded-lg border px-3 py-2"
            >
              {AnimalTypes.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stato *</label>
            <select
              name="status"
              defaultValue={listing.status}
              required
              className="w-full rounded-lg border px-3 py-2"
            >
              {Statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Città</label>
            <input
              name="city"
              defaultValue={listing.city ?? ""}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Foto attuale</label>
            <div className="overflow-hidden rounded-xl border">
              <img
                src={listing.photos || "https://via.placeholder.com/600x400"}
                alt={listing.title}
                className="h-40 w-full object-cover"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nuova foto (file)</label>
            <input
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="w-full rounded-lg border px-3 py-2 bg-white file:mr-3 file:rounded file:border file:px-3 file:py-1"
            />
            <p className="mt-1 text-xs opacity-70">JPG/PNG/WebP — max 5MB</p>

            <label className="mt-3 block text-sm font-medium mb-1">Oppure nuovo URL immagine</label>
            <input
              name="photos"
              type="url"
              placeholder="https://..."
              className="w-full rounded-lg border px-3 py-2"
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
              defaultValue={listing.latitude ?? ""}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Longitudine</label>
            <input
              name="longitude"
              type="number"
              step="any"
              defaultValue={listing.longitude ?? ""}
              className="w-full rounded-lg border px-3 py-2"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-black px-5 py-2.5 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Salva modifiche
          </button>
          <a
            href={`/listings/${listing.id}`}
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            Annulla
          </a>
        </div>
      </form>
    </main>
  );
}