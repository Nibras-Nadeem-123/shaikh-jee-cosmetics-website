"use client"
import React, { useState } from "react";
import {
  ShoppingCart,
  User,
  Heart,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const Header = () => {
  const { cartCount, user, wishlist, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter()

  const navItems = [
    { label: "Home", value: "/" },
    { label: "Shop", value: "/shop" },
    { label: "Categories", value: "/shop?filter=categories" },
    { label: "About", value: "/about" },
    { label: "Contact", value: "/contact" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <div className="bg-primary text-white text-center py-2 px-4">
        <p className="text-sm font-medium tracking-wide">
          ✨ New Year Sale: Up to 50% Off on Selected Items | Free Shipping on Orders Above ₹999
        </p>
      </div>

      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-8">
            <button
              className="lg:hidden p-2 -ml-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
              <h1 className="text-2xl lg:text-3xl font-bold text-primary tracking-tight">
                Shaikh Jee
              </h1>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.value}
                  href={item.value}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center flex-1 max-w-md"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-muted border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-primary transition-all text-sm"
                />
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
              </div>
            </form>

            <div className="flex items-center gap-2 lg:gap-5">
              <Link
                href={user ? "/account" : "/login"}
                className="p-2 text-foreground hover:text-primary transition-colors relative group text-sm font-medium flex items-center gap-2"
                aria-label="Account"
              >
                <User size={22} />
                <span className="hidden lg:inline">{user?.name?.split(' ')[0] || 'Sign In'}</span>
              </Link>
              {user && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-foreground hover:text-primary transition-colors relative group text-sm font-medium flex items-center gap-2"
                  aria-label="Sign Out"
                >
                  Sign Out
                </button>
              )}

              <Link
                href="/account?tab=wishlist"
                className="p-2 text-foreground hover:text-primary transition-colors relative"
                aria-label="Wishlist"
              >
                <Heart size={22} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="p-2 text-foreground hover:text-primary transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <form onSubmit={handleSearch} className="md:hidden mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-muted border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-primary text-sm transition-all"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-0 mt-20 bg-black/50 z-50 backdrop-blur-sm animate-in fade-in duration-200">
            <nav className="bg-white px-4 py-6 flex flex-col gap-1 shadow-xl animate-in slide-in-from-top duration-300">
              {navItems.map((item) => (
                <Link
                  key={item.value}
                  href={item.value}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-4 text-base font-medium text-foreground hover:bg-muted rounded-xl transition-colors active:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
};
