"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type OrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
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
  delivery_name: string;
  delivery_mobile: string;
  delivery_email: string;
  delivery_address_line1: string;
  delivery_address_line2: string | null;
  delivery_landmark: string | null;
  delivery_pincode: string;
  delivery_city: string;
  delivery_state: string;
  paid_at: string | null;
  created_at: string;
  order_items: OrderItem[];
};

function formatMoney(
  value: number,
  currency = "INR"
) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(value: string) {
  return value
    ? value.charAt(0).toUpperCase() +
        value.slice(1)
    : "Pending";
}

function statusClass(value: string) {
  switch (value) {
    case "confirmed":
    case "delivered":
      return "bg-green-100 text-green-800";
    case "processing":
      return "bg-amber-100 text-amber-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] =
    useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] =
    useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [mode, setMode] = useState<
    "login" | "signup"
  >("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [next, setNext] = useState("/");

  useEffect(() => {
    setNext(
      new URLSearchParams(
        window.location.search
      ).get("next") || "/"
    );

    let mounted = true;

    async function load() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setUser(currentUser || null);

      if (currentUser) {
        setEmail(currentUser.email || "");
        setName(
          currentUser.user_metadata?.full_name ||
            ""
        );
        await loadOrders(currentUser.id);
      }

      if (mounted) setLoading(false);
    }

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        const currentUser =
          session?.user || null;

        setUser(currentUser);

        if (currentUser) {
          setEmail(currentUser.email || "");
          setName(
            currentUser.user_metadata
              ?.full_name || ""
          );
          void loadOrders(currentUser.id);
        } else {
          setOrders([]);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function loadOrders(userId?: string) {
    setOrdersLoading(true);
    setMessage("");

    try {
      let id = userId;

      if (!id) {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        id = currentUser?.id;
      }

      if (!id) {
        setOrders([]);
        return;
      }

      const { data, error } =
        await supabase
          .from("orders")
          .select(
            `
              id,
              order_number,
              status,
              payment_status,
              subtotal,
              shipping_amount,
              total_amount,
              currency,
              delivery_name,
              delivery_mobile,
              delivery_email,
              delivery_address_line1,
              delivery_address_line2,
              delivery_landmark,
              delivery_pincode,
              delivery_city,
              delivery_state,
              paid_at,
              created_at,
              order_items (
                id,
                product_id,
                product_name,
                product_image,
                unit_price,
                quantity,
                line_total
              )
            `
          )
          .eq("user_id", id)
          .order("created_at", {
            ascending: false,
          });

      if (error) throw error;

      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load your orders."
      );
    } finally {
      setOrdersLoading(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              },
            },
          });

        if (error) throw error;

        if (data.session) {
          window.location.href = next;
          return;
        }

        setMessage(
          "Account created. Check your email if confirmation is enabled, then sign in."
        );
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        if (!data.user) {
          throw new Error(
            "Unable to sign in."
          );
        }

        window.location.href = next;
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to continue."
      );
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);

    try {
      const { error } =
        await supabase.auth.signOut();

      if (error) throw error;

      setUser(null);
      setOrders([]);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign out."
      );
    } finally {
      setBusy(false);
    }
  }

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
      <main className="min-h-screen bg-cream">
        <div className="container-wide py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-forest"
          >
            <ArrowLeft size={17} />
            Back to Godavari Basket
          </Link>

          <div className="mx-auto mt-10 max-w-md overflow-hidden rounded-[28px] border bg-white shadow-sm">
            <div className="bg-forest px-7 py-9 text-center text-white">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-white/40 text-xl font-bold">
                GB
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[.25em] text-white/70">
                Godavari Basket
              </p>
              <h1 className="serif mt-2 text-3xl">
                {mode === "login"
                  ? "Welcome back"
                  : "Join the basket"}
              </h1>
              <p className="mt-2 text-sm text-white/70">
                {mode === "login"
                  ? "Access your profile and orders."
                  : "Save your details and track your orders."}
              </p>
            </div>

            <div className="p-7">
              {message && (
                <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  {message}
                </div>
              )}

              <form
                onSubmit={submit}
                className="space-y-4"
              >
                {mode === "signup" && (
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">
                      Full Name
                    </span>
                    <div className="relative">
                      <UserRound
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={17}
                      />
                      <input
                        required
                        value={name}
                        onChange={(e) =>
                          setName(e.target.value)
                        }
                        className="h-12 w-full rounded-xl border bg-[#fafafa] pl-11 pr-4 outline-none focus:border-forest"
                      />
                    </div>
                  </label>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Email
                  </span>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={17}
                    />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      className="h-12 w-full rounded-xl border bg-[#fafafa] pl-11 pr-4 outline-none focus:border-forest"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">
                    Password
                  </span>
                  <input
                    required
                    minLength={6}
                    type="password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    className="h-12 w-full rounded-xl border bg-[#fafafa] px-4 outline-none focus:border-forest"
                  />
                </label>

                <button
                  disabled={busy}
                  className="h-12 w-full rounded-xl bg-forest font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {busy
                    ? "Please wait..."
                    : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
                </button>
              </form>

              <button
                type="button"
                className="mt-5 w-full text-sm font-semibold text-forest"
                onClick={() => {
                  setMode(
                    mode === "login"
                      ? "signup"
                      : "login"
                  );
                  setMessage("");
                }}
              >
                {mode === "login"
                  ? "New to Godavari Basket? Create an account"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    "Godavari Basket Customer";

  return (
    <main className="min-h-screen bg-cream">
      <div className="border-b bg-white">
        <div className="container-wide flex items-center justify-between py-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-forest"
          >
            <ArrowLeft size={17} />
            Back to Store
          </Link>

          <button
            type="button"
            disabled={busy}
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="container-wide py-8 md:py-12">
        <section className="overflow-hidden rounded-[32px] bg-forest text-white shadow-sm">
          <div className="p-7 md:p-10">
            <div className="flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-white text-2xl font-bold text-forest shadow-sm">
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.25em] text-white/60">
                    My Account
                  </p>
                  <h1 className="serif mt-1 text-3xl md:text-4xl">
                    Hello, {displayName}
                  </h1>
                  <p className="mt-2 text-sm text-white/70">
                    Manage your profile and view your Godavari Basket purchases.
                  </p>
                </div>
              </div>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-forest"
              >
                <ShoppingBag size={17} />
                Continue Shopping
              </Link>
            </div>
          </div>

          <div className="grid border-t border-white/10 sm:grid-cols-3">
            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r">
              <p className="text-xs uppercase tracking-[.16em] text-white/50">
                Email
              </p>
              <p className="mt-2 truncate text-sm font-semibold">
                {user.email}
              </p>
            </div>

            <div className="border-b border-white/10 p-5 sm:border-b-0 sm:border-r">
              <p className="text-xs uppercase tracking-[.16em] text-white/50">
                Orders
              </p>
              <p className="mt-2 text-2xl font-bold">
                {orders.length}
              </p>
            </div>

            <div className="p-5">
              <p className="text-xs uppercase tracking-[.16em] text-white/50">
                Account
              </p>
              <p className="mt-2 text-sm font-semibold">
                Active customer
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-forest">
                Your purchases
              </p>
              <h2 className="serif mt-1 text-3xl md:text-4xl">
                Order History
              </h2>
            </div>

            <button
              type="button"
              onClick={() =>
                void loadOrders(user.id)
              }
              className="text-sm font-semibold text-forest"
            >
              Refresh orders
            </button>
          </div>

          {message && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {message}
            </div>
          )}

          {ordersLoading ? (
            <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-forest" />
              <p className="mt-4 text-sm text-gray-500">
                Loading your orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border bg-white p-10 text-center shadow-sm md:p-14">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#eef3e8] text-forest">
                <Package size={28} />
              </div>
              <h3 className="serif mt-5 text-2xl">
                Your order history is empty
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Once you place an order, you can track its status and view the items and delivery address here.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex rounded-xl bg-forest px-6 py-3 text-sm font-semibold text-white"
              >
                Explore Godavari Basket
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const open =
                  expanded === order.id;

                return (
                  <article
                    key={order.id}
                    className="overflow-hidden rounded-3xl border bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded(
                          open ? null : order.id
                        )
                      }
                      className="w-full p-5 text-left md:p-6"
                    >
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eef3e8] text-forest">
                            <Package size={21} />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold">
                                #{order.order_number}
                              </h3>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                                  order.status
                                )}`}
                              >
                                {statusLabel(
                                  order.status
                                )}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={14} />
                                {formatDate(
                                  order.created_at
                                )}
                              </span>
                              <span>
                                {order.order_items?.length || 0} items
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-5 md:justify-end">
                          <div className="md:text-right">
                            <p className="text-xs text-gray-400">
                              Total Paid
                            </p>
                            <p className="mt-1 text-xl font-bold">
                              {formatMoney(
                                Number(
                                  order.total_amount
                                ),
                                order.currency
                              )}
                            </p>
                          </div>

                          <div className="grid h-9 w-9 place-items-center rounded-full bg-gray-50 text-forest">
                            {open ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {open && (
                      <div className="border-t bg-[#fcfbf7] p-5 md:p-7">
                        <div className="grid gap-6 lg:grid-cols-[1fr_330px]">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-[.18em] text-forest">
                              Items in this order
                            </h4>

                            <div className="mt-4 space-y-3">
                              {(order.order_items || []).map(
                                (item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-4 rounded-2xl border bg-white p-4"
                                  >
                                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-cream">
                                      {item.product_image ? (
                                        <img
                                          src={item.product_image}
                                          alt={item.product_name}
                                          className="h-full w-full object-contain p-2"
                                        />
                                      ) : (
                                        <Package
                                          size={22}
                                          className="text-gray-400"
                                        />
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold">
                                        {item.product_name}
                                      </p>
                                      <p className="mt-1 text-xs text-gray-500">
                                        Qty {item.quantity} × {formatMoney(Number(item.unit_price), order.currency)}
                                      </p>
                                    </div>

                                    <p className="font-bold">
                                      {formatMoney(
                                        Number(
                                          item.line_total
                                        ),
                                        order.currency
                                      )}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-2xl border bg-white p-5">
                              <h4 className="flex items-center gap-2 font-semibold">
                                <MapPin
                                  size={17}
                                  className="text-forest"
                                />
                                Delivery Address
                              </h4>

                              <div className="mt-4 text-sm leading-6 text-gray-600">
                                <p className="font-semibold text-gray-900">
                                  {order.delivery_name}
                                </p>
                                <p className="mt-1">
                                  {order.delivery_address_line1}
                                </p>
                                {order.delivery_address_line2 && (
                                  <p>
                                    {order.delivery_address_line2}
                                  </p>
                                )}
                                {order.delivery_landmark && (
                                  <p>
                                    Landmark: {order.delivery_landmark}
                                  </p>
                                )}
                                <p>
                                  {order.delivery_city}, {order.delivery_state} {order.delivery_pincode}
                                </p>
                                <p className="mt-3 flex items-center gap-2">
                                  <Phone size={14} />
                                  {order.delivery_mobile}
                                </p>
                                <p className="mt-1 flex items-center gap-2 break-all">
                                  <Mail size={14} />
                                  {order.delivery_email}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border bg-white p-5">
                              <h4 className="font-semibold">
                                Payment Summary
                              </h4>

                              <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between text-gray-500">
                                  <span>Subtotal</span>
                                  <span>
                                    {formatMoney(
                                      Number(
                                        order.subtotal
                                      ),
                                      order.currency
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                  <span>Delivery</span>
                                  <span>
                                    {Number(order.shipping_amount) === 0
                                      ? "FREE"
                                      : formatMoney(Number(order.shipping_amount), order.currency)}
                                  </span>
                                </div>
                                <div className="flex justify-between border-t pt-3 font-bold">
                                  <span>Total Paid</span>
                                  <span className="text-forest">
                                    {formatMoney(
                                      Number(
                                        order.total_amount
                                      ),
                                      order.currency
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
