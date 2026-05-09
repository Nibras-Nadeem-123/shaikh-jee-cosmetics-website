"use client"
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ShoppingBag, Truck, CreditCard, RotateCcw, User, Search } from 'lucide-react';
import { FAQJsonLd } from '@/components/seo/JsonLd';

const faqs = [
  {
    category: 'Orders & Shopping',
    icon: ShoppingBag,
    questions: [
      {
        question: 'How do I place an order on Shaikh Jee Cosmetics?',
        answer: 'Simply browse our products, add items to your cart, and proceed to checkout. You can create an account for a faster checkout experience or checkout as a guest. Follow the steps to enter your shipping address and payment details to complete your order.'
      },
      {
        question: 'Can I modify or cancel my order after placing it?',
        answer: 'You can modify or cancel your order within 2 hours of placing it by contacting our customer support. Once the order is dispatched, modifications cannot be made, but you can initiate a return after delivery.'
      },
      {
        question: 'Are all products on your website authentic?',
        answer: 'Yes, we guarantee 100% authenticity of all products. We source directly from authorized distributors and brands. Every product comes with a manufacturer seal and batch code verification.'
      },
      {
        question: 'How can I track my order?',
        answer: 'Once your order is shipped, you will receive an email with tracking details. You can also track your order by visiting our Track Order page and entering your order ID or the email used during checkout.'
      },
    ]
  },
  {
    category: 'Shipping & Delivery',
    icon: Truck,
    questions: [
      {
        question: 'What are the shipping charges?',
        answer: 'We offer FREE shipping on all orders above Rs.999. For orders below Rs.999, a nominal shipping fee of Rs.49-Rs.79 applies depending on your location. Express shipping is available at an additional cost.'
      },
      {
        question: 'How long does delivery take?',
        answer: 'Standard delivery takes 3-7 business days for metro cities and 7-10 days for other locations. Express delivery is available in select cities with 1-2 day delivery. Delivery times may vary during sale events.'
      },
      {
        question: 'Do you deliver internationally?',
        answer: 'Currently, we ship across Pakistan including all major cities and towns. We are working on expanding our delivery network to international locations. Please subscribe to our newsletter for updates on international shipping.'
      },
      {
        question: 'What if I am not available during delivery?',
        answer: 'Our courier partners will attempt delivery up to 3 times. You can reschedule delivery by contacting the courier directly using the tracking link. If all attempts fail, the package will be returned to us.'
      },
    ]
  },
  {
    category: 'Payments',
    icon: CreditCard,
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept Credit/Debit Cards (Visa, Mastercard), JazzCash, EasyPaisa, Bank Transfer, and Cash on Delivery (COD). All online payments are processed securely through our payment partners.'
      },
      {
        question: 'Is Cash on Delivery (COD) available?',
        answer: 'Yes, COD is available for orders up to Rs.5,000 in serviceable areas. A nominal COD handling fee may apply. COD is not available for certain pin codes due to courier limitations.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. We use industry-standard SSL encryption and PCI-DSS compliant payment gateways. We never store your complete card details on our servers.'
      },
      {
        question: 'What if my payment fails?',
        answer: 'If your payment fails, any debited amount will be automatically refunded within 5-7 business days. You can retry the payment or choose a different payment method.'
      },
    ]
  },
  {
    category: 'Returns & Refunds',
    icon: RotateCcw,
    questions: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 7-day return policy for unused and unopened products in original packaging. Products with manufacturing defects, wrong items, or damage during shipping are eligible for immediate replacement or refund.'
      },
      {
        question: 'How do I return a product?',
        answer: 'Contact our customer support within 7 days of delivery. Our team will provide a Return Authorization Number (RAN). Pack the product securely and ship it back or schedule a free pickup in select cities.'
      },
      {
        question: 'When will I receive my refund?',
        answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned product. The amount will be credited to your original payment method. Bank processing may take an additional 3-5 days.'
      },
      {
        question: 'Can I exchange a product instead of returning?',
        answer: 'Yes, exchanges are available subject to product availability. Contact our support team within 7 days of delivery to initiate an exchange. Price differences will be charged or refunded accordingly.'
      },
    ]
  },
  {
    category: 'Account & Privacy',
    icon: User,
    questions: [
      {
        question: 'Do I need to create an account to shop?',
        answer: 'No, you can checkout as a guest. However, creating an account gives you benefits like order history, faster checkout, wishlist, loyalty points, and exclusive member offers.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click on "Forgot Password" on the login page and enter your registered email. You will receive a password reset link valid for 24 hours. If you do not receive the email, check your spam folder.'
      },
      {
        question: 'How is my personal information protected?',
        answer: 'We take your privacy seriously. Your data is encrypted and stored securely. We never share your personal information with third parties for marketing. Read our Privacy Policy for complete details.'
      },
      {
        question: 'How can I delete my account?',
        answer: 'To delete your account, please contact our support team at support@shaikhjee.com. Note that deleting your account will remove your order history, wishlist, and loyalty points.'
      },
    ]
  },
];

// Flatten FAQs for JSON-LD
const allFaqs = faqs.flatMap(category =>
  category.questions.map(q => ({
    question: q.question,
    answer: q.answer
  }))
);

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-muted/20 pb-20">
      {/* JSON-LD for SEO */}
      <FAQJsonLd faqs={allFaqs} />

      {/* Header Banner */}
      <div className="bg-primary text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 mb-4">
            <HelpCircle size={12} />
            We Are Here to Help
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg opacity-80 max-w-2xl mx-auto">
            Find quick answers to common questions about orders, shipping, payments, and more.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-primary/10 shadow-xl shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeCategory === null
                ? 'bg-primary text-white'
                : 'bg-white text-foreground hover:bg-secondary'
            }`}
          >
            All Topics
          </button>
          {faqs.map((category) => (
            <button
              key={category.category}
              onClick={() => setActiveCategory(category.category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategory === category.category
                  ? 'bg-primary text-white'
                  : 'bg-white text-foreground hover:bg-secondary'
              }`}
            >
              <category.icon size={14} />
              {category.category}
            </button>
          ))}
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {(activeCategory ? filteredFaqs.filter(c => c.category === activeCategory) : filteredFaqs).map((category) => (
            <div key={category.category} className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-primary/5 border border-primary/5">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <category.icon size={20} className="text-primary" />
                </div>
                {category.category}
              </h2>

              <div className="space-y-3">
                {category.questions.map((faq, index) => {
                  const itemId = `${category.category}-${index}`;
                  const isOpen = openItems.includes(itemId);

                  return (
                    <div
                      key={index}
                      className={`border rounded-2xl transition-all ${
                        isOpen ? 'border-primary/20 bg-primary/5' : 'border-border hover:border-primary/10'
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
                      >
                        <span className={`font-medium ${isOpen ? 'text-primary' : 'text-foreground'}`}>
                          {faq.question}
                        </span>
                        <ChevronDown
                          size={20}
                          className={`text-muted-foreground transition-transform shrink-0 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filteredFaqs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl">
              <HelpCircle size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">
                We could not find any FAQ matching your search. Try different keywords or contact support.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
              >
                Contact Support
              </Link>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="max-w-4xl mx-auto mt-12 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-3xl text-center">
          <h3 className="text-2xl font-bold text-foreground mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Our customer support team is here to help you with any queries.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all font-medium"
            >
              Contact Us
            </Link>
            <a
              href="mailto:support@shaikhjee.com"
              className="px-8 py-4 bg-white text-foreground rounded-full hover:bg-secondary transition-all font-medium border border-border"
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
