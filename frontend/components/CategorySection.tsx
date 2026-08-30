"use client";

import {
  Cookie,
  Droplets,
  Leaf,
  Package,
  Sparkles,
  Wheat,
  Drumstick,
  Nut,
  CircleDot,
} from "lucide-react";

export const MAIN_CATEGORIES = [
  { name: "Seasonal", key: "Seasonal", icon: Sparkles },
  { name: "Sweets", key: "Sweets", icon: Cookie },
  { name: "Snacks", key: "Snacks", icon: Wheat },
  { name: "Pickles", key: "Pickles", icon: CircleDot },
  { name: "Podis", key: "Podis", icon: Sparkles },
  { name: "Papads", key: "Papads", icon: Package },
  { name: "Millets", key: "Millets", icon: Leaf },
  { name: "Ghees & Oils", key: "Ghees & Oils", icon: Droplets },
  { name: "Essentials", key: "Essentials", icon: Nut },
  { name: "Art & Traditionals", key: "Art & Traditionals", icon: Package },
];

function filterCategory(key: string) {
  window.dispatchEvent(new CustomEvent("category-filter", { detail: key }));
  document.getElementById("shop")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function CategorySection() {
  return (
    <section id="collections" className="category-section">
      <div className="container-wide">
        <div className="section-heading centered">
          <p className="eyebrow">Discover the region</p>
          <h2>EXPLORE THE GODAVARI</h2>
          <div className="mini-divider"><span>✦</span></div>
        </div>

        <div className="category-row category-row-new">
          {MAIN_CATEGORIES.map(({ name, key, icon: Icon }) => (
            <div key={name} className="category-item category-item-new" role="button" tabIndex={0} onClick={() => filterCategory(key)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") filterCategory(key); }}>
              <span className="category-image category-icon-only">
                <span className="category-icon-glow"><Icon size={31} strokeWidth={1.35} /></span>
                <span className="category-inner-ring" />
              </span>
              <strong>{name}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
