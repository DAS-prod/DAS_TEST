"use client";

import {
  Heart,
  Menu,
  ShoppingBag,
  UserRound,
  X,
  ChevronDown,
} from "lucide-react";
import { useEffect, useState } from "react";

const WISHLIST_KEY = "godavari-basket-wishlist";

function getWishlistCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const parsed = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default function Header({
  cartCount,
  onCart,
}: {
  cartCount: number;
  onCart: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const update = () => setWishlistCount(getWishlistCount());
    update();
    window.addEventListener("wishlist-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("wishlist-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  function scrollToSection(id: string) {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function goHome() {
    setOpen(false);
    if (window.location.pathname !== "/") {
      window.location.href = "/";
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openWishlist() {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("wishlist-filter", { detail: true }));
    setTimeout(() => scrollToSection("shop"), 50);
  }

  return (
    <>
      <header className="site-header">
        <div className="container-wide header-inner">
          <button
            type="button"
            className="mobile-menu-trigger"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button
            type="button"
            className="brand-mark"
            aria-label="Godavari Basket home"
            onClick={goHome}
          >
            <span className="brand-emblem">GB</span>
            <span className="brand-copy">
              <strong>GODAVARI</strong>
              <small>BASKET</small>
            </span>
          </button>

          <nav className="desktop-nav" aria-label="Primary navigation">
            <button type="button" className="active" onClick={goHome}>HOME</button>
            <button type="button" onClick={() => scrollToSection("collections")}>
              SHOP <ChevronDown size={12} />
            </button>
            <button type="button" onClick={() => scrollToSection("about")}>OUR STORY</button>
            <button type="button" onClick={() => { setOpen(false); window.location.href = "/combos"; }}>COMBOS</button>
            <button type="button" onClick={() => { setOpen(false); window.location.href = "/gifting"; }}>GIFTING</button>
            <button type="button" onClick={() => scrollToSection("blog")}>BLOG</button>
            <button type="button" onClick={() => scrollToSection("contact")}>CONTACT</button>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="header-icon"
              aria-label="Account"
              onClick={() => { window.location.href = "/account"; }}
            >
              <UserRound size={20} />
            </button>

            <button
              type="button"
              className="header-icon desktop-heart"
              onClick={openWishlist}
              aria-label="Wishlist"
            >
              <Heart size={19} fill={wishlistCount > 0 ? "currentColor" : "none"} />
              {wishlistCount > 0 && (
                <span>{wishlistCount > 99 ? "99+" : wishlistCount}</span>
              )}
            </button>

            <button
              type="button"
              className="header-icon cart-icon"
              onClick={onCart}
              aria-label="Basket"
            >
              <ShoppingBag size={21} />
              {cartCount > 0 && (
                <span>{cartCount > 99 ? "99+" : cartCount}</span>
              )}
            </button>
          </div>
        </div>

        {open && (
          <div className="mobile-panel">
            <button type="button" onClick={goHome}>HOME</button>
            <button type="button" onClick={() => scrollToSection("collections")}>SHOP</button>
            <button type="button" onClick={() => scrollToSection("about")}>OUR STORY</button>
            <button type="button" onClick={() => { setOpen(false); window.location.href = "/combos"; }}>COMBOS</button>
            <button type="button" onClick={() => { setOpen(false); window.location.href = "/gifting"; }}>GIFTING</button>
            <button type="button" onClick={() => scrollToSection("blog")}>BLOG</button>
            <button type="button" onClick={() => scrollToSection("contact")}>CONTACT</button>
            <button type="button" className="mobile-wishlist-link" onClick={openWishlist}>
              <Heart size={17} fill={wishlistCount > 0 ? "currentColor" : "none"} />
              <span>WISHLIST</span>
              {wishlistCount > 0 && <b>{wishlistCount > 99 ? "99+" : wishlistCount}</b>}
            </button>
          </div>
        )}
      </header>
    </>
  );
}
