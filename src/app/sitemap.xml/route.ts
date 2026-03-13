export async function GET() {
    const baseUrl = 'https://shaikhjee.com';

    // Static pages
    const staticPages = [
        { url: '', priority: 1.0, frequency: 'daily' },
        { url: '/shop', priority: 0.9, frequency: 'daily' },
        { url: '/about', priority: 0.7, frequency: 'monthly' },
        { url: '/contact', priority: 0.7, frequency: 'monthly' },
        { url: '/login', priority: 0.6, frequency: 'monthly' },
    ];

    // Dynamic product pages (you can fetch from API)
    const products = [
        // Add product slugs here
        { url: '/product/velvet-matte-lipstick', priority: 0.8, frequency: 'weekly' },
        { url: '/product/radiant-glow-serum', priority: 0.8, frequency: 'weekly' },
        { url: '/product/luminous-foundation', priority: 0.8, frequency: 'weekly' },
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${[...staticPages, ...products]
            .map(
                ({ url, priority, frequency }) =>
                    `<url>
    <loc>${baseUrl}${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${frequency}</changefreq>
    <priority>${priority}</priority>
  </url>`
            )
            .join('\n  ')}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
