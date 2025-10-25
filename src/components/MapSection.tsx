"use client";

import dynamic from "next/dynamic";

type Pin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  city?: string | null;
};

const ListingsMap = dynamic(() => import("@/components/ListingsMap"), {
  ssr: false,
});

export default function MapSection({ pins }: { pins: Pin[] }) {
  if (!pins.length) return null;
  return <ListingsMap pins={pins} />;
}