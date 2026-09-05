import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabase } from "../../../../lib/supabase-server";

export const dynamic = "force-dynamic";

function normalizeIndianPhone(value: unknown) {
  const raw = String(value || "").trim();
  const compact = raw.replace(/[\s()-]/g, "");
  if (/^\+\d{10,15}$/.test(compact)) return compact;
  const digits = compact.replace(/\D/g, "");
  if (/^\d{10}$/.test(digits)) return `+91${digits}`;
  if (/^91\d{10}$/.test(digits)) return `+${digits}`;
  return "";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName || "").trim().slice(0, 100);
    const email = String(body.email || "").trim().toLowerCase();
    const phone = normalizeIndianPhone(body.phone);
    const password = String(body.password || "");

    if (fullName.length < 2) {
      return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must contain at least 8 characters." }, { status: 400 });
    }

    const supabase = createServiceSupabase();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      phone,
      password,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) {
      const message = String(error.message || "Unable to create account.");
      const duplicate = /already|registered|exists|duplicate/i.test(message);
      return NextResponse.json(
        { error: duplicate ? "An account already exists with this email or mobile number." : message },
        { status: duplicate ? 409 : 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json({ error: "Unable to create account." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create account." },
      { status: 500 }
    );
  }
}
