"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Zap,
} from "lucide-react";
import { getProduct, Product } from "../../../lib/products";

export default function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProduct(Number(params.id));
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.id]);

  function addToCart() {
    if (!product) return;

    const saved = localStorage.getItem("godavari-basket-cart");
    const cart = saved ? JSON.parse(saved) : [];

    const existing = cart.find(
      (item: Product & { quantity: number }) =>
        item.id === product.id
    );

    let updatedCart;

    if (existing) {
      updatedCart = cart.map(
        (item: Product & { quantity: number }) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          ...product,
          quantity,
        },
      ];
    }

    localStorage.setItem(
      "godavari-basket-cart",
      JSON.stringify(updatedCart)
    );

    alert("Product added to cart!");
  }

  function buyNow() {
    if (!product) return;

    addToCart();
    window.location.href = "/checkout";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f6ef] py-20">
        <div className="container-wide text-center">
          <p className="text-gray-500">
            Loading product...
          </p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#f8f6ef] py-20">
        <div className="container-wide text-center">
          <h1 className="serif text-4xl">
            Product not found
          </h1>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-forest px-6 py-3 font-semibold text-white"
          >
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">

      {/* BACK */}

      <div className="container-wide pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-forest"
        >
          <ArrowLeft size={18} />
          Back to Shop
        </Link>
      </div>

      {/* PRODUCT */}

      <section className="container-wide grid gap-12 py-10 lg:grid-cols-2 lg:py-16">

        {/* IMAGE */}

        <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden rounded-[32px] bg-[#f8f6ef]">

          {product.badge && (
            <div className="absolute left-6 top-6 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white">
              {product.badge}
            </div>
          )}

          <img
            src={product.image}
            alt={product.name}
            className="max-h-[430px] max-w-[80%] object-contain mix-blend-multiply transition duration-500 hover:scale-105"
          />

        </div>

        {/* DETAILS */}

        <div className="flex flex-col justify-center">

          <div className="text-sm font-semibold uppercase tracking-[.2em] text-forest">
            {product.category}
          </div>

          <h1 className="serif mt-3 text-4xl leading-tight md:text-5xl">
            {product.name}
          </h1>

          {/* RATING */}

          <div className="mt-5 flex items-center gap-2">

            <div className="flex items-center gap-1">

              <Star
                size={18}
                fill="#D99B24"
                className="text-[#D99B24]"
              />

              <span className="font-semibold">
                {product.rating}
              </span>

            </div>

            <span className="text-gray-400">
              ({product.reviews} reviews)
            </span>

          </div>

          {/* PRICE */}

          <div className="mt-7 flex items-end gap-3">

            <span className="text-4xl font-bold">
              ₹{product.price}
            </span>

            <span className="mb-1 text-gray-500">
              {product.size}
            </span>

          </div>

          {/* DESCRIPTION */}

          <p className="mt-6 max-w-xl text-base leading-7 text-gray-600">
            {product.description}
          </p>

          {/* INGREDIENTS */}

          {product.ingredients && (
            <div className="mt-6 rounded-xl bg-[#f8f6ef] p-5">

              <h3 className="font-semibold">
                Ingredients
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {product.ingredients}
              </p>

            </div>
          )}

          {/* BENEFITS */}

          {product.benefits && (
            <div className="mt-3 rounded-xl bg-[#f8f6ef] p-5">

              <h3 className="font-semibold">
                Benefits
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">
                {product.benefits}
              </p>

            </div>
          )}

          {/* QUANTITY */}

          <div className="mt-8">

            <div className="mb-2 text-sm font-semibold">
              Quantity
            </div>

            <div className="flex w-fit items-center gap-5 rounded-xl border px-4 py-3">

              <button
                onClick={() =>
                  setQuantity((current) =>
                    Math.max(1, current - 1)
                  )
                }
              >
                <Minus size={18} />
              </button>

              <span className="min-w-5 text-center font-semibold">
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity((current) => current + 1)
                }
              >
                <Plus size={18} />
              </button>

            </div>

          </div>

          {/* BUTTONS */}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">

            <button
              onClick={addToCart}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-forest py-4 font-semibold text-forest transition hover:bg-forest hover:text-white"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>

            <button
              onClick={buyNow}
              className="flex items-center justify-center gap-2 rounded-xl bg-forest py-4 font-semibold text-white transition hover:scale-[1.01]"
            >
              <Zap size={20} />
              Buy Now
            </button>

          </div>

        </div>

      </section>

      {/* ABOUT */}

      <section className="border-t bg-[#f8f6ef]">

        <div className="container-wide py-14">

          <h2 className="serif text-3xl">
            About this product
          </h2>

          <p className="mt-5 max-w-3xl leading-8 text-gray-600">
            {product.description}
          </p>

        </div>

      </section>

    </main>
  );
}