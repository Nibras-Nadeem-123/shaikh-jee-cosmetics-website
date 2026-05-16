"use client"
import React, { useState, useEffect } from "react";
import {
    BarChart3,
    Package,
    Users,
    ShoppingBag,
    TrendingUp,
    DollarSign,
    Search,
    Plus,
    X,
    Loader2,
    Edit,
    Trash2,
    AlertCircle,
    Eye,
    MapPin,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    Shield,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    RefreshCw,
    ImagePlus,
    Star,
    Sparkles,
    Gem,
    ChevronRight,
    LayoutDashboard,
    Box,
    UserCircle,
    Activity,
    ExternalLink,
    Home,
    Store,
    FileText,
    ChevronDown,
    LogOut
} from "lucide-react";
import { RateLimitDashboard } from "./RateLimitDashboard";
import { useApp } from "../contexts/AppContext";
import { apiService } from "../services/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";

export const AdminDashboard = () => {
    const { user } = useApp();
    const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "users" | "ratelimits">("overview");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string; type: 'product' | 'user' } | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false);

    const [newProduct, setNewProduct] = useState({
        name: "",
        slug: "",
        category: "",
        subcategory: "",
        price: 0,
        originalPrice: 0,
        discount: 0,
        description: "",
        images: [] as string[],
        inStock: true,
        isNew: false,
        shades: [],
        brand: "",
        ingredients: "",
        usage: "",
        skinTypes: "",
        isBestSeller: false,
        featured: false,
    });
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

    const router = useRouter();
    const { showToast } = useToast();

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const prodData = await apiService.getProducts();
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const orderData = await apiService.getAllOrders(token);

            let userData = { users: [] };
            try {
                userData = await apiService.getAllUsers(token);
            } catch (userError) {
                console.error("Failed to fetch users:", userError);
            }

            setProducts(prodData.products || []);
            setOrders(orderData.orders || []);
            setUsers(userData.users || []);
        } catch (error) {
            const errorMessage = (error as any).response?.data?.message || (error as any).message || "Unknown error occurred";
            console.error("Dashboard fetch error:", errorMessage);
            showToast(`Error: ${errorMessage}`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const resetProductForm = () => {
        setNewProduct({
            name: "",
            slug: "",
            category: "",
            subcategory: "",
            price: 0,
            originalPrice: 0,
            discount: 0,
            description: "",
            images: [],
            inStock: true,
            isNew: false,
            shades: [],
            brand: "",
            ingredients: "",
            usage: "",
            skinTypes: "",
            isBestSeller: false,
            featured: false,
        });
        setSelectedImages([]);
        setImagePreviewUrls([]);
        setEditingProduct(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setSelectedImages(prev => [...prev, ...files]);
            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(imagePreviewUrls[index]);
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const formData = new FormData();
            const productData = {
                ...newProduct,
                images: newProduct.images
            };
            formData.append('data', JSON.stringify(productData));

            selectedImages.forEach((file) => {
                formData.append('images', file);
            });

            if (editingProduct) {
                await apiService.updateProductWithImages(editingProduct, formData, token);
                showToast("Product updated successfully!", "success");
            } else {
                await apiService.createProductWithImages(formData, token);
                showToast("Product added successfully!", "success");
            }

            setIsModalOpen(false);
            fetchData();
            resetProductForm();
        } catch (error) {
            console.error("Product save error:", error);
            showToast(editingProduct ? "Error updating product." : "Error adding product. Please verify admin privileges.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = async (productId: string, productName: string) => {
        setDeleteConfirmation({ id: productId, name: productName, type: 'product' });
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        setDeleteConfirmation({ id: userId, name: userName, type: 'user' });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            if (deleteConfirmation.type === 'product') {
                await apiService.deleteProduct(deleteConfirmation.id, token);
                showToast("Product deleted successfully", "success");
            } else if (deleteConfirmation.type === 'user') {
                await apiService.deleteUser(deleteConfirmation.id, token);
                showToast("User deleted successfully", "success");
            }

            fetchData();
            setDeleteConfirmation(null);
        } catch (error) {
            showToast(`Error deleting ${deleteConfirmation.type}. Please try again.`, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateUserRole = async (userId: string, newRole: string) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            await apiService.updateUserRole(userId, newRole, token);
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            showToast(`User role updated to ${newRole}`, "success");
        } catch (error) {
            showToast("Error updating user role. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditProduct = (product: any) => {
        setNewProduct({
            name: product.name,
            slug: product.slug || "",
            category: product.category,
            subcategory: product.subcategory || "",
            price: product.price,
            originalPrice: product.originalPrice || 0,
            discount: product.discount || 0,
            description: product.description,
            images: product.images || [],
            inStock: product.inStock,
            isNew: product.isNew || false,
            shades: product.shades || [],
            brand: product.brand || "",
            ingredients: product.ingredients || "",
            usage: product.usage || "",
            skinTypes: product.skinTypes || "",
            isBestSeller: product.isBestSeller || false,
            featured: product.featured || false,
        });
        setImagePreviewUrls(product.images || []);
        setSelectedImages([]);
        setEditingProduct(product._id);
        setIsModalOpen(true);
    };

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            await apiService.updateOrderStatus(orderId, newStatus, token);
            setOrders(orders.map(order =>
                order._id === orderId ? { ...order, orderStatus: newStatus } : order
            ));
            showToast(`Order status updated to ${newStatus}`, "success");
        } catch (error) {
            showToast("Error updating order status. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateProductStatus = async (productId: string, newStatus: string) => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            await apiService.updateProductStatus(productId, newStatus, token);
            setProducts(products.map(product =>
                product._id === productId ? { ...product, status: newStatus } : product
            ));
            showToast(`Product status updated to ${newStatus}`, "success");
        } catch (error) {
            showToast("Error updating product status. Please try again.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user || user.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-100">
                <div className="text-center p-16 max-w-lg bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-stone-200/50 border border-stone-100">
                    <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-200/50 rotate-3">
                        <Gem size={40} className="text-amber-800 -rotate-3" />
                    </div>
                    <h2 className="text-3xl font-light text-stone-800 mb-4 tracking-tight">Exclusive Access</h2>
                    <p className="text-stone-500 mb-10 leading-relaxed font-light">This premium area is reserved for administrators. Please authenticate with your credentials.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-12 py-4 bg-gradient-to-r from-stone-800 via-stone-900 to-stone-800 text-white font-medium rounded-xl hover:shadow-xl hover:shadow-stone-300/50 transition-all duration-300 hover:-translate-y-0.5"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;

    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case "delivered":
                return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 };
            case "shipped":
                return { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200", icon: Truck };
            case "out_for_delivery":
                return { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: Truck };
            case "processing":
                return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: RefreshCw };
            case "confirmed":
                return { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200", icon: CheckCircle2 };
            case "pending":
                return { bg: "bg-stone-100", text: "text-stone-600", border: "border-stone-200", icon: Clock };
            case "cancelled":
                return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: XCircle };
            case "returned":
                return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: RefreshCw };
            default:
                return { bg: "bg-stone-100", text: "text-stone-600", border: "border-stone-200", icon: Clock };
        }
    };

    const navItems = [
        { id: "overview", label: "Dashboard", icon: LayoutDashboard },
        { id: "products", label: "Products", icon: Box },
        { id: "orders", label: "Orders", icon: ShoppingBag },
        { id: "users", label: "Customers", icon: UserCircle },
        { id: "ratelimits", label: "API Monitor", icon: Activity },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 via-amber-50/30 to-stone-100">
                <div className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-2 border-amber-200"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-amber-500 animate-spin"></div>
                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 animate-pulse"></div>
                    </div>
                    <p className="text-stone-400 font-light tracking-wide">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-100 via-amber-50/20 to-stone-100">
            {/* Luxury Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 z-50 shadow-2xl shadow-stone-900/50 flex flex-col">
                {/* Gold accent line at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400"></div>

                {/* Brand Section */}
                <div className="px-8 py-8 border-b border-white/5 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <Sparkles size={22} className="text-stone-900" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-stone-900"></div>
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-white tracking-tight">Shaikh Jee</h1>
                            <p className="text-xs text-amber-400/80 font-medium tracking-widest uppercase">Cosmetics</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-stone-700 scrollbar-track-stone-800/50 scroll-smooth">
                {/* Navigation */}
                <nav className="px-4 py-6 flex-shrink-0">
                    <p className="px-4 mb-4 text-[10px] font-semibold text-stone-500 uppercase tracking-[0.2em]">Main Menu</p>
                    <div className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden ${
                                    activeTab === item.id
                                        ? "bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-transparent text-white"
                                        : "text-stone-400 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                {activeTab === item.id && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-500 rounded-r-full shadow-lg shadow-amber-500/50"></div>
                                )}
                                <div className={`p-2 rounded-lg transition-all duration-300 ${
                                    activeTab === item.id
                                        ? "bg-gradient-to-br from-amber-400 to-amber-500 text-stone-900 shadow-lg shadow-amber-500/30"
                                        : "bg-stone-800/50 text-stone-400 group-hover:bg-stone-800 group-hover:text-amber-400"
                                }`}>
                                    <item.icon size={18} />
                                </div>
                                <span className="flex-1 text-left">{item.label}</span>
                                {activeTab === item.id && (
                                    <ChevronRight size={16} className="text-amber-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </nav>

                {/* Quick Links Dropdown */}
                <div className="px-4 py-4 border-t border-white/5 flex-shrink-0">
                    <button
                        onClick={() => setIsQuickLinksOpen(!isQuickLinksOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-stone-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-stone-800/50">
                                <ExternalLink size={18} />
                            </div>
                            <span>Quick Links</span>
                        </div>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isQuickLinksOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ${isQuickLinksOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                        <div className="space-y-1 px-2">
                            {[
                                { label: 'Home', href: '/', icon: Home },
                                { label: 'Shop', href: '/shop', icon: Store },
                                { label: 'My Account', href: '/account', icon: UserCircle },
                                { label: 'Track Order', href: '/track-order', icon: Package },
                                { label: 'Orders', href: '/order', icon: ShoppingBag },
                            ].map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => router.push(link.href)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-400 hover:text-amber-400 hover:bg-white/5 transition-all group"
                                >
                                    <link.icon size={16} className="text-stone-500 group-hover:text-amber-400 transition-colors" />
                                    <span>{link.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Stats in Sidebar */}
                <div className="px-6 py-4 mx-4 mt-4 mb-4 bg-gradient-to-br from-stone-800/80 to-stone-800/40 rounded-2xl border border-white/5 flex-shrink-0">
                    <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-[0.2em] mb-4">Quick Stats</p>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-stone-400 text-sm">Revenue</span>
                            <span className="text-amber-400 font-semibold">Rs.{(totalRevenue/1000).toFixed(1)}k</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-stone-400 text-sm">Orders</span>
                            <span className="text-white font-semibold">{orders.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-stone-400 text-sm">Pending</span>
                            <span className="text-amber-400 font-semibold">{pendingOrders}</span>
                        </div>
                    </div>
                </div>
                </div>

                {/* User Profile Section */}
                <div className="flex-shrink-0 p-6 border-t border-white/5 bg-gradient-to-t from-stone-950 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-900 font-bold shadow-lg shadow-amber-500/20">
                                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-stone-900"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={() => fetchData()}
                            className="p-2 rounded-lg hover:bg-white/5 text-stone-500 hover:text-amber-400 transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                    <button
                        onClick={() => router.push('/account')}
                        className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-400 hover:text-amber-400 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                    >
                        <LogOut size={16} />
                        <span>View Account</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-72 min-h-screen">
                {/* Top Header */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/50">
                    <div className="px-8 h-20 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
                                {activeTab === 'overview' && 'Dashboard Overview'}
                                {activeTab === 'products' && 'Product Management'}
                                {activeTab === 'orders' && 'Order Management'}
                                {activeTab === 'users' && 'Customer Management'}
                                {activeTab === 'ratelimits' && 'API Rate Limits'}
                            </h1>
                            <p className="text-stone-400 text-sm mt-1">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => fetchData()}
                                className="p-3 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/50 transition-all duration-300"
                            >
                                <RefreshCw size={18} />
                            </button>
                            {(activeTab === 'products' || activeTab === 'overview') && (
                                <button
                                    onClick={() => { resetProductForm(); setIsModalOpen(true); }}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-stone-800 via-stone-900 to-stone-800 text-white text-sm font-medium rounded-xl hover:shadow-xl hover:shadow-stone-300/30 transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    <Plus size={18} />
                                    Add Product
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-8">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: "Total Revenue", value: `Rs.${totalRevenue.toLocaleString()}`, icon: DollarSign, change: "+12.5%", color: "emerald", gradient: "from-emerald-500 to-teal-600" },
                                    { label: "Total Orders", value: orders.length, icon: ShoppingBag, change: `${pendingOrders} pending`, color: "sky", gradient: "from-sky-500 to-blue-600" },
                                    { label: "Products", value: products.length, icon: Package, change: "In catalog", color: "amber", gradient: "from-amber-500 to-orange-600" },
                                    { label: "Customers", value: users.length, icon: Users, change: "+8.2%", color: "violet", gradient: "from-violet-500 to-purple-600" },
                                ].map((stat, index) => (
                                    <div key={index} className="group relative bg-white rounded-2xl p-6 border border-stone-100 hover:border-stone-200 hover:shadow-xl hover:shadow-stone-200/50 transition-all duration-500 overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-stone-50 to-transparent rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500"></div>
                                        <div className="relative">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                                    <stat.icon size={24} className="text-white" />
                                                </div>
                                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    <TrendingUp size={12} />
                                                    {stat.change}
                                                </span>
                                            </div>
                                            <div className="text-3xl font-bold text-stone-800 mb-1">{stat.value}</div>
                                            <div className="text-sm text-stone-400 font-medium">{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Action Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 rounded-2xl p-6 text-white overflow-hidden shadow-xl shadow-amber-500/25">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-12 -translate-x-12"></div>
                                    <div className="relative">
                                        <Clock size={28} className="mb-4 opacity-90" />
                                        <div className="text-4xl font-bold mb-2">{pendingOrders}</div>
                                        <div className="text-amber-100 font-medium">Pending Orders</div>
                                    </div>
                                </div>
                                <div className="relative bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white overflow-hidden shadow-xl shadow-emerald-500/25">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-12 -translate-x-12"></div>
                                    <div className="relative">
                                        <CheckCircle2 size={28} className="mb-4 opacity-90" />
                                        <div className="text-4xl font-bold mb-2">{deliveredOrders}</div>
                                        <div className="text-emerald-100 font-medium">Delivered</div>
                                    </div>
                                </div>
                                <div className="relative bg-gradient-to-br from-rose-400 via-rose-500 to-pink-500 rounded-2xl p-6 text-white overflow-hidden shadow-xl shadow-rose-500/25">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
                                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-12 -translate-x-12"></div>
                                    <div className="relative">
                                        <AlertCircle size={28} className="mb-4 opacity-90" />
                                        <div className="text-4xl font-bold mb-2">{products.filter(p => !p.inStock).length}</div>
                                        <div className="text-rose-100 font-medium">Out of Stock</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                                <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
                                    <div>
                                        <h2 className="text-lg font-semibold text-stone-800">Recent Orders</h2>
                                        <p className="text-sm text-stone-400 mt-0.5">Latest transactions</p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('orders')}
                                        className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1"
                                    >
                                        View All <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-stone-50/50">
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Order</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Customer</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                                                <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Date</th>
                                                <th className="text-right px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                            {orders.slice(0, 5).map((o) => {
                                                const statusConfig = getStatusConfig(o.orderStatus);
                                                return (
                                                    <tr key={o._id} className="hover:bg-amber-50/30 transition-colors cursor-pointer" onClick={() => setSelectedOrder(o)}>
                                                        <td className="px-6 py-4">
                                                            <span className="font-semibold text-stone-800">#{o._id.slice(-6).toUpperCase()}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 text-xs font-bold">
                                                                    {o.shippingAddress?.name?.charAt(0)?.toUpperCase() || '?'}
                                                                </div>
                                                                <span className="text-sm text-stone-600 font-medium">{o.shippingAddress?.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                                                                <statusConfig.icon size={12} />
                                                                {o.orderStatus?.replace(/_/g, ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-stone-500">
                                                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-stone-800">Rs.{o.totalPrice?.toLocaleString()}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === "products" && (
                        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-50 to-white">
                                <div>
                                    <h2 className="text-lg font-semibold text-stone-800">All Products</h2>
                                    <p className="text-sm text-stone-400 mt-0.5">{products.length} items in catalog</p>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-72 pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-stone-50/50">
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Product</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Category</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Price</th>
                                            <th className="text-center px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                                            <th className="text-right px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {products
                                            .filter(p => p?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
                                            .map((product) => (
                                            <tr key={product._id} className="hover:bg-amber-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 ring-2 ring-stone-100">
                                                            {product.images?.[0] ? (
                                                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package size={20} className="text-stone-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-stone-800">{product.name}</p>
                                                            <p className="text-xs text-stone-400">{product._id.slice(-8).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                                                        {product.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-stone-800">Rs.{product.price?.toLocaleString()}</span>
                                                    {product.originalPrice > product.price && (
                                                        <span className="text-xs text-stone-400 line-through ml-2">Rs.{product.originalPrice}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <select
                                                        value={product.status || 'active'}
                                                        onChange={(e) => handleUpdateProductStatus(product._id, e.target.value)}
                                                        disabled={isSubmitting}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 border ${
                                                            product.status === 'active' || !product.status
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : product.status === 'inactive'
                                                                ? 'bg-stone-100 text-stone-600 border-stone-200'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                        <option value="archived">Archived</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditProduct(product)}
                                                            className="p-2.5 rounded-xl text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product._id, product.name)}
                                                            className="p-2.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {products.length === 0 && (
                                    <div className="py-20 text-center">
                                        <Package size={48} className="mx-auto text-stone-200 mb-4" />
                                        <p className="text-stone-500 font-medium">No products found</p>
                                        <p className="text-stone-400 text-sm mt-1">Add your first product to get started</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === "orders" && (
                        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-50 to-white">
                                <div>
                                    <h2 className="text-lg font-semibold text-stone-800">All Orders</h2>
                                    <p className="text-sm text-stone-400 mt-0.5">{orders.length} total orders</p>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search orders..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-72 pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-stone-50/50">
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Order</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Customer</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Date</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
                                            <th className="text-right px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Amount</th>
                                            <th className="text-right px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {orders
                                            .filter(o =>
                                                o.shippingAddress?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                o.shippingAddress?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                o._id.toLowerCase().includes(searchQuery.toLowerCase())
                                            )
                                            .map((o) => {
                                                const statusConfig = getStatusConfig(o.orderStatus);
                                                return (
                                                    <tr key={o._id} className="hover:bg-amber-50/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <span className="font-semibold text-stone-800">ORD-{o._id.slice(-8).toUpperCase()}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div>
                                                                <p className="text-sm font-medium text-stone-700">{o.shippingAddress?.name}</p>
                                                                <p className="text-xs text-stone-400">{o.shippingAddress?.email}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-stone-500">
                                                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                value={o.orderStatus}
                                                                onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                                                                disabled={isSubmitting || o.orderStatus === 'delivered'}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="confirmed">Confirmed</option>
                                                                <option value="processing">Processing</option>
                                                                <option value="shipped">Shipped</option>
                                                                <option value="out_for_delivery">Out for Delivery</option>
                                                                <option value="delivered">Delivered</option>
                                                                <option value="cancelled">Cancelled</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold text-stone-800">Rs.{o.totalPrice?.toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button
                                                                onClick={() => setSelectedOrder(o)}
                                                                className="p-2.5 rounded-xl text-stone-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                                {orders.length === 0 && (
                                    <div className="py-20 text-center">
                                        <ShoppingBag size={48} className="mx-auto text-stone-200 mb-4" />
                                        <p className="text-stone-500 font-medium">No orders yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === "users" && (
                        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-50 to-white">
                                <div>
                                    <h2 className="text-lg font-semibold text-stone-800">All Customers</h2>
                                    <p className="text-sm text-stone-400 mt-0.5">{users.length} registered users</p>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-72 pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                                    />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-stone-50/50">
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">User</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Email</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Role</th>
                                            <th className="text-left px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Joined</th>
                                            <th className="text-right px-6 py-4 text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {users
                                            .filter(u =>
                                                u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                                            )
                                            .map((u) => (
                                            <tr key={u._id} className="hover:bg-amber-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-amber-200/50">
                                                            {u.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-stone-800">{u.name}</p>
                                                            <p className="text-xs text-stone-400">{u._id.slice(-8).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-stone-600">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                                        disabled={isSubmitting || u._id === user?.id}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 border ${
                                                            u.role === 'admin'
                                                                ? 'bg-violet-50 text-violet-700 border-violet-200'
                                                                : 'bg-stone-100 text-stone-600 border-stone-200'
                                                        }`}
                                                    >
                                                        <option value="customer">Customer</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-stone-500">
                                                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {u._id !== user?.id && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u._id, u.name)}
                                                            disabled={isSubmitting}
                                                            className="p-2.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {users.length === 0 && (
                                    <div className="py-20 text-center">
                                        <Users size={48} className="mx-auto text-stone-200 mb-4" />
                                        <p className="text-stone-500 font-medium">No users found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rate Limits Tab */}
                    {activeTab === "ratelimits" && (
                        <div className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                            <RateLimitDashboard />
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center">
                            <AlertCircle size={32} className="text-rose-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-stone-800 mb-2">Delete {deleteConfirmation.type}?</h2>
                        <p className="text-stone-500 mb-8">
                            Are you sure you want to delete &quot;{deleteConfirmation.name}&quot;? This action cannot be undone.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirmation(null)}
                                className="flex-1 py-3.5 text-sm font-semibold text-stone-700 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isSubmitting}
                                className="flex-1 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl hover:shadow-lg hover:shadow-rose-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
                            <div>
                                <h2 className="text-xl font-semibold text-stone-800">Order Details</h2>
                                <p className="text-sm text-stone-400 mt-1">{selectedOrder.orderNumber || `ORD-${selectedOrder._id.slice(-8).toUpperCase()}`}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-3 rounded-xl hover:bg-stone-100 transition-colors">
                                <X size={20} className="text-stone-400" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-6">
                            <div className="flex items-center justify-between">
                                {(() => {
                                    const statusConfig = getStatusConfig(selectedOrder.orderStatus);
                                    return (
                                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                                            <statusConfig.icon size={16} />
                                            {selectedOrder.orderStatus?.replace(/_/g, ' ')}
                                        </span>
                                    );
                                })()}
                                <span className="text-sm text-stone-500">
                                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-5 bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-2xl border border-stone-100">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wider">
                                        <Users size={14} />
                                        Customer
                                    </div>
                                    <p className="font-semibold text-stone-800 mb-2">{selectedOrder.shippingAddress?.name}</p>
                                    <div className="space-y-1 text-sm text-stone-600">
                                        <p className="flex items-center gap-2"><Mail size={14} className="text-stone-400" /> {selectedOrder.shippingAddress?.email}</p>
                                        <p className="flex items-center gap-2"><Phone size={14} className="text-stone-400" /> {selectedOrder.shippingAddress?.phone}</p>
                                    </div>
                                </div>

                                <div className="p-5 bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-2xl border border-stone-100">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-3 uppercase tracking-wider">
                                        <MapPin size={14} />
                                        Shipping Address
                                    </div>
                                    <div className="text-sm text-stone-600 space-y-1">
                                        <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                                        {selectedOrder.shippingAddress?.addressLine2 && <p>{selectedOrder.shippingAddress?.addressLine2}</p>}
                                        <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                                        <p className="font-semibold">{selectedOrder.shippingAddress?.pincode}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-semibold text-stone-500 mb-4 uppercase tracking-wider">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.orderItems?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-white flex-shrink-0 ring-2 ring-stone-100">
                                                {item.image ? (
                                                    <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover w-full h-full" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package size={20} className="text-stone-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-stone-800 truncate">{item.name}</p>
                                                {item.selectedShade?.name && (
                                                    <p className="text-xs text-stone-500">Shade: {item.selectedShade.name}</p>
                                                )}
                                                <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-stone-800">Rs.{(item.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">Subtotal</span>
                                    <span className="text-stone-700 font-medium">Rs.{selectedOrder.itemsPrice?.toLocaleString() || selectedOrder.totalPrice?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-stone-500">Shipping</span>
                                    <span className={selectedOrder.shippingPrice === 0 ? 'text-emerald-600 font-semibold' : 'text-stone-700 font-medium'}>
                                        {selectedOrder.shippingPrice === 0 ? 'FREE' : `Rs.${selectedOrder.shippingPrice?.toLocaleString()}`}
                                    </span>
                                </div>
                                {selectedOrder.discount?.amount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600">
                                        <span>Discount ({selectedOrder.discount.code})</span>
                                        <span>-Rs.{selectedOrder.discount.amount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-3 border-t border-amber-200">
                                    <span className="text-stone-800">Total</span>
                                    <span className="text-amber-600">Rs.{selectedOrder.totalPrice?.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-5 bg-stone-50 rounded-2xl border border-stone-100">
                                <div>
                                    <h3 className="font-semibold text-stone-800">Update Status</h3>
                                    <p className="text-xs text-stone-400 mt-0.5">Change order status</p>
                                </div>
                                <select
                                    value={selectedOrder.orderStatus}
                                    onChange={(e) => {
                                        handleUpdateOrderStatus(selectedOrder._id, e.target.value);
                                        setSelectedOrder({ ...selectedOrder, orderStatus: e.target.value });
                                    }}
                                    disabled={isSubmitting || selectedOrder.orderStatus === 'delivered'}
                                    className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white border border-stone-200 cursor-pointer transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="out_for_delivery">Out for Delivery</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-stone-50 to-white">
                            <div>
                                <h2 className="text-xl font-semibold text-stone-800">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                                <p className="text-sm text-stone-400 mt-1">{editingProduct ? 'Update product details' : 'Create a new product'}</p>
                            </div>
                            <button onClick={() => { setIsModalOpen(false); resetProductForm(); }} className="p-3 rounded-xl hover:bg-stone-100 transition-colors">
                                <X size={20} className="text-stone-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="p-8 overflow-y-auto space-y-5">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newProduct.name}
                                        onChange={(e) => {
                                            const name = e.target.value;
                                            const slug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
                                            setNewProduct({ ...newProduct, name, slug });
                                        }}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                                        placeholder="Enter product name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-2">Price (Rs.) *</label>
                                    <input
                                        type="number"
                                        required
                                        value={newProduct.price || ''}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-2">Category</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                                    >
                                        <option value="">Select category</option>
                                        <option value="Lips">Lips</option>
                                        <option value="Face">Face</option>
                                        <option value="Eyes">Eyes</option>
                                        <option value="Skincare">Skincare</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-stone-700 mb-2">Brand</label>
                                    <input
                                        type="text"
                                        value={newProduct.brand}
                                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                                        placeholder="Brand name"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-2">Product Images</label>
                                <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center hover:border-amber-400 transition-colors bg-stone-50/50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="product-images"
                                    />
                                    <label htmlFor="product-images" className="cursor-pointer">
                                        <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                                            <ImagePlus size={24} className="text-amber-600" />
                                        </div>
                                        <p className="text-sm font-medium text-stone-600">Click to upload images</p>
                                        <p className="text-xs text-stone-400 mt-1">PNG, JPG, WebP up to 10MB</p>
                                    </label>
                                </div>
                                {imagePreviewUrls.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        {imagePreviewUrls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-white ring-2 ring-stone-100">
                                                    <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-stone-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all resize-none"
                                    placeholder="Product description"
                                />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { key: 'isNew', label: 'New', icon: Star },
                                    { key: 'isBestSeller', label: 'Best Seller', icon: TrendingUp },
                                    { key: 'inStock', label: 'In Stock', icon: CheckCircle2 },
                                    { key: 'featured', label: 'Featured', icon: Sparkles },
                                ].map((flag) => (
                                    <label key={flag.key} className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all text-sm ${(newProduct as any)[flag.key] ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-400 text-amber-700 shadow-lg shadow-amber-100' : 'bg-stone-50 border-2 border-transparent text-stone-500 hover:border-stone-200'}`}>
                                        <input
                                            type="checkbox"
                                            checked={(newProduct as any)[flag.key]}
                                            onChange={(e) => setNewProduct({ ...newProduct, [flag.key]: e.target.checked })}
                                            className="hidden"
                                        />
                                        <flag.icon size={16} />
                                        <span className="font-semibold">{flag.label}</span>
                                    </label>
                                ))}
                            </div>

                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full py-4 font-semibold text-white rounded-xl bg-gradient-to-r from-stone-800 via-stone-900 to-stone-800 hover:shadow-xl hover:shadow-stone-300/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        {editingProduct ? <Edit size={20} /> : <Plus size={20} />}
                                        {editingProduct ? 'Update Product' : 'Create Product'}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
