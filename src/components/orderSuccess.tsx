"use client"
import React from 'react';
import { CheckCircle, Package, Home } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Link from 'next/link';
 
const OrderSuccessPage = () => {
  const { orders } = useApp();
  const latestOrder = orders[0];

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50">
      <div className="w-full max-w-2xl">
        <div className="p-8 text-center bg-white rounded-2xl lg:p-12">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full">
            <CheckCircle size={48} className="text-green-600" />
          </div>

          <h1 className="mb-4 text-3xl text-gray-900 lg:text-4xl">Order Placed Successfully!</h1>
          <p className="mb-8 text-gray-600">
            Thank you for shopping with Shaikh Jee. Your order has been confirmed and will be delivered soon.
          </p>

          {latestOrder && (
            <div className="p-6 mb-8 text-left rounded-lg bg-gray-50">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                <div>
                  <div className="mb-1 text-sm text-gray-600">Order Number</div>
                  <div className="text-lg">#{latestOrder.id}</div>
                </div>
                <div className="text-right">
                  <div className="mb-1 text-sm text-gray-600">Order Total</div>
                  <div className="text-lg">₹{latestOrder.total}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-1 text-sm text-gray-600">Delivery Address</div>
                  <div className="text-gray-900">
                    {latestOrder.shippingAddress.addressLine1}, {latestOrder.shippingAddress.city},{' '}
                    {latestOrder.shippingAddress.state} - {latestOrder.shippingAddress.pincode}
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-sm text-gray-600">Payment Method</div>
                  <div className="text-gray-900 capitalize">{latestOrder.paymentMethod}</div>
                </div>

                <div>
                  <div className="mb-1 text-sm text-gray-600">Expected Delivery</div>
                  <div className="text-gray-900">5-7 business days</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
                href={`/track-order`}
              className="px-8 py-4 bg-[#D4AF87] text-white rounded-full hover:bg-[#C49E76] transition-colors flex items-center justify-center gap-2"
            >
              <Package size={20} />
              Track Order
            </Link>
            <Link
              href={"/"}
            className="flex items-center justify-center gap-2 px-8 py-4 text-gray-700 transition-colors border border-gray-300 rounded-full hover:bg-gray-50"
            >
              <Home size={20} />
              Back to Home
            </Link>
          </div>

          <div className="p-4 mt-8 rounded-lg bg-blue-50">
            <p className="text-sm text-blue-800">
              📧 A confirmation email has been sent to your registered email address with order details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;