import { Metadata } from 'next';

export function generateProductMetadata(product: {
    name: string;
    description: string;
    slug: string;
    image?: string;
    price: number;
    rating: number;
}): Metadata {
    return {
        title: `${product.name} - Shaikh Jee Cosmetics`,
        description: product.description.substring(0, 160),
        keywords: [product.name, 'cosmetics', 'beauty', 'skincare'],
        openGraph: {
            title: product.name,
            description: product.description,
            type: 'article',
            images: product.image ? [{ url: product.image }] : [],
            url: `https://shaikhjee.com/product/${product.slug}`,
        },
        robots: {
            index: true,
            follow: true,
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description: product.description,
            images: product.image ? [product.image] : [],
        },
    };
}

export const jsonLdProductSchema = (product: {
    _id: string;
    name: string;
    description: string;
    price: number;
    rating: number;
    reviewCount: number;
    image?: string;
    inStock: boolean;
}) => {
    return {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image || 'https://shaikhjee.com/default-product.jpg',
        brand: {
            '@type': 'Brand',
            name: 'Shaikh Jee Cosmetics',
        },
        offers: {
            '@type': 'Offer',
            url: `https://shaikhjee.com/product/${product._id}`,
            priceCurrency: 'INR',
            price: product.price.toString(),
            availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating.toString(),
            reviewCount: product.reviewCount.toString(),
        },
    };
};

export const jsonLdOrganization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shaikh Jee Cosmetics',
    url: 'https://shaikhjee.com',
    logo: 'https://shaikhjee.com/logo.png',
    sameAs: [
        'https://www.facebook.com/shaikhjee',
        'https://www.instagram.com/shaikhjee',
        'https://www.twitter.com/shaikhjee',
    ],
    contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-XXXXXXXXXX',
        contactType: 'Customer Service',
    },
};

export const jsonLdFaq = (faqs: { question: string; answer: string }[]) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
};
