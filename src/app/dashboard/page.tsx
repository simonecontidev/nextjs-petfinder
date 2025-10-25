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
export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { status?: string };
}) {
  const { user } = await getSession();
  if (!user) redirect("/login");

  const rawStatus = searchParams?.status;
  const normalizedStatus =
    typeof rawStatus === "string" ? rawStatus.toUpperCase() : undefined;
  const allowedStatuses = new Set(["LOST", "FOUND"]);
  const activeFilter = allowedStatuses.has(normalizedStatus ?? "")
    ? normalizedStatus!
    : "ALL";

  const myListings = await db.listing.findMany({
    where: {
      userId: user.userId,
      ...(activeFilter === "ALL" ? {} : { status: activeFilter }),
    },
    orderBy: { createdAt: "desc" },
  });

  const filters: Array<{ label: string; value: "ALL" | "LOST" | "FOUND" }> = [
    { label: "Tutti", value: "ALL" },
    { label: "Lost", value: "LOST" },
    { label: "Found", value: "FOUND" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">La mia Dashboard</h1>
        <a href="/logout" className="text-sm underline">
          Logout
        </a>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        {filters.map(({ label, value }) => {
          const isActive = activeFilter === value;
          const baseClasses =
            "inline-flex items-center rounded-full border px-4 py-1 text-sm font-medium transition";
          const activeClasses =
            "bg-blue-600 text-white border-blue-600 shadow-sm";
          const inactiveClasses =
            "bg-white text-gray-700 border-gray-200 hover:border-blue-500 hover:text-blue-600 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:border-blue-400";
          return (
            <Link
              key={value}
              href={
                value === "ALL"
                  ? "/dashboard"
                  : `/dashboard?status=${value}`
              }
              className={`${baseClasses} ${
                isActive
                  ? activeClasses
                  : inactiveClasses
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {myListings.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300">
          Nessun annuncio per questo filtro.
          {activeFilter === "ALL" ? (
            <>
              {" "}
              <a className="underline" href="/listings/new">
                Crea il primo →
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
