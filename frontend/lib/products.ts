export type Product = {
  id: number;
  name: string;
  category: string;
  parent_category?: string;
  subcategory?: string;
  region?: string;
  district?: string;
  origin?: string;
  tags?: string;
  gift_type?: string;
  collection?: string;
  size: string;
  price: number;
  seller_price: number;
  rating: number;
  reviews: number;
  badge?: string;
  image: string;
  description: string;
  ingredients?: string;
  benefits?: string;
  seller_id: string;
  seller_name: string;
  stock: number;
  active: boolean;
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
