import { Product, Review } from "@/types";
import { siteConfig, getFullAddress } from "@/config/siteConfig";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shaikhjee.com';
const SITE_NAME = siteConfig.name;

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Generic JSON-LD component
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Product JSON-LD for rich snippets in Google search
 */
export function ProductJsonLd({
  product,
  reviews = []
}: {
  product: Product;
  reviews?: Review[];
}) {
  const productUrl = `${SITE_URL}/product/${product.slug}`;
  const productImage = product.images?.[0] || product.image || `${SITE_URL}/placeholder.png`;

  // Calculate aggregate rating
  const hasReviews = reviews.length > 0;
  const avgRating = hasReviews
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : product.rating || 4.5;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [productImage],
    "url": productUrl,
    "sku": product._id,
    "mpn": product._id,
    "brand": {
      "@type": "Brand",
      "name": product.brand || SITE_NAME
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "price": product.price,
      "priceCurrency": "PKR",
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "availability": product.inStock !== false
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": SITE_NAME
      },
      ...(product.originalPrice && product.originalPrice > product.price && {
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": product.price,
          "priceCurrency": "PKR",
          "valueAddedTaxIncluded": true
        }
      })
    },
    // Aggregate Rating
    ...(hasReviews || product.rating) && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": avgRating.toFixed(1),
        "reviewCount": reviews.length || product.reviewCount || 1,
        "bestRating": "5",
        "worstRating": "1"
      }
    },
    // Individual Reviews
    ...(hasReviews && {
      "review": reviews.slice(0, 5).map(review => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5",
          "worstRating": "1"
        },
        "author": {
          "@type": "Person",
          "name": review.userName || (typeof review.user === 'object' ? review.user.name : 'Customer')
        },
        "datePublished": new Date(review.createdAt).toISOString(),
        "reviewBody": review.comment
      }))
    }),
    // Additional product info
    ...(product.shades && product.shades.length > 0 && {
      "color": product.shades.map(s => s.name).join(", ")
    }),
    // Return policy
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 7,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    },
    // Shipping details
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": product.price >= 999 ? 0 : 50,
        "currency": "PKR"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "PK"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 1,
          "maxValue": 2,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 3,
          "maxValue": 7,
          "unitCode": "DAY"
        }
      }
    }
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * Organization JSON-LD for brand identity
 */
export function OrganizationJsonLd() {
  const socialLinks = [
    siteConfig.social.facebook,
    siteConfig.social.instagram,
    siteConfig.social.twitter,
    siteConfig.social.youtube,
    siteConfig.social.pinterest,
  ].filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "alternateName": "Shaikh Jee",
    "url": SITE_URL,
    "logo": `${SITE_URL}/logo.png`,
    "description": siteConfig.description,
    "foundingDate": "2020",
    "sameAs": socialLinks,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": siteConfig.contact.phone,
      "contactType": "customer service",
      "email": siteConfig.contact.email,
      "availableLanguage": ["English", "Hindi", "Urdu"]
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
      "addressLocality": siteConfig.address.city,
      "addressRegion": siteConfig.address.state,
      "postalCode": siteConfig.address.pincode,
      "addressCountry": "PK"
    }
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * Website JSON-LD with search action
 */
export function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/shop?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * Breadcrumb JSON-LD
 */
export function BreadcrumbJsonLd({
  items
}: {
  items: { name: string; url: string }[]
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
    }))
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * FAQ JSON-LD for FAQ pages
 */
export function FAQJsonLd({
  faqs
}: {
  faqs: { question: string; answer: string }[]
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * Local Business JSON-LD (if applicable)
 */
export function LocalBusinessJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": SITE_NAME,
    "image": `${SITE_URL}/logo.png`,
    "url": SITE_URL,
    "@id": SITE_URL,
    "priceRange": "$$",
    "servesCuisine": "Cosmetics",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Beauty Products",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Skincare",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Moisturizers" } },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Serums" } },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Cleansers" } }
          ]
        },
        {
          "@type": "OfferCatalog",
          "name": "Makeup",
          "itemListElement": [
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Lipsticks" } },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Foundations" } },
            { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Eye Makeup" } }
          ]
        }
      ]
    }
  };

  return <JsonLd data={jsonLd} />;
}

/**
 * Collection/Category page JSON-LD
 */
export function CollectionJsonLd({
  name,
  description,
  products,
  url
}: {
  name: string;
  description: string;
  products: Product[];
  url: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url.startsWith('http') ? url : `${SITE_URL}${url}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `${SITE_URL}/product/${product.slug}`,
          "image": product.images?.[0] || product.image,
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "PKR",
            "availability": product.inStock !== false
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock"
          }
        }
      }))
    }
  };

  return <JsonLd data={jsonLd} />;
}

export default JsonLd;
