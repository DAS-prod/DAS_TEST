const WISHLIST_KEY = "godavari-basket-wishlist";

export function getWishlist(): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(WISHLIST_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map(Number)
      .filter((id) => Number.isFinite(id));
  } catch {
    return [];
  }
}

export function isWishlisted(id: number): boolean {
  return getWishlist().includes(Number(id));
}

export function toggleWishlist(id: number): boolean {
  const wishlist = getWishlist();
  const numericId = Number(id);

  let updated: number[];
  let liked: boolean;

  if (wishlist.includes(numericId)) {
    updated = wishlist.filter(
      (item) => item !== numericId
    );

    liked = false;
  } else {
    updated = [
      ...wishlist,
      numericId,
    ];

    liked = true;
  }

  localStorage.setItem(
    WISHLIST_KEY,
    JSON.stringify(updated)
  );

  window.dispatchEvent(
    new CustomEvent("wishlist-updated", {
      detail: updated,
    })
  );

  return liked;
}

export function clearWishlist() {
  localStorage.setItem(
    WISHLIST_KEY,
    JSON.stringify([])
  );

  window.dispatchEvent(
    new CustomEvent("wishlist-updated", {
      detail: [],
    })
  );
}
