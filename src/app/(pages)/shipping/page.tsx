import { Metadata } from 'next';
import Link from 'next/link';
import { Truck, MapPin, Clock, Package, Banknote, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Shipping Information | Shaikh Jee Cosmetics',
  description: 'Learn about our shipping policies, delivery times, and shipping charges. Free shipping on orders above Rs.999.',
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Header Banner */}
      <div className="bg-primary text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 mb-4">
            <Truck size={12} />
            Fast & Reliable Delivery
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Shipping Information</h1>
          <p className="mt-4 text-lg opacity-80 max-w-2xl mx-auto">
            Free shipping on orders above Rs.999. Delivering beauty to your doorstep.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-8">
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl shadow-primary/5 border border-primary/5 max-w-4xl mx-auto">

          {/* Free Shipping Banner */}
          <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full mb-4">
              <Truck size={32} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Free Shipping on Orders Above Rs.999</h2>
            <p className="text-muted-foreground">Enjoy complimentary delivery across Pakistan on qualifying orders</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Banknote size={24} className="text-primary" />
                Shipping Charges
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary/50">
                      <th className="text-left p-4 font-bold text-foreground rounded-tl-xl">Order Value</th>
                      <th className="text-left p-4 font-bold text-foreground">Standard Shipping</th>
                      <th className="text-left p-4 font-bold text-foreground rounded-tr-xl">Express Shipping</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border">
                      <td className="p-4">Below Rs.499</td>
                      <td className="p-4">Rs.79</td>
                      <td className="p-4">Rs.149</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-4">Rs.499 - Rs.998</td>
                      <td className="p-4">Rs.49</td>
                      <td className="p-4">Rs.99</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-green-600">Rs.999 & Above</td>
                      <td className="p-4 font-bold text-green-600">FREE</td>
                      <td className="p-4">Rs.49</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                * Shipping charges may vary for remote locations and heavy items.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Clock size={24} className="text-primary" />
                Delivery Times
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-secondary/30 rounded-2xl">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Package size={20} className="text-primary" />
                    Standard Shipping
                  </h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      Metro Cities: 3-5 business days
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      Tier 2 Cities: 5-7 business days
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      Other Areas: 7-10 business days
                    </li>
                  </ul>
                </div>

                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Truck size={20} className="text-primary" />
                    Express Shipping
                  </h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      Metro Cities: 1-2 business days
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      Tier 2 Cities: 2-3 business days
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle size={14} className="text-green-500" />
                      Other Areas: 3-5 business days
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                * Business days exclude Sundays and public holidays. Orders placed after 2 PM will be processed the next business day.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <MapPin size={24} className="text-primary" />
                Delivery Locations
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We deliver across Pakistan. Our delivery network covers:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi',
                  'Faisalabad', 'Multan', 'Peshawar', 'Quetta',
                  'Hyderabad', 'Sialkot', 'Gujranwala', 'Bahawalpur',
                ].map((city) => (
                  <div key={city} className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                    <MapPin size={14} className="text-primary" />
                    <span className="text-sm text-foreground">{city}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                + All major cities and towns across Pakistan. Enter your postal code at checkout to confirm delivery availability.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4">Order Processing</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Orders are processed within 1-2 business days of placement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>You will receive an email confirmation with tracking details once your order ships</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Track your order anytime using the tracking link or our Order Tracking page</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>For COD orders, please keep the exact amount ready at the time of delivery</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4">Shipping Partners</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We partner with leading courier services to ensure safe and timely delivery:
              </p>
              <div className="flex flex-wrap gap-4">
                {['TCS', 'Leopards Courier', 'M&P', 'Trax'].map((partner) => (
                  <div key={partner} className="px-4 py-2 bg-secondary rounded-full text-sm font-medium">
                    {partner}
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4">Important Notes</h2>
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                <ul className="space-y-2 text-amber-800 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0"></span>
                    <span>Delivery times may be affected during sale events, festivals, or unforeseen circumstances</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0"></span>
                    <span>Ensure correct address and phone number to avoid delivery delays</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0"></span>
                    <span>Multiple delivery attempts will be made. Unclaimed orders will be returned to us</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0"></span>
                    <span>For damaged packages, please refuse delivery and contact us immediately</span>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          {/* Track Order CTA */}
          <div className="mt-12 p-8 bg-primary/5 rounded-2xl text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Already placed an order?</h3>
            <p className="text-muted-foreground mb-6">Track your package in real-time with our order tracking system.</p>
            <Link href="/track" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all font-medium">
              Track Your Order
              <Truck size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
