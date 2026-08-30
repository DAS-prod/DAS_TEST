import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "../../../../lib/supabase-server";
import {
  createCashfreeOrder,
  getCashfreeMode,
} from "../../../../lib/cashfree";
import { API_URL } from "../../../../lib/products";

export const dynamic = "force-dynamic";

type Line = {
  productId: string;
  quantity: number;
};

type Address = {
  fullName: string;
  mobile: string;
  email: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
};

type Product = {
  id: string | number;
  active: boolean;
  stock: number | string;
  price: number | string;
};

const FREE_DELIVERY_THRESHOLD = 999;
const PAID_DELIVERY_AMOUNT = 99;

function calculateShipping(subtotal: number) {
  return subtotal > FREE_DELIVERY_THRESHOLD
    ? 0
    : PAID_DELIVERY_AMOUNT;
}

async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/api/products`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      "Unable to validate the product catalogue."
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(
      "Invalid product catalogue response."
    );
  }

  return data;
}

export async function POST(request: NextRequest) {
  try {
    /*
     * ---------------------------------------------
     * 1. AUTHENTICATION
     * ---------------------------------------------
     */

    const authorization =
      request.headers.get("authorization");

    const token = authorization?.replace(
      /^Bearer\s+/i,
      ""
    );

    if (!token) {
      return NextResponse.json(
        {
          error:
            "Please sign in before checkout.",
        },
        { status: 401 }
      );
    }

    const authClient =
      createServerSupabase(token);

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !user) {
      console.error(
        "CREATE ORDER AUTH ERROR:",
        authError
      );

      return NextResponse.json(
        {
          error:
            "Your session has expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    /*
     * ---------------------------------------------
     * 2. READ REQUEST
     * ---------------------------------------------
     */

    const body = await request.json();

    const lines = body.lines as Line[];
    const address = body.address as Address;

    if (!Array.isArray(lines) || !lines.length) {
      return NextResponse.json(
        {
          error: "Your cart is empty.",
        },
        { status: 400 }
      );
    }

    if (
      !address?.fullName ||
      !address.mobile ||
      !address.email ||
      !address.addressLine1 ||
      !address.pincode ||
      !address.city ||
      !address.state
    ) {
      return NextResponse.json(
        {
          error:
            "Delivery details are incomplete.",
        },
        { status: 400 }
      );
    }

    /*
     * ---------------------------------------------
     * 3. LOAD PRODUCTS
     * ---------------------------------------------
     */

    const products = await getProducts();

    const byId = new Map<string, Product>(
      products.map((product) => [
        String(product.id),
        product,
      ])
    );

    /*
     * ---------------------------------------------
     * 4. VALIDATE CART
     * ---------------------------------------------
     */

    const validated = lines.map((line) => {
      const product = byId.get(
        String(line.productId)
      );

      if (
        !product ||
        !product.active ||
        Number(product.stock) <= 0 ||
        !Number.isInteger(
          Number(line.quantity)
        ) ||
        Number(line.quantity) < 1 ||
        Number(line.quantity) > 50
      ) {
        throw new Error(
          "One or more products are unavailable."
        );
      }

      const price = Number(product.price);

      if (
        !Number.isFinite(price) ||
        price <= 0
      ) {
        throw new Error(
          "One or more products have an invalid price."
        );
      }

      return {
        product,
        quantity: Number(line.quantity),
      };
    });

    /*
     * ---------------------------------------------
     * 5. CALCULATE TOTAL
     * ---------------------------------------------
     */

    const subtotal = Number(
      validated
        .reduce(
          (
            sum,
            { product, quantity }
          ) =>
            sum +
            Number(product.price) *
              quantity,
          0
        )
        .toFixed(2)
    );

    const shipping =
      calculateShipping(subtotal);

    const total = Number(
      (subtotal + shipping).toFixed(2)
    );

    if (
      !Number.isFinite(total) ||
      total < 1
    ) {
      throw new Error(
        "Order total must be at least ₹1."
      );
    }

    /*
     * ---------------------------------------------
     * 6. CREATE CASHFREE ORDER
     * ---------------------------------------------
     */

    const orderId =
      `gb_${Date.now()}_${crypto
        .randomUUID()
        .replace(/-/g, "")
        .slice(0, 12)}`;

    /*
     * IMPORTANT:
     *
     * Use the EXACT origin from the current request.
     *
     * Do NOT prefer NEXT_PUBLIC_SITE_URL here.
     *
     * This prevents:
     *
     * godavaribasket.com
     *       ->
     * www.godavaribasket.com
     *
     * or the reverse, which can cause browser
     * sessionStorage to become unavailable.
     */
    const siteUrl =
      request.nextUrl.origin;

    const cfOrder =
      await createCashfreeOrder({
        orderId,

        amount: total,

        customerId:
          user.id,

        customerName:
          address.fullName,

        customerEmail:
          address.email,

        customerPhone:
          address.mobile,

        returnUrl:
          `${siteUrl}/checkout?order_id={order_id}`,
      });

    if (
      !cfOrder?.order_id ||
      !cfOrder?.payment_session_id
    ) {
      throw new Error(
        "Cashfree did not return a valid payment session."
      );
    }

    /*
     * ---------------------------------------------
     * 7. RESPONSE
     * ---------------------------------------------
     */

    return NextResponse.json({
      success: true,

      cashfree: {
        orderId:
          cfOrder.order_id,

        paymentSessionId:
          cfOrder.payment_session_id,

        mode:
          getCashfreeMode(),
      },

      checkout: {
        subtotal,
        shipping,
        total,
      },
    });
  } catch (error) {
    console.error(
      "CREATE CASHFREE ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to start checkout.",
      },
      { status: 400 }
    );
  }
}
