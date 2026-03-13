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
  AlertCircle
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { apiService } from "../services/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/hooks/useToast";

export const AdminDashboard = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    category: "Lips",
    subcategory: "",
    price: 0,
    originalPrice: 0,
    discount: 0,
    description: "",
    images: [""],
    inStock: true,
    isNew: true,
    isBestSeller: false,
    brand: "",
    featured: false,
    ingredients: "",
    usage: "",
    skinTypes: "", // Stored as comma-separated string
    shades: [{ _id: "", name: "", color: "#FFFFFF", stock: 0 }] // Simplified for initial input
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

      setProducts(prodData.products || []);
      setOrders(orderData.orders || []);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await apiService.createProduct(newProduct, token);
      setIsModalOpen(false);
      fetchData();
      setNewProduct({
        name: "",
        slug: "",
        category: "Lips",
        price: 0,
        description: "",
        images: [""],
        inStock: true
      });
      setEditingProduct(null);
      showToast("Luxe item added to the vault!", "success");
    } catch (error) {
      showToast("Error adding product. Please verify admin privileges.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    setDeleteConfirmation({ id: productId, name: productName });
  };

  const confirmDeleteProduct = async () => {
    if (!deleteConfirmation) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      await apiService.deleteProduct(deleteConfirmation.id, token); // Actual API call
      fetchData(); // Re-fetch products after deletion
      setDeleteConfirmation(null);
      showToast("Product removed from vault", "success");
    } catch (error) {
      showToast("Error deleting product. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setNewProduct({
      name: product.name,
      slug: product.slug || "",
      category: product.category,
      price: product.price,
      description: product.description,
      images: product.images || [""],
      inStock: product.inStock
    });
    setEditingProduct(product._id);
    setIsModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      // Note: Add updateOrderStatus to apiService if needed
      // await apiService.updateOrderStatus(orderId, newStatus, token);
      setOrders(orders.map(o =>
        o._id === orderId ? { ...o, orderStatus: newStatus } : o
      ));
      showToast(`Order status updated to ${newStatus}`, "success");
    } catch (error) {
      showToast("Error updating order status. Please try again.", "error");
    }
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

  const stats = [
    { label: "Gross Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: "+12.5%", color: "bg-green-50 text-green-600" },
    { label: "Order Volume", value: orders.length, icon: ShoppingBag, trend: "+5.2%", color: "bg-blue-50 text-blue-600" },
    { label: "Boutique Items", value: products.length, icon: Package, trend: "Live", color: "bg-amber-50 text-amber-600" },
    { label: "Active Patronage", value: "1,234", icon: Users, trend: "+8.1%", color: "bg-primary/10 text-primary" },
  ];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "bg-green-100 text-green-700";
      case "processing": return "bg-amber-100 text-amber-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

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
               <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-primary text-white font-bold rounded-full text-xs uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all">
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
            { id: "overview", label: "Insights Overview", icon: BarChart3 },
            { id: "products", label: "Collection Mgmt", icon: Package },
            { id: "orders", label: "Order Chronicle", icon: ShoppingBag },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-8 py-3.5 rounded-full transition-all text-xs font-bold uppercase tracking-widest ${
                activeTab === tab.id
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
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${product.inStock ? "text-green-600" : "text-destructive"}`}>
                                {product.inStock ? "In Presence" : "Depleted"}
                                </span>
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
                          <p className="text-muted-foreground">Are you sure you want to delete <span className="font-bold">"{deleteConfirmation.name}"</span>? This action cannot be undone.</p>
                          <div className="flex gap-4 justify-center">
                              <button onClick={() => setDeleteConfirmation(null)} className="flex-1 py-4 border-2 border-border text-foreground font-bold rounded-full hover:bg-muted transition-all">Cancel</button>
                              <button onClick={confirmDeleteProduct} disabled={isSubmitting} className="flex-1 py-4 bg-destructive text-white font-bold rounded-full hover:bg-red-600 transition-all disabled:opacity-50">
                                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Delete"}
                              </button>
                          </div>
                      </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === "orders" && (
                <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-primary/5 animate-in fade-in slide-in-from-bottom duration-500">
                    <h2 className="text-3xl font-bold text-foreground tracking-tight mb-8">Order Chronicles</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                        <th className="px-6 pb-2">Order ID</th>
                                        <th className="px-6 pb-2">Customer</th>
                                        <th className="px-6 pb-2">Status</th>
                                        <th className="px-6 pb-2 text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr key={o._id} className="bg-muted/10 hover:bg-white transition-all text-sm">
                                            <td className="py-6 px-6 font-bold rounded-l-3xl">ORD-{o._id.slice(-8).toUpperCase()}</td>
                                            <td className="px-6">{o.shippingAddress?.name}</td>
                                            <td className="px-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(o.orderStatus)}`}>
                                                    {o.orderStatus}
                                                </span>
                                            </td>
                                            <td className="py-6 px-6 text-right font-extrabold rounded-r-3xl">₹{o.totalPrice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                        </table>
                    </div>
                </div>
                )}
            </>
        )}
      </div>

      {/* New Product Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 relative animate-in zoom-in duration-300 max-h-full overflow-y-auto">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-muted rounded-full"><X size={24} /></button>
                  <h2 className="text-3xl font-bold mb-8 tracking-tight">Add Signature Item</h2>
                  <form onSubmit={handleAddProduct} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Luxe Name</label>
                              <input type="text" required value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Valuation (₹)</label>
                              <input type="number" required value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Original Price (₹)</label>
                              <input type="number" value={newProduct.originalPrice} onChange={(e) => setNewProduct({...newProduct, originalPrice: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" placeholder="0" />
                          </div>
                          <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Discount (%)</label>
                              <input type="number" value={newProduct.discount} onChange={(e) => setNewProduct({...newProduct, discount: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" placeholder="0" />
                          </div>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Subcategory</label>
                          <input type="text" value={newProduct.subcategory} onChange={(e) => setNewProduct({...newProduct, subcategory: e.target.value})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" placeholder="e.g. Lipsticks" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Brand</label>
                          <input type="text" value={newProduct.brand} onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" placeholder="e.g. Fenty Beauty" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Department</label>
                          <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl outline-none appearance-none font-bold text-sm">
                              <option>Lips</option>
                              <option>Face</option>
                              <option>Eyes</option>
                              <option>Skincare</option>
                          </select>
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Visual URL</label>
                          <input type="text" required value={newProduct.images[0]} onChange={(e) => setNewProduct({...newProduct, images: [e.target.value]})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Ingredients (comma-separated)</label>
                          <textarea rows={2} value={newProduct.ingredients} onChange={(e) => setNewProduct({...newProduct, ingredients: e.target.value})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none resize-none" placeholder="Ingredient 1, Ingredient 2" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Usage Instructions</label>
                          <textarea rows={2} value={newProduct.usage} onChange={(e) => setNewProduct({...newProduct, usage: e.target.value})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none resize-none" placeholder="How to use this product" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Skin Types (comma-separated)</label>
                          <input type="text" value={newProduct.skinTypes} onChange={(e) => setNewProduct({...newProduct, skinTypes: e.target.value})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none" placeholder="Oily, Dry, Combination" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Narrative</label>
                          <textarea rows={3} value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full px-6 py-4 bg-muted/50 rounded-2xl focus:bg-white border-transparent focus:border-primary border transition-all outline-none resize-none" />
                      </div>
                      <div className="grid md:grid-cols-2 gap-6 pt-4">
                          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <input type="checkbox" checked={newProduct.isNew} onChange={(e) => setNewProduct({...newProduct, isNew: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                              New Arrival
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <input type="checkbox" checked={newProduct.isBestSeller} onChange={(e) => setNewProduct({...newProduct, isBestSeller: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                              Best Seller
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <input type="checkbox" checked={newProduct.inStock} onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                              In Stock
                          </label>
                          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                              <input type="checkbox" checked={newProduct.featured} onChange={(e) => setNewProduct({...newProduct, featured: e.target.checked})} className="w-4 h-4 text-primary rounded" />
                              Featured Product
                          </label>
                      </div>
                      <button disabled={isSubmitting} type="submit" className="w-full py-5 bg-primary text-white font-bold rounded-full shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all">
                          {isSubmitting ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Register Luxe Item</>}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
