"use client";

import { useEffect } from "react";

const KEY = "godavari-basket-referral";

/**
 * Invisible campaign attribution.
 * Customers never see referral UI. An influencer can share:
 *   https://godavaribasket.com/?ref=INFLUENCER_CODE
 * We store the code for checkout attribution, then remove `ref` from
 * the visible browser URL so the storefront behaves normally.
 */
export default function ReferralTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const raw = url.searchParams.get("ref");
    if (!raw) return;

    const referral = raw
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "")
      .slice(0, 40);

    if (!referral) return;

    localStorage.setItem(KEY, referral);
    document.cookie = `${KEY}=${encodeURIComponent(referral)}; path=/; max-age=${60 * 60 * 24 * 90}; samesite=lax`;

    url.searchParams.delete("ref");
    const clean = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, "", clean || "/");
  }, []);

  return null;
}
