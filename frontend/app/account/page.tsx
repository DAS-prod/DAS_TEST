"use client";

import Link from "next/link";

import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Chrome,
  KeyRound,
  LogOut,
  MessageCircle,
  Package,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  supabase,
} from "../../lib/supabase";

const WHATSAPP_NUMBER =
  process.env
    .NEXT_PUBLIC_WHATSAPP_NUMBER ||
  "919618851406";

type OrderItem = {
  id: string;

  product_id: string;

  product_name: string;

  product_image:
    | string
    | null;

  unit_price: number;

  quantity: number;

  line_total: number;
};

type Order = {
  id: string;

  order_number: string;

  status: string;

  payment_status: string;

  subtotal: number;

  shipping_amount: number;

  total_amount: number;

  currency: string;

  created_at: string;

  delivery_name: string;

  delivery_mobile: string;

  delivery_email: string;

  order_items: OrderItem[];
};

function money(
  value: number,
  currency = "INR"
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style:
        "currency",

      currency,

      maximumFractionDigits:
        2,
    }
  ).format(
    Number(
      value || 0
    )
  );
}

function date(
  value: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",
    }
  ).format(
    new Date(value)
  );
}

function title(
  value: string
) {
  return value
    ? value
        .charAt(0)
        .toUpperCase() +
        value.slice(1)
    : "Pending";
}

function normalizePhone(
  value: string
) {
  const compact =
    value
      .trim()
      .replace(
        /[\s()-]/g,
        ""
      );

  if (
    /^\+\d{10,15}$/.test(
      compact
    )
  ) {
    return compact;
  }

  const digits =
    compact.replace(
      /\D/g,
      ""
    );

  if (
    /^\d{10}$/.test(
      digits
    )
  ) {
    return `+91${digits}`;
  }

  if (
    /^91\d{10}$/.test(
      digits
    )
  ) {
    return `+${digits}`;
  }

  return "";
}

