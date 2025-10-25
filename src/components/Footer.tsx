// src/components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} PetFinder — Built with Next.js</p>
        <div className="flex gap-4">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}