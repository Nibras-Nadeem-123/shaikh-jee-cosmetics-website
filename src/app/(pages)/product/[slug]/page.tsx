import ProductPageClient from "./ProductPageClient";
import { notFound } from "next/navigation";
import { Product } from "@/types";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const dynamic = 'force-dynamic';

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shaikh-jee-cosmetics-website.vercel.app';

  try {
    const res = await fetch(`${API_URL}/products/${slug}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      return {
        title: "Product Not Found | Shaikh Jee Cosmetics",
        description: "The product you are looking for could not be found.",
      };
    }

    const data = await res.json();
    const product = data.product;
    const productImage = product.images?.[0] || "/placeholder.png";
    const productUrl = `${siteUrl}/product/${product.slug}`;

    // Generate description (truncate if too long)
    const description = product.metaDescription ||
      (product.description?.length > 160
        ? product.description.substring(0, 157) + '...'
        : product.description) ||
      `Buy ${product.name} at Shaikh Jee Cosmetics. Premium beauty products at best prices.`;

    // Generate keywords
    const keywords = product.metaKeywords || [
      product.name,
      product.category,
      'cosmetics',
      'beauty',
      'skincare',
      'makeup',
      'Shaikh Jee',
      ...(product.skinTypes || [])
    ].join(', ');

    return {
      title: product.metaTitle || `${product.name} | Shaikh Jee Cosmetics`,
      description,
      keywords,
      authors: [{ name: 'Shaikh Jee Cosmetics' }],
      creator: 'Shaikh Jee Cosmetics',
      publisher: 'Shaikh Jee Cosmetics',

      // Canonical URL
      alternates: {
        canonical: productUrl,
      },

      // OpenGraph tags for social sharing
      openGraph: {
        title: `${product.name} - Rs.${product.price}`,
        description,
        url: productUrl,
        siteName: 'Shaikh Jee Cosmetics',
        images: [
          {
            url: productImage,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },

      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - Rs.${product.price}`,
        description,
        images: [productImage],
        creator: '@shaikhjee',
      },

      // Robots
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },

      // Other meta tags
      other: {
        'product:price:amount': product.price?.toString() || '',
        'product:price:currency': 'PKR',
        'product:availability': product.inStock ? 'in stock' : 'out of stock',
        'product:category': product.category || '',
        'product:brand': 'Shaikh Jee Cosmetics',
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product | Shaikh Jee Cosmetics",
      description: "Discover premium beauty and skincare products at Shaikh Jee Cosmetics.",
    };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shaikh-jee-cosmetics-website.vercel.app';

  // Fetch product for JSON-LD (server-side)
  let product: Product | null = null;
  let reviews: any[] = [];

  try {
    const productRes = await fetch(`${API_URL}/products/${slug}`, {
      cache: 'no-store'
    });

    if (productRes.ok) {
      const productData = await productRes.json();
      product = productData.product;

      // Fetch reviews for aggregate rating
      try {
        const reviewsRes = await fetch(`${API_URL}/reviews/product/${product?._id}?limit=5`, {
          cache: 'no-store'
        });
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          reviews = reviewsData.reviews || [];
        }
      } catch (e) {
        // Reviews are optional
      }
    }
  } catch (error) {
    console.error("Error fetching product for JSON-LD:", error);
  }

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      {product && (
        <>
          <ProductJsonLd product={product} reviews={reviews} />
          <BreadcrumbJsonLd
            items={[
              { name: "Home", url: "/" },
              { name: "Shop", url: "/shop" },
              { name: product.category, url: `/shop?category=${product.category.toLowerCase()}` },
              { name: product.name, url: `/product/${product.slug}` }
            ]}
          />
        </>
      )}
      <ProductPageClient slug={slug} />
    </>
  );
}
