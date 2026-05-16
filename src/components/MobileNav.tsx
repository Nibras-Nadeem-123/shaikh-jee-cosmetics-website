"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, User, ShoppingCart } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

export const MobileNav = () => {
  const pathname = usePathname();
  const { cartCount, wishlist } = useApp();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/shop', icon: ShoppingBag, label: 'Shop' },
    { href: '/account?tab=wishlist', icon: Heart, label: 'Wishlist' },
    { href: '/account', icon: User, label: 'Account' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50 lg:hidden safe-area-bottom">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/account' && pathname.startsWith('/account'));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center
                px-2 py-1 min-w-[64px]
                rounded-2xl transition-all duration-300
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              <div className="relative">
                <item.icon size={20} className="transition-transform group-hover:scale-110" />
                {/* Wishlist count badge */}
                {item.href === '/account?tab=wishlist' && wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
                {/* Cart count badge */}
                {item.href === '/cart' && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest mt-1">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Cart button with badge */}
        <Link
          href="/cart"
          className={`
            flex flex-col items-center justify-center
            px-2 py-1 min-w-[64px]
            rounded-2xl transition-all duration-300
            ${pathname === '/cart' ? 'text-primary' : 'text-muted-foreground'}
          `}
        >
          <div className="relative">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1">Cart</span>
        </Link>
      </div>

      <style jsx global>{`
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .safe-area-bottom {
            padding-bottom: calc(env(safe-area-inset-bottom) + 8px);
          }
        }
      `}</style>
    </div>
  );
};
