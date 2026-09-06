"use client";

import Link from "next/link";

import {
  ArrowLeft,
  MessageCircle,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import ProductCard from "./ProductCard";

import {
  getProducts,
  type Product,
} from "../lib/products";

export type CollectionKind =
  | "combo"
  | "gift"
  | "art"
  | "90s-seasonal";

const WHATSAPP_NUMBER =
  process.env
    .NEXT_PUBLIC_WHATSAPP_NUMBER ||
  "919618851406";

const META: Record<
  CollectionKind,
  {
    eyebrow: string;
    title: string;
    lead: string;
    note: string;
    className: string;
  }
> = {
  combo: {
    eyebrow:
      "Curated combinations",

    title:
      "Godavari Combos",

    lead:
      "A generous way to discover more — familiar favourites paired for families, celebrations and gifting.",

    note:
      "Curated with care",

    className:
      "collection-combo",
  },

  gift: {
    eyebrow:
      "Thoughtfully packed",

    title:
      "Gifting from Godavari",

    lead:
      "Premium regional gifting with warmth, meaning and a sense of place — for every kind of occasion.",

    note:
      "Made to be remembered",

    className:
      "collection-gift",
  },

  art: {
    eyebrow:
      "Crafted by skilled hands",

    title:
      "Art & Craft",

    lead:
      "Pieces shaped by regional traditions, natural materials and the makers who keep them alive.",

    note:
      "Stories made by hand",

    className:
      "collection-art",
  },

  "90s-seasonal": {
    eyebrow:
      "Memories & seasonal favourites",

    title:
      "90s & Seasonal Specials",

    lead:
      "Childhood favourites, nostalgic treats, harvest-led specialties and festive Godavari products — together in one changing collection.",

    note:
      "Memories meet the season",

    className:
      "collection-seasonal",
  },
};

function productText(
  product: Product
) {
  return [
    product.collection,
    product.gift_type,
    product.tags,
    product.category,
    product.parent_category,
    product.subcategory,
    product.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function matches(
  product: Product,
  type: CollectionKind
) {
  const value =
    productText(product);

  if (
    type === "combo"
  ) {
    return /combo|bundle/.test(
      value
    );
  }

  if (
    type === "gift"
  ) {
    return /gift|hamper/.test(
      value
    );
  }

  if (
    type === "art"
  ) {
    return /art|craft|coir|toy|handmade/.test(
      value
    );
  }

  return /90s|90's|nostalgia|chocolate|childhood|retro|seasonal|season|festival|festive|limited edition|limited-edition/.test(
    value
  );
}

export default function PremiumCollectionPage({
  type,
}: {
  type: CollectionKind;
}) {
  const meta =
    META[type];

  const [
    products,
    setProducts,
  ] =
    useState<Product[]>(
      []
    );

  const [
    message,
    setMessage,
  ] =
    useState("");

  useEffect(() => {
    getProducts()
      .then(
        setProducts
      )
      .catch(
        () =>
          setProducts(
            []
          )
      );
  }, []);

  const items =
    useMemo(
      () =>
        products.filter(
          (product) =>
            matches(
              product,
              type
            )
        ),
      [
        products,
        type,
      ]
    );

  function onAdd(
    product: Product
  ) {
    try {
      const raw =
        localStorage.getItem(
          "godavari-basket-cart"
        );

      const cart =
        raw
          ? JSON.parse(
              raw
            )
          : [];

      const existing =
        cart.find(
          (item: any) =>
            item.id ===
              product.id &&
            item.size ===
              product.size
        );

      const updated =
        existing
          ? cart.map(
              (
                item: any
              ) =>
                item.id ===
                  product.id &&
                item.size ===
                  product.size
                  ? {
                      ...item,

                      quantity:
                        (
                          item.quantity ||
                          1
                        ) +
                        1,
                    }
                  : item
            )
          : [
              ...cart,

              {
                ...product,
                quantity:
                  1,
              },
            ];

      localStorage.setItem(
        "godavari-basket-cart",
        JSON.stringify(
          updated
        )
      );

      window.dispatchEvent(
        new CustomEvent(
          "cart-updated"
        )
      );

      setMessage(
        `${product.name} added to your basket.`
      );

      window.setTimeout(
        () =>
          setMessage(
            ""
          ),
        2000
      );
    } catch {
      setMessage(
        "Unable to add this item right now."
      );
    }
  }

  const help =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      `Hi Godavari Basket, I need help with ${meta.title}.`
    )}`;

  return (
    <main
      className={`premium-collection-page ${meta.className}`}
    >
      <header className="premium-collection-nav">
        <div className="container-wide">
          <Link href="/">
            <ArrowLeft
              size={17}
            />

            Back to store
          </Link>

          <Link
            href="/"
            className="serif brand"
          >
            GODAVARI BASKET
          </Link>

          <Link href="/checkout">
            <ShoppingBag
              size={17}
            />

            Basket
          </Link>
        </div>
      </header>

      <section className="premium-collection-hero">
        <div className="collection-ambient one" />

        <div className="collection-ambient two" />

        <div className="container-wide premium-collection-hero-inner">
          <div>
            <p className="collection-kicker">
              <Sparkles
                size={14}
              />

              {meta.eyebrow}
            </p>

            <h1>
              {meta.title}
            </h1>

            <p className="collection-lead">
              {meta.lead}
            </p>

            <div className="collection-hero-actions">
              <a
                href={help}
                target="_blank"
                rel="noreferrer"
                className="collection-secondary"
              >
                <MessageCircle
                  size={16}
                />

                Need help?
              </a>
            </div>
          </div>

          <div className="collection-signature">
            <span>
              Godavari Basket
            </span>

            <strong>
              {meta.note}
            </strong>

            <small>
              From our roots to your home
            </small>
          </div>
        </div>
      </section>

      <section className="container-wide premium-collection-products">
        <div className="premium-section-heading">
          <div>
            <p className="eyebrow">
              From the collection
            </p>

            <h2 className="serif">
              DISCOVER{" "}
              {meta.title.toUpperCase()}
            </h2>
          </div>

          <span>
            {items.length} products
          </span>
        </div>

        {items.length ? (
          <div className="product-grid-v2">
            {items.map(
              (product) => (
                <ProductCard
                  key={
                    product.id
                  }
                  product={
                    product
                  }
                  onAdd={
                    onAdd
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="collection-empty">
            <h3 className="serif">
              This collection is being prepared.
            </h3>

            <p>
              Add matching products in the existing Google Sheet and they will appear here automatically.
            </p>
          </div>
        )}
      </section>

      {message && (
        <div className="collection-toast">
          {message}
        </div>
      )}
    </main>
  );
}
