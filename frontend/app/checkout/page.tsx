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
  Tag,
  MessageCircle,
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

type Line = {
  productId: string;
  size?: string;
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

const CART_KEY =
  "godavari-basket-cart";

const ADDRESS_KEY =
  "godavari-basket-checkout-address";

const PAYMENT_ORDER_KEY =
  "godavari-basket-payment-order";

const CHECKOUT_LINES_KEY =
  "godavari-basket-checkout-lines";

const COUPON_KEY = "godavari-basket-coupon";
const APPLIED_COUPON_KEY = "godavari-basket-applied-coupon";
const REFERRAL_KEY = "godavari-basket-referral";

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
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(Number(value || 0));
}

/*
 * ==================================================
 * CHECKOUT RECOVERY HELPERS
 * ==================================================
 */

function saveCheckoutRecoveryData(
  lines: Line[],
  address: Address
) {
  const linesJson =
    JSON.stringify(lines);

  const addressJson =
    JSON.stringify(address);

  /*
   * Primary storage.
   */
  try {
    sessionStorage.setItem(
      CHECKOUT_LINES_KEY,
      linesJson
    );

    sessionStorage.setItem(
      ADDRESS_KEY,
      addressJson
    );
  } catch (error) {
    console.error(
      "Unable to save session checkout data:",
      error
    );
  }

  /*
   * Backup storage.
   */
  try {
    localStorage.setItem(
      CHECKOUT_LINES_KEY,
      linesJson
    );

    localStorage.setItem(
      ADDRESS_KEY,
      addressJson
    );
  } catch (error) {
    console.error(
      "Unable to save local checkout recovery data:",
      error
    );
  }
}

function getCheckoutRecoveryData() {
  let storedLines: string | null =
    null;

  let storedAddress: string | null =
    null;

  /*
   * Try sessionStorage first.
   */
  try {
    storedLines =
      sessionStorage.getItem(
        CHECKOUT_LINES_KEY
      );

    storedAddress =
      sessionStorage.getItem(
        ADDRESS_KEY
      );
  } catch (error) {
    console.error(
      "Unable to read session checkout data:",
      error
    );
  }

  /*
   * Fallback to localStorage.
   */
  if (
    !storedLines ||
    !storedAddress
  ) {
    try {
      storedLines =
        storedLines ||
        localStorage.getItem(
          CHECKOUT_LINES_KEY
        );

      storedAddress =
        storedAddress ||
        localStorage.getItem(
          ADDRESS_KEY
        );
    } catch (error) {
      console.error(
        "Unable to read local checkout recovery data:",
        error
      );
    }
  }

  return {
    storedLines,
    storedAddress,
  };
}

function clearCheckoutRecoveryData() {
  try {
    sessionStorage.removeItem(
      CHECKOUT_LINES_KEY
    );

    sessionStorage.removeItem(
      PAYMENT_ORDER_KEY
    );

    sessionStorage.removeItem(
      ADDRESS_KEY
    );
    sessionStorage.removeItem(APPLIED_COUPON_KEY);
  } catch (error) {
    console.error(
      "Unable to clear session checkout data:",
      error
    );
  }

  try {
    localStorage.removeItem(
      CHECKOUT_LINES_KEY
    );

    localStorage.removeItem(
      ADDRESS_KEY
    );
    localStorage.removeItem(APPLIED_COUPON_KEY);
  } catch (error) {
    console.error(
      "Unable to clear local checkout recovery data:",
      error
    );
  }
}



