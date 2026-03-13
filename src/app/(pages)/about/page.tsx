import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl text-gray-900 mb-8 text-center">About Shaikh Jee</h1>
      
            <div className="mb-12">
                <Image
                    src="https://images.unsplash.com/photo-1523634118614-82b2685ee3df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjb3NtZXRpY3MlMjBtYWtldXB8ZW58MXx8fHwxNzY3MzU4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="About Shaikh Jee"
                    width={500}
                    height={96}
                    className="w-full h-96 object-cover rounded-2xl"
                />
            </div>

            <div className="prose max-w-none space-y-6">
                <h2 className="text-2xl text-gray-900">Our Mission</h2>
                <p className="text-gray-700 text-lg">
                    At Shaikh Jee, we believe that beauty should be accessible, safe, and luxurious for everyone.
                    Our mission is to deliver high-quality cosmetic products that enhance your natural beauty without
                    compromising on safety or affordability.
                </p>

                <h2 className="text-2xl text-gray-900 mt-8">Our Story</h2>
                <p className="text-gray-700 text-lg">
                    Founded with a passion for beauty and wellness, Shaikh Jee has grown into a trusted name in the
                    cosmetics industry. We carefully curate our product range to ensure every item meets our strict
                    quality standards and delivers exceptional results.
                </p>

                <h2 className="text-2xl text-gray-900 mt-8">Why Choose Us?</h2>
                <ul className="list-disc list-inside text-gray-700 text-lg space-y-2">
                    <li>100% Authentic products from trusted brands</li>
                    <li>Safe, dermatologically tested formulations</li>
                    <li>Affordable pricing without compromising quality</li>
                    <li>Free shipping on orders above ₹999</li>
                    <li>Easy returns and dedicated customer support</li>
                    <li>Cruelty-free and sustainable practices</li>
                </ul>

                <div className="bg-linear-to-r from-[#F5E6D3] to-[#E8D5C4] rounded-2xl p-8 mt-12 text-center">
                    <h3 className="text-2xl text-gray-900 mb-4">Ready to enhance your beauty?</h3>
                    <Link
                        href={"/shop"}
                        className="px-8 py-4 bg-[#D4AF87] text-white rounded-full hover:bg-[#C49E76] transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        </div>
        </div>
  )
};

export default AboutPage;