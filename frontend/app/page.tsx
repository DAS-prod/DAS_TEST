"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Box, CheckCircle2, Globe2, HeartHandshake, X, PackageCheck } from "lucide-react";
import IntroAnimation from "../components/IntroAnimation";
import Header from "../components/Header";
import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import ComboBanner from "../components/ComboBanner";
import ProductGrid from "../components/ProductGrid";
import RegionalMapSection from "../components/RegionalMapSection";
import CartDrawer, { type CartItem } from "../components/CartDrawer";
import Footer from "../components/Footer";
import type { Product } from "../lib/products";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; amount: number; currency: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("godavari-basket-cart");
      if (saved) setCart(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("order_success") !== "1") return;

    try {
      const raw = sessionStorage.getItem("godavari-basket-order-success");
      if (raw) {
        setOrderSuccess(JSON.parse(raw));
        sessionStorage.removeItem("godavari-basket-order-success");
      }
    } catch (e) {
      console.error(e);
    }

    // Remove the query string so refresh/back navigation does not reopen the popup.
    window.history.replaceState({}, "", "/");
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("godavari-basket-cart", JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  function addToCart(product: Product) {
    setCart((c) => {
      const found = c.find((i) => i.id === product.id);
      return found
        ? c.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...c, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function changeQuantity(id: number, delta: number) {
    setCart((c) =>
      c
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  const count = cart.reduce((n, i) => n + i.quantity, 0);

  const trustItems = [
    {
      title: "AUTHENTIC GODAVARI",
      desc: "Sourced directly from farmers & artisans",
      Icon: HeartHandshake,
    },
    {
      title: "QUALITY YOU TRUST",
      desc: "Lab tested. Hygienically packed.",
      Icon: CheckCircle2,
    },
    {
      title: "PAN INDIA & USA",
      desc: "Delivering happiness across borders",
      Icon: Globe2,
    },
    {
      title: "SECURE PAYMENTS",
      desc: "100% safe & secured checkout",
      Icon: Box,
    },
  ];

  return (
    <>
      <IntroAnimation />
      <Header cartCount={count} onCart={() => setCartOpen(true)} />

      <main>
        <Hero />

        {/* Trust Indicators Strip */}
        <section className="trust-strip">
          <div className="container-wide trust-grid">
            {trustItems.map(({ title, desc, Icon }) => (
              <div className="trust-item" key={title}>
                <Icon size={28} strokeWidth={1.25} />
                <div>
                  <strong>{title}</strong>
                  <span>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories Carousel / Grid */}
        <CategorySection />

        <ComboBanner />

        {/* Main Product Showcase Grid */}
        <ProductGrid onAdd={addToCart} />

        {/* Interactive Godavari Regional Delta Map */}
        <div id="soil" className="scroll-anchor"><RegionalMapSection /></div>

        {/* Story Section */}
        <section id="about" className="story-section">
          <div className="container-wide story-grid">
            <div className="story-copy">
              <p className="eyebrow light">Our origin</p>
              <h2>THE GODAVARI STORY</h2>
              <p className="story-tagline">From our roots to your home</p>
              <div className="gold-divider left">
                <span>✦</span>
              </div>
              <p>
                Every product has a story. From fertile farms and patient artisans to the
                hands that pack each order, we preserve the character of the region while
                making discovery feel effortless.
              </p>
              <button type="button" onClick={() => scrollToSection("contact")} className="outline-gold-button">
                KNOW OUR STORY <ArrowRight size={14} />
              </button>
            </div>

            <div className="story-process">
              {[
                ["01", "SOURCED", "Directly from farmers & artisans"],
                ["02", "QUALITY CHECKED", "Multiple quality checks"],
                ["03", "PACKED WITH CARE", "Hygienically packed to retain freshness"],
                ["04", "DELIVERED TO YOU", "Fast, safe & reliable delivery"],
              ].map(([n, t, d]) => (
                <div className="process-step" key={n}>
                  <span className="process-icon">{n}</span>
                  <strong>{t}</strong>
                  <p>{d}</p>
                </div>
              ))}
            </div>

            <div className="origin-map">
              <div className="map-placeholder">
                <span>OUR ORIGIN</span>
                <strong>Godavari Region, AP</strong>
                <i>GODAVARI</i>
              </div>
            </div>
          </div>
        </section>



        <section id="blog" className="story-section blog-placeholder">
          <div className="container-wide">
            <div className="story-copy">
              <p className="eyebrow light">The Godavari Journal</p>
              <h2>STORIES FROM THE REGION</h2>
              <p className="story-tagline">Recipes, people, places and traditions from the Godavari.</p>
              <div className="gold-divider left"><span>✦</span></div>
              <p>
                Our journal is being prepared. Check back for authentic stories and
                regional discoveries as we publish them.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Services Links */}
        <section id="gifting" className="quick-links">
          <div className="container-wide quick-grid">
            {[
              ["BUILD YOUR OWN BASKET", "Create a personalized gift for your loved ones.", "BUILD NOW"],
              ["SUBSCRIPTION BASKETS", "Monthly delivery of your favourites.", "SUBSCRIBE"],
              ["EASY REORDER", "Buy your past favourites in one click.", "REORDER NOW"],
              ["WHATSAPP SUPPORT", "We're here to help you, always.", "CHAT NOW"],
            ].map(([title, desc, cta]) => (
              <button type="button" onClick={() => scrollToSection("contact")} className="quick-card" key={title}>
                <span>{title}</span>
                <p>{desc}</p>
                <b>{cta} →</b>
              </button>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onChange={changeQuantity}
      />
      {orderSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-success-title"
            className="relative w-full max-w-md overflow-hidden rounded-[30px] border bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setOrderSuccess(null)}
              aria-label="Close order confirmation"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-500 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
            >
              <X size={18} />
            </button>

            <div className="bg-forest px-7 pb-8 pt-10 text-center text-white">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-forest shadow-sm">
                <PackageCheck size={32} />
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[.25em] text-white/65">
                Payment Successful
              </p>

              <h2 id="order-success-title" className="serif mt-2 text-3xl">
                Thank you for your order!
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/75">
                Your payment has been received successfully. We have saved your order and will share the next updates with you.
              </p>
            </div>

            <div className="p-6 md:p-7">
              <div className="rounded-2xl bg-[#f8f6ef] p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-[.16em] text-gray-500">
                    Order Number
                  </span>
                  <span className="font-bold text-forest">
                    #{orderSuccess.orderNumber}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span className="text-sm text-gray-500">
                    Amount Paid
                  </span>
                  <span className="text-lg font-bold">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: orderSuccess.currency || "INR",
                      maximumFractionDigits: 2,
                    }).format(orderSuccess.amount)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setOrderSuccess(null)}
                  className="min-h-[48px] flex-1 rounded-xl border-2 border-forest px-5 text-sm font-semibold text-forest"
                >
                  Continue Shopping
                </button>

                <a
                  href="/account"
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-forest px-5 text-sm font-semibold text-white"
                >
                  View My Orders
                </a>
              </div>

              <p className="mt-4 text-center text-xs text-gray-400">
                You can close this message using the × button above.
              </p>
            </div>
          </div>
        </div>
      )}


    </>
  );
}