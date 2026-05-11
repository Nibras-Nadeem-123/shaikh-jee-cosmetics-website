"use client"

import { ProductDetailsPage } from "@/components/productDetailsPage";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Product } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ProductPageClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        console.log(`Fetching product from: ${API_URL}/products/${slug}`);

        const res = await fetch(`${API_URL}/products/${slug}`, {
          signal: controller.signal,
          cache: 'no-store'
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error(`API returned ${res.status}:`, errorData);
          setError(`Product not found (${res.status})`);
          setProduct(null);
          return;
        }

        const data = await res.json();
        if (!data.product) {
          console.error('API response missing product:', data);
          setError('Invalid API response');
          setProduct(null);
          return;
        }
        setProduct(data.product);
      } catch (error: any) {
        console.error("Error fetching product:", error);
        if (error.name === 'AbortError') {
          setError('Request timed out - server may not be running');
        } else {
          setError(`Failed to fetch: ${error.message}`);
        }
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    // Log the error for debugging
    if (error) {
      console.error(`Product page error for slug "${slug}":`, error);
    }
    notFound();
  }

  return <ProductDetailsPage product={product} />;
}
