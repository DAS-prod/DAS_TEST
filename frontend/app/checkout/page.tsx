"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  LockKeyhole,
  MapPin,
  CreditCard,
  Minus,
  Plus,
  Trash2,
  Truck,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { supabase } from "../../lib/supabase";
import type { Product } from "../../lib/products";

type CartItem = Product & {
  quantity: number;
};

type Address = {
  fullName: string;
  mobile: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  pincode: string;
  city: string;
  state: string;
};

declare global {
  interface Window {
    Cashfree?: (config: {
      mode: "sandbox" | "production";
    }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: string;
      }) => Promise<any> | any;
    };
  }
}

const FREE_DELIVERY_THRESHOLD = 999;
const PAID_DELIVERY_AMOUNT = 99;

const emptyAddress: Address = {
  fullName: "",
  mobile: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  pincode: "",
  city: "",
  state: "",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const [address, setAddress] =
    useState<Address>(emptyAddress);

  const [user, setUser] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /*
   * IMPORTANT
   *
   * Load the cart first.
   *
   * We use cartLoaded so the save-to-localStorage effect
   * cannot accidentally save [] before localStorage has been
   * read.
   */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(
        "godavari-basket-cart"
      );

      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch {
      console.error(
        "Unable to load saved cart."
      );
    } finally {
      setCartLoaded(true);
    }

    try {
      const raw = sessionStorage.getItem(
        "godavari-basket-checkout-address"
      );

      if (raw) {
        const parsed = JSON.parse(raw);

        if (parsed && typeof parsed === "object") {
          setAddress({
            ...emptyAddress,
            ...parsed,
          });
        }
      }
    } catch {
      console.error(
        "Unable to load saved checkout address."
      );
    }

    void supabase.auth
      .getUser()
      .then(({ data }) => {
        setUser(data.user || null);

        if (data.user?.email) {
          setAddress((current) => ({
            ...current,
            email:
              current.email ||
              data.user?.email ||
              "",
          }));
        }

        const fullName =
          data.user?.user_metadata?.full_name;

        if (fullName) {
          setAddress((current) => ({
            ...current,
            fullName:
              current.fullName ||
              fullName,
          }));
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /*
   * IMPORTANT
   *
   * Persist cart changes.
   *
   * The cart is NOT cleared here.
   *
   * cartLoaded prevents the initial empty state [] from
   * overwriting the real cart in localStorage.
   */
  useEffect(() => {
    if (!cartLoaded) return;

    try {
      localStorage.setItem(
        "godavari-basket-cart",
        JSON.stringify(cart)
      );
    } catch {
      console.error(
        "Unable to save cart."
      );
    }
  }, [cart, cartLoaded]);

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.quantity),
      0
    );
  }, [cart]);

  /*
   * Same shipping calculation used by create-order
   * and verify-order.
   *
   * Above ₹999 = FREE
   * ₹999 or below = ₹99
   */
  const shipping =
    subtotal > FREE_DELIVERY_THRESHOLD
      ? 0
      : cart.length > 0
      ? PAID_DELIVERY_AMOUNT
      : 0;

  const total = Number(
    (subtotal + shipping).toFixed(2)
  );

  const count = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity),
    0
  );

  function updateAddress(
    key: keyof Address,
    value: string
  ) {
    const next = {
      ...address,
      [key]: value,
    };

    setAddress(next);

    try {
      sessionStorage.setItem(
        "godavari-basket-checkout-address",
        JSON.stringify(next)
      );
    } catch {
      // Ignore storage errors.
    }
  }

  function qty(
    id: number,
    delta: number
  ) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  Number(item.quantity) +
                  delta,
              }
            : item
        )
        .filter(
          (item) =>
            Number(item.quantity) > 0
        )
    );
  }

  function removeItem(id: number) {
    setCart((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  }

  async function loadCashfree() {
    if (window.Cashfree) {
      return;
    }

    await new Promise<void>(
      (resolve, reject) => {
        const existing =
          document.querySelector(
            'script[data-cashfree="v3"]'
          );

        if (existing) {
          existing.addEventListener(
            "load",
            () => resolve(),
            { once: true }
          );

          existing.addEventListener(
            "error",
            () =>
              reject(
                new Error(
                  "Cashfree SDK failed to load."
                )
              ),
            { once: true }
          );

          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://sdk.cashfree.com/js/v3/cashfree.js";

        script.async = true;
        script.dataset.cashfree = "v3";

        script.onload = () =>
          resolve();

        script.onerror = () =>
          reject(
            new Error(
              "Cashfree SDK failed to load."
            )
          );

        document.head.appendChild(
          script
        );
      }
    );
  }

  async function submit(
    e: FormEvent
  ) {
    e.preventDefault();

    setMessage("");

    if (!user) {
      window.location.href =
        "/account?next=/checkout";
      return;
    }

    if (!cartLoaded) {
      setMessage(
        "Please wait while your cart is loading."
      );
      return;
    }

    if (!cart.length) {
      setMessage(
        "Your cart is empty."
      );
      return;
    }

    if (
      !address.fullName ||
      !address.mobile ||
      !address.email ||
      !address.addressLine1 ||
      !address.pincode ||
      !address.city ||
      !address.state
    ) {
      setMessage(
        "Please complete all required delivery details."
      );
      return;
    }

    setBusy(true);

    try {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      /*
       * IMPORTANT:
       *
       * We send the current cart to the server.
       *
       * We DO NOT remove the local cart here.
       */
      const response = await fetch(
        "/api/checkout/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            lines: cart.map((item) => ({
              productId: String(
                item.id
              ),
              quantity:
                Number(item.quantity),
            })),
            address,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create payment."
        );
      }

      /*
       * Save the exact cart used for this payment.
       *
       * This is NOT the same as clearing the cart.
       */
      try {
        sessionStorage.setItem(
          "godavari-basket-payment-order",
          data.cashfree.orderId
        );

        sessionStorage.setItem(
          "godavari-basket-checkout-lines",
          JSON.stringify(
            cart.map((item) => ({
              productId: String(
                item.id
              ),
              quantity:
                Number(item.quantity),
            }))
          )
        );

        sessionStorage.setItem(
          "godavari-basket-checkout-address",
          JSON.stringify(address)
        );
      } catch {
        // Payment can still continue.
      }

      await loadCashfree();

      if (!window.Cashfree) {
        throw new Error(
          "Cashfree checkout is unavailable."
        );
      }

      const cashfree =
        window.Cashfree({
          mode:
            data.cashfree.mode,
        });

      await cashfree.checkout({
        paymentSessionId:
          data.cashfree
            .paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to start checkout."
      );

      setBusy(false);
    }
  }

  /*
   * PAYMENT RETURN / VERIFICATION
   *
   * The cart is cleared ONLY after /api/checkout/verify
   * returns success.
   */
  useEffect(() => {
    const orderId =
      new URLSearchParams(
        window.location.search
      ).get("order_id");

    if (!orderId) {
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

        if (!session) {
          setMessage(
            "Please sign in again to verify your payment. Your cart has not been cleared."
          );
          return;
        }

        const storedLines =
          sessionStorage.getItem(
            "godavari-basket-checkout-lines"
          );

        const storedAddress =
          sessionStorage.getItem(
            "godavari-basket-checkout-address"
          );

        if (
          !storedLines ||
          !storedAddress
        ) {
          throw new Error(
            "Your checkout information could not be recovered. Your cart has not been cleared."
          );
        }

        const parsedLines =
          JSON.parse(storedLines);

        const parsedAddress =
          JSON.parse(
            storedAddress
          );

        const response =
          await fetch(
            "/api/checkout/verify",
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                cashfreeOrderId:
                  orderId,
                lines: parsedLines,
                address:
                  parsedAddress,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Payment was not successful. Your cart is still saved. Please retry the payment."
          );
        }

        if (cancelled) {
          return;
        }

        /*
         * PAYMENT VERIFIED SUCCESSFULLY.
         *
         * ONLY NOW clear the cart.
         */
        const successData = {
          orderNumber:
            result.order
              .order_number,
          amount: Number(
            result.order
              .total_amount
          ),
          currency:
            result.order
              .currency || "INR",
        };

        sessionStorage.setItem(
          "godavari-basket-order-success",
          JSON.stringify(
            successData
          )
        );

        /*
         * FINAL CART CLEAR.
         *
         * This is the ONLY place in the checkout
         * page where the cart is cleared automatically.
         */
        localStorage.removeItem(
          "godavari-basket-cart"
        );

        setCart([]);

        sessionStorage.removeItem(
          "godavari-basket-checkout-lines"
        );

        sessionStorage.removeItem(
          "godavari-basket-payment-order"
        );

        sessionStorage.removeItem(
          "godavari-basket-checkout-address"
        );

        window.location.href =
          "/?order_success=1";
      } catch (err) {
        if (!cancelled) {
          /*
           * PAYMENT FAILED / VERIFICATION FAILED.
           *
           * DO NOT CLEAR CART.
           */
          setMessage(
            err instanceof Error
              ? err.message
              : "Payment failed. Your cart is still saved. Please retry the payment."
          );

          setBusy(false);

          /*
           * Remove order_id from URL so refresh doesn't
           * repeatedly verify the same payment.
           */
          window.history.replaceState(
            {},
            "",
            "/checkout"
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-cream grid place-items-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-forest" />

          <p className="mt-4 text-sm text-gray-500">
            Loading checkout...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="border-b bg-white">
        <div className="container-wide flex items-center justify-between py-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-forest"
          >
            <ArrowLeft size={18} />
            Continue Shopping
          </Link>

          <span className="hidden text-xs uppercase tracking-[.2em] text-gray-400 sm:block">
            Godavari Basket Checkout
          </span>
        </div>
      </div>

      <div className="container-wide py-8 md:py-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[.25em] text-forest">
            Godavari Basket
          </p>

          <h1 className="serif mt-2 text-4xl md:text-5xl">
            Complete your order
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Secure checkout powered by
            Cashfree. Your payment is
            verified server-side before
            the order is saved as paid.
          </p>
        </div>

        {!user && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            Please{" "}
            <Link
              className="font-bold underline"
              href="/account?next=/checkout"
            >
              sign in or create an
              account
            </Link>{" "}
            before payment.
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            <div className="font-semibold">
              Payment could not be
              completed
            </div>

            <p className="mt-1">
              {message}
            </p>

            <p className="mt-2 text-xs text-red-700">
              Your cart and delivery
              details are still saved.
              Correct any issue and retry
              the payment.
            </p>
          </div>
        )}

        {success && (
          <div className="mt-6 flex gap-3 rounded-2xl border border-green-200 bg-green-50 p-5 text-sm text-green-900">
            <CheckCircle2 className="shrink-0" />

            <div>
              <b>
                Payment successful.
              </b>

              <div className="mt-1">
                Order #
                {success.order_number}{" "}
                is confirmed.
              </div>
            </div>
          </div>
        )}

        <form
          onSubmit={submit}
          className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]"
        >
          <section className="rounded-3xl border bg-white p-5 shadow-sm md:p-7">
            <div className="flex gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#eef3e8] text-forest">
                <MapPin size={20} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-forest">
                  Step 01
                </p>

                <h2 className="serif text-2xl">
                  Delivery Details
                </h2>

                <p className="text-sm text-gray-500">
                  Where should we deliver
                  your basket?
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {(
                [
                  [
                    "fullName",
                    "Full Name",
                    "text",
                  ],
                  [
                    "mobile",
                    "Phone Number",
                    "tel",
                  ],
                  [
                    "email",
                    "Email",
                    "email",
                  ],
                  [
                    "pincode",
                    "PIN Code",
                    "text",
                  ],
                  [
                    "city",
                    "City",
                    "text",
                  ],
                  [
                    "state",
                    "State",
                    "text",
                  ],
                ] as const
              ).map(
                ([
                  key,
                  label,
                  type,
                ]) => (
                  <label
                    key={key}
                    className="block"
                  >
                    <span className="mb-2 block text-sm font-semibold">
                      {label} *
                    </span>

                    <input
                      required
                      type={type}
                      value={
                        address[key]
                      }
                      onChange={(e) =>
                        updateAddress(
                          key,
                          e.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border bg-[#fafafa] px-4 text-sm outline-none focus:border-forest"
                    />
                  </label>
                )
              )}

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">
                  Address Line 1 *
                </span>

                <input
                  required
                  value={
                    address.addressLine1
                  }
                  onChange={(e) =>
                    updateAddress(
                      "addressLine1",
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border bg-[#fafafa] px-4 text-sm outline-none focus:border-forest"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Address Line 2
                </span>

                <input
                  value={
                    address.addressLine2
                  }
                  onChange={(e) =>
                    updateAddress(
                      "addressLine2",
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border bg-[#fafafa] px-4 text-sm outline-none focus:border-forest"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">
                  Landmark
                </span>

                <input
                  value={
                    address.landmark
                  }
                  onChange={(e) =>
                    updateAddress(
                      "landmark",
                      e.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border bg-[#fafafa] px-4 text-sm outline-none focus:border-forest"
                />
              </label>
            </div>
          </section>

          <aside className="rounded-3xl border bg-white p-5 shadow-sm md:p-7">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#eef3e8] text-forest">
                <CreditCard size={20} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-forest">
                  Step 02
                </p>

                <h2 className="serif text-2xl">
                  Your Order
                </h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 border-b pb-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl bg-cream object-contain p-2"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.size}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            item.id
                          )
                        }
                        className="text-gray-400"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <b>
                        {formatMoney(
                          Number(
                            item.price
                          ) *
                            Number(
                              item.quantity
                            )
                        )}
                      </b>

                      <div className="flex items-center rounded-lg border">
                        <button
                          type="button"
                          onClick={() =>
                            qty(
                              item.id,
                              -1
                            )
                          }
                          className="grid h-8 w-8 place-items-center"
                        >
                          <Minus
                            size={14}
                          />
                        </button>

                        <span className="min-w-6 text-center text-sm">
                          {
                            item.quantity
                          }
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            qty(
                              item.id,
                              1
                            )
                          }
                          className="grid h-8 w-8 place-items-center"
                        >
                          <Plus
                            size={14}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {cart.length > 0 ? (
              <>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>
                      Items
                    </span>

                    <span>
                      {count}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-500">
                    <span className="flex items-center gap-2">
                      <Truck
                        size={15}
                      />
                      Delivery
                    </span>

                    <span>
                      {shipping === 0
                        ? "FREE"
                        : formatMoney(
                            shipping
                          )}
                    </span>
                  </div>

                  {shipping > 0 && (
                    <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
                      Add more than ₹999
                      to your basket to
                      unlock free
                      delivery.
                    </p>
                  )}

                  {shipping === 0 &&
                    subtotal >
                      FREE_DELIVERY_THRESHOLD && (
                      <p className="rounded-xl bg-green-50 p-3 text-xs leading-5 text-green-800">
                        You unlocked
                        FREE delivery
                        because your
                        basket is above
                        ₹999.
                      </p>
                    )}

                  <div className="flex justify-between border-t pt-4 text-lg">
                    <b>Total</b>

                    <b>
                      {formatMoney(
                        total
                      )}
                    </b>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    busy || !user
                  }
                  className="mt-6 flex min-h-[54px] w-full items-center justify-center gap-3 rounded-xl bg-forest font-semibold text-white disabled:opacity-60"
                >
                  <LockKeyhole
                    size={18}
                  />

                  {busy
                    ? "Opening Cashfree..."
                    : "Pay Securely with Cashfree"}
                </button>

                <p className="mt-3 text-center text-xs text-gray-400">
                  UPI, cards and other
                  Cashfree-supported
                  payment methods.
                </p>
              </>
            ) : (
              <div className="py-10 text-center text-sm text-gray-500">
                Your cart is empty.
              </div>
            )}
          </aside>
        </form>
      </div>
    </main>
  );
}