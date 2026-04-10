"use client"
import React, { useState } from "react";
import {
  ShoppingCart,
  User,
  Heart,
  Search,
  Menu,
  X,
  Shield,
  Package,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShowForAdmin } from "./ShowForRole";
import { DarkModeToggle } from "./DarkModeToggle";

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
      <div className="px-4 py-2 text-center text-white bg-primary">
        <p className="text-sm font-medium tracking-wide">
          ✨ New Year Sale: Up to 50% Off on Selected Items | Free Shipping on Orders Above ₹999
        </p>
      </div>

      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="container px-4 py-4 mx-auto lg:px-8">
          <div className="flex items-center justify-between gap-8">
            <button
              className="p-2 -ml-2 lg:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link href="/" className="transition-opacity shrink-0 hover:opacity-90">
              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl text-primary">
                Shaikh Jee
              </h1>
            </Link>

            <nav className="items-center hidden gap-8 lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.value}
                  href={item.value}
                  className="text-sm font-medium transition-colors text-foreground hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <form
              onSubmit={handleSearch}
              className="items-center flex-1 hidden max-w-md md:flex"
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
                  className="absolute -translate-y-1/2 left-4 top-1/2 text-muted-foreground"
                  size={18}
                />
              </div>
            </form>

            <div className="flex items-center gap-2 lg:gap-5">
              <ShowForAdmin fallback={
                <Link
                  href={user ? "/account" : "/login"}
                  className="relative flex items-center gap-2 p-2 text-sm font-medium transition-colors text-foreground hover:text-primary group"
                  aria-label="Account"
                >
                  <User size={22} />
                  <span className="hidden lg:inline">{user?.name?.split(' ')[0] || 'Sign In'}</span>
                </Link>
              }>
                <Link
                  href="/adminDashboard"
                  className="relative flex items-center gap-2 p-2 text-sm font-medium transition-colors text-foreground hover:text-primary group"
                  aria-label="Admin Dashboard"
                >
                  <Shield size={22} className="text-primary" />
                  <span className="hidden lg:inline">Admin</span>
                </Link>
              </ShowForAdmin>

              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* <Link
                href={user ? "/account" : "/login"}
                className="relative flex items-center gap-2 p-2 text-sm font-medium transition-colors text-foreground hover:text-primary group"
                aria-label="Account"
              >
                <User size={22} />
                <span className="hidden lg:inline">{user?.name?.split(' ')[0] || 'Sign In'}</span>
              </Link> */}

              {user && (
                <button
                  onClick={handleLogout}
                  className="relative flex items-center gap-2 p-2 text-sm font-medium transition-colors text-foreground hover:text-red-500 group"
                  aria-label="Sign Out"
                >
                  <span className="hidden lg:inline">Logout</span>
                  <X size={20} />
                </button>
              )}

              <Link
                href="/account?tab=wishlist"
                className="relative p-2 transition-colors text-foreground hover:text-primary"
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
                href="/track-order"
                className="relative p-2 transition-colors text-foreground hover:text-primary hidden lg:flex items-center gap-2"
                aria-label="Track Order"
              >
                <Package size={22} />
                <span className="text-sm font-medium">Track Order</span>
              </Link>

              <Link
                href="/cart"
                className="relative p-2 transition-colors text-foreground hover:text-primary"
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

          <form onSubmit={handleSearch} className="mt-4 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-muted border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-primary text-sm transition-all"
              />
              <Search
                className="absolute -translate-y-1/2 left-4 top-1/2 text-muted-foreground"
                size={18}
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-0 z-50 mt-20 duration-200 lg:hidden bg-black/50 backdrop-blur-sm animate-in fade-in">
            <nav className="flex flex-col gap-1 px-4 py-6 duration-300 bg-white shadow-xl animate-in slide-in-from-top">
              {navItems.map((item) => (
                <Link
                  key={item.value}
                  href={item.value}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-4 text-base font-medium transition-colors text-foreground hover:bg-muted rounded-xl active:bg-accent"
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
