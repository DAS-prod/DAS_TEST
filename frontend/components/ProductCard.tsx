"use client";

import {
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import type { Product } from "../lib/products";

const WISHLIST_KEY = "godavari-basket-wishlist";

function getWishlist(): number[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(WISHLIST_KEY);

    if (!stored) return [];

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

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
    updated = [...wishlist, productId];
    liked = true;
  }

  localStorage.setItem(
    WISHLIST_KEY,
    JSON.stringify(updated)
  );

  window.dispatchEvent(
    new CustomEvent("wishlist-updated", {
      detail: updated,
    })
  );

  return liked;
}

function getPrice(
  product: Product,
  size: string
): number {
  if (size === "250g") {
    const value = Number(product["250g"]);

    if (
      Number.isFinite(value) &&
      value > 0
    ) {
      return value;
    }
  }

  if (size === "500g") {
    const value = Number(product["500g"]);

    if (
      Number.isFinite(value) &&
      value > 0
    ) {
      return value;
    }
  }

  if (size === "1kg") {
    const value = Number(product["1kg"]);

    if (
      Number.isFinite(value) &&
      value > 0
    ) {
      return value;
    }
  }

  return Number(product.price) || 0;
}

function getAvailableSizes(
  product: Product
): string[] {
  const sizes: string[] = [];

  const price250 = Number(product["250g"]);
  const price500 = Number(product["500g"]);
  const price1kg = Number(product["1kg"]);

  if (
    Number.isFinite(price250) &&
    price250 > 0
  ) {
    sizes.push("250g");
  }

  if (
    Number.isFinite(price500) &&
    price500 > 0
  ) {
    sizes.push("500g");
  }

  if (
    Number.isFinite(price1kg) &&
    price1kg > 0
  ) {
    sizes.push("1kg");
  }

  return sizes;
}

