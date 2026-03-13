import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToastProvider, ToastContainer } from "@/hooks/useToast";
import { MobileNav } from "@/components/MobileNav";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: "Shaikh Jee Cosmetics | Premium Beauty & Skincare",
  description: "Discover luxurious cosmetics and premium skincare at Shaikh Jee. 100% authentic products, free shipping on orders above ₹999, and cruelty-free beauty essentials.",
  keywords: ["cosmetics", "skincare", "beauty", "makeup", "luxury beauty", "Indian cosmetics", "organic skincare"],
  authors: [{ name: "Shaikh Jee Cosmetics" }],
  creator: "Shaikh Jee Cosmetics",
  publisher: "Shaikh Jee Cosmetics",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shaikhjee.com",
    title: "Shaikh Jee Cosmetics | Premium Beauty & Skincare",
    description: "Discover luxurious cosmetics and premium skincare at Shaikh Jee. 100% authentic products, free shipping on orders above ₹999.",
    siteName: "Shaikh Jee Cosmetics",
    images: [
      {
        url: "https://shaikhjee.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Shaikh Jee Cosmetics - Premium Beauty Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shaikh Jee Cosmetics | Premium Beauty & Skincare",
    description: "Discover luxurious cosmetics and premium skincare at Shaikh Jee.",
    images: ["https://shaikhjee.com/twitter-image.jpg"],
    creator: "@shaikhjee",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: 1200,
  height: 630,
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <AppProvider >
            <Header />
              {children}
              <Footer />
              <MobileNav />
            </AppProvider>
            <ToastContainer />
          </ToastProvider>
      </body>
    </html>
  );
}
