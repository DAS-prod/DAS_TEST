import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Godavari Basket | Authentic Godavari Products & Specialties",
  description: "Discover authentic products, seasonal specialties, traditional foods, gifts and unique treasures from the Godavari region, carefully curated and delivered to your doorstep.",
  openGraph: { title: "Godavari Basket | Authentic Godavari Products & Specialties", description: "Discover authentic products rooted in the Godavari region.", images: ["/og-image.jpg"], locale: "en_IN", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
