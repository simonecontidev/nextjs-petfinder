import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center px-6">
        <ThemeToggle />
      <h1 className="text-5xl font-bold mb-6">🐾 PetFinder</h1>

      <p className="text-lg text-gray-600 max-w-xl mb-10">
        Find and report <strong>lost or found pets</strong> in your area.  
        Browse active listings or create a new post if you’ve seen or lost an animal.
      </p>

      <div className="flex gap-4">
        <a
          href="/listings"
          className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-800 transition"
        >
          Browse Listings
        </a>

        <a
          href="/about"
          className="border border-gray-400 px-6 py-3 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
        >
          About
        </a>
      </div>

      <footer className="mt-16 text-sm text-gray-400">
        © {new Date().getFullYear()} PetFinder. All rights reserved.
      </footer>
    </main>
  );
}