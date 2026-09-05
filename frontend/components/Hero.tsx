"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    key: "traditional",
    title: "Traditional Goodness",
    href: "/#shop",
    desktop: "/images/hero-approved/traditional-goodness.jpg",
    mobile: "/images/hero-approved/traditional-goodness-mobile.jpg",
  },
  {
    key: "art",
    title: "Art & Craft",
    href: "/art-and-craft",
    desktop: "/images/hero-approved/art-craft.jpg",
    mobile: "/images/hero-approved/art-craft-mobile.jpg",
  },
  {
    key: "gifting",
    title: "Gifting",
    href: "/gifting",
    desktop: "/images/hero-approved/gifting.jpg",
    mobile: "/images/hero-approved/gifting-mobile.jpg",
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % SLIDES.length),
      3500
    );
    return () => window.clearInterval(timer);
  }, [paused]);

  function move(delta: number) {
    setIndex((value) => (value + delta + SLIDES.length) % SLIDES.length);
  }

  return (
    <section
      className="approved-hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Godavari Basket highlights"
    >
      {SLIDES.map((slide, slideIndex) => (
        <Link
          key={slide.key}
          href={slide.href}
          className={`approved-hero-slide ${slideIndex === index ? "active" : ""}`}
          aria-hidden={slideIndex !== index}
          tabIndex={slideIndex === index ? 0 : -1}
          aria-label={`${slide.title} — explore`}
        >
          <picture>
            <source media="(max-width: 700px)" srcSet={slide.mobile} />
            <img src={slide.desktop} alt={slide.title} fetchPriority={slideIndex === 0 ? "high" : "auto"} />
          </picture>
        </Link>
      ))}

      <button
        type="button"
        className="approved-hero-arrow left"
        onClick={() => move(-1)}
        aria-label="Previous banner"
      >
        <ArrowLeft size={19} />
      </button>

      <button
        type="button"
        className="approved-hero-arrow right"
        onClick={() => move(1)}
        aria-label="Next banner"
      >
        <ArrowRight size={19} />
      </button>

      <div className="approved-hero-dots" aria-label="Choose banner">
        {SLIDES.map((slide, slideIndex) => (
          <button
            type="button"
            key={slide.key}
            className={slideIndex === index ? "active" : ""}
            onClick={() => setIndex(slideIndex)}
            aria-label={`Show ${slide.title}`}
          />
        ))}
      </div>
    </section>
  );
}
