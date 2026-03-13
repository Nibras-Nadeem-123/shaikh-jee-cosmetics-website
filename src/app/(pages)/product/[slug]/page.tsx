import { ProductDetailsPage } from "@/components/productDetailsPage";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiService } from "@/services/api"; // Import apiService
import { Product } from "@/types";
import { createClient } from "redis";
import mongoose from "mongoose";
// Ensure the environment variable is always a string
mongoose.connect(process.env.MONGO_URI || "", {});

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6380",
  password: process.env.REDIS_PASSWORD,
});

const productSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // Remove `index: true` if schema.index() is used
});

// If schema.index() is used, ensure it's not duplicating the above:
productSchema.index({ slug: 1 }); // Remove this if `index: true` is already used

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params; // No need for await params
  let product;
  try {
    product = await apiService.getProduct(slug);
  } catch (error) {
    console.error("Error fetching product for metadata:", error);
    // Fallback to generic metadata or re-throw if critical
  }

  if (!product) {
    return {
      title: "Product Not Found | Shaikh Jee Cosmetics",
      description: "The product you are looking for is not available.",
    };
  }

  return {
    title: `${product.name} | Shaikh Jee Cosmetics`,
    description: product.description,
    keywords: [product.name, product.category, ...product.skinTypes || []],
    openGraph: {
      title: `${product.name} | Shaikh Jee Cosmetics`,
      description: product.description,
      images: [
        {
          url: product.images?.[0] || "/placeholder.png",
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Shaikh Jee Cosmetics`,
      description: product.description,
      images: [product.images?.[0] || "/placeholder.png"],
    },
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
  let product;
  try {
    product = await apiService.getProduct(slug);
  } catch (error) {
    console.error("Error fetching product:", error);
  }

  if (!product) {
    notFound();
  }
  return <ProductDetailsPage product={product} />;
}

export async function generateStaticParams() {
  let products = [];
  try {
    const data = await apiService.getProducts(""); // Fetch all products
    products = data.products || [];
  } catch (error) {
    console.error("Error fetching products for generateStaticParams:", error);
  }

  return products.map((product: Product) => ({
    slug: product.slug,
  }));
}
