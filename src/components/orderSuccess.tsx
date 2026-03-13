"use client"
import React from 'react';
import { CheckCircle, Package, Home } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Link from 'next/link';
 
const OrderSuccessPage = () => {
  const { orders } = useApp();
  const latestOrder = orders[0];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl p-8 lg:p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>

          <h1 className="text-3xl lg:text-4xl text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for shopping with Shaikh Jee. Your order has been confirmed and will be delivered soon.
          </p>

          {latestOrder && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Order Number</div>
                  <div className="text-lg">#{latestOrder.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Order Total</div>
                  <div className="text-lg">₹{latestOrder.total}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Delivery Address</div>
                  <div className="text-gray-900">
                    {latestOrder.shippingAddress.addressLine1}, {latestOrder.shippingAddress.city},{' '}
                    {latestOrder.shippingAddress.state} - {latestOrder.shippingAddress.pincode}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Payment Method</div>
                  <div className="text-gray-900 capitalize">{latestOrder.paymentMethod}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Expected Delivery</div>
                  <div className="text-gray-900">5-7 business days</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
                href={`/account`}
              className="px-8 py-4 bg-[#D4AF87] text-white rounded-full hover:bg-[#C49E76] transition-colors flex items-center justify-center gap-2"
            >
              <Package size={20} />
              Track Order
            </Link>
            <Link
              href={"/"}
            className="px-8 py-4 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Home size={20} />
              Back to Home
            </Link>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
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