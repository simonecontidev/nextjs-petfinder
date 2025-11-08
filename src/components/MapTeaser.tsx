"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { LatLngExpression } from "leaflet";

// Lazy load per evitare hydration errori in Next.js
const MapContainer = dynamic(
  async () => (await import("react-leaflet")).MapContainer,
  { ssr: false }
);
const TileLayer = dynamic(
  async () => (await import("react-leaflet")).TileLayer,
  { ssr: false }
);
const Marker = dynamic(
  async () => (await import("react-leaflet")).Marker,
  { ssr: false }
);
const Popup = dynamic(
  async () => (await import("react-leaflet")).Popup,
  { ssr: false }
);

type Pin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  city?: string | null;
};

export default function MapTeaser({ pins }: { pins: Pin[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || pins.length === 0) return null;

  const avgLat = pins.reduce((a, b) => a + b.lat, 0) / pins.length;
  const avgLng = pins.reduce((a, b) => a + b.lng, 0) / pins.length;
  const center: LatLngExpression = [avgLat, avgLng];

  return (
    <div className="relative h-[380px] w-full rounded-2xl overflow-hidden border border-[var(--surface-border)]">
      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pins.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <a
                href={`/listings/${p.id}`}
                className="font-medium text-sm text-blue-600 hover:underline"
              >
                {p.title}
              </a>
              {p.city && (
                <div className="text-xs text-gray-500 mt-1">{p.city}</div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}