export default function CheckoutPage() {
  const [cart, setCart] =
    useState<CartItem[]>([]);

  const [cartLoaded, setCartLoaded] =
    useState(false);

  const [address, setAddress] =
    useState<Address>(
      emptyAddress
    );

  const [user, setUser] =
    useState<any>(null);

  const [busy, setBusy] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [success, setSuccess] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponAppliedSubtotal, setCouponAppliedSubtotal] = useState<number | null>(null);

  /*
   * --------------------------------------------------
   * INITIAL LOAD
   * --------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    async function initialise() {
      try {
        const savedCoupon = localStorage.getItem(COUPON_KEY);
        if (savedCoupon) setCouponCode(savedCoupon);
      } catch {}
      /*
       * Load cart.
       */

      try {
        const raw =
          localStorage.getItem(
            CART_KEY
          );

        if (raw) {
          const parsed =
            JSON.parse(raw);

          if (
            Array.isArray(parsed)
          ) {
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
          ) ||
          localStorage.getItem(
            ADDRESS_KEY
          );

        if (raw) {
          const parsed =
            JSON.parse(raw);

          if (
            parsed &&
            typeof parsed ===
              "object"
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
      } =
        await supabase.auth.getUser();

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
        user?.user_metadata
          ?.full_name;

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
     * Listen for auth changes.
     */

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(
            session?.user || null
          );
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
  }, [
    cart,
    cartLoaded,
  ]);

  /*
   * --------------------------------------------------
   * TOTALS
   * --------------------------------------------------
   */

  const subtotal = useMemo(() => {
    return cart.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(item.price) *
          Number(
            item.quantity
          ),
      0
    );
  }, [cart]);

  const shipping =
    subtotal >
    FREE_DELIVERY_THRESHOLD
      ? 0
      : cart.length > 0
      ? PAID_DELIVERY_AMOUNT
      : 0;

  const total = Number(
    (
      subtotal - couponDiscount +
      shipping
    ).toFixed(2)
  );

  const count = cart.reduce(
    (
      sum,
      item
    ) =>
      sum +
      Number(item.quantity),
    0
  );

  useEffect(() => {
    if (couponDiscount > 0 && couponAppliedSubtotal !== null && Math.abs(couponAppliedSubtotal - subtotal) > 0.001) {
      setCouponDiscount(0);
      setCouponAppliedSubtotal(null);
      setCouponMessage("Your cart changed. Apply the coupon again.");
    }
  }, [subtotal, couponDiscount, couponAppliedSubtotal]);

  async function applyCoupon() {
    setCouponBusy(true);
    setCouponMessage("");
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await response.json();
      if (!response.ok || !data.valid) {
        setCouponDiscount(0);
        throw new Error(data.message || data.error || "Coupon could not be applied.");
      }
      setCouponDiscount(Number(data.discountAmount || 0));
      setCouponAppliedSubtotal(subtotal);
      setCouponCode(String(data.code || couponCode).toUpperCase());
      localStorage.setItem(COUPON_KEY, String(data.code || couponCode).toUpperCase());
      setCouponMessage(data.message || "Coupon applied.");
    } catch (error) {
      setCouponMessage(error instanceof Error ? error.message : "Unable to apply coupon.");
    } finally { setCouponBusy(false); }
  }

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

      /*
       * Keep backup copy.
       */
      localStorage.setItem(
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
    size: string,
    delta: number
  ) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id && item.size === size
            ? {
                ...item,
                quantity:
                  Number(
                    item.quantity
                  ) +
                  delta,
              }
            : item
        )
        .filter(
          (item) =>
            Number(
              item.quantity
            ) > 0
        )
    );
  }

  function removeItem(
    id: number,
    size: string
  ) {
    setCart((current) =>
      current.filter(
        (item) =>
          !(item.id === id && item.size === size)
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
      (
        resolve,
        reject
      ) => {
        const existing =
          document.querySelector(
            'script[data-cashfree="v3"]'
          );

        if (existing) {
          existing.addEventListener(
            "load",
            () => resolve(),
            {
              once: true,
            }
          );

          existing.addEventListener(
            "error",
            () =>
              reject(
                new Error(
                  "Cashfree SDK failed to load."
                )
              ),
            {
              once: true,
            }
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

        script.dataset.cashfree =
          "v3";

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
     * Get CURRENT session immediately
     * before starting payment.
     */

    const {
      data: {
        session,
      },
      error:
        sessionError,
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
       * ------------------------------------------------
       * SAVE CHECKOUT RECOVERY DATA
       * ------------------------------------------------
       */

      const checkoutLines: Line[] =
        cart.map((item) => ({
          productId:
            String(item.id),

          size: item.size,

          quantity:
            Number(
              item.quantity
            ),
        }));

      saveCheckoutRecoveryData(
        checkoutLines,
        address
      );

      /*
       * ------------------------------------------------
       * CREATE SERVER-SIDE CASHFREE ORDER
       * ------------------------------------------------
       */

      const response =
        await fetch(
          "/api/checkout/create-order",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                lines:
                  checkoutLines,

                address,
                couponCode: couponDiscount > 0 ? couponCode : "",
                referralCode: localStorage.getItem(REFERRAL_KEY) || "",
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

      /* Save the exact coupon used for this Cashfree amount. */
      const appliedCoupon = String(data.checkout?.couponCode || "");
      sessionStorage.setItem(APPLIED_COUPON_KEY, appliedCoupon);
      localStorage.setItem(APPLIED_COUPON_KEY, appliedCoupon);

      /*
       * Save Cashfree order ID.
       */

      sessionStorage.setItem(
        PAYMENT_ORDER_KEY,
        data.cashfree.orderId
      );

      /*
       * Backup Cashfree order ID.
       */

      localStorage.setItem(
        PAYMENT_ORDER_KEY,
        data.cashfree.orderId
      );

      /*
       * Load Cashfree.
       */

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

        redirectTarget:
          "_self",
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
         * ------------------------------------------------
         * RESTORE AUTHENTICATION
         * ------------------------------------------------
         */

        let {
          data: {
            session,
          },
          error:
            sessionError,
        } =
          await supabase.auth.getSession();

        if (
          sessionError ||
          !session?.access_token ||
          !session.user
        ) {
          /*
           * Try getUser.
           */

          const {
            data: {
              user:
                refreshedUser,
            },
          } =
            await supabase.auth.getUser();

          if (
            !refreshedUser
          ) {
            throw new Error(
              "Your login session could not be restored after payment. The payment may have succeeded, but the order could not be verified automatically. Please contact support with your Cashfree order ID: " +
                orderId
            );
          }

          /*
           * Get session again.
           */

          const {
            data: {
              session:
                restoredSession,
            },
          } =
            await supabase.auth.getSession();

          session =
            restoredSession;
        }

        if (
          !session?.access_token ||
          !session.user
        ) {
          throw new Error(
            "Your login session could not be restored after payment. The payment may have succeeded, but the order could not be verified automatically. Please contact support with your Cashfree order ID: " +
              orderId
          );
        }

        /*
         * Keep user state current.
         */

        setUser(
          session.user
        );

        /*
         * ------------------------------------------------
         * RECOVER CHECKOUT DATA
         * ------------------------------------------------
         */

        const {
          storedLines,
          storedAddress,
        } =
          getCheckoutRecoveryData();

        if (
          !storedLines ||
          !storedAddress
        ) {
          throw new Error(
            "Your checkout information could not be recovered. Your cart has not been cleared. Cashfree order: " +
              orderId
          );
        }

        let parsedLines: Line[];
        let parsedAddress: Address;

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
         * Validate recovered data before sending it.
         */

        if (
          !Array.isArray(
            parsedLines
          ) ||
          parsedLines.length === 0
        ) {
          throw new Error(
            "Saved checkout cart is invalid. Your cart has not been cleared. Cashfree order: " +
              orderId
          );
        }

        if (
          !parsedAddress ||
          !parsedAddress.fullName ||
          !parsedAddress.mobile ||
          !parsedAddress.email ||
          !parsedAddress.addressLine1 ||
          !parsedAddress.pincode ||
          !parsedAddress.city ||
          !parsedAddress.state
        ) {
          throw new Error(
            "Saved delivery details are incomplete. Your cart has not been cleared. Cashfree order: " +
              orderId
          );
        }

        /*
         * ------------------------------------------------
         * VERIFY PAYMENT ON SERVER
         * ------------------------------------------------
         */

        const response =
          await fetch(
            "/api/checkout/verify",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${session.access_token}`,
              },

              body:
                JSON.stringify({
                  cashfreeOrderId:
                    orderId,

                  lines:
                    parsedLines,

                  address:
                    parsedAddress,
                  couponCode: sessionStorage.getItem(APPLIED_COUPON_KEY) || localStorage.getItem(APPLIED_COUPON_KEY) || "",
                  referralCode: localStorage.getItem(REFERRAL_KEY) || "",
                  }),
            }
          );

        const responseText = await response.text();
        let result: any = {};
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch {
          result = {};
        }

        if (!response.ok) {
          if (response.status === 504 || response.status === 502 || response.status === 503) {
            throw new Error(
              "Payment verification is taking longer than expected. Your payment may already be successful. Please use Check Payment Status before attempting another payment."
            );
          }
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

          amount:
            Number(
              result.order
                .total_amount
            ),

          currency:
            result.order
              .currency ||
            "INR",
        };

        /*
         * Save success information first.
         */

        sessionStorage.setItem(
          "godavari-basket-order-success",
          JSON.stringify(
            successData
          )
        );

        /*
         * ------------------------------------------------
         * ONLY AFTER SERVER SUCCESS:
         * CLEAR CART
         * ------------------------------------------------
         */

        localStorage.removeItem(
          CART_KEY
        );

        setCart([]);

        clearCheckoutRecoveryData();

        /*
         * Redirect home.
         */

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
           * DO NOT clear cart.
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
          <div className="fixed inset-x-4 top-5 z-[300] mx-auto max-w-lg rounded-2xl border border-red-200 bg-white p-5 text-sm text-red-800 shadow-2xl sm:top-8">
            <button
              type="button"
              onClick={() => setMessage("")}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-gray-500 hover:bg-gray-100"
              aria-label="Close message"
            >
              ×
            </button>
            <div className="pr-8 font-semibold">Payment verification issue</div>
            <p className="mt-2 leading-6">{message}</p>
            <p className="mt-2 text-xs text-red-700">
              Your cart and delivery details have NOT been cleared.
            </p>
            {message.includes("Check Payment Status") && (
              <button
                type="button"
                onClick={() => {
                  const savedOrderId = sessionStorage.getItem(PAYMENT_ORDER_KEY) || localStorage.getItem(PAYMENT_ORDER_KEY);
                  if (savedOrderId) window.location.href = `/checkout?order_id=${encodeURIComponent(savedOrderId)}`;
                }}
                className="mt-4 rounded-xl bg-forest px-4 py-2.5 text-xs font-bold text-white"
              >
                Check Payment Status
              </button>
            )}
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
              {cart.map(
                (item) => (
                  <div
                    key={`${item.id}-${item.size}`}
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
                              item.id,
                              item.size
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
                                item.size,
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
                                item.size,
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
                )
              )}
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

                  <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>

                  <div className="rounded-2xl border bg-[#fbfaf6] p-4">
                    <div className="mb-2 flex items-center gap-2 font-semibold text-forest"><Tag size={15}/>Have a coupon?</div>
                    <div className="flex gap-2"><input value={couponCode} onChange={(e)=>{setCouponCode(e.target.value.toUpperCase());setCouponDiscount(0);}} placeholder="Enter coupon code" className="h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm outline-none focus:border-forest"/><button type="button" onClick={applyCoupon} disabled={couponBusy || !couponCode.trim()} className="rounded-lg bg-forest px-4 text-xs font-bold text-white disabled:opacity-50">{couponBusy?"Checking...":"Apply"}</button></div>
                    {couponMessage&&<p className={`mt-2 text-xs ${couponDiscount>0?"text-green-700":"text-amber-700"}`}>{couponMessage}</p>}
                    <p className="mt-2 text-[11px] text-gray-500">5% offer · Minimum order ₹1,000 · Use while the coupon is active.</p>
                  </div>
                  {couponDiscount>0&&<div className="flex justify-between font-semibold text-green-700"><span>Coupon discount</span><span>-{formatMoney(couponDiscount)}</span></div>}

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                    <strong>Estimated delivery: 2–5 working days</strong>
                    <div>Carefully packed and dispatched from Godavari.</div>
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
                    <b>
                      Total
                    </b>

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
                    busy ||
                    !user
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

                <p className="mt-3 text-center text-xs text-gray-400">UPI, cards and other Cashfree-supported payment methods.</p>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919618851406"}?text=${encodeURIComponent("Hi Godavari Basket, I need help with checkout.")}`} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-green-700"><MessageCircle size={15}/>Need checkout help? WhatsApp us</a>
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
