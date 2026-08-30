import { NextRequest, NextResponse } from "next/server";

import {
  createServerSupabase,
  createServiceSupabase,
} from "../../../../lib/supabase-server";

import {
  getCashfreeOrder,
  getCashfreePayments,
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
  name?: string;
  handle?: string;
  image?: string;
  sku?: string;
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
     * ==================================================
     * 1. AUTHENTICATION
     * ==================================================
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
            "Authentication required.",
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
        "VERIFY AUTH ERROR:",
        authError
      );

      return NextResponse.json(
        {
          error:
            "Your payment was received, but your login session could not be verified. Please contact support with your Cashfree order ID.",
        },
        { status: 401 }
      );
    }

    /*
     * ==================================================
     * 2. READ REQUEST
     * ==================================================
     */

    const body = await request.json();

    const cashfreeOrderId = String(
      body.cashfreeOrderId || ""
    ).trim();

    const lines = body.lines as Line[];

    const address = body.address as Address;

    if (
      !cashfreeOrderId ||
      !Array.isArray(lines) ||
      !lines.length
    ) {
      return NextResponse.json(
        {
          error:
            "Payment verification data is incomplete.",
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
     * ==================================================
     * 3. GET ACTUAL CASHFREE PAYMENT
     * ==================================================
     */

    const [cfOrder, payments] =
      await Promise.all([
        getCashfreeOrder(
          cashfreeOrderId
        ),

        getCashfreePayments(
          cashfreeOrderId
        ),
      ]);

    if (!cfOrder) {
      return NextResponse.json(
        {
          error:
            "Cashfree order could not be found.",
        },
        { status: 400 }
      );
    }

    const successful =
      Array.isArray(payments)
        ? payments.find(
            (payment: any) =>
              String(
                payment.payment_status ||
                  ""
              ).toUpperCase() ===
              "SUCCESS"
          )
        : null;

    /*
     * Payment isn't confirmed yet.
     *
     * DO NOT create order.
     * DO NOT clear cart.
     */

    if (!successful) {
      return NextResponse.json(
        {
          error:
            "Payment is not yet confirmed by Cashfree. Your cart has not been cleared. Please wait a moment and retry.",
        },
        { status: 400 }
      );
    }

    /*
     * ==================================================
     * 4. LOAD PRODUCTS
     * ==================================================
     */

    const products =
      await getProducts();

    const byId =
      new Map<string, Product>(
        products.map(
          (product) => [
            String(product.id),
            product,
          ]
        )
      );

    /*
     * ==================================================
     * 5. VALIDATE CART
     * ==================================================
     */

    const validated = lines.map(
      (line) => {
        const product =
          byId.get(
            String(
              line.productId
            )
          );

        const quantity =
          Number(line.quantity);

        if (
          !product ||
          !product.active ||
          Number(product.stock) <= 0 ||
          !Number.isInteger(
            quantity
          ) ||
          quantity < 1 ||
          quantity > 50
        ) {
          throw new Error(
            "One or more products are unavailable."
          );
        }

        const price =
          Number(product.price);

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
          quantity,
        };
      }
    );

    /*
     * ==================================================
     * 6. SERVER-SIDE TOTAL
     * ==================================================
     */

    const subtotal =
      Number(
        validated
          .reduce(
            (
              sum,
              {
                product,
                quantity,
              }
            ) =>
              sum +
              Number(
                product.price
              ) *
                quantity,
            0
          )
          .toFixed(2)
      );

    const shipping =
      calculateShipping(
        subtotal
      );

    const total =
      Number(
        (
          subtotal +
          shipping
        ).toFixed(2)
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
     * ==================================================
     * 7. VERIFY PAYMENT AMOUNT
     * ==================================================
     */

    const paidAmount =
      Number(
        successful.payment_amount
      );

    const orderAmount =
      Number(
        cfOrder.order_amount
      );

    if (
      !Number.isFinite(
        paidAmount
      ) ||
      !Number.isFinite(
        orderAmount
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Unable to verify the Cashfree payment amount.",
        },
        { status: 400 }
      );
    }

    if (
      Math.abs(
        orderAmount - total
      ) > 0.01 ||
      Math.abs(
        paidAmount - total
      ) > 0.01
    ) {
      return NextResponse.json(
        {
          error:
            "Payment amount does not match the order total. Your cart has not been cleared.",
        },
        { status: 400 }
      );
    }

    /*
     * ==================================================
     * 8. VERIFY CURRENCY
     * ==================================================
     */

    const orderCurrency =
      String(
        cfOrder.order_currency ||
          ""
      ).toUpperCase();

    const paymentCurrency =
      String(
        successful.payment_currency ||
          ""
      ).toUpperCase();

    if (
      orderCurrency !== "INR" ||
      paymentCurrency !== "INR"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid payment currency.",
        },
        { status: 400 }
      );
    }

    /*
     * ==================================================
     * 9. SERVICE SUPABASE
     * ==================================================
     */

    const supabase =
      createServiceSupabase();

    /*
     * ==================================================
     * 10. IDEMPOTENCY CHECK
     * ==================================================
     */

    const {
      data: existingPayment,
      error: existingPaymentError,
    } = await supabase
      .from("order_payments")
      .select("order_id")
      .eq(
        "provider_order_id",
        cashfreeOrderId
      )
      .maybeSingle();

    if (existingPaymentError) {
      console.error(
        "EXISTING PAYMENT LOOKUP ERROR:",
        existingPaymentError
      );

      throw new Error(
        "Unable to verify the existing payment."
      );
    }

    if (
      existingPayment?.order_id
    ) {
      /*
       * ----------------------------------------------
       * Check whether the corresponding order exists.
       * ----------------------------------------------
       */

      const {
        data: existingOrder,
        error: existingOrderError,
      } = await supabase
        .from("orders")
        .select(
          "id,order_number,total_amount,currency,user_id"
        )
        .eq(
          "id",
          existingPayment.order_id
        )
        .maybeSingle();

      /*
       * IMPORTANT:
       *
       * Do not access existingOrderError.message
       * directly here because the Supabase generated
       * type can infer the error branch as `never`.
       *
       * We only need to know that the lookup failed.
       */

      if (existingOrderError) {
        console.error(
          "EXISTING ORDER LOOKUP ERROR:",
          existingOrderError
        );

        throw new Error(
          "Unable to verify the existing order."
        );
      }

      /*
       * If the payment exists but order doesn't,
       * remove the orphan payment record so the
       * verified payment can be rebuilt.
       */

      if (!existingOrder) {
        const {
          error:
            orphanPaymentDeleteError,
        } = await supabase
          .from("order_payments")
          .delete()
          .eq(
            "provider_order_id",
            cashfreeOrderId
          );

        if (
          orphanPaymentDeleteError
        ) {
          console.error(
            "ORPHAN PAYMENT DELETE ERROR:",
            orphanPaymentDeleteError
          );

          throw new Error(
            "Unable to recover the previous payment record."
          );
        }
      } else {
        /*
         * Make sure the existing order belongs
         * to the authenticated customer.
         */

        if (
          existingOrder.user_id !==
          user.id
        ) {
          return NextResponse.json(
            {
              error:
                "This payment does not belong to this customer.",
            },
            { status: 403 }
          );
        }

        /*
         * Already successfully processed.
         *
         * Return the existing order rather than
         * creating another order.
         */

        return NextResponse.json({
          success: true,

          order: {
            id:
              existingOrder.id,

            order_number:
              existingOrder.order_number,

            total_amount:
              existingOrder.total_amount,

            currency:
              existingOrder.currency,
          },
        });
      }
    }

    /*
     * ==================================================
     * 11. CREATE ORDER
     * ==================================================
     */

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .insert({
        user_id:
          user.id,

        status:
          "confirmed",

        payment_status:
          "paid",

        subtotal,

        shipping_amount:
          shipping,

        total_amount:
          total,

        currency:
          "INR",

        delivery_name:
          address.fullName,

        delivery_mobile:
          address.mobile,

        delivery_email:
          address.email,

        delivery_address_line1:
          address.addressLine1,

        delivery_address_line2:
          address.addressLine2 ||
          null,

        delivery_landmark:
          address.landmark ||
          null,

        delivery_pincode:
          address.pincode,

        delivery_city:
          address.city,

        delivery_state:
          address.state,

        paid_at:
          new Date().toISOString(),
      })
      .select(
        "id,order_number,total_amount,currency"
      )
      .single();

    if (
      orderError ||
      !order
    ) {
      console.error(
        "CREATE ORDER ERROR:",
        orderError
      );

      throw new Error(
        orderError
          ? String(
              (
                orderError as {
                  message?: string;
                }
              ).message ||
                "Unable to create the order."
            )
          : "Unable to create the order."
      );
    }

    /*
     * ==================================================
     * 12. CREATE PAYMENT RECORD
     * ==================================================
     */

    const {
      error: paymentError,
    } = await supabase
      .from("order_payments")
      .insert({
        order_id:
          order.id,

        provider:
          "cashfree",

        provider_order_id:
          cashfreeOrderId,

        provider_payment_id:
          successful.cf_payment_id
            ? String(
                successful.cf_payment_id
              )
            : null,

        amount:
          total,

        currency:
          "INR",

        status:
          "paid",

        paid_at:
          new Date().toISOString(),
      });

    if (paymentError) {
      console.error(
        "CREATE PAYMENT RECORD ERROR:",
        paymentError
      );

      /*
       * Roll back order.
       */

      await supabase
        .from("orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      /*
       * Handle duplicate payment safely.
       */

      if (
        paymentError.code ===
        "23505"
      ) {
        const {
          data:
            winningPayment,
        } = await supabase
          .from(
            "order_payments"
          )
          .select(
            "order_id"
          )
          .eq(
            "provider_order_id",
            cashfreeOrderId
          )
          .maybeSingle();

        if (
          winningPayment?.order_id
        ) {
          const {
            data:
              winningOrder,
          } =
            await supabase
              .from("orders")
              .select(
                "id,order_number,total_amount,currency,user_id"
              )
              .eq(
                "id",
                winningPayment.order_id
              )
              .maybeSingle();

          if (
            winningOrder &&
            winningOrder.user_id ===
              user.id
          ) {
            return NextResponse.json({
              success: true,

              order: {
                id:
                  winningOrder.id,

                order_number:
                  winningOrder.order_number,

                total_amount:
                  winningOrder.total_amount,

                currency:
                  winningOrder.currency,
              },
            });
          }
        }
      }

      throw new Error(
        String(
          (
            paymentError as {
              message?: string;
            }
          ).message ||
            "Unable to save the payment record."
        )
      );
    }

    /*
     * ==================================================
     * 13. CREATE ORDER ITEMS
     * ==================================================
     */

    const items =
      validated.map(
        ({
          product,
          quantity,
        }) => ({
          order_id:
            order.id,

          product_id:
            String(
              product.id
            ),

          product_name:
            product.name,

          product_handle:
            product.handle ||
            null,

          product_image:
            product.image ||
            null,

          unit_price:
            Number(
              product.price
            ),

          quantity,

          line_total:
            Number(
              product.price
            ) *
            quantity,

          sku:
            product.sku ||
            null,
        })
      );

    const {
      error: itemError,
    } = await supabase
      .from("order_items")
      .insert(items);

    if (itemError) {
      console.error(
        "CREATE ORDER ITEMS ERROR:",
        itemError
      );

      /*
       * Remove payment.
       */

      await supabase
        .from("order_payments")
        .delete()
        .eq(
          "order_id",
          order.id
        );

      /*
       * Remove order.
       */

      await supabase
        .from("orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      throw new Error(
        String(
          (
            itemError as {
              message?: string;
            }
          ).message ||
            "Unable to save order items."
        )
      );
    }

    /*
     * ==================================================
     * 14. SAVE ADDRESS
     * ==================================================
     */

    const {
      error: addressError,
    } = await supabase
      .from("addresses")
      .insert({
        user_id:
          user.id,

        label:
          "Checkout",

        full_name:
          address.fullName,

        mobile:
          address.mobile,

        address_line1:
          address.addressLine1,

        address_line2:
          address.addressLine2 ||
          null,

        landmark:
          address.landmark ||
          null,

        pincode:
          address.pincode,

        city:
          address.city,

        state:
          address.state,

        is_default:
          false,
      });

    if (addressError) {
      console.error(
        "SAVE ADDRESS ERROR:",
        addressError
      );

      /*
       * Remove order items.
       */

      await supabase
        .from("order_items")
        .delete()
        .eq(
          "order_id",
          order.id
        );

      /*
       * Remove payment.
       */

      await supabase
        .from("order_payments")
        .delete()
        .eq(
          "order_id",
          order.id
        );

      /*
       * Remove order.
       */

      await supabase
        .from("orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      throw new Error(
        String(
          (
            addressError as {
              message?: string;
            }
          ).message ||
            "Unable to save delivery address."
        )
      );
    }

    /*
     * ==================================================
     * 15. SUCCESS
     * ==================================================
     */

    return NextResponse.json({
      success: true,

      order: {
        id:
          order.id,

        order_number:
          order.order_number,

        total_amount:
          order.total_amount,

        currency:
          order.currency,
      },
    });
  } catch (error) {
    console.error(
      "VERIFY CASHFREE PAYMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to verify payment.",
      },
      { status: 400 }
    );
  }
}
