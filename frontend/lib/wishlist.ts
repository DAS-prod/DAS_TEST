const WISHLIST_KEY = "godavari-basket-wishlist";

function normaliseIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return Array.from(new Set(
    value.map(Number).filter((id) => Number.isFinite(id) && id > 0)
  ));
}

export function getWishlist(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return normaliseIds(JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]"));
  } catch {
    return [];
  }
}

export function isWishlisted(id: number): boolean {
  return getWishlist().includes(Number(id));
}

function saveWishlist(ids: number[]) {
  const clean = normaliseIds(ids);
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(clean));
  window.dispatchEvent(new CustomEvent("wishlist-updated", { detail: clean }));
  return clean;
}

export function toggleWishlist(id: number): boolean {
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) return false;
  const current = getWishlist();
  const liked = !current.includes(numericId);
  saveWishlist(liked ? [...current, numericId] : current.filter((item) => item !== numericId));
  return liked;
}

export function clearWishlist() {
  saveWishlist([]);
}
