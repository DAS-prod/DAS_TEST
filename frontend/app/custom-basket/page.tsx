"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Gift,
  MessageCircle,
  Minus,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getProducts, type Product } from "../../lib/products";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919618851406";

type Selected = { product: Product; quantity: number };

function cleanText(value: string, max: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export default function CustomBasketPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Record<number, Selected>>({});
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [giftMessage, setGiftMessage] = useState("");
  const [occasion, setOccasion] = useState("");
  const [instructions, setInstructions] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {
      setProducts([]);
      setNotice("Products could not be loaded. Please try again or contact us on WhatsApp.");
    });
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const q = query.trim().toLowerCase();
        const matchCategory = category === "All" || p.category === category;
        const hay = [p.name, p.category, p.subcategory, p.tags]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matchCategory && (!q || hay.includes(q));
      }),
    [products, query, category]
  );

  const entries = Object.values(selected);
  const totalItems = entries.reduce((n, x) => n + x.quantity, 0);

  function change(product: Product, delta: number) {
    setSelected((current) => {
      const now = current[product.id]?.quantity || 0;
      const next = Math.max(0, Math.min(50, now + delta));
      const copy = { ...current };
      if (next === 0) delete copy[product.id];
      else copy[product.id] = { product, quantity: next };
      return copy;
    });
  }

  function buildWhatsappUrl() {
    if (!entries.length) {
      setNotice("Choose at least one product before requesting a quote.");
      setStep(1);
      return "";
    }

    const lines = entries.map(
      ({ product, quantity }) =>
        `• ${product.name}${product.size ? ` (${product.size})` : ""} × ${quantity}`
    );

    const message = [
      "Hi Godavari Basket,",
      "",
      "I would like a customised basket. Please share the final price.",
      "",
      "Selected items:",
      ...lines,
      "",
      `Total quantity: ${totalItems}`,
      occasion ? `Occasion: ${cleanText(occasion, 80)}` : "",
      giftMessage ? `Gift message: ${cleanText(giftMessage, 220)}` : "",
      instructions ? `Special requirements: ${cleanText(instructions, 220)}` : "",
      "",
      "I understand the final price may vary based on products, customisation and packaging.",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  function requestQuote() {
    const url = buildWhatsappUrl();
    if (!url) return;
    setStep(4);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  const helpWhatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "Hi Godavari Basket, I need help creating a customised basket."
  )}`;

  return (
    <main className="custom-builder-page">
      <header className="custom-builder-nav">
        <div className="container-wide">
          <Link href="/">
            <ArrowLeft size={17} /> Back to store
          </Link>
          <Link href="/" className="serif custom-brand">
            GODAVARI BASKET
          </Link>
          <a href={helpWhatsapp} target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> Help
          </a>
        </div>
      </header>

      <section className="custom-builder-hero">
        <div className="container-wide">
          <p>
            <Sparkles size={14} /> Made around your choices
          </p>
          <h1 className="serif">Customised Gift Basket</h1>
          <span>
            Handpick your favourites, choose quantities and personalise the basket. Final pricing is shared personally on WhatsApp.
          </span>
        </div>
      </section>

      <div className="container-wide custom-stepper">
        {(
          [
            [1, "Choose"],
            [2, "Review"],
            [3, "Personalise"],
            [4, "Quote"],
          ] as Array<[number, string]>
        ).map(([n, label]) => (
          <button
            key={n}
            onClick={() => n <= 3 && setStep(n)}
            className={`${step === n ? "active" : ""} ${step > n ? "done" : ""}`}
          >
            <b>{step > n ? <Check size={14} /> : n}</b>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {notice && (
        <div className="gb-toast-wrap" role="status" aria-live="polite">
          <div className="gb-toast">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")} aria-label="Close message">
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <section className="container-wide custom-builder-layout">
          <div className="custom-products-pane">
            <div className="custom-toolbar">
              <div className="custom-search">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                />
              </div>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="custom-category-pills">
              {categories.slice(0, 8).map((c) => (
                <button
                  className={category === c ? "active" : ""}
                  onClick={() => setCategory(c)}
                  key={c}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="custom-product-grid">
              {filtered.map((p) => {
                const qty = selected[p.id]?.quantity || 0;
                return (
                  <article key={p.id} className={`custom-product-card ${qty ? "selected" : ""}`}>
                    <div className="custom-product-image">
                      <img src={p.image} alt={p.name} loading="lazy" />
                      {qty > 0 && (
                        <span>
                          <Check size={14} /> Added
                        </span>
                      )}
                    </div>
                    <div className="custom-product-body">
                      <small>{p.category}</small>
                      <h3>{p.name}</h3>
                      {p.size && <div className="custom-product-meta">{p.size}</div>}
                      <div className="custom-qty">
                        <button onClick={() => change(p, -1)} disabled={!qty} aria-label={`Remove ${p.name}`}>
                          <Minus size={15} />
                        </button>
                        <b>{qty}</b>
                        <button onClick={() => change(p, 1)} aria-label={`Add ${p.name}`}>
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="custom-summary-card custom-summary-no-price">
            <p className="eyebrow">Your selection</p>
            <h2 className="serif">
              {totalItems ? `${totalItems} items selected` : "Start with a favourite"}
            </h2>
            <div className="custom-summary-lines">
              {entries.slice(0, 6).map((x) => (
                <div key={x.product.id}>
                  <span>{x.product.name}</span>
                  <strong>× {x.quantity}</strong>
                </div>
              ))}
              {entries.length > 6 && <small>+ {entries.length - 6} more products</small>}
            </div>
            <div className="custom-quote-note">
              Final pricing may vary based on products, customisation and packaging.
            </div>
            <button
              disabled={!entries.length}
              onClick={() => {
                setStep(2);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Review Basket <ArrowRight size={16} />
            </button>
            <a href={helpWhatsapp} target="_blank" rel="noreferrer">
              <MessageCircle size={16} /> Need help? WhatsApp us
            </a>
          </aside>
        </section>
      )}

      {step === 2 && (
        <section className="container-wide custom-review-wrap">
          <div className="custom-review-card">
            <div className="custom-review-head">
              <div>
                <p className="eyebrow">Review selection</p>
                <h2 className="serif">Your Custom Basket</h2>
              </div>
              <button onClick={() => setStep(1)}>Add more products</button>
            </div>

            <div className="custom-review-list">
              {entries.map(({ product, quantity }) => (
                <div key={product.id} className="custom-review-row custom-review-row-no-price">
                  <img src={product.image} alt="" />
                  <div className="custom-review-name">
                    <small>{product.category}</small>
                    <strong>{product.name}</strong>
                    <span>{product.size}</span>
                  </div>
                  <div className="custom-review-qty">
                    <button onClick={() => change(product, -1)} aria-label={`Reduce ${product.name}`}>
                      <Minus size={14} />
                    </button>
                    <b>{quantity}</b>
                    <button onClick={() => change(product, 1)} aria-label={`Increase ${product.name}`}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <button className="remove" onClick={() => change(product, -quantity)} aria-label={`Remove ${product.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="custom-review-footer custom-review-footer-no-price">
              <div>
                <span>Selected quantity</span>
                <strong>{totalItems} items</strong>
              </div>
              <button
                onClick={() => {
                  setStep(3);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Personalise Basket <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="container-wide custom-personalise">
          <div className="custom-personalise-card">
            <div className="custom-personalise-copy">
              <p className="eyebrow">Optional personal touch</p>
              <h2 className="serif">Make it feel more yours.</h2>
              <p>Tell us what you have in mind. We’ll confirm the final quote with you personally.</p>

              <label>
                <span>Occasion</span>
                <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                  <option value="">No occasion</option>
                  <option>Birthday</option>
                  <option>Anniversary</option>
                  <option>Festival</option>
                  <option>Corporate Gift</option>
                  <option>Thank You</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                <span>Gift message</span>
                <textarea
                  maxLength={220}
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  placeholder="A short message for the recipient..."
                />
                <small>{giftMessage.length}/220</small>
              </label>

              <label>
                <span>Special requirements</span>
                <textarea
                  maxLength={220}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Packing preferences, colour theme or anything we should know..."
                />
                <small>{instructions.length}/220</small>
              </label>
            </div>

            <div className="custom-personalise-summary">
              <div className="gift-icon">
                <Gift size={30} />
              </div>
              <h3 className="serif">Ready for a custom quote</h3>
              <p>{totalItems} selected items. No price is shown because every customised basket is quoted individually.</p>
              <div>
                <span>What happens next</span>
                <strong>We’ll confirm pricing and packing on WhatsApp</strong>
              </div>
              <button onClick={requestQuote}>
                <MessageCircle size={17} /> Request Custom Quote <ArrowRight size={16} />
              </button>
              <button className="back" onClick={() => setStep(2)}>
                Back to review
              </button>
            </div>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="container-wide custom-success">
          <div className="custom-success-card">
            <div className="custom-success-check">
              <Check size={28} />
            </div>
            <p className="eyebrow">Quote request</p>
            <h2 className="serif">Continue with us on WhatsApp.</h2>
            <p>
              Your selected items and customisation details will be included automatically. We’ll share the final price after reviewing your request.
            </p>
            <div>
              <button className="custom-success-whatsapp" onClick={requestQuote}>
                <MessageCircle size={17} /> Open WhatsApp
              </button>
              <Link href="/">Continue Shopping</Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
