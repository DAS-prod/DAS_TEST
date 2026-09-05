import { createServiceSupabase } from "./supabase-server";

export type CouponResult = {
  valid: boolean;
  code: string;
  discountPercent: number;
  discountAmount: number;
  minimumOrder: number;
  message: string;
};

const DEFAULT_CODE = (process.env.DEFAULT_COUPON_CODE || "GODAVARI5").trim().toUpperCase();
const DEFAULT_PERCENT = Number(process.env.DEFAULT_COUPON_PERCENT || 5);
const DEFAULT_MINIMUM = Number(process.env.DEFAULT_COUPON_MINIMUM || 1000);
const DEFAULT_ACTIVE = String(process.env.DEFAULT_COUPON_ACTIVE || "true").toLowerCase() !== "false";

export async function validateCoupon(codeInput: unknown, subtotal: number): Promise<CouponResult> {
  const code = String(codeInput || "").trim().toUpperCase();
  if (!code) {
    return { valid: false, code: "", discountPercent: 0, discountAmount: 0, minimumOrder: DEFAULT_MINIMUM, message: "Enter a coupon code." };
  }

  let percent = DEFAULT_PERCENT;
  let minimum = DEFAULT_MINIMUM;
  let active = DEFAULT_ACTIVE;
  let found = code === DEFAULT_CODE;
  let maxDiscount: number | null = null;

  try {
    const supabase = createServiceSupabase();
    const { data, error } = await supabase
      .from("coupons")
      .select("code,discount_percent,minimum_order,maximum_discount,active,starts_at,ends_at")
      .eq("code", code)
      .maybeSingle();

    if (!error) {
      found = Boolean(data);
    }
    if (!error && data) {
      percent = Number(data.discount_percent || 0);
      minimum = Number(data.minimum_order || 0);
      maxDiscount = data.maximum_discount == null ? null : Number(data.maximum_discount);
      active = Boolean(data.active);
      const now = Date.now();
      if (data.starts_at && new Date(data.starts_at).getTime() > now) active = false;
      if (data.ends_at && new Date(data.ends_at).getTime() < now) active = false;
    }
  } catch {
    // Local testing is intentionally supported before the coupons migration is applied.
  }

  if (!found) {
    return { valid: false, code, discountPercent: 0, discountAmount: 0, minimumOrder: minimum, message: "This coupon code is not valid." };
  }

  if (!active) {
    return { valid: false, code, discountPercent: 0, discountAmount: 0, minimumOrder: minimum, message: "This coupon is currently inactive." };
  }

  if (subtotal < minimum) {
    return { valid: false, code, discountPercent: percent, discountAmount: 0, minimumOrder: minimum, message: `Minimum order value is ₹${minimum.toLocaleString("en-IN")}.` };
  }

  let discountAmount = Number((subtotal * (percent / 100)).toFixed(2));
  if (maxDiscount != null && Number.isFinite(maxDiscount)) {
    discountAmount = Math.min(discountAmount, maxDiscount);
  }

  return {
    valid: true,
    code,
    discountPercent: percent,
    discountAmount,
    minimumOrder: minimum,
    message: `${percent}% offer applied successfully.`,
  };
}
