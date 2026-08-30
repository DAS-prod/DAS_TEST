"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { TownData } from "./RegionalMapSection";

// Helper component to center the map when a user selects a town from either the card or marker
function MapRecenter({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, 10, { duration: 1.2 });
  }, [position, map]);
  return null;
}

export default function RealMapLeaflet({
  towns,
  selectedTown,
  onSelectTown,
}: {
  towns: TownData[];
  selectedTown: TownData;
  onSelectTown: (town: TownData) => void;
}) {
  const godavariCenter: [number, number] = [16.8, 81.6];

  // Custom golden map marker element
  const createMarkerIcon = (isSelected: boolean) => {
    return L.divIcon({
      className: "custom-leaflet-pin",
      html: `<div class="custom-gold-marker ${
        isSelected ? "active-marker" : ""
      }">✦</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <MapContainer
      center={godavariCenter}
      zoom={8}
      scrollWheelZoom={false}
      className="h-full w-full z-10"
      style={{ background: "#0c1811" }}
    >
      {/* Dark & Elegant CartoDB Map Tiles (Perfect for Dark Green / Gold Theme) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapRecenter position={selectedTown.position} />

      {towns.map((town) => {
        const isSelected = town.id === selectedTown.id;
        return (
          <Marker
            key={town.id}
            position={town.position}
            icon={createMarkerIcon(isSelected)}
            eventHandlers={{
              click: () => onSelectTown(town),
            }}
          >
            <Popup className="custom-leaflet-popup">
              <div className="p-1 text-stone-900 font-sans">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b5e34]">
                  {town.region}
                </span>
                <h4 className="font-bold text-sm text-stone-900">{town.name}</h4>
                <p className="text-xs text-stone-600 mt-1 font-semibold">
                  {town.craftTitle}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}