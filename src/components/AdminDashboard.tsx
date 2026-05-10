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
    CreditCard,
    Shield
} from "lucide-react";
import { RateLimitDashboard } from "./RateLimitDashboard";
import { useApp } from "../contexts/AppContext";
import { apiService } from "../services/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";
import LoadingSpinner from "./LoadingSpinner";

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
            // Create preview URLs
            const newPreviewUrls = files.map(file => URL.createObjectURL(file));
            setImagePreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        // Revoke the URL to free memory
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

            // Create FormData for file upload
            const formData = new FormData();

            // Add product data as JSON string
            const productData = {
                ...newProduct,
                images: newProduct.images // Keep existing images for edit mode
            };
            formData.append('data', JSON.stringify(productData));

            // Add image files
            selectedImages.forEach((file) => {
                formData.append('images', file);
            });

            if (editingProduct) {
                // Update existing product
                await apiService.updateProductWithImages(editingProduct, formData, token);
                showToast("Product updated successfully!", "success");
            } else {
                // Create new product with images
                await apiService.createProductWithImages(formData, token);
                showToast("Luxe item added to the vault!", "success");
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
        // Set existing images as preview URLs
        setImagePreviewUrls(product.images || []);
        setSelectedImages([]); // Clear selected files, only show existing images
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
            <div className="flex items-center justify-center min-h-screen bg-muted/20">
                <div className="space-y-4 text-center">
                    <h2 className="text-2xl font-bold">Unauthorized Access</h2>
                    <p>Only administrators may enter the Vault.</p>
                    <button onClick={() => router.push('/login')} className="px-8 py-3 text-white rounded-full bg-primary">Sign In as Admin</button>
                </div>
            </div>
        );
    }

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered').length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'pending' || o.orderStatus === 'processing').length;

    const stats = [
        { label: "Gross Revenue", value: `Rs.${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: `${deliveredOrders} delivered`, color: "bg-green-50 text-green-600" },
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
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 bg-muted/20">
            {/* Management Header Banner */}
            <div className="relative pt-12 pb-24 overflow-hidden text-white bg-foreground">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[150px] translate-x-1/2 -translate-y-1/2" />
                <div className="container relative z-10 px-4 mx-auto lg:px-8">
                    <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
                        <div className="space-y-2 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/10 mb-2 leading-none">
                                Administrator Vault
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Shaikh Jee <span className="italic text-primary">Control</span></h1>
                            <p className="italic font-medium opacity-70">Overseeing the legacy of luxury beauty and commerce.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => { resetProductForm(); setIsModalOpen(true); }} className="flex items-center gap-2 px-8 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all rounded-full shadow-xl bg-primary shadow-primary/20 hover:scale-105">
                                <Plus size={16} />
                                New Product
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 mx-auto -mt-12 lg:px-8">
                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 p-2 mx-auto mb-12 bg-white border rounded-full shadow-2xl shadow-black/5 border-border max-w-fit md:mx-0">
                    {[
                        { id: "overview", label: "Overview", icon: BarChart3 },
                        { id: "products", label: "Products", icon: Package },
                        { id: "orders", label: "Orders", icon: ShoppingBag },
                        { id: "users", label: "Users", icon: Users },
                        { id: "ratelimits", label: "API Limits", icon: Shield },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-8 py-3.5 rounded-full transition-all text-xs font-bold uppercase tracking-widest ${activeTab === tab.id
                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105"
                                : "bg-gray-500 text-white shadow-lg shadow-primary/20 scale-105"
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
                        <p className="italic font-bold text-muted-foreground">Accessing the Vault...</p>
                    </div>
                ) : (
                    <>
                        {/* Overview Tab */}
                        {activeTab === "overview" && (
                            <div className="space-y-12 duration-500 animate-in fade-in slide-in-from-bottom">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
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
                                                    <div className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-green-500 border border-green-100 rounded-full bg-green-50">
                                                        <TrendingUp size={12} />
                                                        {stat.trend}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 px-1">Live data</p>
                                                </div>
                                            </div>
                                            <div className="mb-1 text-4xl font-extrabold tracking-tighter text-foreground">
                                                {stat.value}
                                            </div>
                                            <div className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                                                {stat.label}
                                            </div>
                                            <ArrowUpRight className="absolute bottom-6 right-6 text-muted-foreground opacity-20" size={32} />
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Orders Table */}
                                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-primary/5">
                                    <h2 className="mb-8 text-2xl font-bold tracking-tight text-foreground">Recent Acquisitions</h2>
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
                                                    <tr key={o._id} className="transition-all bg-muted/10 hover:bg-white">
                                                        <td className="px-6 py-4 font-bold rounded-l-3xl">#{o._id.slice(-6).toUpperCase()}</td>
                                                        <td className="px-6">{o.shippingAddress?.name}</td>
                                                        <td className="px-6">
                                                            <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(o.orderStatus)}`}>
                                                                {o.orderStatus}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 font-extrabold text-right rounded-r-3xl">Rs.{o.totalPrice}</td>
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
                                <div className="flex flex-col items-center justify-between gap-8 mb-12 md:flex-row">
                                    <div className="space-y-1 text-center md:text-left">
                                        <h2 className="text-3xl font-bold tracking-tight text-foreground">The Boutique Registry</h2>
                                        <p className="text-sm italic font-medium text-muted-foreground">Managing {products.length} signature premium items</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-y-6">
                                        <thead>
                                            <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                                <th className="px-6 pb-4">Product Item</th>
                                                <th className="px-6 pb-4">Category</th>
                                                <th className="px-6 pb-4">Price</th>
                                                <th className="px-6 pb-4 text-center">Availability</th>
                                                <th className="px-6 pb-4 text-right">Management</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product) => (
                                                <tr key={product._id} className="text-sm transition-all group bg-muted/10 hover:bg-white hover:shadow-2xl rounded-3xl">
                                                    <td className="px-6 py-4 rounded-l-3xl">
                                                        <div className="flex items-center gap-6">
                                                            <div className="relative w-16 h-16 overflow-hidden bg-white rounded-2xl shrink-0">
                                                                {product.images?.[0] && <Image src={product.images[0]} alt={product.name} fill className="object-cover" />}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-base font-bold tracking-tight text-foreground">{product.name}</p>
                                                                <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">ID: {product._id.slice(-8).toUpperCase()}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 italic font-bold text-primary">{product.category}</td>
                                                    <td className="px-6 py-4 font-extrabold">Rs.{product.price}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <select
                                                            value={product.status}
                                                            onChange={(e) => handleUpdateProductStatus(product._id, e.target.value)}
                                                            className="px-2 py-1 border rounded"
                                                            disabled={isSubmitting}
                                                        >
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                            <option value="archived">Archived</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-right rounded-r-3xl">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => handleEditProduct(product)} className="p-2 transition-colors text-muted-foreground hover:text-primary"><Edit size={16} /></button>
                                                            <button onClick={() => handleDeleteProduct(product._id, product.name)} className="p-2 transition-colors text-destructive hover:text-red-600"><Trash2 size={16} /></button>
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
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                <div className="bg-white w-full max-w-md rounded-[3rem] p-10 relative animate-in zoom-in duration-300 text-center space-y-6">
                                    <AlertCircle size={48} className="mx-auto text-destructive" />
                                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Confirm Deletion</h2>
                                    <p className="text-muted-foreground">Are you sure you want to delete {deleteConfirmation.type === 'user' ? 'user' : 'product'} <span className="font-bold">"{deleteConfirmation.name}"</span>? This action cannot be undone.</p>
                                    <div className="flex justify-center gap-4">
                                        <button onClick={() => setDeleteConfirmation(null)} className="flex-1 py-4 font-bold transition-all border-2 rounded-full border-border text-foreground hover:bg-muted">Cancel</button>
                                        <button onClick={confirmDelete} disabled={isSubmitting} className="flex-1 py-4 font-bold text-white transition-all rounded-full bg-destructive hover:bg-red-600 disabled:opacity-50">
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Details Modal */}
                        {selectedOrder && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                <div className="bg-white w-full max-w-3xl rounded-[3rem] p-10 relative animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                                    <button onClick={() => setSelectedOrder(null)} className="absolute p-2 rounded-full top-8 right-8 hover:bg-muted">
                                        <X size={24} />
                                    </button>

                                    <div className="space-y-8">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-3xl font-bold tracking-tight">Order Details</h2>
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {selectedOrder.orderNumber || `ORD-${selectedOrder._id.slice(-8).toUpperCase()}`}
                                                </p>
                                            </div>
                                            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedOrder.orderStatus)}`}>
                                                {selectedOrder.orderStatus?.replace(/_/g, ' ')}
                                            </span>
                                        </div>

                                        {/* Order Info Grid */}
                                        <div className="grid gap-6 md:grid-cols-2">
                                            {/* Customer Info */}
                                            <div className="p-6 space-y-4 bg-muted/30 rounded-2xl">
                                                <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground">
                                                    <Users size={14} /> Customer Information
                                                </h3>
                                                <div className="space-y-3">
                                                    <p className="text-lg font-bold">{selectedOrder.shippingAddress?.name}</p>
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
                                            <div className="p-6 space-y-4 bg-muted/30 rounded-2xl">
                                                <h3 className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-muted-foreground">
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
                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                            <div className="p-4 text-center bg-primary/5 rounded-2xl">
                                                <Calendar size={20} className="mx-auto mb-2 text-primary" />
                                                <p className="text-xs text-muted-foreground">Order Date</p>
                                                <p className="text-sm font-bold">
                                                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="p-4 text-center bg-primary/5 rounded-2xl">
                                                <CreditCard size={20} className="mx-auto mb-2 text-primary" />
                                                <p className="text-xs text-muted-foreground">Payment</p>
                                                <p className="text-sm font-bold">{selectedOrder.paymentMethod}</p>
                                            </div>
                                            <div className="p-4 text-center bg-primary/5 rounded-2xl">
                                                <Package size={20} className="mx-auto mb-2 text-primary" />
                                                <p className="text-xs text-muted-foreground">Items</p>
                                                <p className="text-sm font-bold">{selectedOrder.orderItems?.length || 0}</p>
                                            </div>
                                            <div className="p-4 text-center bg-green-50 rounded-2xl">
                                                <DollarSign size={20} className="mx-auto mb-2 text-green-600" />
                                                <p className="text-xs text-muted-foreground">Total</p>
                                                <p className="text-sm font-bold text-green-600">Rs.{selectedOrder.totalPrice?.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div>
                                            <h3 className="mb-4 text-xs font-bold tracking-widest uppercase text-muted-foreground">Order Items</h3>
                                            <div className="space-y-3">
                                                {selectedOrder.orderItems?.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl">
                                                        <div className="flex-shrink-0 w-16 h-16 overflow-hidden bg-white rounded-xl">
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
                                                            <p className="font-bold">Rs.{(item.price * item.quantity).toLocaleString()}</p>
                                                            <p className="text-xs text-muted-foreground">Rs.{item.price} each</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price Summary */}
                                        <div className="p-6 bg-muted/30 rounded-2xl">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Subtotal</span>
                                                    <span>Rs.{selectedOrder.itemsPrice?.toLocaleString() || selectedOrder.totalPrice?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Shipping</span>
                                                    <span>{selectedOrder.shippingPrice === 0 ? 'FREE' : `Rs.${selectedOrder.shippingPrice?.toLocaleString()}`}</span>
                                                </div>
                                                {selectedOrder.discount?.amount > 0 && (
                                                    <div className="flex justify-between text-sm text-green-600">
                                                        <span>Discount ({selectedOrder.discount.code})</span>
                                                        <span>-Rs.{selectedOrder.discount.amount.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between pt-3 text-lg font-bold border-t border-border">
                                                    <span>Total</span>
                                                    <span className="text-primary">Rs.{selectedOrder.totalPrice?.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Update Status */}
                                        <div className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl">
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
                                <div className="flex flex-col items-center justify-between gap-8 mb-8 md:flex-row">
                                    <div className="space-y-1 text-center md:text-left">
                                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Order Chronicles</h2>
                                        <p className="text-sm italic font-medium text-muted-foreground">Managing {orders.length} customer orders</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute -translate-y-1/2 left-4 top-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search orders..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-64 py-3 pl-12 pr-6 text-sm transition-all border border-transparent rounded-full outline-none bg-muted/50 focus:bg-white focus:border-primary"
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
                                                <tr key={o._id} className="text-sm transition-all bg-muted/10 hover:bg-white hover:shadow-lg">
                                                    <td className="px-6 py-6 font-bold rounded-l-3xl">
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
                                                    <td className="px-6 py-6 font-extrabold">Rs.{o.totalPrice?.toLocaleString()}</td>
                                                    <td className="px-6 py-6 text-right rounded-r-3xl">
                                                        <button
                                                            onClick={() => setSelectedOrder(o)}
                                                            className="p-2 transition-colors rounded-full text-primary hover:bg-primary/10"
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
                                        <div className="py-12 text-center text-muted-foreground">
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
                                <div className="flex flex-col items-center justify-between gap-8 mb-8 md:flex-row">
                                    <div className="space-y-1 text-center md:text-left">
                                        <h2 className="text-3xl font-bold tracking-tight text-foreground">User Management</h2>
                                        <p className="text-sm italic font-medium text-muted-foreground">Managing {users.length} registered users</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute -translate-y-1/2 left-4 top-1/2 text-muted-foreground" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-64 py-3 pl-12 pr-6 text-sm transition-all border border-transparent rounded-full outline-none bg-muted/50 focus:bg-white focus:border-primary"
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
                                                <tr key={u._id} className="text-sm transition-all bg-muted/10 hover:bg-white hover:shadow-lg">
                                                    <td className="px-6 py-6 font-bold rounded-l-3xl">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center justify-center w-10 h-10 font-bold rounded-full bg-primary/10 text-primary">
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
                                                    <td className="px-6 py-6 text-right rounded-r-3xl">
                                                        {u._id !== user?.id && (
                                                            <button
                                                                onClick={() => handleDeleteUser(u._id, u.name)}
                                                                className="p-2 transition-colors text-destructive hover:text-red-600"
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
                                        <div className="py-12 text-center text-muted-foreground">
                                            <Users className="mx-auto mb-4 opacity-50" size={48} />
                                            <p className="font-medium">No users found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Rate Limits Tab */}
                        {activeTab === "ratelimits" && (
                            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-primary/5 animate-in fade-in slide-in-from-bottom duration-500">
                                <RateLimitDashboard />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Product Modal (Add/Edit) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 relative animate-in zoom-in duration-300 max-h-full overflow-y-auto">
                        <button onClick={() => { setIsModalOpen(false); resetProductForm(); }} className="absolute p-2 rounded-full top-8 right-8 hover:bg-muted"><X size={24} /></button>
                        <h2 className="mb-8 text-3xl font-bold tracking-tight">{editingProduct ? 'Edit Product' : 'Add Signature Item'}</h2>
                        <form onSubmit={handleSaveProduct} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Luxe Name</label>
                                    <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} className="w-full px-6 py-4 transition-all border border-transparent outline-none bg-muted/50 rounded-2xl focus:bg-white focus:border-primary" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Valuation (Rs.)</label>
                                    <input type="number" required value={newProduct.price || ''} onChange={(e) => setNewProduct({ ...newProduct, price: parseInt(e.target.value) || 0 })} className="w-full px-6 py-4 transition-all border border-transparent outline-none bg-muted/50 rounded-2xl focus:bg-white focus:border-primary" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Original Price (Rs.)</label>
                                    <input type="number" value={newProduct.originalPrice || ''} onChange={(e) => setNewProduct({ ...newProduct, originalPrice: parseInt(e.target.value) || 0 })} className="w-full px-6 py-4 transition-all border border-transparent outline-none bg-muted/50 rounded-2xl focus:bg-white focus:border-primary" placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Discount (%)</label>
                                    <input type="number" value={newProduct.discount || ''} onChange={(e) => setNewProduct({ ...newProduct, discount: parseInt(e.target.value) || 0 })} className="w-full px-6 py-4 transition-all border border-transparent outline-none bg-muted/50 rounded-2xl focus:bg-white focus:border-primary" placeholder="0" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Subcategory</label>
                                <input type="text" value={newProduct.subcategory} onChange={(e) => setNewProduct({ ...newProduct, subcategory: e.target.value })} className="w-full px-6 py-4 transition-all border border-transparent outline-none bg-muted/50 rounded-2xl focus:bg-white focus:border-primary" placeholder="e.g. Lipsticks" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Brand</label>
                                <input type="text" value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} className="w-full px-6 py-4 transition-all border border-transparent outline-none bg-muted/50 rounded-2xl focus:bg-white focus:border-primary" placeholder="e.g. Fenty Beauty" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Department</label>
                                <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full px-6 py-4 text-sm font-bold outline-none appearance-none bg-muted/50 rounded-2xl">
                                    <option>Lips</option>
                                    <option>Face</option>
                                    <option>Eyes</option>
                                    <option>Skincare</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Product Images</label>
                                <div className="p-4 border-2 border-dashed rounded-2xl border-muted-foreground/20 bg-muted/30">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="product-images"
                                    />
                                    <label htmlFor="product-images" className="flex flex-col items-center justify-center gap-2 cursor-pointer py-4">
                                        <Plus size={24} className="text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Click to upload images</span>
                                        <span className="text-xs text-muted-foreground/70">PNG, JPG, WebP up to 10MB</span>
                                    </label>
                                </div>
                                {/* Image Previews */}
                                {imagePreviewUrls.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-4">
                                        {imagePreviewUrls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <div className="relative w-20 h-20 overflow-hidden bg-white border rounded-xl border-border">
                                                    <Image src={url} alt={`Preview ${index + 1}`} fill className="object-cover" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute flex items-center justify-center w-5 h-5 text-white transition-opacity rounded-full opacity-0 -top-2 -right-2 bg-destructive group-hover:opacity-100"
                                                >
                                                    <X size={12} />
                                                </button>
                                                {index === 0 && (
                                                    <span className="absolute px-1 text-[8px] font-bold text-white rounded bg-primary -bottom-1 left-1/2 -translate-x-1/2">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Ingredients (comma-separated)</label>
                                <textarea rows={2} value={newProduct.ingredients} onChange={(e) => setNewProduct({ ...newProduct, ingredients: e.target.value })} className="w-full px-6 py-4 transition-all border border-transparent outline-none resize-none bg-muted/50 rounded-2xl focus:bg-white focus:border-primary" placeholder="Ingredient 1, Ingredient 2" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Usage Instructions</label>
                                <textarea rows={2} value={newProduct.usage} onChange={(e) => setNewProduct({ ...newProduct, usage: e.target.value })} className="w-full px-6 py-4 transition-all border border-transparent outline-none resize-none bg-muted/50 rounded-2xl focus:bg-white focus:border-primary" placeholder="How to use this product" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Skin Types (comma-separated)</label>
                                <input type="text" value={newProduct.skinTypes} onChange={(e) => setNewProduct({ ...newProduct, skinTypes: e.target.value })} className="w-full px-6 py-4 transition-all border border-transparent outline-none bg-muted/50 rounded-2xl focus:bg-white focus:border-primary" placeholder="Oily, Dry, Combination" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Narrative</label>
                                <textarea rows={3} value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full px-6 py-4 transition-all border border-transparent outline-none resize-none bg-muted/50 rounded-2xl focus:bg-white focus:border-primary" />
                            </div>
                            <div className="grid gap-6 pt-4 md:grid-cols-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <input type="checkbox" checked={newProduct.isNew} onChange={(e) => setNewProduct({ ...newProduct, isNew: e.target.checked })} className="w-4 h-4 rounded text-primary" />
                                    New Arrival
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <input type="checkbox" checked={newProduct.isBestSeller} onChange={(e) => setNewProduct({ ...newProduct, isBestSeller: e.target.checked })} className="w-4 h-4 rounded text-primary" />
                                    Best Seller
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <input type="checkbox" checked={newProduct.inStock} onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })} className="w-4 h-4 rounded text-primary" />
                                    In Stock
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                                    <input type="checkbox" checked={newProduct.featured} onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })} className="w-4 h-4 rounded text-primary" />
                                    Featured Product
                                </label>
                            </div>
                            <button disabled={isSubmitting} type="submit" className="flex items-center justify-center w-full gap-3 py-5 font-bold text-white transition-all rounded-full shadow-xl bg-primary active:scale-95 disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> {editingProduct ? 'Update Product' : 'Register Luxe Item'}</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
