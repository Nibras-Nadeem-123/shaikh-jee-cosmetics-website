import { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, Mail, UserCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy | Shaikh Jee Cosmetics',
  description: 'Learn how Shaikh Jee Cosmetics collects, uses, and protects your personal information. Your privacy matters to us.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* Header Banner */}
      <div className="bg-primary text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 mb-4">
            <Shield size={12} />
            Your Privacy Matters
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-lg opacity-80 max-w-2xl mx-auto">
            Last updated: January 2024
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-8">
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl shadow-primary/5 border border-primary/5 max-w-4xl mx-auto">

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 p-6 bg-secondary/50 rounded-2xl">
            {[
              { icon: Database, label: 'Information Collection' },
              { icon: Eye, label: 'How We Use Data' },
              { icon: Lock, label: 'Data Security' },
              { icon: UserCheck, label: 'Your Rights' },
              { icon: Mail, label: 'Contact Us' },
              { icon: Shield, label: 'Cookie Policy' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon size={16} className="text-primary" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Database size={24} className="text-primary" />
                Information We Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                At Shaikh Jee Cosmetics, we collect information to provide you with a better shopping experience. This includes:
              </p>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Personal Information:</strong> Name, email address, phone number, shipping and billing addresses when you create an account or place an order.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Payment Information:</strong> Payment method details processed securely through our payment partners (Razorpay). We do not store your complete card details.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Browsing Information:</strong> Products viewed, items added to cart, search queries, and purchase history to personalize your experience.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Device Information:</strong> IP address, browser type, device type, and operating system for security and analytics purposes.</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Eye size={24} className="text-primary" />
                How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use the collected information for the following purposes:
              </p>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Processing and fulfilling your orders, including shipping and delivery notifications</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Communicating with you about orders, promotions, and customer service inquiries</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Personalizing your shopping experience with product recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Improving our website, products, and services</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Preventing fraud and ensuring the security of our platform</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Complying with legal obligations and regulations</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Lock size={24} className="text-primary" />
                Data Security
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>SSL/TLS encryption for all data transmission</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Secure payment processing through PCI-DSS compliant payment gateways</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Regular security audits and vulnerability assessments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span>Access controls and authentication measures for our systems</span>
                </li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Shield size={24} className="text-primary" />
                Cookies & Tracking
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your browsing experience:
              </p>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Essential Cookies:</strong> Required for basic website functionality like shopping cart and checkout</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements (can be disabled)</span>
                </li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <UserCheck size={24} className="text-primary" />
                Your Rights
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the following rights regarding your personal data:
              </p>
              <ul className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Access:</strong> Request a copy of your personal data we hold</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Correction:</strong> Update or correct inaccurate information</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0"></span>
                  <span><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</span>
                </li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                To exercise these rights, please contact us at <a href="mailto:privacy@shaikhjee.com" className="text-primary hover:underline">privacy@shaikhjee.com</a>
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Mail size={24} className="text-primary" />
                Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 p-6 bg-secondary/50 rounded-xl">
                <p className="text-foreground font-medium">Shaikh Jee Cosmetics</p>
                <p className="text-muted-foreground">Email: privacy@shaikhjee.com</p>
                <p className="text-muted-foreground">Phone: +92 321 1234567</p>
                <p className="text-muted-foreground">Address: Karachi, Sindh, Pakistan</p>
              </div>
            </section>
          </div>

          {/* Back Link */}
          <div className="mt-12 pt-8 border-t border-border text-center">
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
