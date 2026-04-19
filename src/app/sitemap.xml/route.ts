import { NextResponse } from 'next/server';

interface Product {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
}

interface Category {
  name: string;
  slug: string;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shaikhjee.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Static pages
  const staticPages = [
    { url: '', priority: 1.0, frequency: 'daily' },
    { url: '/shop', priority: 0.9, frequency: 'daily' },
    { url: '/about', priority: 0.7, frequency: 'monthly' },
    { url: '/contact', priority: 0.7, frequency: 'monthly' },
    { url: '/login', priority: 0.5, frequency: 'monthly' },
    { url: '/cart', priority: 0.5, frequency: 'weekly' },
  ];

  // Category pages
  const categories: Category[] = [
    { name: 'Lips', slug: 'lips' },
    { name: 'Face', slug: 'face' },
    { name: 'Eyes', slug: 'eyes' },
    { name: 'Skincare', slug: 'skincare' },
    { name: 'Nails', slug: 'nails' },
    { name: 'Tools', slug: 'tools' },
  ];

  const categoryPages = categories.map(cat => ({
    url: `/shop?category=${cat.slug}`,
    priority: 0.8,
    frequency: 'daily'
  }));

  // Fetch products dynamically
  let productPages: { url: string; priority: number; frequency: string; lastmod?: string }[] = [];

  try {
    const response = await fetch(`${apiUrl}/products?limit=1000`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (response.ok) {
      const data = await response.json();
      const products: Product[] = data.products || [];

      productPages = products.map(product => ({
        url: `/product/${product.slug}`,
        priority: 0.8,
        frequency: 'weekly',
        lastmod: product.updatedAt || product.createdAt
      }));
    }
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error);
  }

  // Combine all pages
  const allPages = [...staticPages, ...categoryPages, ...productPages];

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${allPages
    .map(({ url, priority, frequency, lastmod }) => {
      const lastModDate = lastmod ? new Date(lastmod).toISOString() : new Date().toISOString();
      return `<url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>${frequency}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n  ')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