export default function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  const availableSizes = useMemo(
    () => getAvailableSizes(product),
    [product]
  );

  const defaultSize =
    availableSizes.length > 0
      ? availableSizes[0]
      : product.size || "";

  const [selectedSize, setSelectedSize] =
    useState(defaultSize);

  const [details, setDetails] =
    useState(false);

  const [liked, setLiked] =
    useState(false);

  const [quantity, setQuantity] =
    useState(1);

  useEffect(() => {
    const firstSize =
      getAvailableSizes(product)[0] ||
      product.size ||
      "";

    setSelectedSize(firstSize);
  }, [product]);

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

  const selectedPrice = getPrice(
    product,
    selectedSize
  );

  function getSelectedProduct(): Product {
    return {
      ...product,
      size: selectedSize,
      price: selectedPrice,
    };
  }

  function handleWishlistClick(
    e: MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    e.stopPropagation();

    const newLikedState =
      toggleWishlistItem(
        Number(product.id)
      );

    setLiked(newLikedState);
  }

  function handleSizeClick(
    e: MouseEvent<HTMLButtonElement>,
    size: string
  ) {
    e.preventDefault();
    e.stopPropagation();

    setSelectedSize(size);
  }

  function handleOpenDetails() {
    setDetails(true);
  }

  function add() {
    const selectedProduct =
      getSelectedProduct();

    for (
      let i = 0;
      i < quantity;
      i++
    ) {
      onAdd(selectedProduct);
    }

    setQuantity(1);
    setDetails(false);
  }

  return (
    <>
      {/* ==================================================
          PRODUCT CARD
      ================================================== */}

      <article
        onClick={handleOpenDetails}
        className="
          group
          relative
          cursor-pointer
          overflow-hidden
          rounded-[24px]
          border
          border-[#e9e1d1]
          bg-white
          shadow-[0_8px_30px_rgba(38,55,43,0.06)]
          transition-all
          duration-300
          hover:-translate-y-1
          hover:shadow-[0_18px_45px_rgba(38,55,43,0.12)]
        "
      >
        {/* IMAGE */}

        <div
          className="
            relative
            aspect-[4/3]
            overflow-hidden
            bg-[#f1eadc]
          "
        >
          {product.badge && (
            <span
              className="
                absolute
                left-4
                top-4
                z-10
                rounded-full
                bg-[#073b27]
                px-3
                py-1.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[#f4d78c]
                shadow-sm
              "
            >
              {product.badge}
            </span>
          )}

          {/* WISHLIST */}

          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={
              liked
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            aria-pressed={liked}
            className="
              absolute
              right-4
              top-4
              z-10
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white/95
              text-[#6d6a5f]
              shadow-[0_5px_18px_rgba(0,0,0,0.08)]
              backdrop-blur-sm
              transition-all
              duration-200
              hover:scale-105
              hover:text-[#073b27]
            "
          >
            <Heart
              size={18}
              strokeWidth={1.7}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
            />
          </button>

          {/* IMAGE */}

          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-700
                group-hover:scale-[1.04]
              "
              onError={(e) => {
                e.currentTarget.style.display =
                  "none";
              }}
            />
          ) : (
            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                bg-[#f1eadc]
                text-center
              "
            >
              <div>
                <div
                  className="
                    mx-auto
                    mb-3
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#d7cdb9]
                    text-[#806d48]
                  "
                >
                  <ShoppingBag
                    size={23}
                    strokeWidth={1.4}
                  />
                </div>

                <span
                  className="
                    text-xs
                    tracking-[0.12em]
                    text-[#827b6d]
                  "
                >
                  GODAVARI BASKET
                </span>
              </div>
            </div>
          )}

          <div
            className="
              absolute
              bottom-4
              left-4
              rounded-full
              bg-[#073b27]/90
              px-3
              py-1.5
              text-[9px]
              font-medium
              uppercase
              tracking-[0.12em]
              text-white
              opacity-0
              transition-opacity
              duration-300
              group-hover:opacity-100
            "
          >
            Tap to explore
          </div>
        </div>

        {/* PRODUCT BODY */}

        <div className="p-5 pb-4">
          <span
            className="
              text-[9px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-[#9a8965]
            "
          >
            {product.category}
          </span>

          <h3
            className="
              mt-2
              min-h-[48px]
              text-[18px]
              font-semibold
              leading-[1.3]
              tracking-[-0.02em]
              text-[#20251f]
            "
          >
            {product.name}
          </h3>

          {/* RATING */}

          <div
            className="
              mt-2
              flex
              min-h-[18px]
              items-center
              gap-1
              text-[11px]
              text-[#8a806d]
            "
          >
            {product.rating > 0 && (
              <>
                <Star
                  size={12}
                  fill="currentColor"
                  className="text-[#b48a32]"
                />

                <span>
                  {product.rating.toFixed(1)}
                </span>

                <span>
                  ({product.reviews})
                </span>
              </>
            )}
          </div>

          {/* SIZE SELECTORS */}

          {availableSizes.length > 0 && (
            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-2
              "
            >
              {availableSizes.map(
                (size) => {
                  const isSelected =
                    selectedSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) =>
                        handleSizeClick(
                          e,
                          size
                        )
                      }
                      className={`
                        rounded-full
                        border
                        px-3.5
                        py-1.5
                        text-[11px]
                        font-medium
                        tracking-wide
                        transition-all
                        duration-200
                        ${
                          isSelected
                            ? "border-[#073b27] bg-[#073b27] text-white shadow-sm"
                            : "border-[#ddd4c3] bg-[#faf8f3] text-[#5f5a50] hover:border-[#073b27] hover:text-[#073b27]"
                        }
                      `}
                    >
                      {size}
                    </button>
                  );
                }
              )}
            </div>
          )}

          {/* PRICE */}

          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              gap-3
              border-t
              border-[#eee8dc]
              pt-4
            "
          >
            <div>
              <span
                className="
                  block
                  text-[9px]
                  uppercase
                  tracking-[0.14em]
                  text-[#9b9487]
                "
              >
                {selectedSize || "Price"}
              </span>

              <strong
                className="
                  mt-0.5
                  block
                  text-[19px]
                  font-semibold
                  tracking-[-0.02em]
                  text-[#073b27]
                "
              >
                ₹
                {selectedPrice.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                onAdd(
                  getSelectedProduct()
                );
              }}
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-[#caa85c]
                bg-white
                px-4
                py-2.5
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.08em]
                text-[#073b27]
                transition-all
                duration-200
                hover:border-[#073b27]
                hover:bg-[#073b27]
                hover:text-white
              "
            >
              <ShoppingBag
                size={14}
                strokeWidth={1.8}
              />

              Add
            </button>
          </div>
        </div>
      </article>

      {/* ==================================================
          PRODUCT DETAILS MODAL
      ================================================== */}

      {details && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-[#07150f]/60
            p-3
            backdrop-blur-md
            sm:p-4
          "
          onClick={() =>
            setDetails(false)
          }
        >
          {/* SMALLER + SCROLLABLE MODAL */}

          <div
            className="
              relative
              grid
              w-full
              max-w-3xl
              max-h-[90vh]
              overflow-y-auto
              overflow-x-hidden
              rounded-[24px]
              border
              border-white/50
              bg-[#fbfaf7]
              shadow-[0_30px_100px_rgba(0,0,0,0.25)]
              md:grid-cols-2
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* CLOSE BUTTON */}

            <button
              type="button"
              onClick={() =>
                setDetails(false)
              }
              aria-label="Close product details"
              className="
                sticky
                right-3
                top-3
                z-30
                ml-auto
                -mb-10
                mr-3
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-white/95
                text-[#353830]
                shadow-md
                transition
                hover:scale-105
                md:absolute
                md:right-4
                md:top-4
                md:ml-0
                md:mr-0
              "
            >
              <X size={18} />
            </button>

            {/* MODAL IMAGE */}

            <div
              className="
                relative
                min-h-[220px]
                bg-[#f1eadc]
                sm:min-h-[280px]
                md:min-h-[420px]
              "
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="
                    h-full
                    min-h-[220px]
                    w-full
                    object-cover
                    sm:min-h-[280px]
                    md:min-h-[420px]
                  "
                />
              ) : (
                <div
                  className="
                    flex
                    h-full
                    min-h-[220px]
                    items-center
                    justify-center
                    sm:min-h-[280px]
                    md:min-h-[420px]
                  "
                >
                  <div className="text-center">
                    <div
                      className="
                        mx-auto
                        mb-4
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#d4c7ad]
                        text-[#806d48]
                      "
                    >
                      <ShoppingBag
                        size={26}
                        strokeWidth={1.3}
                      />
                    </div>

                    <span
                      className="
                        text-xs
                        uppercase
                        tracking-[0.18em]
                        text-[#857963]
                      "
                    >
                      Godavari Basket
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* MODAL CONTENT */}

            <div
              className="
                flex
                flex-col
                justify-center
                p-5
                sm:p-6
                md:p-8
              "
            >
              {/* CATEGORY */}

              <span
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.2em]
                  text-[#9a8965]
                "
              >
                {product.category}
              </span>

              {/* NAME */}

              <h2
                className="
                  mt-2
                  text-2xl
                  font-semibold
                  leading-[1.15]
                  tracking-[-0.03em]
                  text-[#20251f]
                  sm:text-3xl
                "
              >
                {product.name}
              </h2>

              {/* RATING */}

              {product.rating > 0 && (
                <div
                  className="
                    mt-3
                    flex
                    items-center
                    gap-1.5
                    text-sm
                    text-[#716b60]
                  "
                >
                  <Star
                    size={14}
                    fill="currentColor"
                    className="text-[#b48a32]"
                  />

                  {product.rating.toFixed(1)}

                  <span>
                    ({product.reviews} reviews)
                  </span>
                </div>
              )}

              {/* SIZE */}

              {availableSizes.length > 0 && (
                <div className="mt-5">
                  <div
                    className="
                      mb-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.16em]
                      text-[#777166]
                    "
                  >
                    Select size
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(
                      (size) => {
                        const isSelected =
                          selectedSize ===
                          size;

                        const sizePrice =
                          getPrice(
                            product,
                            size
                          );

                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() =>
                              setSelectedSize(
                                size
                              )
                            }
                            className={`
                              min-w-[76px]
                              rounded-xl
                              border
                              px-3
                              py-2.5
                              text-left
                              transition-all
                              ${
                                isSelected
                                  ? "border-[#073b27] bg-[#073b27] text-white shadow-md"
                                  : "border-[#ddd5c5] bg-white text-[#34372f] hover:border-[#073b27]"
                              }
                            `}
                          >
                            <span
                              className="
                                block
                                text-xs
                                font-semibold
                              "
                            >
                              {size}
                            </span>

                            <span
                              className={`
                                mt-1
                                block
                                text-[11px]
                                ${
                                  isSelected
                                    ? "text-[#e8d394]"
                                    : "text-[#8a806d]"
                                }
                              `}
                            >
                              ₹
                              {sizePrice.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* SELECTED PRICE */}

              <div
                className="
                  mt-5
                  border-t
                  border-[#e7e0d4]
                  pt-4
                "
              >
                <span
                  className="
                    block
                    text-[10px]
                    uppercase
                    tracking-[0.16em]
                    text-[#958b7b]
                  "
                >
                  {selectedSize
                    ? `Price · ${selectedSize}`
                    : "Price"}
                </span>

                <strong
                  className="
                    mt-1
                    block
                    text-2xl
                    font-semibold
                    tracking-[-0.03em]
                    text-[#806021]
                  "
                >
                  ₹
                  {selectedPrice.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              {/* DESCRIPTION */}

              {product.description && (
                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-[#6f6a60]
                  "
                >
                  {product.description}
                </p>
              )}

              {/* INGREDIENTS */}

              {product.ingredients && (
                <div className="mt-3">
                  <span
                    className="
                      text-xs
                      font-semibold
                      text-[#30342d]
                    "
                  >
                    Ingredients
                  </span>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-[#777167]
                    "
                  >
                    {product.ingredients}
                  </p>
                </div>
              )}

              {/* BENEFITS */}

              {product.benefits && (
                <div className="mt-3">
                  <span
                    className="
                      text-xs
                      font-semibold
                      text-[#30342d]
                    "
                  >
                    Why you'll love it
                  </span>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-[#777167]
                    "
                  >
                    {product.benefits}
                  </p>
                </div>
              )}

              {/* QUANTITY */}

              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    text-sm
                    font-medium
                    text-[#30342d]
                  "
                >
                  Quantity
                </span>

                <div
                  className="
                    flex
                    items-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-[#dcd3c2]
                    bg-white
                  "
                >
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
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      text-[#56584f]
                      hover:bg-[#f5f1e8]
                    "
                  >
                    <Minus size={15} />
                  </button>

                  <span
                    className="
                      flex
                      h-10
                      min-w-[40px]
                      items-center
                      justify-center
                      border-x
                      border-[#e4ddcf]
                      text-sm
                      font-semibold
                    "
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (q) => q + 1
                      )
                    }
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      text-[#56584f]
                      hover:bg-[#f5f1e8]
                    "
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* ADD TO BASKET */}

              <button
                type="button"
                onClick={add}
                className="
                  mt-4
                  flex
                  min-h-[48px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#073b27]
                  px-5
                  py-3
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-white
                  shadow-[0_8px_25px_rgba(7,59,39,0.18)]
                  transition-all
                  hover:bg-[#0a4b32]
                "
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