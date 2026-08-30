"use client";

import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { Product } from "../lib/products";

export type CartItem = Product & { quantity: number };

export default function CartDrawer({
  open,
  items,
  onClose,
  onChange,
}: {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onChange: (id: number, delta: number) => void;
}) {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const itemCount = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  if (!open) return null;

  function goToCheckout() {
    if (!items.length) return;

    localStorage.setItem(
      "godavari-basket-cart",
      JSON.stringify(items)
    );

    window.location.href = "/checkout";
  }

  return (
    <div className="fixed inset-0 z-[200]">

      {/* BACKDROP */}

      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* DRAWER */}

      <aside
        className="
          absolute
          bottom-0
          right-0
          flex
          h-[92vh]
          w-full
          flex-col
          overflow-hidden
          rounded-t-[28px]
          bg-white
          shadow-2xl
          md:top-0
          md:h-full
          md:max-w-md
          md:rounded-none
        "
      >

        {/* MOBILE HANDLE */}

        <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-gray-300 md:hidden" />

        {/* HEADER */}

        <div className="flex items-center justify-between border-b px-5 py-5 md:px-6">

          <div>
            <h2 className="serif text-2xl">
              Your Cart
            </h2>

            {items.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full bg-gray-50 transition hover:bg-gray-100"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>

        </div>

        {/* CART CONTENT */}

        <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6">

          {items.length === 0 ? (

            <div className="grid h-full place-items-center text-center">

              <div>

                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#f8f6ef]">
                  <ShoppingBag
                    size={30}
                    className="text-forest"
                  />
                </div>

                <h3 className="serif mt-5 text-2xl">
                  Your cart is empty
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Add something delicious to get started.
                </p>

                <button
                  onClick={onClose}
                  className="mt-6 rounded-xl bg-forest px-6 py-3 font-semibold text-white"
                >
                  Continue Shopping
                </button>

              </div>

            </div>

          ) : (

            <div className="space-y-5">

              {items.map((item) => (

                <div
                  key={item.id}
                  className="flex gap-3 border-b pb-5"
                >

                  {/* IMAGE */}

                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#f8f6ef] p-2">

                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply"
                    />

                  </div>

                  {/* DETAILS */}

                  <div className="min-w-0 flex-1">

                    <div className="pr-2 font-semibold leading-5">
                      {item.name}
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      {item.size}
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">

                      <div className="font-bold">
                        ₹{item.price * item.quantity}
                      </div>

                      {/* QUANTITY */}

                      <div className="flex items-center rounded-xl border">

                        <button
                          onClick={() =>
                            onChange(item.id, -1)
                          }
                          className="grid h-10 w-10 place-items-center"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>

                        <span className="min-w-6 text-center text-sm font-semibold">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            onChange(item.id, 1)
                          }
                          className="grid h-10 w-10 place-items-center"
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>

                      </div>

                    </div>

                  </div>

                  {/* DELETE */}

                  <button
                    onClick={() =>
                      onChange(item.id, -item.quantity)
                    }
                    className="grid h-10 w-10 shrink-0 place-items-center self-start rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={17} />
                  </button>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* FOOTER */}

        {items.length > 0 && (

          <div className="border-t bg-white px-5 pb-5 pt-4 md:px-6">

            {/* TOTAL */}

            <div className="mb-4 flex items-center justify-between">

              <span className="text-gray-600">
                Total
              </span>

              <span className="text-2xl font-bold">
                ₹{total}
              </span>

            </div>

            {/* CHECKOUT */}

            <button
              onClick={goToCheckout}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-forest py-3.5 font-semibold text-white transition hover:scale-[1.01]"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={onClose}
              className="mt-2 w-full py-3 text-sm font-medium text-gray-500"
            >
              Continue Shopping
            </button>

          </div>

        )}

      </aside>

    </div>
  );
}