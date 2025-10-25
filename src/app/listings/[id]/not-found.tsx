import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold">Listing not found</h1>
      <p className="mt-2 opacity-80">The post you’re looking for doesn’t exist.</p>
      <Link href="/listings" className="mt-6 inline-block rounded-lg border px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800">
        Back to listings
      </Link>
    </main>
  );
}