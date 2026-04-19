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
    ArrowUpRight,
    MoreVertical,
    Filter,
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
    CreditCard
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { apiService } from "../services/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";
import LoadingSpinner from "./LoadingSpinner";

export const AdminDashboard = () => {
    const { user } = useApp();
    const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "users">("overview");
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

    const [newProduct, setNewProduct] = useState({
        name: "",
        slug: "",
        category: "",
        subcategory: "",
        price: 0,
        originalPrice: 0,
        discount: 0,
        description: "",
        images: [""],
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

            // Fetch users for admin
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
            images: [""],
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
        setEditingProduct(null);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            if (editingProduct) {
                // Update existing product
                await apiService.updateProduct(editingProduct, newProduct, token);
                showToast("Product updated successfully!", "success");
            } else {
                // Create new product
                await apiService.createProduct(newProduct, token);
                showToast("Luxe item added to the vault!", "success");
            }

            setIsModalOpen(false);
            fetchData();
            resetProductForm();
        } catch (error) {
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
                showToast("Product removed from vault", "success");
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
            images: product.images || [""],
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

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const paginatedOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const filteredProducts = paginatedProducts.filter(product =>
        product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredOrders = paginatedOrders.filter(order =>
        order?.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (!user || user.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/20">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">Unauthorized Access</h2>
                    <p>Only administrators may enter the Vault.</p>
                    <button onClick={() => router.push('/login')} className="px-8 py-3 bg-primary text-white rounded-full">Sign In as Admin</button>
                </div>
            </div>
        );
    }

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;

    const stats = [
        { label: "Gross Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: `${deliveredOrders} delivered`, color: "bg-green-50 text-green-600" },
        { label: "Order Volume", value: orders.length, icon: ShoppingBag, trend: `${pendingOrders} pending`, color: "bg-blue-50 text-blue-600" },
        { label: "Boutique Items", value: products.length, icon: Package, trend: "Live", color: "bg-amber-50 text-amber-600" },
        { label: "Registered Users", value: users.length.toLocaleString(), icon: Users, trend: "Active", color: "bg-primary/10 text-primary" },
    ];

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "delivered": return "bg-green-100 text-green-700 border-green-200";
            case "shipped": return "bg-blue-100 text-blue-700 border-blue-200";
            case "out_for_delivery": return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case "processing": return "bg-amber-100 text-amber-700 border-amber-200";
            case "confirmed": return "bg-cyan-100 text-cyan-700 border-cyan-200";
            case "pending": return "bg-gray-100 text-gray-700 border-gray-200";
            case "cancelled": return "bg-red-100 text-red-700 border-red-200";
            case "returned": return "bg-orange-100 text-orange-700 border-orange-200";
            default: return "bg-blue-100 text-blue-700 border-blue-200";
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/20 pb-20">
            {/* Management Header Banner */}
            <div className="bg-foreground text-white pt-12 pb-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
                <div className="container mx-auto px-4 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="space-y-2 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10 mb-2 leading-none">
                                Administrator Vault
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">Shaikh Jee <span className="text-primary italic">Control</span></h1>
                            <p className="opacity-70 font-medium italic">Overseeing the legacy of luxury beauty and commerce.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => { resetProductForm(); setIsModalOpen(true); }} className="px-8 py-4 bg-primary text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all">
                                <Plus size={16} />
                                New Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 -mt-12">
                {/* Navigation Tabs */}
                <div className="bg-white rounded-full p-2 shadow-2xl shadow-black/5 border border-border flex flex-wrap gap-2 mb-12 max-w-fit mx-auto md:mx-0">
                    {[
                        { id: "overview", label: "Overview", icon: BarChart3 },
                        { id: "products", label: "Products", icon: Package },
                        { id: "orders", label: "Orders", icon: ShoppingBag },
                        { id: "users", label: "Users", icon: Users },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-full transition-all text-xs font-bold uppercase tracking-widest ${activeTab === tab.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                : "bg-transparent text-muted-foreground hover:bg-muted"
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <Loader2 className="animate-spin text-primary" size={48} />
                        <p className="font-bold italic text-muted-foreground">Accessing the Vault...</p>
                    </div>
                ) : (
                    <>
                        {/* Overview Tab */}
                        {activeTab === "overview" && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom duration-500">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {stats.map((stat, index) => (
                                        <div
                                            key={index}
                                            className="bg-white rounded-[2.5rem] p-8 border border-primary/5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <div className={`p-4 rounded-2xl border ${stat.color} transition-transform group-hover:rotate-12`}>
                                                    <stat.icon size={26} />
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded-full border border-green-100">
                                                        <TrendingUp size={12} />
                                                        {stat.trend}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 px-1">Live data</p>
                                                </div>
                                            </div>
                                            <div className="text-4xl font-extrabold text-foreground tracking-tighter mb-1">
                                                {stat.value}
                                            </div>
                                            <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                                {stat.label}
                                            </div>
                                            <ArrowUpRight className="absolute bottom-6 right-6 text-muted-foreground opacity-20" size={32} />
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Orders Table */}
                                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-primary/5">
                                    <h2 className="text-2xl font-bold text-foreground tracking-tight mb-8">Recent Acquisitions</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-separate border-spacing-y-4">
                                            <thead>
                                                <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    <th className="px-6 pb-2">Ref</th>
                                                    <th className="px-6 pb-2">Patron</th>
                                                    <th className="px-6 pb-2">Status</th>
                                                    <th className="px-6 pb-2 text-right">Valuation</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.slice(0, 5).map((o) => (
                                                    <tr key={o._id} className="bg-muted/10 hover:bg-white transition-all">
                                                        <td className="py-4 px-6 font-bold rounded-l-3xl">#{o._id.slice(-6).toUpperCase()}</td>
                                                        <td className="px-6">{o.shippingAddress?.name}</td>
                                                        <td className="px-6">
                                                            <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(o.orderStatus)}`}>
                                                                {o.orderStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 text-right font-extrabold rounded-r-3xl">₹{o.totalPrice}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products Tab */}
                        {activeTab === "products" && (
                            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-primary/5 animate-in fade-in slide-in-from-bottom duration-500">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                                    <div className="space-y-1 text-center md:text-left">
                                        <h2 className="text-3xl font-bold text-foreground tracking-tight">The Boutique Registry</h2>
                                        <p className="text-muted-foreground text-sm font-medium italic">Managing {products.length} signature premium items</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-y-6">
                                        <thead>
                                            <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                                <th className="pb-4 px-6">Product Item</th>
                                                <th className="pb-4 px-6">Category</th>
                                                <th className="pb-4 px-6">Price</th>
                                                <th className="pb-4 px-6 text-center">Availability</th>
                                                <th className="pb-4 px-6 text-right">Management</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product) => (
                                                <tr key={product._id} className="group bg-muted/10 hover:bg-white hover:shadow-2xl transition-all text-sm rounded-3xl">
                                                    <td className="py-4 px-6 rounded-l-3xl">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-16 h-16 relative rounded-2xl overflow-hidden bg-white shrink-0">
                                                                {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" />}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="font-bold text-foreground text-base tracking-tight">{product.name}</p>
                                                                <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">ID: {product._id.slice(-8).toUpperCase()}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 font-bold text-primary italic">{product.category}</td>
                                                    <td className="py-4 px-6 font-extrabold">₹{product.price}</td>
                                                    <td className="py-4 px-6 text-center">
                                                        <select
                                                            value={product.status}
                                                            onChange={(e) => handleUpdateProductStatus(product._id, e.target.value)}
                                                            className="border rounded px-2 py-1"
                                                            disabled={isSubmitting}
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                            <option value="archived">Archived</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-4 px-6 text-right rounded-r-3xl">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleEditProduct(product)} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit size={16} /></button>
                                                            <button onClick={() => handleDeleteProduct(product._id, product.name)} className="p-2 text-destructive hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Delete Confirmation Modal */}
                        {deleteConfirmation && (
                            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative animate-in zoom-in duration-300 text-center space-y-6">
                                    <AlertCircle size={48} className="text-destructive mx-auto" />
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Confirm Deletion</h2>
                                    <p className="text-muted-foreground">Are you sure you want to delete {deleteConfirmation.type === 'user' ? 'user' : 'product'} <span className="font-bold">"{deleteConfirmation.name}"</span>? This action cannot be undone.</p>
                                    <div className="flex gap-4 justify-center">
                                        <button onClick={() => setDeleteConfirmation(null)} className="flex-1 py-4 border-2 border-border text-foreground font-bold rounded-full hover:bg-muted transition-all">Cancel</button>
                                        <button onClick={confirmDelete} disabled={isSubmitting} className="flex-1 py-4 bg-destructive text-white font-bold rounded-full hover:bg-red-600 transition-all disabled:opacity-50">
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Details Modal */}
                        {selectedOrder && (
                            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                                <div className="bg-white w-full max-w-3xl rounded-[3rem] p-10 relative animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                                    <button onClick={() => setSelectedOrder(null)} className="absolute top-8 right-8 p-2 hover:bg-muted rounded-full">
                                        <X size={24} />
                                    </button>

                                    <div className="space-y-8">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-3xl font-bold tracking-tight">Order Details</h2>
                                                <p className="text-muted-foreground text-sm mt-1">
                                                    {selectedOrder.orderNumber || `ORD-${selectedOrder._id.slice(-8).toUpperCase()}`}
                                                </p>
                                            </div>
                                            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedOrder.orderStatus)}`}>
                                                {selectedOrder.orderStatus?.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        {/* Order Info Grid */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* Customer Info */}
                                            <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
                                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                    <Users size={14} /> Customer Information
                                                </h3>
                                                <div className="space-y-3">
                                                    <p className="font-bold text-lg">{selectedOrder.shippingAddress?.name}</p>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail size={14} />
                                                        {selectedOrder.shippingAddress?.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone size={14} />
                                                        {selectedOrder.shippingAddress?.phone}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Shipping Address */}
                                            <div className="bg-muted/30 rounded-2xl p-6 space-y-4">
                                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                    <MapPin size={14} /> Shipping Address
                                                </h3>
                                                <div className="space-y-1 text-sm">
                                                    <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                                                    {selectedOrder.shippingAddress?.addressLine2 && (
                                                        <p>{selectedOrder.shippingAddress?.addressLine2}</p>
                                                    )}
                                                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                                                    <p className="font-bold">{selectedOrder.shippingAddress?.pincode}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Meta */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-primary/5 rounded-2xl p-4 text-center">
                                                <Calendar size={20} className="mx-auto mb-2 text-primary" />
                                                <p className="text-xs text-muted-foreground">Order Date</p>
                                                <p className="font-bold text-sm">
                                                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="bg-primary/5 rounded-2xl p-4 text-center">
                                                <CreditCard size={20} className="mx-auto mb-2 text-primary" />
                                                <p className="text-xs text-muted-foreground">Payment</p>
                                                <p className="font-bold text-sm">{selectedOrder.paymentMethod}</p>
                                            </div>
                                            <div className="bg-primary/5 rounded-2xl p-4 text-center">
                                                <Package size={20} className="mx-auto mb-2 text-primary" />
                                                <p className="text-xs text-muted-foreground">Items</p>
                                                <p className="font-bold text-sm">{selectedOrder.orderItems?.length || 0}</p>
                                            </div>
                                            <div className="bg-green-50 rounded-2xl p-4 text-center">
                                                <DollarSign size={20} className="mx-auto mb-2 text-green-600" />
                                                <p className="text-xs text-muted-foreground">Total</p>
                                                <p className="font-bold text-sm text-green-600">₹{selectedOrder.totalPrice?.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div>
                                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Order Items</h3>
                                            <div className="space-y-3">
                                                {selectedOrder.orderItems?.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-4 bg-muted/20 rounded-2xl p-4">
                                                        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0">
                                                            {item.image && (
                                                                <Image src={item.image} alt={item.name} width={64} height={64} className="object-cover w-full h-full" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold truncate">{item.name}</p>
                                                            {item.selectedShade?.name && (
                                                                <p className="text-xs text-muted-foreground">Shade: {item.selectedShade.name}</p>
                                                            )}
                                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</p>
                                                            <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price Summary */}
                                        <div className="bg-muted/30 rounded-2xl p-6">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Subtotal</span>
                                                    <span>₹{selectedOrder.itemsPrice?.toLocaleString() || selectedOrder.totalPrice?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Shipping</span>
                                                    <span>{selectedOrder.shippingPrice === 0 ? 'FREE' : `₹${selectedOrder.shippingPrice?.toLocaleString()}`}</span>
                                                </div>
                                                {selectedOrder.discount?.amount > 0 && (
                                                    <div className="flex justify-between text-sm text-green-600">
                                                        <span>Discount ({selectedOrder.discount.code})</span>
                                                        <span>-₹{selectedOrder.discount.amount.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                                                    <span>Total</span>
                                                    <span className="text-primary">₹{selectedOrder.totalPrice?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Update Status */}
                                        <div className="flex items-center justify-between bg-muted/30 rounded-2xl p-6">
                                            <div>
                                                <h3 className="font-bold">Update Order Status</h3>
                                                <p className="text-sm text-muted-foreground">Change the status and notify customer</p>
                                            </div>
                                            <select
                                                value={selectedOrder.orderStatus}
                                                onChange={(e) => {
                                                    handleUpdateOrderStatus(selectedOrder._id, e.target.value);
                                                    setSelectedOrder({ ...selectedOrder, orderStatus: e.target.value });
                                                }}
                                                disabled={isSubmitting || selectedOrder.orderStatus === 'delivered'}
                                                className={`px-6 py-3 rounded-full text-sm font-bold uppercase border cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-70 ${getStatusColor(selectedOrder.orderStatus)}`}
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

                        {/* Orders Tab */}
                        {activeTab === "orders" && (
                            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-primary/5 animate-in fade-in slide-in-from-bottom duration-500">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                                    <div className="space-y-1 text-center md:text-left">
                                        <h2 className="text-3xl font-bold text-foreground tracking-tight">Order Chronicles</h2>
                                        <p className="text-muted-foreground text-sm font-medium italic">Managing {orders.length} customer orders</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search orders..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-12 pr-6 py-3 bg-muted/50 rounded-full w-64 focus:bg-white border border-transparent focus:border-primary transition-all outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-y-4">
                                        <thead>
                                            <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <th className="px-6 pb-2">Order ID</th>
                                                <th className="px-6 pb-2">Customer</th>
                                                <th className="px-6 pb-2">Contact</th>
                                                <th className="px-6 pb-2">Date</th>
                                                <th className="px-6 pb-2">Status</th>
                                                <th className="px-6 pb-2">Revenue</th>
                                                <th className="px-6 pb-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders
                                                .filter(o =>
                                                    o.shippingAddress?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    o.shippingAddress?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    o._id.toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                                .map((o) => (
                                                <tr key={o._id} className="bg-muted/10 hover:bg-white hover:shadow-lg transition-all text-sm">
                                                    <td className="py-6 px-6 font-bold rounded-l-3xl">
                                                        <div>
                                                            <p className="font-bold">ORD-{o._id.slice(-8).toUpperCase()}</p>
                                                            <p className="text-[10px] text-muted-foreground">{o.orderNumber || ''}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6">
                                                        <div>
                                                            <p className="font-semibold">{o.shippingAddress?.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{o.shippingAddress?.city}, {o.shippingAddress?.state}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6">
                                                        <div>
                                                            <p className="text-xs">{o.shippingAddress?.email}</p>
                                                            <p className="text-[10px] text-muted-foreground">{o.shippingAddress?.phone}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 text-xs text-muted-foreground">
                                                        {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-6">
                                                        <select
                                                            value={o.orderStatus}
                                                            onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                                                            disabled={isSubmitting || o.orderStatus === 'delivered'}
                                                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase border cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-70 ${getStatusColor(o.orderStatus)}`}
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
                                                    <td className="py-6 px-6 font-extrabold">₹{o.totalPrice?.toLocaleString()}</td>
                                                    <td className="py-6 px-6 text-right rounded-r-3xl">
                                                        <button
                                                            onClick={() => setSelectedOrder(o)}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                                                            title="View Order Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {orders.length === 0 && (
                                        <div className="text-center py-12 text-muted-foreground">
                                            <ShoppingBag className="mx-auto mb-4 opacity-50" size={48} />
                                            <p className="font-medium">No orders yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === "users" && (
                            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-primary/5 animate-in fade-in slide-in-from-bottom duration-500">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                                    <div className="space-y-1 text-center md:text-left">
                                        <h2 className="text-3xl font-bold text-foreground tracking-tight">User Management</h2>
                                        <p className="text-muted-foreground text-sm font-medium italic">Managing {users.length} registered users</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-12 pr-6 py-3 bg-muted/50 rounded-full w-64 focus:bg-white border border-transparent focus:border-primary transition-all outline-none text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-y-4">
                                        <thead>
                                            <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                <th className="px-6 pb-2">User</th>
                                                <th className="px-6 pb-2">Email</th>
                                                <th className="px-6 pb-2">Role</th>
                                                <th className="px-6 pb-2">Joined</th>
                                                <th className="px-6 pb-2 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users
                                                .filter(u =>
                                                    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                                .map((u) => (
                                                <tr key={u._id} className="bg-muted/10 hover:bg-white hover:shadow-lg transition-all text-sm">
                                                    <td className="py-6 px-6 font-bold rounded-l-3xl">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold">{u.name}</p>
                                                                <p className="text-[10px] text-muted-foreground">ID: {u._id.slice(-8).toUpperCase()}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 text-sm">{u.email}</td>
                                                    <td className="px-6">
                                                        <select
                                                            value={u.role}
                                                            onChange={(e) => handleUpdateUserRole(u._id, e.target.value)}
                                                            disabled={isSubmitting || u._id === user?.id}
                                                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase border cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                                                                u.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'
                                                            }`}
                                                        >
                                                            <option value="customer">Customer</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 text-xs text-muted-foreground">
                                                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="py-6 px-6 text-right rounded-r-3xl">
                                                        {u._id !== user?.id && (
                                                            <button
                                                                onClick={() => handleDeleteUser(u._id, u.name)}
                                                                className="p-2 text-destructive hover:text-red-600 transition-colors"
                                                                disabled={isSubmitting}
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
                                        <div className="text-center py-12 text-muted-foreground">
                                            <Users className="mx-auto mb-4 opacity-50" size={48} />
                                            <p className="font-medium">No users found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Product Modal (Add/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 relative animate-in zoom-in duration-300 max-h-full overflow-y-auto">
                        <button onClick={() => { setIsModalOpen(false); resetProductForm(); }} className="absolute top-8 right-8 p-2 hover:bg-muted rounded-full"><X size={24} /></button>
                        <h2 className="text-3xl font-bold mb-8 tracking-tight">{editingProduct ? 'Edit Product' : 'Add Signature Item'}</h2>
                        <form onSubmit={handleSaveProduct} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Luxe Name</label>
                                    <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Valuation (₹)</label>
                                    <input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Original Price (₹)</label>
                                    <input type="number" value={newProduct.originalPrice} onChange={(e) => setNewProduct({ ...newProduct, originalPrice: parseInt(e.target.value) })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Discount (%)</label>
                                    <input type="number" value={newProduct.discount} onChange={(e) => setNewProduct({ ...newProduct, discount: parseInt(e.target.value) })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" placeholder="0" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Subcategory</label>
                                <input type="text" value={newProduct.subcategory} onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" placeholder="e.g. Lipsticks" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Brand</label>
                                <input type="text" value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" placeholder="e.g. Fenty Beauty" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Department</label>
                                <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl outline-none appearance-none font-bold text-sm">
                                    <option>Lips</option>
                                    <option>Face</option>
                                    <option>Eyes</option>
                                    <option>Skincare</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Visual URL</label>
                                <input type="text" required value={newProduct.images[0]} onChange={(e) => setNewProduct({ ...newProduct, images: [e.target.value] })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Ingredients (comma-separated)</label>
                                <textarea rows={2} value={newProduct.ingredients} onChange={(e) => setNewProduct({ ...newProduct, ingredients: e.target.value })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none resize-none" placeholder="Ingredient 1, Ingredient 2" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Usage Instructions</label>
                                <textarea rows={2} value={newProduct.usage} onChange={(e) => setNewProduct({ ...newProduct, usage: e.target.value })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none resize-none" placeholder="How to use this product" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Skin Types (comma-separated)</label>
                                <input type="text" value={newProduct.skinTypes} onChange={(e) => setNewProduct({ ...newProduct, skinTypes: e.target.value })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" placeholder="Oily, Dry, Combination" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Narrative</label>
                                <textarea rows={3} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none resize-none" />
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 pt-4">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <input type="checkbox" checked={newProduct.isNew} onChange={(e) => setNewProduct({ ...newProduct, isNew: e.target.checked })} className="w-4 h-4 text-primary rounded" />
                                    New Arrival
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <input type="checkbox" checked={newProduct.isBestSeller} onChange={(e) => setNewProduct({ ...newProduct, isBestSeller: e.target.checked })} className="w-4 h-4 text-primary rounded" />
                                    Best Seller
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <input type="checkbox" checked={newProduct.inStock} onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })} className="w-4 h-4 text-primary rounded" />
                                    In Stock
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <input type="checkbox" checked={newProduct.featured} onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })} className="w-4 h-4 text-primary rounded" />
                                    Featured Product
                                </label>
                            </div>
                            <button disabled={isSubmitting} type="submit" className="w-full py-5 bg-primary text-white font-bold rounded-full shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> {editingProduct ? 'Update Product' : 'Register Luxe Item'}</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
