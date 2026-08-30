"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, ShoppingBag } from "lucide-react";
import ProductCard from "./ProductCard";
import { getProducts, type Product } from "../lib/products";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919618851406";

function whatsapp(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function matchesCollection(product: Product, type: "combo" | "gift") {
  const collection = (product.collection || "").toLowerCase();
  const giftType = (product.gift_type || "").toLowerCase();
  const tags = (product.tags || "").toLowerCase();
  const category = (product.category || "").toLowerCase();

  if (type === "combo") {
    return (
      collection === "combo" ||
      collection === "combos" ||
      giftType.includes("combo") ||
      tags.includes("combo") ||
      category.includes("combo")
    );
  }

  return (
    collection === "gift" ||
    collection === "gifting" ||
    Boolean(giftType) ||
    giftType.includes("gift") ||
    tags.includes("gift") ||
    category.includes("gift")
  );
}

export default function CollectionPage({ type }: { type: "combo" | "gift" }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const items = useMemo(
    () => products.filter((p) => matchesCollection(p, type)),
    [products, type]
  );

  const isGift = type === "gift";
  const title = isGift ? "GIFTING FROM GODAVARI" : "GODAVARI COMBOS";
  const eyebrow = isGift ? "Thoughtfully packed" : "Curated combinations";
  const description = isGift
    ? "Meaningful gifts made from authentic Godavari favourites. Choose a ready-made gift or create something personal."
    : "Curated combinations of Godavari favourites, prepared for sharing, celebrating and discovering more in one basket.";

  function addToWhatsApp() {
    const message = isGift
      ? "Hi Godavari Basket, I would like to create a custom gift. Please help me build one."
      : "Hi Godavari Basket, I would like to place a custom combo order. Please help me create one.";
    window.open(whatsapp(message), "_blank", "noopener,noreferrer");
  }

  function onAdd(product: Product) {
    try {
      const raw = localStorage.getItem("godavari-basket-cart");
      const cart = raw ? JSON.parse(raw) : [];
      const existing = cart.find((item: Product & { quantity?: number }) => item.id === product.id);
      const updated = existing
        ? cart.map((item: Product & { quantity?: number }) =>
            item.id === product.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          )
        : [...cart, { ...product, quantity: 1 }];
      localStorage.setItem("godavari-basket-cart", JSON.stringify(updated));
      setCartMessage(`${product.name} added to your basket.`);
      window.setTimeout(() => setCartMessage(""), 2200);
    } catch {
      setCartMessage("Unable to add this item right now.");
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6]">
      <header className="border-b bg-[#062b18] text-white">
        <div className="container-wide flex min-h-[78px] items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/85">
            <ArrowLeft size={17} /> Back to Godavari Basket
          </Link>
          <Link href="/" className="serif text-lg tracking-[.12em]">GODAVARI BASKET</Link>
          <Link href="/checkout" className="inline-flex items-center gap-2 text-sm text-white/85">
            <ShoppingBag size={17} /> Basket
          </Link>
        </div>
      </header>

      <section className="border-b bg-[#f6f2e8]">
        <div className="container-wide py-14 text-center md:py-20">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="serif mt-3 text-4xl text-[#062b18] md:text-6xl">{title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-600">{description}</p>
          <button
            type="button"
            onClick={addToWhatsApp}
            className="mt-7 inline-flex min-h-[46px] items-center gap-2 rounded-full bg-[#062b18] px-6 text-xs font-bold tracking-[.08em] text-[#f2d27d]"
          >
            <MessageCircle size={16} />
            {isGift ? "CREATE CUSTOM GIFT" : "CREATE CUSTOM COMBO"}
          </button>
        </div>
      </section>

      <section className="container-wide py-10 md:py-14">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">From the catalogue</p>
            <h2 className="serif mt-2 text-3xl text-[#062b18]">
              {isGift ? "CURATED GIFTS" : "CURATED COMBOS"}
            </h2>
          </div>
          <span className="text-xs text-gray-500">{items.length} options</span>
        </div>

        {items.length ? (
          <div className="product-grid-v2">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border bg-white px-6 py-16 text-center">
            <h3 className="serif text-2xl text-[#062b18]">
              {isGift ? "Gifting collection is being prepared." : "Combo collection is being prepared."}
            </h3>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-500">
              Add products to your Google Sheet with the appropriate collection value,
              then they will appear here automatically.
            </p>
          </div>
        )}

        {cartMessage && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#062b18] px-5 py-3 text-sm text-white shadow-xl">
            {cartMessage}
          </div>
        )}
      </section>
    </main>
  );
}
