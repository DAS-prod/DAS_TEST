
"use client";

import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "../lib/products";

const WISHLIST_KEY = "godavari-basket-wishlist";

function getWishlist(): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(WISHLIST_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(Number)
      .filter((id) => Number.isFinite(id));
  } catch {
    return [];
  }
}

function toggleWishlistItem(id: number): boolean {
  const wishlist = getWishlist();
  const productId = Number(id);

  let updated: number[];
  let liked: boolean;

  if (wishlist.includes(productId)) {
    updated = wishlist.filter(
      (item) => item !== productId
    );

    liked = false;
  } else {
    updated = [
      ...wishlist,
      productId,
    ];

    liked = true;
  }

  localStorage.setItem(
    WISHLIST_KEY,
    JSON.stringify(updated)
  );

  /*
   * Tell Header, ProductGrid and other ProductCards
   * that the wishlist has changed.
   */
  window.dispatchEvent(
    new CustomEvent("wishlist-updated", {
      detail: updated,
    })
  );

  return liked;
}

export default function ProductCard({
  product,
  onAdd,
  onCartOpen,
}: {
  product: Product;
  onAdd: (p: Product) => void;
  onCartOpen: () => void;
}) {
  const [details, setDetails] =
    useState(false);

  const [liked, setLiked] =
    useState(false);

  const [quantity, setQuantity] =
    useState(1);

  /*
   * Load the saved wishlist when this card appears.
   */
  useEffect(() => {
    const updateLikedState = () => {
      const wishlist = getWishlist();

      setLiked(
        wishlist.includes(
          Number(product.id)
        )
      );
    };

    updateLikedState();

    window.addEventListener(
      "wishlist-updated",
      updateLikedState
    );

    return () => {
      window.removeEventListener(
        "wishlist-updated",
        updateLikedState
      );
    };
  }, [product.id]);

  function handleWishlistClick(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    /*
     * Prevent the click from opening
     * the product modal.
     */
    e.preventDefault();
    e.stopPropagation();

    const newLikedState =
      toggleWishlistItem(
        Number(product.id)
      );

    setLiked(newLikedState);
  }

  function handleOpenDetails() {
    setDetails(true);
  }

  /*
   * Add the selected quantity to the basket,
   * then automatically open the existing cart.
   */
  function add() {
    for (
      let i = 0;
      i < quantity;
      i++
    ) {
      onAdd(product);
    }

    setQuantity(1);
    setDetails(false);

    /*
     * Automatically open the cart after
     * the product has been added.
     */
    onCartOpen();
  }

  /*
   * Direct ADD TO BASKET button.
   */
  function handleQuickAdd(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    e.stopPropagation();

    onAdd(product);

    /*
     * Automatically open the cart.
     */
    onCartOpen();
  }

  return (
    <>
      <article
        className="product-card-v2"
        onClick={handleOpenDetails}
      >
        <div className="product-image-v2">

          {product.badge && (
            <span className="product-badge-v2">
              {product.badge}
            </span>
          )}

          {/* =========================
              WISHLIST HEART
          ========================== */}
          <button
            type="button"
            className={`product-heart ${
              liked ? "liked" : ""
            }`}
            onClick={handleWishlistClick}
            aria-label={
              liked
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            aria-pressed={liked}
          >
            <Heart
              size={17}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
          />

          <div className="product-touch-label">
            Tap to explore
          </div>
        </div>

        <div className="product-body-v2">

          <span className="product-category-v2">
            {product.category}
          </span>

          <h3>{product.name}</h3>

          <div className="rating-row">
            {product.rating > 0 && (
              <>
                <Star
                  size={12}
                  fill="currentColor"
                />

                {" "}

                {product.rating.toFixed(
                  1
                )}

                {" "}

                <span>
                  ({product.reviews})
                </span>
              </>
            )}
          </div>

          <div className="product-price-row">

            <strong>
              ₹
              {product.price.toLocaleString(
                "en-IN"
              )}
            </strong>

            <button
              type="button"
              onClick={handleQuickAdd}
            >
              <ShoppingBag size={14} />

              ADD TO BASKET
            </button>

          </div>
        </div>
      </article>

      {/* =========================================
          PRODUCT DETAILS MODAL
      ========================================== */}

      {details && (
        <div
          className="product-modal-backdrop"
          onClick={() =>
            setDetails(false)
          }
        >
          <div
            className="product-modal-v2"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              type="button"
              className="modal-close-v2"
              onClick={() =>
                setDetails(false)
              }
              aria-label="Close product details"
            >
              <X size={20} />
            </button>

            <div className="modal-image-v2">
              <img
                src={product.image}
                alt={product.name}
              />
            </div>

            <div className="modal-copy-v2">

              <span className="product-category-v2">
                {product.category}
              </span>

              <h2>{product.name}</h2>

              <strong className="modal-price-v2">
                ₹
                {product.price.toLocaleString(
                  "en-IN"
                )}
              </strong>

              <p>
                {product.description}
              </p>

              {product.ingredients && (
                <p>
                  <b>
                    Ingredients
                  </b>

                  <br />

                  {product.ingredients}
                </p>
              )}

              {product.benefits && (
                <p>
                  <b>
                    Why you'll love it
                  </b>

                  <br />

                  {product.benefits}
                </p>
              )}

              <div className="quantity-v2">

                <span>
                  Quantity
                </span>

                <div>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (q) =>
                          Math.max(
                            1,
                            q - 1
                          )
                      )
                    }
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>

                  <b>{quantity}</b>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (q) => q + 1
                      )
                    }
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>

                </div>
              </div>

              <button
                type="button"
                className="gold-button modal-add-v2"
                onClick={add}
              >
                <ShoppingBag size={16} />

                ADD {quantity} TO BASKET
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  );
}

