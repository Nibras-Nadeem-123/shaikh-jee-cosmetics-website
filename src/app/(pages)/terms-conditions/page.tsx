import { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ShoppingBag, CreditCard, Truck, AlertCircle, Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Shaikh Jee Cosmetics',
  description: 'Read the terms and conditions for using Shaikh Jee Cosmetics website and services. Understand your rights and responsibilities.',
};

export default function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Header Banner */}
      <div className="bg-primary text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 mb-4">
            <Scale size={12} />
            Legal Agreement
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Terms & Conditions</h1>
          <p className="mt-4 text-lg opacity-80 max-w-2xl mx-auto">
            Last updated: January 2024
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-8">
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl shadow-primary/5 border border-primary/5 max-w-4xl mx-auto">

          {/* Introduction */}
          <div className="p-6 bg-secondary/50 rounded-2xl mb-10">
            <p className="text-muted-foreground leading-relaxed">
              Welcome to Shaikh Jee Cosmetics. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully before making any purchases.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <FileText size={24} className="text-primary" />
                1. General Terms
              </h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>These Terms constitute a legally binding agreement between you and Shaikh Jee Cosmetics.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>You must be at least 18 years of age to use our services or have parental/guardian consent.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>All content on this website is protected by intellectual property laws.</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <ShoppingBag size={24} className="text-primary" />
                2. Products & Orders
              </h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>All products displayed are subject to availability. We reserve the right to limit quantities.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Product images are for illustration purposes. Actual products may vary slightly in appearance.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Prices are in Pakistani Rupees (PKR) and include applicable taxes unless stated otherwise.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>We reserve the right to cancel orders due to pricing errors, suspected fraud, or stock unavailability.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Order confirmation email constitutes acceptance of your order by us.</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <CreditCard size={24} className="text-primary" />
                3. Payment Terms
              </h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>We accept Credit/Debit Cards, UPI, Net Banking, and Cash on Delivery (COD).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>All online payments are processed through secure, PCI-DSS compliant payment gateways.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>COD orders may have an additional handling fee as displayed at checkout.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Failed payment attempts may require re-processing or alternative payment methods.</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Truck size={24} className="text-primary" />
                4. Shipping & Delivery
              </h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Free shipping on orders above Rs.999. Standard shipping charges apply for orders below this amount.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Estimated delivery times are 3-7 business days for metro cities, 7-10 days for other locations.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Delivery times may vary due to external factors beyond our control.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Risk of loss transfers to you upon delivery to the shipping address provided.</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <AlertCircle size={24} className="text-primary" />
                5. User Responsibilities
              </h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>You agree to provide accurate and complete information when creating an account or placing orders.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>You are responsible for maintaining the confidentiality of your account credentials.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>You must not use the website for any unlawful or prohibited purpose.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>You must not attempt to interfere with the proper functioning of the website.</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Scale size={24} className="text-primary" />
                6. Limitation of Liability
              </h2>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Shaikh Jee Cosmetics is not liable for any indirect, incidental, or consequential damages.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Our total liability shall not exceed the amount paid for the product or service in question.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>We do not guarantee uninterrupted or error-free website operation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Product results may vary based on individual skin type and usage.</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Governing Law & Disputes</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by the laws of Pakistan. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of courts in Karachi, Sindh.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For questions about these Terms & Conditions, please contact us:
              </p>
              <div className="p-6 bg-secondary/50 rounded-xl">
                <p className="text-foreground font-medium">Shaikh Jee Cosmetics</p>
                <p className="text-muted-foreground">Email: legal@shaikhjee.com</p>
                <p className="text-muted-foreground">Phone: +92 321 1234567</p>
                <p className="text-muted-foreground">Address: Karachi, Sindh, Pakistan</p>
              </div>
            </section>
          </div>

          {/* Related Links */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Related Policies</h3>
            <div className="flex flex-wrap gap-4">
              <Link href="/privacy-policy" className="px-4 py-2 bg-secondary rounded-full text-sm hover:bg-primary hover:text-white transition-all">
                Privacy Policy
              </Link>
              <Link href="/return-policy" className="px-4 py-2 bg-secondary rounded-full text-sm hover:bg-primary hover:text-white transition-all">
                Return Policy
              </Link>
              <Link href="/shipping" className="px-4 py-2 bg-secondary rounded-full text-sm hover:bg-primary hover:text-white transition-all">
                Shipping Information
              </Link>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
