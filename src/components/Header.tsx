// src/components/Header.tsx
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";

export default async function Header() {
  const { user } = await getSession();

  return (
    <header
      data-app-header
      className="
        sticky top-0
        z-[2000]                         /* ⬅️ più alto dei layer Leaflet */
        border-b border-gray-200 dark:border-gray-800
        bg-white/80 dark:bg-black/80
        backdrop-blur-md
      "
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition">
          🐾 PetFinder
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/listings" className="hover:underline">Listings</Link>
          <Link href="/about" className="hover:underline">About</Link>

          {user ? (
            <>
              <Link href="/listings/new" className="hover:underline">New</Link>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/logout" className="text-red-600 dark:text-red-400 hover:underline">
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Login</Link>
              <Link href="/register" className="hover:underline">Register</Link>
            </>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}