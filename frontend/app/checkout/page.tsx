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

const CART_KEY = "godavari-basket-cart";
const ADDRESS_KEY = "godavari-basket-checkout-address";
const PAYMENT_ORDER_KEY = "godavari-basket-payment-order";
const CHECKOUT_LINES_KEY =
  "godavari-basket-checkout-lines";

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
   * --------------------------------------------------
   * INITIAL LOAD
   * --------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    async function initialise() {
      /*
       * Load cart.
       */
      try {
        const raw =
          localStorage.getItem(CART_KEY);

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

      /*
       * Load saved address.
       */
      try {
        const raw =
          sessionStorage.getItem(
            ADDRESS_KEY
          );

        if (raw) {
          const parsed = JSON.parse(raw);

          if (
            parsed &&
            typeof parsed === "object"
          ) {
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

      /*
       * Get authenticated user.
       */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(user || null);

      if (user?.email) {
        setAddress((current) => ({
          ...current,
          email:
            current.email ||
            user.email ||
            "",
        }));
      }

      const fullName =
        user?.user_metadata?.full_name;

      if (fullName) {
        setAddress((current) => ({
          ...current,
          fullName:
            current.fullName ||
            fullName,
        }));
      }

      setLoading(false);
    }

    void initialise();

    /*
     * Listen for Supabase auth changes.
     *
     * This is particularly important immediately
     * after login.
     */
    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user || null);
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * --------------------------------------------------
   * SAVE CART
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!cartLoaded) return;

    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
      );
    } catch {
      console.error(
        "Unable to save cart."
      );
    }
  }, [cart, cartLoaded]);

  /*
   * --------------------------------------------------
   * TOTALS
   * --------------------------------------------------
   */

  const subtotal = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(item.quantity),
      0
    );
  }, [cart]);

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

  /*
   * --------------------------------------------------
   * ADDRESS
   * --------------------------------------------------
   */

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
        ADDRESS_KEY,
        JSON.stringify(next)
      );
    } catch {
      // Ignore storage errors.
    }
  }

  /*
   * --------------------------------------------------
   * CART
   * --------------------------------------------------
   */

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

  /*
   * --------------------------------------------------
   * CASHFREE SDK
   * --------------------------------------------------
   */

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

  /*
   * --------------------------------------------------
   * START PAYMENT
   * --------------------------------------------------
   */

  async function submit(
    e: FormEvent
  ) {
    e.preventDefault();

    setMessage("");

    /*
     * Get the CURRENT session immediately before
     * starting payment.
     *
     * This prevents a stale user state from being used.
     */
    const {
      data: { session },
      error: sessionError,
    } =
      await supabase.auth.getSession();

    if (
      sessionError ||
      !session?.user
    ) {
      setUser(null);

      setMessage(
        "Your login session is not available. Please sign in again before payment."
      );

      return;
    }

    setUser(session.user);

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
      /*
       * Save checkout information BEFORE opening
       * Cashfree.
       */
      sessionStorage.setItem(
        CHECKOUT_LINES_KEY,
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
        ADDRESS_KEY,
        JSON.stringify(address)
      );

      /*
       * Create server-side Cashfree order.
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
       * Save Cashfree order ID.
       */
      sessionStorage.setItem(
        PAYMENT_ORDER_KEY,
        data.cashfree.orderId
      );

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
   * --------------------------------------------------
   * VERIFY PAYMENT AFTER CASHFREE RETURN
   * --------------------------------------------------
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

    async function verifyPayment() {
      try {
        setBusy(true);
        setMessage("");

        /*
         * IMPORTANT:
         *
         * Ask Supabase to refresh/restore the current
         * authentication session after returning from
         * Cashfree.
         */
        const {
          data: {
            session,
          },
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (
          sessionError ||
          !session?.access_token ||
          !session.user
        ) {
          /*
           * Try getUser as a second attempt.
           */
          const {
            data: {
              user: refreshedUser,
            },
          } =
            await supabase.auth.getUser();

          if (!refreshedUser) {
            throw new Error(
              "Your login session could not be restored after payment. The payment may have succeeded, but the order could not be verified automatically. Please contact support with your Cashfree order ID: " +
                orderId
            );
          }
        }

        /*
         * Get a fresh session again after getUser().
         */
        const {
          data: {
            session: freshSession,
          },
        } =
          await supabase.auth.getSession();

        if (
          !freshSession?.access_token
        ) {
          throw new Error(
            "Your login session could not be restored after payment. The payment may have succeeded, but the order could not be verified automatically. Please contact support with your Cashfree order ID: " +
              orderId
          );
        }

        /*
         * Recover checkout data.
         */
        const storedLines =
          sessionStorage.getItem(
            CHECKOUT_LINES_KEY
          );

        const storedAddress =
          sessionStorage.getItem(
            ADDRESS_KEY
          );

        if (
          !storedLines ||
          !storedAddress
        ) {
          throw new Error(
            "Your checkout information could not be recovered. Your cart has not been cleared. Cashfree order: " +
              orderId
          );
        }

        let parsedLines;
        let parsedAddress;

        try {
          parsedLines =
            JSON.parse(
              storedLines
            );

          parsedAddress =
            JSON.parse(
              storedAddress
            );
        } catch {
          throw new Error(
            "Saved checkout information is invalid. Your cart has not been cleared. Cashfree order: " +
              orderId
          );
        }

        /*
         * Verify payment on server.
         */
        const response =
          await fetch(
            "/api/checkout/verify",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization: `Bearer ${freshSession.access_token}`,
              },

              body: JSON.stringify({
                cashfreeOrderId:
                  orderId,

                lines:
                  parsedLines,

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
              "Payment could not be verified. Your cart has not been cleared."
          );
        }

        if (cancelled) {
          return;
        }

        /*
         * ------------------------------------------------
         * PAYMENT + DATABASE ORDER SUCCESS
         * ------------------------------------------------
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
         * ONLY NOW clear cart.
         */
        localStorage.removeItem(
          CART_KEY
        );

        setCart([]);

        sessionStorage.removeItem(
          CHECKOUT_LINES_KEY
        );

        sessionStorage.removeItem(
          PAYMENT_ORDER_KEY
        );

        sessionStorage.removeItem(
          ADDRESS_KEY
        );

        window.location.href =
          "/?order_success=1";
      } catch (err) {
        if (!cancelled) {
          setMessage(
            err instanceof Error
              ? err.message
              : "Payment verification failed. Your cart is still saved."
          );

          setBusy(false);

          /*
           * Do NOT clear cart.
           */

          window.history.replaceState(
            {},
            "",
            "/checkout"
          );
        }
      }
    }

    void verifyPayment();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * --------------------------------------------------
   * LOADING
   * --------------------------------------------------
   */

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

  /*
   * --------------------------------------------------
   * UI
   * --------------------------------------------------
   */

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
              Payment verification issue
            </div>

            <p className="mt-1">
              {message}
            </p>

            <p className="mt-2 text-xs text-red-700">
              Your cart and delivery
              details have NOT been
              cleared.
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
                    <span>Items</span>
                    <span>{count}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-500">
                    <span className="flex items-center gap-2">
                      <Truck size={15} />
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
                        FREE delivery.
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
                    ? "Processing..."
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
