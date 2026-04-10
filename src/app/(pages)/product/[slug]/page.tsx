import ProductPageClient from "./ProductPageClient";
import { notFound } from "next/navigation";
import { Product } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Generate static params for all products
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/products?limit=100`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    return (data.products || []).map((product: Product) => ({
      slug: product.slug,
    }));
  } catch (error) {
    console.error("Error fetching products for static params:", error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return {
        title: "Product Not Found | Shaikh Jee Cosmetics",
      };
    }
    
    const data = await res.json();
    const product = data.product;
    
    return {
      title: `${product.name} | Shaikh Jee Cosmetics`,
      description: product.description,
      openGraph: {
        images: [product.images?.[0] || "/placeholder.png"],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product | Shaikh Jee Cosmetics",
    };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductPageClient slug={slug} />;
}
