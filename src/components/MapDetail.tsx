"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

type MapProps = { lat: number; lng: number; title: string };

const ListingMap = dynamic(
  () => import("@/components/ListingMap"),
  { ssr: false }
) as ComponentType<MapProps>;

export default function MapDetail(props: MapProps) {
  return <ListingMap {...props} />;
}