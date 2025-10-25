// app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import AboutHero from "./sections/AboutHero";

export const metadata: Metadata = {
  title: "About — PetFinder",
  description:
    "PetFinder helps communities reunite lost pets faster with verified listings, maps, and a simple reporting flow.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About — PetFinder",
    description:
      "PetFinder helps communities reunite lost pets faster with verified listings, maps, and a simple reporting flow.",
    url: "/about",
    type: "website",
    siteName: "PetFinder",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — PetFinder",
    description:
      "PetFinder helps communities reunite lost pets faster with verified listings, maps, and a simple reporting flow.",
  },
  robots: { index: true, follow: true },
};

export default async function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PetFinder",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    sameAs: [],
    description:
      "PetFinder helps communities reunite lost pets faster with verified listings, maps, and a simple reporting flow.",
    logo: `${process.env.NEXT_PUBLIC_APP_URL || ""}/logo.svg`,
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* JSON-LD for SEO */}
      <Script
        id="about-org-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <AboutHero />

      {/* Mission */}
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">Our Mission</h2>
          <p className="mt-3 text-gray-700">
            We believe every lost pet deserves a fast, organized way home.
            PetFinder connects neighbors, shelters, and finders through clear
            listings, verified details, and respectful privacy.
          </p>
        </div>
        <div className="rounded-2xl border p-6">
          <h2 className="text-xl font-semibold">What We Do</h2>
          <p className="mt-3 text-gray-700">
            We simplify reporting, boost visibility with filters and maps, and
            coordinate safe handovers with contact preferences and consent.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">How It Works</h2>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "1) Create a report",
              text:
                "Add species, city, date, photos, and how to be contacted. Keep it factual and recent.",
            },
            {
              title: "2) Get visibility",
              text:
                "Listings appear on the board with filters and (soon) an interactive map to reach the right people.",
            },
            {
              title: "3) Reunite safely",
              text:
                "Use preferred contact methods. We never share more than you allow.",
            },
          ].map((s) => (
            <li key={s.title} className="rounded-2xl border p-6">
              <h3 className="font-medium">{s.title}</h3>
              <p className="mt-2 text-gray-700">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">Highlights</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            "Fast, clean reporting flow",
            "Smart filters (species, city, date, size)",
            "Privacy-first contact & consent",
            "Account dashboard for your listings",
            "Email verification & rate limits",
            "Accessible UI and mobile-first",
          ].map((f) => (
            <div key={f} className="rounded-2xl border p-6">
              <p className="text-gray-800">{f}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="mt-16 rounded-2xl border p-6">
        <h2 className="text-xl font-semibold">Trust & Safety</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
          <li>Email verification and basic rate-limiting to reduce spam.</li>
          <li>Clear consent for visibility and contact preferences.</li>
          <li>Content guidelines to protect people and pets.</li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="text-xl font-semibold">FAQ</h2>
        <div className="mt-4 divide-y rounded-2xl border">
          {[
            {
              q: "Is PetFinder free?",
              a: "Yes. We’re building this as a community tool. Some advanced features may arrive later, but core reporting will remain free.",
            },
            {
              q: "How do you handle privacy?",
              a: "We only show the details you choose. You can prefer email or phone, and we never expose sensitive data without your consent.",
            },
            {
              q: "Can shelters or vets use it?",
              a: "Absolutely. We welcome shelters and clinics—contact us to set up a verified profile.",
            },
          ].map((item) => (
            <details key={item.q} className="group p-5">
              <summary className="flex cursor-pointer items-center justify-between font-medium">
                {item.q}
                <span className="transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-2 text-gray-700">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16">
        <div className="rounded-2xl border p-6 text-center">
          <h2 className="text-xl font-semibold">Want to collaborate?</h2>
          <p className="mt-2 text-gray-700">
            We’re looking for local partners and contributors.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              href="/contact"
              className="rounded-lg bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
            >
              Contact us
            </Link>
            <Link href="/listings" className="underline">
              Browse listings
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}