export type ProductVariant = {
  label: string;
  price: number;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  parent_category?: string;
  subcategory?: string;
  collection?: string;
  gift_type?: string;
  region?: string;
  district?: string;
  origin?: string;
  tags?: string;
  size: string;
  price: number;
  "250g"?: number;
  "500g"?: number;
  "1kg"?: number;
  rating: number;
  reviews: number;
  badge?: string;
  image: string;
  description: string;
  ingredients?: string;
  benefits?: string;
  stock: number;
  active: boolean;
  variants?: ProductVariant[];
};

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function getProducts(): Promise<Product[]> {
  const r = await fetch(`${API_URL}/api/products`, { cache: "no-store" });
  if (!r.ok) throw new Error("Failed to fetch products");
  return r.json();
}

export async function getProduct(id: number): Promise<Product> {
  const r = await fetch(`${API_URL}/api/products/${id}`, { cache: "no-store" });
  if (!r.ok) throw new Error("Product not found");
  return r.json();
}
