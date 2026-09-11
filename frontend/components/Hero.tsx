"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Gift,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
  "919618851406";

type HeroSlide = {
  key: string;
  title: string;
  subtitle?: string;

  href?: string;

  whatsappMessage?: string;

  secondaryHref?: string;
  secondaryText?: string;

  desktop: string;
  mobile: string;

  buttonText?: string;
};

const SLIDES: HeroSlide[] = [
  {
    key: "combos",

    title: "Godavari Combos",

    subtitle:
      "Handpicked flavours from the Godavari",

    whatsappMessage:
      "Hi Godavari Basket, I am interested in your Godavari Combos. Please share the available combo options.",

    desktop:
      "/images/hero/hero-combos.jpg",

    mobile:
      "/images/hero/hero-combos-mobile.jpg",

    buttonText:
      "Explore Combos",
  },

  {
    key: "gifting",

    title:
      "Gifting & Hampers",

    subtitle:
      "Thoughtful gifting with a touch of tradition",

    whatsappMessage:
      "Hi Godavari Basket, I am interested in your gifting and hamper options. Please share the available choices.",

    secondaryHref:
      "/custom-basket",

    secondaryText:
      "Customise Your Gift",

    desktop:
      "/images/hero/hero-gifting.jpg",

    mobile:
      "/images/hero/hero-gifting-mobile.jpg",

    buttonText:
      "Explore Gifting",
  },

  {
    key: "coir-toys",

    title:
      "Coir Toys",

    subtitle:
      "Traditional handmade creations from our roots",

    href:
      "/art-and-craft",

    desktop:
      "/images/hero/hero-coir-toys.jpg",

    mobile:
      "/images/hero/hero-coir-toys-mobile.jpg",

    buttonText:
      "Explore Collection",
  },

  {
    key: "90s-combo",

    title:
      "90's Memories",

    subtitle:
      "Bring back the flavours and memories we grew up with",

    href:
      "/90s-seasonal",

    desktop:
      "/images/hero/hero-90s-memories.jpg",

    mobile:
      "/images/hero/hero-90s-memories-mobile.jpg",

    buttonText:
      "Relive the 90's",
  },

  {
    key: "traditional",

    title:
      "Traditional Godavari Foods",

    subtitle:
      "Authentic flavours from our roots to your home",

    href:
      "/#shop",

    desktop:
      "/images/hero/hero-essentials.jpg",

    mobile:
      "/images/hero/hero-essentials-mobile.jpg",

    buttonText:
      "Shop Now",
  },
];

function getWhatsappUrl(
  message: string
) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;
}

export default function Hero() {
  const [
    activeSlide,
    setActiveSlide,
  ] = useState(0);

  const [
    paused,
    setPaused,
  ] = useState(false);

  const totalSlides =
    SLIDES.length;

  useEffect(() => {
    if (
      paused ||
      totalSlides <= 1
    ) {
      return;
    }

    const interval =
      window.setInterval(
        () => {
          setActiveSlide(
            (current) =>
              (current + 1) %
              totalSlides
          );
        },
        3000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, [
    paused,
    totalSlides,
  ]);

  function nextSlide() {
    setActiveSlide(
      (current) =>
        (current + 1) %
        totalSlides
    );
  }

  function previousSlide() {
    setActiveSlide(
      (current) =>
        (current -
          1 +
          totalSlides) %
        totalSlides
    );
  }

  return (
    <section
      className="relative w-full overflow-hidden bg-[#f6f1e7]"
      onMouseEnter={() =>
        setPaused(true)
      }
      onMouseLeave={() =>
        setPaused(false)
      }
    >
      <div className="relative h-[420px] w-full sm:h-[500px] md:h-[560px] lg:h-[620px]">
        {SLIDES.map(
          (
            slide,
            index
          ) => {
            const isActive =
              index ===
              activeSlide;

            return (
              <div
                key={
                  slide.key
                }
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  isActive
                    ? "z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                }`}
                aria-hidden={
                  !isActive
                }
              >
                <picture>
                  <source
                    media="(max-width: 700px)"
                    srcSet={
                      slide.mobile
                    }
                  />

                  <img
                    src={
                      slide.desktop
                    }
                    alt={
                      slide.title
                    }
                    className="absolute inset-0 h-full w-full object-cover"
                    loading={
                      index ===
                      0
                        ? "eager"
                        : "lazy"
                    }
                  />
                </picture>

                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent md:from-black/55 md:via-black/20" />

                <div className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-5 sm:px-8 lg:px-12">
                  <div className="max-w-xl text-white">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#e2c27d] sm:text-sm">
                      Godavari
                      Basket
                    </p>

                    <h1 className="text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">
                      {
                        slide.title
                      }
                    </h1>

                    {slide.subtitle && (
                      <p className="mt-4 max-w-lg text-sm leading-6 text-white/90 sm:text-base md:text-lg">
                        {
                          slide.subtitle
                        }
                      </p>
                    )}

                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      {slide.whatsappMessage ? (
                        <a
                          href={getWhatsappUrl(
                            slide.whatsappMessage
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#d5b56f] bg-[#153d2b] px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-[#1d5139] sm:px-7"
                        >
                          <MessageCircle
                            size={
                              17
                            }
                          />

                          {slide.buttonText ||
                            "Explore"}
                        </a>
                      ) : (
                        slide.href && (
                          <Link
                            href={
                              slide.href
                            }
                            className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#d5b56f] bg-[#153d2b] px-6 py-3 text-sm font-semibold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-[#1d5139] sm:px-7"
                          >
                            {slide.buttonText ||
                              "Explore"}

                            <span className="ml-2">
                              →
                            </span>
                          </Link>
                        )
                      )}

                      {slide.secondaryHref &&
                        slide.secondaryText && (
                          <Link
                            href={
                              slide.secondaryHref
                            }
                            className="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#e6cc87] bg-[#f7eed6]/95 px-6 py-3 text-sm font-semibold text-[#153d2b] shadow-[0_8px_28px_rgba(0,0,0,0.14)] backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white sm:px-7"
                          >
                            <Gift
                              size={
                                17
                              }
                              className="text-[#9c742c]"
                            />

                            {
                              slide.secondaryText
                            }

                            <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                              →
                            </span>
                          </Link>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        )}

        {totalSlides >
          1 && (
          <>
            <button
              type="button"
              onClick={
                previousSlide
              }
              aria-label="Previous banner"
              className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 sm:left-5 sm:h-11 sm:w-11"
            >
              <ChevronLeft
                size={22}
              />
            </button>

            <button
              type="button"
              onClick={
                nextSlide
              }
              aria-label="Next banner"
              className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 sm:right-5 sm:h-11 sm:w-11"
            >
              <ChevronRight
                size={22}
              />
            </button>
          </>
        )}

        <div className="absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
          {SLIDES.map(
            (
              slide,
              index
            ) => (
              <button
                key={
                  slide.key
                }
                type="button"
                aria-label={`Open banner ${
                  index +
                  1
                }`}
                onClick={() =>
                  setActiveSlide(
                    index
                  )
                }
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeSlide ===
                  index
                    ? "w-7 bg-white"
                    : "w-2.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}
