import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "../../../../lib/promotions";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const subtotal = Number(body.subtotal || 0);
    if (!Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json({ error: "Invalid cart subtotal." }, { status: 400 });
    }
    const result = await validateCoupon(body.code, subtotal);
    return NextResponse.json(result, { status: result.valid ? 200 : 400 });
  } catch {
    return NextResponse.json({ error: "Unable to validate coupon." }, { status: 400 });
  }
}
