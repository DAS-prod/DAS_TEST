"use client";

import { ArrowRight, Heart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProducts, type Product } from "../lib/products";
import { MAIN_CATEGORIES } from "./CategorySection";
import ProductCard from "./ProductCard";

const WISHLIST_KEY = "godavari-basket-wishlist";

function getWishlistIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.map(Number).filter(Number.isFinite)
      : [];
  } catch {
    return [];
  }
}

const normalize = (value?: string) =>
  (value || "").trim().toLowerCase();

export default function ProductGrid({ onAdd }: { onAdd: (p: Product) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("All");
  const [subcategoryFilter, setSubcategoryFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [wishlistOnly, setWishlistOnly] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const update = () => setWishlistIds(getWishlistIds());
    update();
    window.addEventListener("wishlist-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("wishlist-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  useEffect(() => {
    const onSearch = (e: Event) => {
      setSearch((e as CustomEvent<string>).detail || "");
      setWishlistOnly(false);
    };
    const onCategory = (e: Event) => {
      setFilter((e as CustomEvent<string>).detail || "All");
      setSubcategoryFilter("All");
      setRegionFilter("All");
      setWishlistOnly(false);
    };
    const onSubcategory = (e: Event) => {
      setSubcategoryFilter((e as CustomEvent<string>).detail || "All");
      setWishlistOnly(false);
    };
    const onRegion = (e: Event) => {
      setRegionFilter((e as CustomEvent<string>).detail || "All");
      setFilter("All");
      setSubcategoryFilter("All");
      setSearch("");
      setWishlistOnly(false);
    };
    const onWishlist = (e: Event) => {
      const value = Boolean((e as CustomEvent<boolean>).detail);
      setWishlistOnly(value);
      if (value) {
        setFilter("All");
        setSubcategoryFilter("All");
        setSearch("");
        setRegionFilter("All");
      }
    };

    window.addEventListener("product-search", onSearch);
    window.addEventListener("category-filter", onCategory);
    window.addEventListener("subcategory-filter", onSubcategory);
    window.addEventListener("region-filter", onRegion);
    window.addEventListener("wishlist-filter", onWishlist);

    return () => {
      window.removeEventListener("product-search", onSearch);
      window.removeEventListener("category-filter", onCategory);
      window.removeEventListener("subcategory-filter", onSubcategory);
      window.removeEventListener("region-filter", onRegion);
      window.removeEventListener("wishlist-filter", onWishlist);
    };
  }, []);

  function matchesCategory(p: Product, category: string) {
    if (category === "All") return true;
    const selected = normalize(category);
    const fields = [
      p.parent_category,
      p.category,
    ].map(normalize);
    if (fields.includes(selected)) return true;

    const aliases: Record<string, string[]> = {
      seasonal: ["seasonal", "festival", "special"],
      sweets: ["sweet"],
      snacks: ["snack"],
      pickles: ["pickle"],
      podis: ["podi", "karam"],
      papads: ["papad", "appadam", "vadiyalu"],
      millets: ["millet"],
      "ghees & oils": ["ghee", "oil"],
      essentials: ["essential", "tamarind", "chilli", "coconut", "spice", "rice"],
      "art & traditionals": ["art", "traditional", "handicraft", "artisan"],
    };

    const terms = aliases[selected] || [];
    const haystack = [
      p.parent_category, p.category, p.subcategory, p.name, p.description, p.tags
    ].map(normalize).join(" ");

    return terms.some((term) => haystack.includes(term));
  }

  function matchesRegion(p: Product, region: string) {
    if (region === "All") return true;
    const selected = normalize(region);
    return [p.region, p.district, p.origin, p.tags]
      .filter(Boolean)
      .map(normalize)
      .some((v) => v === selected || v.includes(selected) || selected.includes(v));
  }

  const subcategories = useMemo(() => {
    if (filter === "All") return [];
    return Array.from(new Set(
      products
        .filter((p) => matchesCategory(p, filter))
        .map((p) => (p.subcategory || "").trim())
        .filter(Boolean)
    ));
  }, [products, filter]);

  const visible = useMemo(() => {
    const q = normalize(search);
    return products.filter((p) => {
      if (wishlistOnly && !wishlistIds.includes(Number(p.id))) return false;
      if (!matchesRegion(p, regionFilter)) return false;
      if (!matchesCategory(p, filter)) return false;
      if (
        subcategoryFilter !== "All" &&
        normalize(p.subcategory) !== normalize(subcategoryFilter)
      ) return false;

      if (!q) return true;
      const text = [
        p.name, p.category, p.parent_category, p.subcategory,
        p.description, p.ingredients, p.benefits, p.region,
        p.district, p.origin, p.tags, p.gift_type
      ].map(normalize).join(" ");
      return text.includes(q);
    });
  }, [products, filter, subcategoryFilter, regionFilter, search, wishlistOnly, wishlistIds]);

  function showAllProducts() {
    setFilter("All");
    setSubcategoryFilter("All");
    setRegionFilter("All");
    setSearch("");
    setWishlistOnly(false);
    window.dispatchEvent(new CustomEvent("product-search", { detail: "" }));
    window.dispatchEvent(new CustomEvent("category-filter", { detail: "All" }));
    window.dispatchEvent(new CustomEvent("subcategory-filter", { detail: "All" }));
    window.dispatchEvent(new CustomEvent("wishlist-filter", { detail: false }));
  }

  function selectCategory(category: string) {
    setFilter(category);
    setSubcategoryFilter("All");
    setRegionFilter("All");
    setWishlistOnly(false);
    window.dispatchEvent(new CustomEvent("category-filter", { detail: category }));
    setTimeout(() => document.getElementById("shop")?.scrollIntoView({
      behavior: "smooth", block: "start"
    }), 0);
  }

  return (
    <section id="shop" className="collection-section">
      <div className="container-wide">
        <div className="collection-head">
          <div>
            <p className="eyebrow">{wishlistOnly ? "Saved for you" : "Curated with intention"}</p>
            <h2>{wishlistOnly ? "YOUR WISHLIST" : "CURATED PICKS FROM GODAVARI"}</h2>
          </div>
          <button type="button" className="view-all" onClick={showAllProducts}>
            View All Products <ArrowRight size={14} />
          </button>
        </div>

        {search && (
          <div className="active-filter-message">
            Searching for: <strong>{search}</strong>
            <button type="button" onClick={() => setSearch("")}>×</button>
          </div>
        )}

        {wishlistOnly && (
          <div className="active-filter-message wishlist-filter-message">
            <Heart size={15} fill="currentColor" />
            <span>Showing your saved products</span>
            <button type="button" onClick={showAllProducts}>Show All</button>
          </div>
        )}

        {!wishlistOnly && (
          <div className="collection-controls">
            <button type="button" className={`filter-pill ${filter === "All" ? "selected" : ""}`} onClick={showAllProducts}>
              All
            </button>
            {MAIN_CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.key}
                className={`filter-pill ${filter === c.key ? "selected" : ""}`}
                onClick={() => selectCategory(c.key)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {!wishlistOnly && filter !== "All" && subcategories.length > 0 && (
          <div className="collection-subcategory-controls">
            <button
              type="button"
              className={`filter-pill ${subcategoryFilter === "All" ? "selected" : ""}`}
              onClick={() => setSubcategoryFilter("All")}
            >
              All {filter}
            </button>
            {subcategories.map((subcategory) => (
              <button
                type="button"
                key={subcategory}
                className={`filter-pill ${
                  normalize(subcategoryFilter) === normalize(subcategory) ? "selected" : ""
                }`}
                onClick={() => setSubcategoryFilter(subcategory)}
              >
                {subcategory}
              </button>
            ))}
          </div>
        )}

        {visible.length ? (
          <div className="product-grid-v2">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} />
            ))}
          </div>
        ) : (
          <div className="catalog-empty">
            <div className="empty-seal">GB</div>
            <h3>
              {wishlistOnly
                ? "Your wishlist is empty."
                : products.length === 0
                ? "Your Godavari collection is ready."
                : "No products found."}
            </h3>
            <p>
              {wishlistOnly
                ? "Tap the heart on any product to save it here."
                : products.length === 0
                ? "Connect your Google Sheet product source to populate this section."
                : "Try another category or subcategory."}
            </p>
            {wishlistOnly && (
              <button type="button" className="gold-button" onClick={showAllProducts}>
                EXPLORE PRODUCTS
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}