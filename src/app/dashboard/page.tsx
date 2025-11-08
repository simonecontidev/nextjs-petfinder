// src/app/dashboard/page.tsx
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ───────────────────────────────────────────────────────────
// Server Action: Delete listing (solo owner)
// ───────────────────────────────────────────────────────────
async function delAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");

  const { user } = await getSession();
  const authUserId = (user as any)?.id ?? (user as any)?.userId ?? null;
  if (!authUserId) redirect("/login");

  await db.listing.deleteMany({
    where: { id, userId: authUserId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/listings");
}

// ───────────────────────────────────────────────────────────
// Server Action: Save basic profile info
// ───────────────────────────────────────────────────────────
async function saveProfile(formData: FormData) {
  "use server";

  const { user } = await getSession();
  const authUserId = (user as any)?.id ?? (user as any)?.userId ?? null;
  if (!authUserId) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const bio = String(formData.get("bio") || "").trim();

  // mini validazioni soft (niente zod qui per restare snelli)
  if (name.length > 120) {
    redirect(`/dashboard?err=${encodeURIComponent("Name too long")}`);
  }
  if (phone.length > 60) {
    redirect(`/dashboard?err=${encodeURIComponent("Phone too long")}`);
  }
  if (city.length > 120) {
    redirect(`/dashboard?err=${encodeURIComponent("City too long")}`);
  }
  if (bio.length > 1000) {
    redirect(`/dashboard?err=${encodeURIComponent("Bio too long")}`);
  }

  await db.user.update({
    where: { id: authUserId },
    data: {
      name: name || null,
      phone: phone || null,
      city: city || null,
      bio: bio || null,
    },
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard?ok=${encodeURIComponent("Profile updated")}`);
}

// ───────────────────────────────────────────────────────────
// Pagina Dashboard
// ───────────────────────────────────────────────────────────
type StatusFilter = "ALL" | "LOST" | "FOUND" | "RESOLVED";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { status?: string; ok?: string; err?: string };
}) {
  // Auth
  const { user } = await getSession();
  const authUserId = (user as any)?.id ?? (user as any)?.userId ?? null;
  if (!authUserId) redirect("/login");

  // Profile corrente (per precompilare)
  const me = await db.user.findUnique({
    where: { id: authUserId },
    select: { email: true, name: true, phone: true, city: true, bio: true },
  });

  // Feedback da azioni
  const okMsg = searchParams?.ok ? decodeURIComponent(searchParams.ok) : null;
  const errMsg = searchParams?.err ? decodeURIComponent(searchParams.err) : null;

  // Filtro status robusto
  const rawStatus = (searchParams?.status || "").toString().toUpperCase();
  const activeFilter: StatusFilter =
    rawStatus === "LOST" || rawStatus === "FOUND" || rawStatus === "RESOLVED"
      ? (rawStatus as StatusFilter)
      : "ALL";

  // I miei listing filtrati
  const myListings = await db.listing.findMany({
    where: {
      userId: authUserId,
      ...(activeFilter === "ALL" ? {} : { status: activeFilter }),
    },
    orderBy: { createdAt: "desc" },
  });

  // Messaggi ricevuti per i miei listing (ultimi 20)
  const myMessages = await db.contactMessage.findMany({
    where: { listing: { userId: authUserId } },
    include: {
      listing: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const filters: Array<{ label: string; value: StatusFilter }> = [
    { label: "All", value: "ALL" },
    { label: "Lost", value: "LOST" },
    { label: "Found", value: "FOUND" },
    { label: "Resolved", value: "RESOLVED" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <a href="/logout" className="text-sm underline">
          Logout
        </a>
      </div>

      {/* Feedback */}
      {okMsg && (
        <div className="mb-4 rounded-lg border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-800">
          {okMsg}
        </div>
      )}
      {errMsg && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errMsg}
        </div>
      )}

     

      {/* Filtri */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {filters.map(({ label, value }) => {
          const isActive = activeFilter === value;
          const base =
            "inline-flex items-center rounded-full border px-4 py-1 text-sm font-medium transition";
        const active =
            "bg-amber-600 text-white border-amber-600 shadow-sm";
          const inactive =
            "bg-white text-gray-700 border-gray-200 hover:border-amber-500 hover:text-amber-600 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:border-amber-400";
          return (
            <Link
              key={value}
              href={value === "ALL" ? "/dashboard" : `/dashboard?status=${value}`}
              className={`${base} ${isActive ? active : inactive}`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Miei listing */}
      <section aria-labelledby="my-listings">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="my-listings" className="text-xl font-semibold">
            My listings
          </h2>
          <Link
            href="/listings/new"
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            + New listing
          </Link>
        </div>

        {myListings.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">
            No listings for this filter.
            {activeFilter === "ALL" ? (
              <>
                {" "}
                <a className="underline" href="/listings/new">
                  Create the first →
                </a>
              </>
            ) : null}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myListings.map((l) => (
              <div
                key={l.id}
                className="rounded-2xl overflow-hidden border bg-white dark:bg-gray-800"
              >
                <div className="relative">
                  <img
                    src={l.photos || "https://via.placeholder.com/400x300"}
                    alt={l.title}
                    className="h-48 w-full object-cover"
                  />
                  <span
                    className={`absolute right-3 top-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      l.status === "FOUND"
                        ? "bg-green-600 text-white"
                        : l.status === "LOST"
                        ? "bg-orange-500 text-white"
                        : "bg-gray-600 text-white"
                    }`}
                  >
                    {l.status}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{l.title}</h3>
                      {l.city && (
                        <p className="text-sm opacity-80 mt-1">{l.city}</p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Link
                        href={`/listings/${l.id}/edit`}
                        className="text-sm rounded border px-2 py-1 hover:bg-amber-50 dark:hover:bg-gray-700"
                      >
                        Edit
                      </Link>

                      <form action={delAction}>
                        <input type="hidden" name="id" value={l.id} />
                        <button
                          type="submit"
                          className="text-sm rounded border px-2 py-1 hover:bg-red-50 dark:hover:bg-gray-700"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/listings/${l.id}`}
                      className="text-sm underline opacity-80 hover:opacity-100"
                    >
                      View detail →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Messaggi ricevuti */}
      <section aria-labelledby="messages" className="mt-12">
        <h2 id="messages" className="text-xl font-semibold mb-4">
          Messages received
        </h2>

        {myMessages.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300">No messages yet.</p>
        ) : (
          <ul className="space-y-4">
            {myMessages.map((m) => (
              <li key={m.id} className="rounded-xl border p-4 bg-white dark:bg-gray-800">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">
                    <div className="font-medium">
                      <Link
                        href={`/listings/${m.listing.id}`}
                        className="underline"
                      >
                        {m.listing.title}
                      </Link>
                    </div>
                    <div className="opacity-80">
                      From: {m.email || "anonymous"}
                      {m.name ? ` — ${m.name}` : ""}
                      {m.phone ? ` — ${m.phone}` : ""}
                    </div>
                  </div>
                  <time className="text-xs opacity-60">
                    {new Date(m.createdAt).toLocaleString()}
                  </time>
                </div>

                <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                  {m.body}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>



       {/* ───────────────── Basic info ───────────────── */}
      <section aria-labelledby="basic-info" className="m-10">
        <h2 id="basic-info" className="text-xl font-semibold mb-4">
          Basic info
        </h2>

        <form action={saveProfile} className="grid gap-4 rounded-2xl border bg-white p-4 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={(me?.email ?? "") as string}
                disabled
                className="w-full rounded-lg border px-3 py-2 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                name="name"
                defaultValue={me?.name ?? ""}
                placeholder="Your full name"
                className="w-full rounded-lg border px-3 py-2"
                maxLength={120}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                name="phone"
                defaultValue={me?.phone ?? ""}
                placeholder="+34 ..."
                className="w-full rounded-lg border px-3 py-2"
                maxLength={60}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                name="city"
                defaultValue={me?.city ?? ""}
                placeholder="Madrid"
                className="w-full rounded-lg border px-3 py-2"
                maxLength={120}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bio / Notes</label>
            <textarea
              name="bio"
              defaultValue={me?.bio ?? ""}
              rows={4}
              placeholder="Optional notes: preferred contact times, languages..."
              className="w-full rounded-lg border px-3 py-2"
              maxLength={1000}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="submit" className="btn-primary">
              Save profile
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}