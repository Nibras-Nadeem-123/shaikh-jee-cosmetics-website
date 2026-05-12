"use client"
import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  User,
  Heart,
  Search,
  Menu,
  X,
  Shield,
  Package,
  ChevronDown,
  Sparkles,
  LogOut,
  UserCircle,
  Settings,
  ShoppingBag,
  ArrowRight,
  Home,
  Store,
  Info,
  Phone,
  Grid3X3,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ShowForAdmin } from "./ShowForRole";
import Image from "next/image";

// Categories for mega menu
const categories = [
  { name: 'Lips', slug: 'lips', icon: '💄' },
  { name: 'Face', slug: 'face', icon: '✨' },
  { name: 'Eyes', slug: 'eyes', icon: '👁️' },
  { name: 'Skincare', slug: 'skincare', icon: '🧴' },
  { name: 'Hair Care', slug: 'hair', icon: '💇' },
  { name: 'Fragrances', slug: 'fragrances', icon: '🌸' },
];

export const Header = () => {
  const { cartCount, user, wishlist, logout, cart } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: "Home", value: "/", icon: Home },
    { label: "Shop", value: "/shop", icon: Store },
    { label: "About", value: "/about", icon: Info },
    { label: "Contact", value: "/contact", icon: Phone },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchFocused(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <>
      {/* Header */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-black/5'
            : 'bg-white'
        }`}
      >
        <div className="container px-4 mx-auto lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Mobile Menu Button */}
            <button
              className="p-2 -ml-2 lg:hidden text-foreground hover:bg-muted rounded-xl transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all group-hover:scale-105">
                SJ
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  Shaikh Jee
                </h1>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest -mt-0.5">
                  Cosmetics
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.value;
                return (
                  <Link
                    key={item.value}
                    href={item.value}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onMouseEnter={() => setShowCategoryMenu(true)}
                  onMouseLeave={() => setShowCategoryMenu(false)}
                  className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    pathname?.includes('/shop?category')
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  Categories
                  <ChevronDown size={16} className={`transition-transform ${showCategoryMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Mega Menu */}
                {showCategoryMenu && (
                  <div
                    onMouseEnter={() => setShowCategoryMenu(true)}
                    onMouseLeave={() => setShowCategoryMenu(false)}
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/shop?category=${cat.slug}`}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group"
                          onClick={() => setShowCategoryMenu(false)}
                        >
                          <span className="text-2xl">{cat.icon}</span>
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link
                        href="/shop"
                        className="flex items-center justify-center gap-2 p-3 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary hover:text-white transition-all"
                        onClick={() => setShowCategoryMenu(false)}
                      >
                        View All Products
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className={`hidden md:flex items-center flex-1 max-w-sm transition-all duration-300 ${
                searchFocused ? 'max-w-md' : ''
              }`}
            >
              <div className="relative w-full group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={`w-full pl-12 pr-4 py-3 bg-muted border-2 border-transparent rounded-full focus:outline-none focus:bg-white focus:border-primary transition-all text-sm ${
                    searchFocused ? 'shadow-lg shadow-primary/10' : ''
                  }`}
                />
                <Search
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    searchFocused ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  size={20}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Admin Link */}
              <ShowForAdmin>
                <Link
                  href="/adminDashboard"
                  className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/10 rounded-full hover:bg-primary hover:text-white transition-all"
                >
                  <Shield size={18} />
                  <span className="hidden lg:inline">Admin</span>
                </Link>
              </ShowForAdmin>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 md:px-3 md:py-2 text-foreground hover:bg-muted rounded-full transition-colors"
                >
                  {user ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  ) : (
                    <User size={22} />
                  )}
                  <span className="hidden lg:inline text-sm font-medium">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={16} className={`hidden lg:block transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {user ? (
                        <>
                          <div className="p-4 bg-gradient-to-br from-primary/10 to-pink-500/10">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-2">
                            <Link
                              href="/account"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
                            >
                              <UserCircle size={18} />
                              My Account
                            </Link>
                            <Link
                              href="/account?tab=orders"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
                            >
                              <ShoppingBag size={18} />
                              My Orders
                            </Link>
                            <Link
                              href="/account?tab=wishlist"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
                            >
                              <Heart size={18} />
                              Wishlist
                              {wishlist.length > 0 && (
                                <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                  {wishlist.length}
                                </span>
                              )}
                            </Link>
                            <Link
                              href="/track-order"
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
                            >
                              <Package size={18} />
                              Track Order
                            </Link>
                            <div className="border-t border-gray-100 mt-2 pt-2">
                              <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <LogOut size={18} />
                                Sign Out
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="p-4">
                          <div className="text-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                              <User size={32} className="text-muted-foreground" />
                            </div>
                            <p className="font-medium text-foreground">Welcome!</p>
                            <p className="text-sm text-muted-foreground">Sign in to access your account</p>
                          </div>
                          <Link
                            href="/login"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
                          >
                            Sign In
                            <ArrowRight size={16} />
                          </Link>
                          <Link
                            href="/signup"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 mt-2 border-2 border-gray-200 text-foreground font-medium rounded-xl hover:bg-muted transition-colors"
                          >
                            Create Account
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Wishlist */}
              <Link
                href="/account?tab=wishlist"
                className="relative p-2 text-foreground hover:bg-muted rounded-full transition-colors hidden md:flex"
              >
                <Heart size={22} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold px-1">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center gap-2 p-2 md:px-4 md:py-2 text-foreground hover:bg-muted md:bg-foreground md:text-white md:hover:bg-foreground/90 rounded-full transition-all"
              >
                <ShoppingCart size={22} />
                <span className="hidden lg:inline text-sm font-medium">
                  Cart
                </span>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 md:static bg-primary md:bg-white/20 text-white rounded-full min-w-[18px] md:min-w-[24px] h-[18px] md:h-[24px] flex items-center justify-center text-[10px] md:text-xs font-bold px-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="pb-4 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-muted border-2 border-transparent rounded-full focus:outline-none focus:bg-white focus:border-primary text-sm transition-all"
              />
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
            </div>
          </form>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl lg:hidden animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white font-bold">
                  SJ
                </div>
                <div>
                  <h2 className="font-bold text-foreground">Shaikh Jee</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Cosmetics</p>
                </div>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-foreground hover:bg-muted rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* User Info */}
            {user ? (
              <div className="p-4 bg-gradient-to-br from-primary/10 to-pink-500/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-muted/50">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary text-white font-medium rounded-xl"
                >
                  Sign In
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}

            {/* Navigation */}
            <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-300px)]">
              <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</p>
              {navItems.map((item) => {
                const isActive = pathname === item.value;
                return (
                  <Link
                    key={item.value}
                    href={item.value}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                );
              })}

              <p className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categories</p>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  <span className="text-xl">{cat.icon}</span>
                  {cat.name}
                </Link>
              ))}

              {user && (
                <>
                  <p className="px-3 py-2 mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    <UserCircle size={20} />
                    My Account
                  </Link>
                  <Link
                    href="/account?tab=orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    <ShoppingBag size={20} />
                    My Orders
                  </Link>
                  <Link
                    href="/account?tab=wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    <Heart size={20} />
                    Wishlist
                    {wishlist.length > 0 && (
                      <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                        {wishlist.length}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/track-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    <Package size={20} />
                    Track Order
                  </Link>
                </>
              )}
            </nav>

            {/* Footer */}
            {user && (
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 text-red-600 bg-red-50 font-medium rounded-xl hover:bg-red-100 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
