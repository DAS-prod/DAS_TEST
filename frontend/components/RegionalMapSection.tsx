"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import type { LatLngExpression } from "leaflet";

export interface TownData {
  id: string;
  name: string;
  region: string;
  craftTitle: string;
  tag: string;
  desc: string;
  price: string;
  categoryFilterKey: string;
  regionKey: string;
  position: [number, number]; // [Latitude, Longitude]
}

const TOWNS: TownData[] = [
  {
    id: "rajahmundry",
    name: "Rajahmundry",
    region: "East Godavari Riverbank",
    craftTitle: "Traditional Bilona Ghee",
    tag: "Grass-Fed A2",
    desc: "Hand-churned from curd using wooden ladles and slow-simmered over gentle earthen wood fires for a rich golden grain.",
    price: "₹650 • 500ml",
    categoryFilterKey: "Godavari Foods",
    regionKey: "East Godavari",
    position: [17.0005, 81.804],
  },
  {
    id: "atreyapuram",
    name: "Atreyapuram",
    region: "Central Delta Village",
    craftTitle: "Bellam Pootharekulu",
    tag: "Hand-Rolled Edible Paper",
    desc: "Ultra-thin rice starch edible paper sheets rolled with organic palm jaggery, pure cow ghee, and roasted cashew nuts.",
    price: "₹380 • 10 Rolls",
    categoryFilterKey: "Godavari Foods",
    regionKey: "Konaseema",
    position: [16.8364, 81.7877],
  },
  {
    id: "konaseema",
    name: "Konaseema (Amalapuram)",
    region: "Coconut Delta Belt",
    craftTitle: "Raw Mango Avakaya",
    tag: "Cold-Pressed Sesame Oil",
    desc: "Native sour mango chunks cured with unrefined sea salt, sun-cured Guntur red chilies, and wood-pressed gingelly oil.",
    price: "₹320 • 350g",
    categoryFilterKey: "Godavari Foods",
    regionKey: "Konaseema",
    position: [16.5787, 82.0061],
  },
  {
    id: "bhimavaram",
    name: "Bhimavaram",
    region: "West Godavari Plains",
    craftTitle: "Kandi Karam Podi",
    tag: "Stone Ground Spice",
    desc: "Wood-roasted lentils, cumin, garlic, and dry chilies stone-pounded into a fragrant dry breakfast spice blend.",
    price: "₹220 • 200g",
    categoryFilterKey: "Godavari Foods",
    regionKey: "West Godavari",
    position: [16.5449, 81.5212],
  },
  {
    id: "guntur",
    name: "Guntur",
    region: "Spice Heartland",
    craftTitle: "Stone-Ground Mirchi Karam",
    tag: "Hand-Harvested Chilies",
    desc: "Sun-cured fiery red chilies ground with whole rock salt, roasted coriander seeds, and local garlic cloves.",
    price: "₹190 • 250g",
    categoryFilterKey: "Godavari Foods",
    regionKey: "Guntur",
    position: [16.3067, 80.4365],
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

  const handleExploreCategory = (categoryKey: string, regionKey: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryKey);
    }
    window.dispatchEvent(
      new CustomEvent("region-filter", { detail: regionKey })
    );
    const shopEl = document.getElementById("shop");
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#0a1710] py-16 md:py-24 text-stone-100 border-t border-[#cbb47e]/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b3d2f]/90 border border-[#cbb47e]/35 text-[#fce4b8] text-xs font-semibold uppercase tracking-[0.2em]">
            <Sparkles size={13} className="text-[#f3c969]" /> Origin-Tracked Foods
          </div>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#fdfbf7]">
            Taste the Soil of the{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fce4b8] via-[#e2c17c] to-[#9a7837]">
              Godavari Delta
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-stone-300">
            Explore the real geography of Andhra Pradesh. Click on any regional town marker to view its artisanal food craft.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Craft Details */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#12281c] to-[#0c1a12] border border-[#cbb47e]/35 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between gap-2 border-b border-stone-700/60 pb-3 mb-4">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#f3c969]">
                  <MapPin size={14} /> {selectedTown.region}
                </span>
                <span className="text-[11px] font-semibold text-emerald-400">
                  ● Direct from Artisans
                </span>
              </div>

              <span className="inline-block text-[11px] font-semibold tracking-wider text-amber-200/90 uppercase">
                {selectedTown.tag} · {selectedTown.regionKey}
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
                    Typical Batch
                  </span>
                  <strong className="text-base sm:text-lg font-bold text-[#fce4b8]">
                    {selectedTown.price}
                  </strong>
                </div>

                <button
                  onClick={() => handleExploreCategory(selectedTown.categoryFilterKey, selectedTown.regionKey)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#cbb47e] to-[#a3803d] text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  View In Store <ArrowRight size={13} />
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