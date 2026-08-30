"use client";

import { ArrowRight, Gift } from "lucide-react";

export default function ComboBanner() {
  return (
    <section id="combos" className="combo-banner-section">
      <div className="container-wide">
        <div className="combo-banner">
          <div className="combo-copy">
            <p className="eyebrow">Curated with love from Godavari</p>
            <h2>COMBOS &amp; GIFTING</h2>
            <p>
              Discover thoughtfully curated combinations and gifts, with custom
              options available directly through WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/combos" className="gold-button">
                EXPLORE COMBOS <ArrowRight size={14} />
              </a>
              <a href="/gifting" className="outline-gold-button">
                EXPLORE GIFTING <Gift size={14} />
              </a>
            </div>
          </div>
          <div className="combo-image" aria-hidden="true">
            <img src="/images/hero-godavari.jpg" alt="Godavari Basket curated collection" />
            <span><Gift size={22} /></span>
          </div>
        </div>
      </div>
    </section>
  );
}
