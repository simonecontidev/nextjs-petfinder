// src/app/dashboard/page.tsx
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

// 🔧 Server Action per eliminare annuncio
async function delAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const { user } = await getSession();
  if (!user) redirect("/login");

  // Elimina solo se è owner
  await db.listing.deleteMany({
    where: { id, userId: user.userId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/listings");
}

// 🔹 Pagina Dashboard
export default async function DashboardPage() {
  const { user } = await getSession();
  if (!user) redirect("/login");

  const myListings = await db.listing.findMany({
    where: { userId: user.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">La mia Dashboard</h1>
        <a href="/logout" className="text-sm underline">
          Logout
        </a>
      </div>

      {myListings.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300">
          Nessun annuncio.{" "}
          <a className="underline" href="/listings/new">
            Crea il primo →
          </a>
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {myListings.map((l) => (
            <div
              key={l.id}
              className="rounded-2xl overflow-hidden border bg-white dark:bg-gray-800"
            >
              <img
                src={l.photos || "https://via.placeholder.com/400x300"}
                alt={l.title}
                className="h-48 w-full object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{l.title}</h3>
                    {l.city && (
                      <p className="text-sm opacity-80 mt-1">{l.city}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {/* 🔹 Pulsante Edit */}
                    <Link
                      href={`/listings/${l.id}/edit`}
                      className="text-sm rounded border px-2 py-1 hover:bg-blue-50 dark:hover:bg-gray-700"
                    >
                      Edit
                    </Link>

                    {/* 🔹 Pulsante Delete */}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}