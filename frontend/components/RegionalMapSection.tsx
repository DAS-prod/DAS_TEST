"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";

export interface TownData {
  id: string;
  name: string;
  region: string;
  craftTitle: string;
  tag: string;
  desc: string;
  price: string;
  productId: number;
  regionKey: string;
  position: [number, number]; // [Latitude, Longitude]
}

const TOWNS: TownData[] = [
  {
    id: "rajahmundry",
    name: "Rajahmundry",
    region: "Godavari Riverbank",
    craftTitle: "Kova",
    tag: "Traditional Godavari Sweet",
    desc: "A rich, creamy milk sweet with a traditional Andhra character, associated with the Godavari region and enjoyed across Rajahmundry.",
    price: "View product",
    productId: 191,
    regionKey: "East Godavari",
    position: [17.0005, 81.804],
  },
  {
    id: "atreyapuram",
    name: "Atreyapuram",
    region: "Central Godavari Delta",
    craftTitle: "Potharekulu",
    tag: "Atreyapuram Specialty",
    desc: "Delicate paper-thin rice starch sheets layered and rolled with ghee and jaggery, making this one of the best-known sweets of Atreyapuram.",
    price: "View product",
    productId: 190,
    regionKey: "Konaseema",
    position: [16.8364, 81.7877],
  },
  {
    id: "tapeswaram",
    name: "Tapeswaram",
    region: "Godavari Delta",
    craftTitle: "Madatha Kaja",
    tag: "Traditional Layered Sweet",
    desc: "A crisp, layered Andhra sweet closely associated with Tapeswaram and the traditional sweet-making culture of the Godavari region.",
    price: "View product",
    productId: 193,
    regionKey: "Konaseema",
    position: [16.7555, 82.0005],
  },
  {
    id: "kakinada",
    name: "Kakinada",
    region: "Coastal Godavari",
    craftTitle: "Gotam Kaja",
    tag: "Kakinada Sweet Tradition",
    desc: "A traditional Godavari-region sweet associated with the Kakinada area and its long-standing Andhra sweet-making tradition.",
    price: "View product",
    productId: 194,
    regionKey: "East Godavari",
    position: [16.9891, 82.2475],
  },
  {
    id: "konaseema",
    name: "Konaseema",
    region: "Coconut & Mango Delta",
    craftTitle: "Avakai Pachadi",
    tag: "Konaseema Pickle",
    desc: "A bold Andhra mango pickle made with raw mango, red chilli, salt and traditional oil, representing the distinctive food culture of the Konaseema delta.",
    price: "View product",
    productId: 174,
    regionKey: "Konaseema",
    position: [16.5787, 82.0061],
  },
  {
    id: "godavari-delta",
    name: "Godavari Delta",
    region: "Traditional Andhra Kitchen",
    craftTitle: "Gongura Pachadi",
    tag: "Regional Andhra Classic",
    desc: "A traditional Andhra preparation made from gongura leaves and aromatic spices, reflecting the bold flavours found throughout the Godavari region.",
    price: "View product",
    productId: 175,
    regionKey: "Godavari",
    position: [16.6500, 81.8500],
  },
];

// Dynamically import the real Leaflet Map to avoid SSR errors in Next.js
const RealMap = dynamic(() => import("./RealMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[380px] w-full items-center justify-center rounded-3xl bg-[#0c1811] text-xs font-semibold text-[#fce4b8]">
      Loading Godavari Regional Map...
    </div>
  ),
});

export default function RegionalMapSection({
  onSelectCategory,
}: {
  onSelectCategory?: (category: string) => void;
}) {
  const [selectedTown, setSelectedTown] = useState<TownData>(TOWNS[1]);

  const handleViewProduct = (productId: number) => {
    window.location.href = `/products/${productId}`;
  };

  return (
    <section className="relative overflow-hidden bg-[#0a1710] py-16 md:py-24 text-stone-100 border-t border-[#cbb47e]/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b3d2f]/90 border border-[#cbb47e]/35 text-[#fce4b8] text-xs font-semibold uppercase tracking-[0.2em]">
            <Sparkles size={13} className="text-[#f3c969]" />
            Origin-Tracked Foods
          </div>

          <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#fdfbf7]">
            Taste the Soil of the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fce4b8] via-[#e2c17c] to-[#9a7837]">
              Godavari Delta
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-stone-300">
            Explore the places, flavours, and traditional foods that define
            the Godavari region.
          </p>
        </div>

        <div className="mb-7 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          {TOWNS.map((town) => (
            <button
              key={town.id}
              type="button"
              onClick={() => setSelectedTown(town)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[.08em] transition ${selectedTown.id === town.id ? "border-[#d7b65f] bg-[#d7b65f] text-[#0a1710]" : "border-[#cbb47e]/25 bg-white/5 text-stone-300 hover:border-[#cbb47e]/55"}`}
            >
              {town.name}
            </button>
          ))}
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* Left Column: Craft Details */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#12281c] to-[#0c1a12] border border-[#cbb47e]/35 p-6 sm:p-8 shadow-2xl backdrop-blur-md">

              <div className="flex items-center justify-between gap-2 border-b border-stone-700/60 pb-3 mb-4">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#f3c969]">
                  <MapPin size={14} />
                  {selectedTown.region}
                </span>

                <span className="text-[11px] font-semibold text-emerald-400">
                  ● Direct from Artisans
                </span>
              </div>

              <span className="inline-block text-[11px] font-semibold tracking-wider text-amber-200/90 uppercase">
                {selectedTown.tag} · {selectedTown.name}
              </span>

              <h3 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#fdfbf7]">
                {selectedTown.craftTitle}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-stone-300">
                {selectedTown.desc}
              </p>

              <div className="mt-6 pt-4 border-t border-stone-700/60 flex items-center justify-between gap-4">

                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-stone-400">
                    From
                  </span>

                  <strong className="text-base sm:text-lg font-bold text-[#fce4b8]">
                    {selectedTown.name}
                  </strong>
                </div>

                <button
                  onClick={() =>
                    handleViewProduct(selectedTown.productId)
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#cbb47e] to-[#a3803d] text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  View In Store
                  <ArrowRight size={13} />
                </button>

              </div>
            </div>
          </div>

          {/* Right Column: Real Leaflet Map */}
          <div className="lg:col-span-7">
            <div className="relative h-[420px] sm:h-[480px] w-full rounded-3xl overflow-hidden border border-[#cbb47e]/35 shadow-2xl">
              <RealMap
                towns={TOWNS}
                selectedTown={selectedTown}
                onSelectTown={setSelectedTown}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
