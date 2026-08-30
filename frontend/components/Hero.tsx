"use client";

import { ArrowRight, Play } from "lucide-react";

function scrollTo(id: string) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }

export default function Hero() {
  return (
    <section className="hero-v2">
      {/* Background & Subtle Dim Overlay */}
      <div className="hero-image-layer" aria-hidden="true" />
      <div className="hero-overlay" aria-hidden="true" />

      {/* Main Content Area */}
      <div className="container-wide hero-content-v2">
        <div className="hero-copy-v2">
          <p className="hero-script">Experience the</p>
          <h1>GODAVARI</h1>
          <div className="gold-divider">
            <span>✦</span>
          </div>
          <p className="hero-lead">Authentic. Pure. Rooted in Tradition.</p>
          <p className="hero-body">
            A curated collection of products that carry the flavour, craft,
            traditions and spirit of the Godavari region — brought to your home.
          </p>
          <div className="hero-actions-v2">
            <button type="button" onClick={() => scrollTo("shop")} className="gold-button">
              EXPLORE THE COLLECTION <ArrowRight size={15} />
            </button>
            <button type="button" onClick={() => scrollTo("about")} className="story-button">
              <span>
                <Play size={13} fill="currentColor" />
              </span>{" "}
              WATCH OUR STORY
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}