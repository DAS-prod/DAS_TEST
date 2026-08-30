import type { MetadataRoute } from "next";

type Product = {
  id: number;
  active?: boolean;
};

const SITE_URL = "https://godavaribasket.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  if (!API_URL) {
    return urls;
  }

  try {
    const response = await fetch(`${API_URL}/api/products`, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return urls;
    }

    const products = (await response.json()) as Product[];

    urls.push(
      ...products
        .filter((product) => product.active !== false)
        .map((product) => ({
          url: `${SITE_URL}/products/${product.id}`,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }))
    );
  } catch {
    // Keep the homepage in the sitemap if the product API is temporarily unavailable.
  }

  return urls;
}
