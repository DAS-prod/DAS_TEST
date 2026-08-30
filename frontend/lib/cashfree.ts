const API_VERSION = process.env.CASHFREE_API_VERSION || "2025-01-01";
const ENV = process.env.CASHFREE_ENV === "production" ? "production" : "sandbox";
const BASE_URL = ENV === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

function credentials() {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Cashfree credentials are not configured.");
  }
  return { clientId, clientSecret };
}

async function cashfreeFetch(path: string, init: RequestInit = {}) {
  const { clientId, clientSecret } = credentials();
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-version": API_VERSION,
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
      ...(init.headers || {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }

  if (!response.ok) {
    throw new Error(data?.message || data?.message_description || `Cashfree API failed (${response.status}).`);
  }
  return data;
}

export function getCashfreeMode() {
  return ENV;
}

export async function createCashfreeOrder(input: {
  orderId: string;
  amount: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
}) {
  return cashfreeFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      order_id: input.orderId,
      order_amount: Number(input.amount.toFixed(2)),
      order_currency: "INR",
      customer_details: {
        customer_id: input.customerId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
      },
      order_meta: {
        return_url: input.returnUrl,
      },
      order_note: "Godavari Basket Order",
    }),
  });
}

export async function getCashfreeOrder(orderId: string) {
  return cashfreeFetch(`/orders/${encodeURIComponent(orderId)}`);
}

export async function getCashfreePayments(orderId: string) {
  return cashfreeFetch(`/orders/${encodeURIComponent(orderId)}/payments`);
}
