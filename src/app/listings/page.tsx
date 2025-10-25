import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic"; // sempre dati aggiornati

export default async function ListingsPage() {
  const listings = await db.listing.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Pet Listings</h1>

      {listings.length === 0 && (
        <p className="text-gray-500">No listings found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((item) => (
          <Link
            key={item.id}
            href={`/listings/${item.id}`}
            className="block rounded-2xl overflow-hidden border bg-white shadow hover:shadow-lg transition dark:bg-gray-800"
          >
            <img
              src={item.photos || "https://via.placeholder.com/400x300"}
              alt={item.title}
              className="w-full h-56 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{item.city}</p>
              <p className="text-sm mt-1 opacity-80">{item.animalType}</p>
              <span
                className={`inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full ${
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