/**
 * Godavari Basket
 * Admin Push Notification Helper
 *
 * This file is used by the storefront/server checkout flow
 * to notify the separate Godavari Basket Admin Dashboard
 * when an order has been successfully paid.
 *
 * IMPORTANT:
 * - Server-side only.
 * - Do NOT expose the webhook secret using NEXT_PUBLIC_.
 * - Push failures must NEVER fail checkout/payment verification.
 */

export type PaidOrderNotification = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  itemCount: number;
};

/**
 * Notify the Godavari Basket Admin application
 * about a successfully paid order.
 */
export async function notifyAdminOfPaidOrder(
  payload: PaidOrderNotification
): Promise<void> {
  const webhookUrl = String(
    process.env.ADMIN_PUSH_WEBHOOK_URL || ""
  ).trim();

  const webhookSecret = String(
    process.env.ADMIN_PUSH_WEBHOOK_SECRET || ""
  ).trim();

  // ---------------------------------------------------------
  // Environment validation
  // ---------------------------------------------------------

  if (!webhookUrl) {
    console.warn(
      "[ADMIN PUSH] Skipped: ADMIN_PUSH_WEBHOOK_URL is missing."
    );

    return;
  }

  if (!webhookSecret) {
    console.warn(
      "[ADMIN PUSH] Skipped: ADMIN_PUSH_WEBHOOK_SECRET is missing."
    );

    return;
  }

  // ---------------------------------------------------------
  // Payload validation
  // ---------------------------------------------------------

  const orderId = String(
    payload.orderId || ""
  ).trim();

  const orderNumber = String(
    payload.orderNumber || ""
  ).trim();

  const customerName = String(
    payload.customerName || "Customer"
  ).trim();

  const totalAmount = Number(
    payload.totalAmount || 0
  );

  const itemCount = Number(
    payload.itemCount || 0
  );

  if (!orderId) {
    console.error(
      "[ADMIN PUSH] Skipped: orderId is missing."
    );

    return;
  }

  if (!orderNumber) {
    console.error(
      "[ADMIN PUSH] Skipped: orderNumber is missing."
    );

    return;
  }

  // ---------------------------------------------------------
  // Send notification request to Admin Dashboard
  // ---------------------------------------------------------

  try {
    const response = await fetch(
      webhookUrl,
      {
        method: "POST",

        headers: {
          Accept: "application/json",

          "Content-Type":
            "application/json",

          "x-gb-push-secret":
            webhookSecret,
        },

        body: JSON.stringify({
          orderId,
          orderNumber,
          customerName,
          totalAmount,
          itemCount,
        }),

        cache: "no-store",
      }
    );

    const responseText =
      await response.text();

    // -------------------------------------------------------
    // Admin endpoint returned an error
    // -------------------------------------------------------

    if (!response.ok) {
      console.error(
        "[ADMIN PUSH] Webhook returned an error:",
        {
          status:
            response.status,

          statusText:
            response.statusText,

          response:
            responseText,

          orderId,

          orderNumber,
        }
      );

      // IMPORTANT:
      // Do not throw.
      //
      // Customer payment/order has already succeeded.
      // Notification failure must not turn a successful
      // payment into a failed checkout.
      return;
    }

    // -------------------------------------------------------
    // Successful notification
    // -------------------------------------------------------

    let result: unknown =
      responseText;

    try {
      result =
        responseText
          ? JSON.parse(
              responseText
            )
          : null;
    } catch {
      // Response doesn't have to be JSON.
    }

    console.log(
      "[ADMIN PUSH] Order notification processed:",
      {
        orderId,
        orderNumber,
        result,
      }
    );
  } catch (error) {
    /**
     * Network failure, Admin Vercel downtime,
     * Firebase problem, etc.
     *
     * NEVER propagate this error into checkout.
     */

    console.error(
      "[ADMIN PUSH] Webhook request failed:",
      {
        orderId,
        orderNumber,

        error:
          error instanceof Error
            ? error.message
            : String(error),
      }
    );
  }
}
