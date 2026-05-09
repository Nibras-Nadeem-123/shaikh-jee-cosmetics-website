import { Metadata } from 'next';
import Link from 'next/link';
import { RotateCcw, Package, Clock, CheckCircle, XCircle, HelpCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Return & Refund Policy | Shaikh Jee Cosmetics',
  description: 'Learn about our hassle-free return and refund policy. Easy returns within 7 days for a seamless shopping experience.',
};

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Header Banner */}
      <div className="bg-primary text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 mb-4">
            <RotateCcw size={12} />
            Hassle-Free Returns
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Return & Refund Policy</h1>
          <p className="mt-4 text-lg opacity-80 max-w-2xl mx-auto">
            Your satisfaction is our priority. Easy returns within 7 days.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-8">
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl shadow-primary/5 border border-primary/5 max-w-4xl mx-auto">

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="text-center p-6 bg-secondary/50 rounded-2xl">
              <div className="text-3xl font-bold text-primary">7</div>
              <div className="text-sm text-muted-foreground mt-1">Days Return Window</div>
            </div>
            <div className="text-center p-6 bg-secondary/50 rounded-2xl">
              <div className="text-3xl font-bold text-primary">Free</div>
              <div className="text-sm text-muted-foreground mt-1">Return Shipping</div>
            </div>
            <div className="text-center p-6 bg-secondary/50 rounded-2xl">
              <div className="text-3xl font-bold text-primary">5-7</div>
              <div className="text-sm text-muted-foreground mt-1">Days Refund Time</div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Package size={24} className="text-primary" />
                Return Eligibility
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We want you to be completely satisfied with your purchase. Returns are accepted under the following conditions:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                  <h3 className="font-bold text-green-800 flex items-center gap-2 mb-4">
                    <CheckCircle size={20} />
                    Eligible for Return
                  </h3>
                  <ul className="space-y-2 text-green-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0"></span>
                      <span>Unused and unopened products in original packaging</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0"></span>
                      <span>Products with manufacturing defects</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0"></span>
                      <span>Wrong product delivered</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0"></span>
                      <span>Damaged during shipping</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 shrink-0"></span>
                      <span>Expired products (check on delivery)</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                  <h3 className="font-bold text-red-800 flex items-center gap-2 mb-4">
                    <XCircle size={20} />
                    Not Eligible for Return
                  </h3>
                  <ul className="space-y-2 text-red-700 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0"></span>
                      <span>Opened or used products (hygiene reasons)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0"></span>
                      <span>Products without original packaging/seals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0"></span>
                      <span>Items marked as "Final Sale" or "Non-Returnable"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0"></span>
                      <span>Free gifts or promotional items</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 shrink-0"></span>
                      <span>Returns requested after 7 days</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Clock size={24} className="text-primary" />
                How to Initiate a Return
              </h2>
              <div className="space-y-4">
                {[
                  { step: 1, title: 'Contact Us', description: 'Email us at returns@shaikhjee.com or call +92 321 1234567 within 7 days of delivery.' },
                  { step: 2, title: 'Get Return Authorization', description: 'Our team will verify your request and provide a Return Authorization Number (RAN).' },
                  { step: 3, title: 'Pack the Item', description: 'Pack the product securely in original packaging with all tags and accessories.' },
                  { step: 4, title: 'Ship or Schedule Pickup', description: 'Drop off at nearest courier or request free pickup (available in select cities).' },
                  { step: 5, title: 'Receive Refund', description: 'Once we receive and verify the product, refund will be processed within 5-7 business days.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 bg-secondary/30 rounded-xl">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <RotateCcw size={24} className="text-primary" />
                Refund Process
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Once your return is received and inspected, we will notify you about the status of your refund.
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Original Payment Method:</strong> Refunds will be credited to the original payment method (Credit/Debit Card, UPI, Net Banking).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>COD Orders:</strong> Refunds for Cash on Delivery orders will be processed via bank transfer. Please provide valid bank details.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Processing Time:</strong> Refunds are typically processed within 5-7 business days after inspection.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Bank Processing:</strong> Additional 3-5 business days may be required by your bank to reflect the refund.</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <HelpCircle size={24} className="text-primary" />
                Exchange Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Want a different shade or variant? We offer easy exchanges!
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Exchanges are subject to product availability</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>If the exchange item has a price difference, you will be charged or refunded accordingly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Exchange requests must be made within 7 days of delivery</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4">Damaged or Defective Products</h2>
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-amber-800">
                  <strong>Important:</strong> If you receive a damaged or defective product, please contact us within 48 hours of delivery with photos of the damage. We will arrange for immediate replacement or full refund at no additional cost to you.
                </p>
              </div>
            </section>
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-8 bg-primary/5 rounded-2xl">
            <h3 className="text-xl font-bold text-foreground mb-4">Need Help with Returns?</h3>
            <p className="text-muted-foreground mb-6">Our customer service team is here to assist you with any return or refund queries.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all font-medium">
                Contact Support
                <ArrowRight size={16} />
              </Link>
              <Link href="/track" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-border text-foreground rounded-full hover:bg-secondary transition-all font-medium">
                Track Your Order
              </Link>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-8 pt-8 border-t border-border text-center">
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
