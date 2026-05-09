import { ShopPageComponent } from '@/components/shop'
import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { CollectionJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shaikhjee.com';

// Force dynamic rendering for shop page (needs fresh product data)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop All Products | Shaikh Jee Cosmetics',
  description: 'Browse our complete collection of premium cosmetics, skincare, and beauty products. Find the perfect products for your beauty routine.',
  openGraph: {
    title: 'Shop All Products | Shaikh Jee Cosmetics',
    description: 'Browse our complete collection of premium cosmetics and skincare products.',
    url: `${SITE_URL}/shop`,
  },
}

export default async function ShopPage() {
  // Fetch featured products for JSON-LD
  let products: any[] = [];
  try {
    const res = await fetch(`${API_URL}/products?limit=10&featured=true`, {
      next: { revalidate: 0 } // Force fresh data for dynamic page
    });
    if (res.ok) {
      const data = await res.json();
      products = data.products || [];
    }
  } catch (error) {
    console.error("Error fetching products for JSON-LD:", error);
  }

  return (
    <div>
      {/* JSON-LD Structured Data */}
      <CollectionJsonLd
        name="All Products"
        description="Browse our complete collection of premium cosmetics, skincare, and beauty products."
        products={products}
        url="/shop"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Shop", url: "/shop" }
        ]}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <ShopPageComponent />
      </Suspense>
    </div>
  )
}
