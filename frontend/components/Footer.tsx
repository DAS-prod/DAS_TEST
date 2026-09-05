"use client";

import { Instagram, MessageCircle, Youtube } from "lucide-react";

const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919618851406";
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "";
const YOUTUBE_URL = process.env.NEXT_PUBLIC_YOUTUBE_URL || "";
const BLOG_URL = process.env.NEXT_PUBLIC_BLOG_URL || "";

const whatsappUrl = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const bulkOrderMessage =
  "Hi Godavari Basket, I am interested in placing a bulk order. Please share the details.";

export default function Footer() {
  const values = [
    ["✦", "100% AUTHENTIC", "Godavari products"],
    ["◌", "NO PRESERVATIVES", "Only natural ingredients"],
    ["⌁", "TRADITIONAL RECIPES", "Made the traditional way"],
    ["◈", "SUPPORT LOCAL", "Empowering local communities"],
  ];

  return (
    <footer id="contact" className="footer-v2">
      <div className="footer-values">
        <div className="container-wide footer-values-grid">
          {values.map(([icon, title, desc]) => (
            <div key={title} className="footer-value">
              <span>{icon}</span>
              <div>
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-wide footer-main">
        <div className="footer-brand">
          <div className="footer-logo">
            GODAVARI <span>BASKET</span>
          </div>
          <p>
            More than a basket of products — a way to experience the authentic
            character of the Godavari region.
          </p>

          <div className="footer-contact-card">
            <strong>Need help or want to order in bulk?</strong>
            <a href={whatsappUrl(bulkOrderMessage)} target="_blank" rel="noreferrer">
              <MessageCircle size={15} /> WhatsApp us · +91 9618851406
            </a>
          </div>

          <div className="footer-social" aria-label="Social links">
            {INSTAGRAM_URL && (
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram size={15} />
              </a>
            )}
            {YOUTUBE_URL && (
              <a href={YOUTUBE_URL} target="_blank" rel="noreferrer" aria-label="YouTube">
                <Youtube size={15} />
              </a>
            )}
            <a href={whatsappUrl("Hi Godavari Basket, I need some help.")} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <MessageCircle size={15} />
            </a>
          </div>
        </div>

        <div>
          <h3>SHOP</h3>
          <button type="button" onClick={() => scrollToSection("shop")}>All Products</button>
          <button type="button" onClick={() => scrollToSection("shop")}>Sweets</button>
          <button type="button" onClick={() => scrollToSection("shop")}>Snacks</button>
          <button type="button" onClick={() => scrollToSection("shop")}>Pickles</button>
          <button type="button" onClick={() => scrollToSection("shop")}>Podis</button>
          <button type="button" onClick={() => scrollToSection("shop")}>Ghee &amp; Oils</button>
          <a href="/gifting">Gifting</a>
        </div>

        <div>
          <h3>GODAVARI BASKET</h3>
          <button type="button" onClick={() => scrollToSection("about")}>Our Story</button>
          <button type="button" onClick={() => scrollToSection("collections")}>Explore the Godavari</button>
          <button type="button" onClick={() => scrollToSection("soil")}>Taste of the Soil</button>
          <a href="/gifting">Gifting</a>
          {BLOG_URL ? (
            <a href={BLOG_URL}>Blog</a>
          ) : (
            <button type="button" onClick={() => scrollToSection("blog")}>Blog</button>
          )}
        </div>

        <div>
          <h3>CUSTOMER SUPPORT</h3>
          <button type="button" onClick={() => scrollToSection("contact")}>Contact Us</button>
          <a href={whatsappUrl(bulkOrderMessage)} target="_blank" rel="noreferrer">Bulk Orders</a>
          <button type="button" onClick={() => scrollToSection("contact")}>Shipping</button>
          <button type="button" onClick={() => scrollToSection("contact")}>Returns / Policies</button>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container-wide">
          <span>© 2026 Godavari Basket. All rights reserved.</span>
          <span>Rooted in the Godavari region, made for everywhere.</span>
        </div>
      </div>
    </footer>
  );
}