export default function AccountPage() {
  const [
    user,
    setUser,
  ] =
    useState<any>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    ordersLoading,
    setOrdersLoading,
  ] =
    useState(false);

  const [
    orders,
    setOrders,
  ] =
    useState<Order[]>(
      []
    );

  const [
    expanded,
    setExpanded,
  ] =
    useState<
      string | null
    >(null);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    busy,
    setBusy,
  ] =
    useState(false);

  const [
    mode,
    setMode,
  ] =
    useState<
      "login" | "signup"
    >("login");

  const [
    identifier,
    setIdentifier,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    name,
    setName,
  ] =
    useState("");

  const [
    signupIdentifier,
    setSignupIdentifier,
  ] =
    useState("");

  const [
    next,
    setNext,
  ] =
    useState("/");

  useEffect(() => {
    const requestedNext =
      new URLSearchParams(
        window.location
          .search
      ).get("next") ||
      "/";

    setNext(
      requestedNext
    );

    let mounted =
      true;

    async function load() {
      const {
        data: {
          user:
            currentUser,
        },
      } =
        await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      setUser(
        currentUser ||
          null
      );

      if (
        currentUser
      ) {
        if (
          requestedNext !==
            "/" &&
          requestedNext !==
            "/account"
        ) {
          window.location.replace(
            requestedNext
          );

          return;
        }

        await loadOrders(
          currentUser.id
        );
      }

      if (mounted) {
        setLoading(
          false
        );
      }
    }

    void load();

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          session
        ) => {
          if (
            !mounted
          ) {
            return;
          }

          const currentUser =
            session?.user ||
            null;

          setUser(
            currentUser
          );

          if (
            currentUser
          ) {
            void loadOrders(
              currentUser.id
            );
          } else {
            setOrders(
              []
            );
          }
        }
      );

    return () => {
      mounted =
        false;

      subscription.unsubscribe();
    };
  }, []);

  async function loadOrders(
    userId: string
  ) {
    setOrdersLoading(
      true
    );

    try {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "orders"
          )
          .select(`
            id,
            order_number,
            status,
            payment_status,
            subtotal,
            shipping_amount,
            total_amount,
            currency,
            created_at,
            delivery_name,
            delivery_mobile,
            delivery_email,
            order_items(
              id,
              product_id,
              product_name,
              product_image,
              unit_price,
              quantity,
              line_total
            )
          `)
          .eq(
            "user_id",
            userId
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          );

      if (error) {
        throw error;
      }

      setOrders(
        (data ||
          []) as Order[]
      );
    } catch (error) {
      setMessage(
        error instanceof
        Error
          ? error.message
          : "Unable to load orders."
      );
    } finally {
      setOrdersLoading(
        false
      );
    }
  }

  async function loginSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    setBusy(true);
    setMessage("");

    try {
      const value =
        identifier.trim();

      if (!value) {
        throw new Error(
          "Enter your email address or mobile number."
        );
      }

      if (
        password.length <
        6
      ) {
        throw new Error(
          "Enter your password."
        );
      }

      const credentials =
        value.includes(
          "@"
        )
          ? {
              email:
                value.toLowerCase(),

              password,
            }
          : {
              phone:
                normalizePhone(
                  value
                ),

              password,
            };

      if (
        "phone" in
          credentials &&
        !credentials.phone
      ) {
        throw new Error(
          "Enter a valid mobile number."
        );
      }

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          credentials as any
        );

      if (error) {
        throw error;
      }

      if (
        !data.user
      ) {
        throw new Error(
          "Unable to sign in."
        );
      }

      window.location.href =
        next;
    } catch (error) {
      setMessage(
        error instanceof
        Error
          ? error.message
          : "Unable to sign in."
      );
    } finally {
      setBusy(false);
    }
  }

  async function signupSubmit(
    e: FormEvent
  ) {
    e.preventDefault();

    setBusy(true);
    setMessage("");

    try {
      const value =
        signupIdentifier.trim();

      if (!value) {
        throw new Error(
          "Enter your email address or mobile number."
        );
      }

      if (
        name.trim()
          .length <
        2
      ) {
        throw new Error(
          "Enter your full name."
        );
      }

      if (
        password.length <
        8
      ) {
        throw new Error(
          "Password must contain at least 8 characters."
        );
      }

      const response =
        await fetch(
          "/api/auth/register",
          {
            method:
              "POST",

            headers: {
              "content-type":
                "application/json",
            },

            body:
              JSON.stringify(
                {
                  fullName:
                    name.trim(),

                  identifier:
                    value,

                  password,
                }
              ),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok
      ) {
        throw new Error(
          result?.error ||
            "Unable to create account."
        );
      }

      const credentials =
        value.includes(
          "@"
        )
          ? {
              email:
                value.toLowerCase(),

              password,
            }
          : {
              phone:
                normalizePhone(
                  value
                ),

              password,
            };

      if (
        "phone" in
          credentials &&
        !credentials.phone
      ) {
        throw new Error(
          "Enter a valid mobile number."
        );
      }

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword(
          credentials as any
        );

      if (error) {
        throw error;
      }

      if (
        !data.user
      ) {
        throw new Error(
          "Account created, but automatic sign-in failed. Please sign in."
        );
      }

      window.location.href =
        next;
    } catch (error) {
      setMessage(
        error instanceof
        Error
          ? error.message
          : "Unable to create account."
      );
    } finally {
      setBusy(false);
    }
  }

  async function googleLogin() {
    setBusy(true);
    setMessage("");

    try {
      const redirectTo =
        `${
          window
            .location
            .origin
        }/account?next=${encodeURIComponent(
          next
        )}`;

      const {
        error,
      } =
        await supabase.auth.signInWithOAuth(
          {
            provider:
              "google",

            options: {
              redirectTo,
            },
          }
        );

      if (error) {
        throw error;
      }
    } catch (error) {
      setMessage(
        error instanceof
        Error
          ? error.message
          : "Google sign in is unavailable."
      );

      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);

    const {
      error,
    } =
      await supabase.auth.signOut();

    if (error) {
      setMessage(
        error.message
      );
    } else {
      setUser(null);
      setOrders([]);
    }

    setBusy(false);
  }

  const whatsappUrl =
    useMemo(
      () =>
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          "Hi Godavari Basket, I need help logging into my account."
        )}`,
      []
    );

  if (loading) {
    return (
      <main className="min-h-screen bg-cream grid place-items-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-forest" />

          <p className="mt-4 text-sm text-gray-500">
            Loading your account...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="auth-premium-shell">
        {message && (
          <div
            className="gb-toast-wrap"
            role="alert"
            aria-live="assertive"
          >
            <div className="gb-toast">
              <span>
                {message}
              </span>

              <button
                type="button"
                onClick={() =>
                  setMessage(
                    ""
                  )
                }
                aria-label="Close message"
              >
                <X
                  size={17}
                />
              </button>
            </div>
          </div>
        )}

        <div className="container-wide py-6 md:py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest"
          >
            <ArrowLeft
              size={17}
            />

            Back to Godavari Basket
          </Link>

          <section className="auth-premium-card">
            <div className="auth-brand-panel">
              <div className="auth-logo">
                <img
                  src="/logo.png"
                  alt="Godavari Basket"
                />
              </div>

              <p className="eyebrow light">
                One account. Every Godavari experience.
              </p>

              <h1 className="serif">
                Welcome to
                <br />
                Godavari Basket
              </h1>

              <p>
                Use your email or mobile number with the same password, or continue quickly with Google.
              </p>

              <div className="auth-brand-points">
                <span>
                  ✓ Track orders
                </span>

                <span>
                  ✓ Save your details
                </span>

                <span>
                  ✓ Simple secure checkout
                </span>
              </div>
            </div>

            <div className="auth-form-panel">
              <div className="auth-form-heading">
                <span>
                  {mode ===
                  "login"
                    ? "Welcome back"
                    : "Create your account"}
                </span>

                <h2>
                  {mode ===
                  "login"
                    ? "Sign in"
                    : "Join Godavari Basket"}
                </h2>
              </div>

              <button
                type="button"
                disabled={
                  busy
                }
                onClick={
                  googleLogin
                }
                className="auth-google"
              >
                <Chrome
                  size={19}
                />

                Continue with Google
              </button>

              <div className="auth-divider">
                <span>
                  or
                </span>
              </div>

              {mode ===
              "login" ? (
                <form
                  onSubmit={
                    loginSubmit
                  }
                  className="auth-fields"
                >
                  <label>
                    <span>
                      Email or mobile number
                    </span>

                    <div className="auth-input">
                      <UserRound
                        size={17}
                      />

                      <input
                        required
                        value={
                          identifier
                        }
                        onChange={(
                          e
                        ) =>
                          setIdentifier(
                            e
                              .target
                              .value
                          )
                        }
                        placeholder="you@example.com or 98765 43210"
                        autoComplete="username"
                      />
                    </div>
                  </label>

                  <label>
                    <span>
                      Password
                    </span>

                    <div className="auth-input">
                      <KeyRound
                        size={17}
                      />

                      <input
                        required
                        minLength={
                          6
                        }
                        type="password"
                        value={
                          password
                        }
                        onChange={(
                          e
                        ) =>
                          setPassword(
                            e
                              .target
                              .value
                          )
                        }
                        placeholder="Your password"
                        autoComplete="current-password"
                      />
                    </div>
                  </label>

                  <button
                    disabled={
                      busy
                    }
                    className="auth-primary"
                  >
                    {busy
                      ? "Please wait..."
                      : "Sign in"}
                  </button>
                </form>
              ) : (
                <form
                  onSubmit={
                    signupSubmit
                  }
                  className="auth-fields"
                >
                  <label>
                    <span>
                      Full name
                    </span>

                    <div className="auth-input">
                      <UserRound
                        size={17}
                      />

                      <input
                        required
                        value={
                          name
                        }
                        onChange={(
                          e
                        ) =>
                          setName(
                            e
                              .target
                              .value
                          )
                        }
                        placeholder="Your full name"
                      />
                    </div>
                  </label>

                  <label>
                    <span>
                      Email or mobile number
                    </span>

                    <div className="auth-input">
                      <UserRound
                        size={17}
                      />

                      <input
                        required
                        value={
                          signupIdentifier
                        }
                        onChange={(
                          e
                        ) =>
                          setSignupIdentifier(
                            e
                              .target
                              .value
                          )
                        }
                        placeholder="you@example.com or 98765 43210"
                        autoComplete="username"
                      />
                    </div>

                    <small className="mt-1 block text-xs text-gray-500">
                      Use either one. A mobile number is not mandatory when you sign up with email.
                    </small>
                  </label>

                  <label>
                    <span>
                      Password
                    </span>

                    <div className="auth-input">
                      <KeyRound
                        size={17}
                      />

                      <input
                        required
                        minLength={
                          8
                        }
                        type="password"
                        value={
                          password
                        }
                        onChange={(
                          e
                        ) =>
                          setPassword(
                            e
                              .target
                              .value
                          )
                        }
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                      />
                    </div>
                  </label>

                  <button
                    disabled={
                      busy
                    }
                    className="auth-primary"
                  >
                    {busy
                      ? "Creating account..."
                      : "Create account"}
                  </button>
                </form>
              )}

              <button
                type="button"
                className="auth-switch"
                onClick={() => {
                  setMode(
                    mode ===
                      "login"
                      ? "signup"
                      : "login"
                  );

                  setMessage(
                    ""
                  );

                  setPassword(
                    ""
                  );
                }}
              >
                {mode ===
                "login"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>

              <a
                className="auth-whatsapp"
                href={
                  whatsappUrl
                }
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle
                  size={19}
                />

                <span>
                  <strong>
                    Having trouble logging in?
                  </strong>

                  <small>
                    Chat with Godavari Basket on WhatsApp
                  </small>
                </span>
              </a>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const displayName =
    user
      .user_metadata
      ?.full_name ||
    user.email ||
    user.phone ||
    "Godavari Basket Customer";

  return (
    <main className="min-h-screen bg-cream">
      {message && (
        <div
          className="gb-toast-wrap"
          role="alert"
          aria-live="assertive"
        >
          <div className="gb-toast">
            <span>
              {message}
            </span>

            <button
              type="button"
              onClick={() =>
                setMessage(
                  ""
                )
              }
              aria-label="Close message"
            >
              <X
                size={17}
              />
            </button>
          </div>
        </div>
      )}

      <div className="border-b bg-white">
        <div className="container-wide flex items-center justify-between py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-forest"
          >
            <ArrowLeft
              size={17}
            />

            Back to Store
          </Link>

          <button
            disabled={
              busy
            }
            onClick={
              signOut
            }
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold"
          >
            <LogOut
              size={16}
            />

            Sign Out
          </button>
        </div>
      </div>

      <div className="container-wide py-8 md:py-12">
        <section className="overflow-hidden rounded-[32px] bg-forest text-white shadow-sm">
          <div className="p-7 md:p-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[.22em] text-white/60">
                My Account
              </p>

              <h1 className="serif mt-2 text-3xl md:text-4xl">
                Hello,{" "}
                {displayName}
              </h1>

              <p className="mt-2 text-sm text-white/70">
                Your orders and Godavari Basket account in one place.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-forest"
            >
              <ShoppingBag
                size={17}
              />

              Continue Shopping
            </Link>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">
                Purchase history
              </p>

              <h2 className="serif mt-2 text-3xl text-forest">
                MY ORDERS
              </h2>
            </div>

            <span className="text-sm text-gray-500">
              {orders.length} orders
            </span>
          </div>

          {ordersLoading ? (
            <div className="mt-6 rounded-3xl border bg-white p-10 text-center text-sm text-gray-500">
              Loading orders...
            </div>
          ) : orders.length ===
            0 ? (
            <div className="mt-6 rounded-3xl border bg-white p-10 text-center">
              <Package
                className="mx-auto text-forest"
              />

              <h3 className="serif mt-4 text-2xl text-forest">
                No orders yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Your Godavari Basket orders will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {orders.map(
                (order) => (
                  <article
                    key={
                      order.id
                    }
                    className="rounded-3xl border bg-white p-5 md:p-6"
                  >
                    <button
                      className="flex w-full items-center justify-between gap-4 text-left"
                      onClick={() =>
                        setExpanded(
                          expanded ===
                            order.id
                            ? null
                            : order.id
                        )
                      }
                    >
                      <div>
                        <p className="text-xs uppercase tracking-[.14em] text-gray-400">
                          {date(
                            order.created_at
                          )}
                        </p>

                        <h3 className="mt-1 font-bold text-forest">
                          {
                            order.order_number
                          }
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          {title(
                            order.status
                          )}
                          {" · "}
                          {order.order_items?.reduce(
                            (
                              total,
                              item
                            ) =>
                              total +
                              item.quantity,
                            0
                          ) ||
                            0}
                          {" items"}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <strong>
                          {money(
                            order.total_amount,
                            order.currency
                          )}
                        </strong>

                        {expanded ===
                        order.id ? (
                          <ChevronUp
                            size={18}
                          />
                        ) : (
                          <ChevronDown
                            size={18}
                          />
                        )}
                      </div>
                    </button>

                    {expanded ===
                      order.id && (
                      <div className="mt-5 border-t pt-5 space-y-3">
                        {order.order_items?.map(
                          (
                            item
                          ) => (
                            <div
                              key={
                                item.id
                              }
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <div className="flex items-center gap-3">
                                {item.product_image ? (
                                  <img
                                    className="h-12 w-12 rounded-xl object-cover"
                                    src={
                                      item.product_image
                                    }
                                    alt={
                                      item.product_name
                                    }
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-xl bg-gray-100" />
                                )}

                                <div>
                                  <strong>
                                    {
                                      item.product_name
                                    }
                                  </strong>

                                  <p className="text-gray-500">
                                    Qty{" "}
                                    {
                                      item.quantity
                                    }
                                  </p>
                                </div>
                              </div>

                              <span>
                                {money(
                                  item.line_total
                                )}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
