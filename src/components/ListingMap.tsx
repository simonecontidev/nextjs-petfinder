"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { FC } from "react";

export type SingleMapProps = { lat: number; lng: number; title: string };

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const ListingMap: FC<SingleMapProps> = ({ lat, lng, title }) => {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "360px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[lat, lng]} icon={markerIcon}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ListingMap;