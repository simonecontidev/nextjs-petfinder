"use client";

import { FC, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";

export type Pin = { id: string; lat: number; lng: number; title: string; city?: string | null };

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const ListingsMap: FC<{ pins: Pin[] }> = ({ pins }) => {
  const bounds = useMemo(() => {
    if (!pins.length) return null;
    return new LatLngBounds(pins.map((p) => [p.lat, p.lng]));
  }, [pins]);

  const fallbackCenter: [number, number] = [40.4168, -3.7038];

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border">
      <MapContainer
        bounds={bounds ?? undefined}
        center={bounds ? undefined : fallbackCenter}
        zoom={bounds ? undefined : 11}
        scrollWheelZoom={false}
        style={{ height: "360px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={markerIcon}>
            <Popup>
              <div className="text-sm font-semibold">{p.title}</div>
              {p.city ? <div className="text-xs opacity-70">{p.city}</div> : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default ListingsMap;