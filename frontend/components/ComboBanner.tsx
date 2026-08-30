"use client";

import { ArrowRight, Gift } from "lucide-react";

export default function ComboBanner() {
  return (
    <section id="combos" className="combo-banner-section">
      <div className="container-wide">
        <div className="combo-banner">
          <div className="combo-copy">
            <p className="eyebrow">
              Curated with love from Godavari
            </p>

            <h2>COMBOS &amp; GIFTING</h2>

            <p>
              Discover thoughtfully curated combinations and gifts, with custom
              options available directly through WhatsApp.
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="/combos" className="gold-button">
                EXPLORE COMBOS
                <ArrowRight size={14} />
              </a>

              <a href="/gifting" className="gold-button">
                EXPLORE GIFTING
                <Gift size={14} />
              </a>
            </div>
          </div>

          <div
            className="combo-image relative overflow-hidden"
            aria-hidden="true"
          >
            <img
              src="/images/combos-gifting-godavari.jpg"
              alt="Godavari Basket curated food gifts and hampers"
              className="h-full w-full object-cover object-center"
            />

            <span className="absolute right-5 top-5">
              <Gift size={22} />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
