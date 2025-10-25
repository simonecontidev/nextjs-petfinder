// app/about/sections/AboutHero.tsx
"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function AboutHero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".about-hero-line",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="text-center">
      <h1 className="text-3xl font-bold leading-tight md:text-4xl">
        <span className="about-hero-line block">A simple way</span>
        <span className="about-hero-line block">to bring lost pets</span>
        <span className="about-hero-line block">back home.</span>
      </h1>
      <p className="about-hero-line mx-auto mt-4 max-w-2xl text-gray-700">
        Built with care for communities who act fast when a pet goes missing.
      </p>
    </section>
  );
}