import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, getStatusColor } from '@/lib/helpers';
import AdminAnalytics from '@/components/AdminAnalytics';
import {
  LayoutDashboard, Package, ShoppingCart, Users, FolderOpen, LogOut,
  Plus, Pencil, Trash2, Save, X, Search, ChevronDown, ChevronUp,
  Eye, Check, Truck, CheckCircle, XCircle, Download, Loader2,
  TrendingUp, DollarSign, BarChart3, Image as ImageIcon, Globe,
  MessageSquare, Send, Phone
} from 'lucide-react';

type Section = 'dashboard' | 'analytics' | 'products' | 'orders' | 'customers' | 'collections';


// ─── MAIN ADMIN PAGE ────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, loading: authLoading, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading]);

  if (authLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  if (!user) return null;

  const navItems: { id: Section; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'collections', label: 'Collections', icon: FolderOpen },
  ];


  return (
    <div className="flex h-[calc(100vh-120px)] bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-white border-e border-gray-200 flex flex-col transition-all duration-200 shrink-0`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className={`font-bold text-gray-900 ${sidebarOpen ? 'text-lg' : 'text-xs text-center'}`}>
            {sidebarOpen ? 'Admin Panel' : 'AP'}
          </h2>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                section === item.id ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon size={18} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t border-gray-100">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-full px-3 py-2 text-xs text-gray-500 hover:bg-gray-50 rounded-lg">
            {sidebarOpen ? '← Collapse' : '→'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {section === 'dashboard' && <DashboardSection />}
        {section === 'analytics' && <AdminAnalytics />}
        {section === 'products' && <ProductsSection />}
        {section === 'orders' && <OrdersSection />}
        {section === 'customers' && <CustomersSection />}
        {section === 'collections' && <CollectionsSection />}
      </main>

    </div>
  );
}

// ─── DASHBOARD / ANALYTICS ──────────────────────────────────────────────────
function DashboardSection() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, customers: 0, products: 0 });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [ordersRes, customersRes, productsRes, itemsRes] = await Promise.all([
        supabase.from('ecom_orders').select('id, total, status, created_at, shipping_address').order('created_at', { ascending: false }),
        supabase.from('ecom_customers').select('id', { count: 'exact', head: true }),
        supabase.from('ecom_products').select('id', { count: 'exact', head: true }),
        supabase.from('ecom_order_items').select('product_name, quantity, total'),
      ]);

      const orders = ordersRes.data || [];
      const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
      setStats({
        orders: orders.length,
        revenue,
        customers: customersRes.count || 0,
        products: productsRes.count || 0,
      });
      setRecentOrders(orders.slice(0, 5));

      // Top products by quantity
      const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
      (itemsRes.data || []).forEach((item: any) => {
        const key = item.product_name;
        if (!productMap[key]) productMap[key] = { name: key, qty: 0, revenue: 0 };
        productMap[key].qty += item.quantity || 0;
        productMap[key].revenue += item.total || 0;
      });
      setTopProducts(Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 5));
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;

  const cards = [
    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
    { label: 'Revenue', value: formatPrice(stats.revenue, 'fr'), icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Customers', value: stats.customers, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { label: 'Products', value: stats.products, icon: Package, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{c.label}</span>
              <div className={`p-2 rounded-lg ${c.color}`}><c.icon size={18} /></div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp size={18} /> Top Products</h3>
          {topProducts.length === 0 ? <p className="text-gray-400 text-sm">No data yet</p> : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{p.name}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-sm font-medium text-gray-900">{p.qty} sold</span>
                    <span className="text-xs text-gray-500 ms-2">{formatPrice(p.revenue, 'fr')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><ShoppingCart size={18} /> Recent Orders</h3>
          {recentOrders.length === 0 ? <p className="text-gray-400 text-sm">No orders yet</p> : (
            <div className="space-y-3">
              {recentOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-mono font-medium text-gray-900">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`ms-2 text-xs px-2 py-0.5 rounded-full ${getStatusColor(o.status)}`}>{o.status}</span>
                  </div>
                  <span className="text-sm font-medium">{formatPrice(o.total, 'fr')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PRODUCTS CRUD ──────────────────────────────────────────────────────────
function ProductsSection() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    name: '', handle: '', description: '', price: '', sku: '', inventory_qty: '',
    status: 'active', product_type: '', images: [''],
    name_ar: '', name_en: '', description_ar: '', description_en: '', compare_at_price: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase.from('ecom_products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const resetForm = () => {
    setForm({ name: '', handle: '', description: '', price: '', sku: '', inventory_qty: '',
      status: 'active', product_type: '', images: [''], name_ar: '', name_en: '', description_ar: '', description_en: '', compare_at_price: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const editProduct = (p: any) => {
    setForm({
      name: p.name || '', handle: p.handle || '', description: p.description || '',
      price: p.price ? String(p.price / 100) : '', sku: p.sku || '',
      inventory_qty: p.inventory_qty != null ? String(p.inventory_qty) : '',
      status: p.status || 'active', product_type: p.product_type || '',
      images: p.images?.length ? p.images : [''],
      name_ar: p.metadata?.name_ar || '', name_en: p.metadata?.name_en || '',
      description_ar: p.metadata?.description_ar || '', description_en: p.metadata?.description_en || '',
      compare_at_price: p.metadata?.compare_at_price ? String(p.metadata.compare_at_price / 100) : '',
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const saveProduct = async () => {
    setSaving(true);
    const slug = form.handle || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const priceInCents = Math.round(parseFloat(form.price || '0') * 100);
    const comparePrice = form.compare_at_price ? Math.round(parseFloat(form.compare_at_price) * 100) : null;

    const payload: any = {
      name: form.name,
      handle: slug,
      description: form.description,
      price: priceInCents,
      sku: form.sku || null,
      inventory_qty: form.inventory_qty ? parseInt(form.inventory_qty) : null,
      status: form.status,
      product_type: form.product_type || null,
      images: form.images.filter(Boolean),
      metadata: {
        name_ar: form.name_ar || null,
        name_en: form.name_en || null,
        description_ar: form.description_ar || null,
        description_en: form.description_en || null,
        ...(comparePrice ? { compare_at_price: comparePrice } : {}),
      },
    };

    if (editingId) {
      await supabase.from('ecom_products').update(payload).eq('id', editingId);
    } else {
      await supabase.from('ecom_products').insert(payload);
    }
    resetForm();
    fetchProducts();
    setSaving(false);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('ecom_products').delete().eq('id', id);
    fetchProducts();
  };

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products ({products.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 mb-10 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pe-2">
              {/* Basic Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2"><Globe size={16} /> French (Default)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name (FR) *</label>
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Nom du produit" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description (FR)</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              {/* Arabic */}
              <div className="bg-orange-50 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-orange-700 mb-3 flex items-center gap-2"><Globe size={16} /> Arabic (العربية)</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name (AR)</label>
                    <input dir="rtl" value={form.name_ar} onChange={e => setForm({ ...form, name_ar: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="اسم المنتج" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description (AR)</label>
                    <textarea dir="rtl" value={form.description_ar} onChange={e => setForm({ ...form, description_ar: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              {/* English */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-blue-700 mb-3 flex items-center gap-2"><Globe size={16} /> English</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Name (EN)</label>
                    <input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="Product name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description (EN)</label>
                    <textarea value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3">Pricing & Inventory</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Price (DA) *</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Compare Price (DA)</label>
                    <input type="number" value={form.compare_at_price} onChange={e => setForm({ ...form, compare_at_price: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                    <input type="number" value={form.inventory_qty} onChange={e => setForm({ ...form, inventory_qty: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                    <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Handle (URL)</label>
                    <input value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="auto-generated" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type / Category</label>
                    <input value={form.product_type} onChange={e => setForm({ ...form, product_type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Électronique" />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-sm text-gray-700 mb-3 flex items-center gap-2"><ImageIcon size={16} /> Images (URLs)</h3>
                {form.images.map((img, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={img} onChange={e => { const imgs = [...form.images]; imgs[i] = e.target.value; setForm({ ...form, images: imgs }); }} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
                    {form.images.length > 1 && (
                      <button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    )}
                  </div>
                ))}
                <button onClick={() => setForm({ ...form, images: [...form.images, ''] })} className="text-sm text-teal-600 hover:text-teal-700 font-medium">+ Add Image URL</button>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              <button onClick={resetForm} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={saveProduct} disabled={saving || !form.name || !form.price} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full border border-gray-300 rounded-lg ps-10 pe-4 py-2.5 text-sm" />
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">Image</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">Name</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">AR / EN</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">Stock</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-start px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 bg-gray-100 rounded-lg" />}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[200px]">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.sku || p.handle}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500 truncate max-w-[150px]" dir="rtl">{p.metadata?.name_ar || '—'}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">{p.metadata?.name_en || '—'}</p>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(p.price || 0, 'fr')}</td>
                    <td className="px-4 py-3">{p.inventory_qty ?? '∞'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : p.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => editProduct(p)} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"><Pencil size={14} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <p className="text-center py-8 text-gray-400">No products found</p>}
        </div>
      )}
    </div>
  );
}

// ─── ORDERS MANAGEMENT ──────────────────────────────────────────────────────
function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [smsLoading, setSmsLoading] = useState<Record<string, boolean>>({});
  const [smsResult, setSmsResult] = useState<Record<string, { success: boolean; message: string; phone?: string } | null>>({});
  const [smsLang, setSmsLang] = useState<Record<string, string>>({});

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase.from('ecom_orders').select('*, items:ecom_order_items(*), customer:ecom_customers(name, email, phone)').order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('ecom_orders').update({ status }).eq('id', id);
    fetchOrders();
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const addr = { ...(order.shipping_address || {}), payment_status: paymentStatus };
    await supabase.from('ecom_orders').update({ shipping_address: addr }).eq('id', id);
    if (paymentStatus === 'confirmed') {
      await supabase.from('ecom_orders').update({ status: 'paid' }).eq('id', id);
    }
    fetchOrders();
  };

  const sendSMS = async (order: any) => {
    const phone = order.shipping_address?.phone || order.customer?.phone;
    if (!phone) {
      setSmsResult(prev => ({ ...prev, [order.id]: { success: false, message: 'No phone number found' } }));
      return;
    }
    setSmsLoading(prev => ({ ...prev, [order.id]: true }));
    setSmsResult(prev => ({ ...prev, [order.id]: null }));
    try {
      const lang = smsLang[order.id] || 'fr';
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          orderId: order.id,
          customerName: order.customer?.name || order.shipping_address?.name || 'Client',
          customerPhone: phone,
          orderStatus: order.status,
          language: lang,
          storeName: 'DZ Market',
          orderTotal: order.total,
        }
      });
      if (error) throw error;
      setSmsResult(prev => ({ ...prev, [order.id]: { success: true, message: data?.message || 'SMS sent', phone: data?.phone } }));
    } catch (err: any) {
      setSmsResult(prev => ({ ...prev, [order.id]: { success: false, message: err.message || 'Failed to send SMS' } }));
    } finally {
      setSmsLoading(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
  const filtered = orders.filter(o => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.id.includes(q) || o.customer?.name?.toLowerCase().includes(q) || o.customer?.email?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders ({orders.length})</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, name, email..." className="w-full border border-gray-300 rounded-lg ps-10 pe-4 py-2.5 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
          <option value="">All Statuses</option>
          {statuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const expanded = expandedId === order.id;
            const payMethod = order.shipping_address?.payment_method || 'cod';
            const payStatus = order.shipping_address?.payment_status || 'unpaid';
            const customerPhone = order.shipping_address?.phone || order.customer?.phone;
            const result = smsResult[order.id];

            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => setExpandedId(expanded ? null : order.id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-start">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-sm text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>{order.status}</span>
                    {payMethod === 'bank_transfer' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payStatus === 'confirmed' ? 'bg-green-100 text-green-700' : payStatus === 'needs_review' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                        Bank: {payStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-DZ')}</span>
                    <span className="font-bold text-sm">{formatPrice(order.total, 'fr')}</span>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {expanded && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    {/* Customer info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Customer</h4>
                        <p className="text-sm font-medium">{order.customer?.name || order.shipping_address?.name || '—'}</p>
                        <p className="text-sm text-gray-500">{order.customer?.email || '—'}</p>
                        <p className="text-sm text-gray-500" dir="ltr">{customerPhone || '—'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Shipping</h4>
                        <p className="text-sm">{order.shipping_address?.address || '—'}</p>
                        <p className="text-sm text-gray-500">{order.shipping_address?.commune}, {order.shipping_address?.wilaya}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</h4>
                      <div className="space-y-1">
                        {(order.items || []).map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.product_name} {item.variant_title ? `(${item.variant_title})` : ''} x{item.quantity}</span>
                            <span className="font-medium">{formatPrice(item.total, 'fr')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Order Status</label>
                        <div className="flex gap-1">
                          {statuses.map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(order.id, s)}
                              className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                                order.status === s ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {payMethod === 'bank_transfer' && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Payment Status</label>
                          <div className="flex gap-1">
                            {['unpaid', 'needs_review', 'confirmed'].map(ps => (
                              <button
                                key={ps}
                                onClick={() => updatePaymentStatus(order.id, ps)}
                                className={`px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors ${
                                  payStatus === ps ? 'bg-amber-500 text-white border-amber-500' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                {ps === 'needs_review' ? 'Review' : ps}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SMS Notification Section */}
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <h4 className="text-xs font-semibold text-indigo-700 uppercase mb-3 flex items-center gap-2">
                        <MessageSquare size={14} /> SMS Notification
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={smsLang[order.id] || 'fr'}
                          onChange={e => setSmsLang(prev => ({ ...prev, [order.id]: e.target.value }))}
                          className="border border-indigo-200 rounded-lg px-2 py-1.5 text-xs bg-white"
                        >
                          <option value="fr">Français</option>
                          <option value="ar">العربية</option>
                          <option value="en">English</option>
                        </select>
                        <button
                          onClick={() => sendSMS(order)}
                          disabled={smsLoading[order.id] || !customerPhone}
                          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {smsLoading[order.id] ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Send size={12} />
                          )}
                          Send SMS
                        </button>
                        {!customerPhone && (
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            <Phone size={12} /> No phone number
                          </span>
                        )}
                        {customerPhone && (
                          <span className="text-xs text-indigo-600 flex items-center gap-1" dir="ltr">
                            <Phone size={12} /> {customerPhone}
                          </span>
                        )}
                      </div>
                      {result && (
                        <div className={`mt-2 p-2 rounded-lg text-xs ${result.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          {result.success ? (
                            <div>
                              <p className="font-medium mb-0.5">SMS Generated {result.phone ? `for ${result.phone}` : ''}</p>
                              <p className="text-green-600 italic">"{result.message}"</p>
                            </div>
                          ) : (
                            <p>{result.message}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {order.notes && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-yellow-700 mb-1">Customer Notes</p>
                        <p className="text-sm text-yellow-800">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-center py-12 text-gray-400">No orders found</p>}
        </div>
      )}
    </div>
  );
}


// ─── CUSTOMERS ──────────────────────────────────────────────────────────────
function CustomersSection() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('ecom_customers').select('*').order('created_at', { ascending: false });
      setCustomers(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = customers.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.includes(q);
  });

  const exportCSV = () => {
    const headers = 'Name,Email,Phone,Created\n';
    const rows = filtered.map(c => `"${c.name || ''}","${c.email}","${c.phone || ''}","${new Date(c.created_at).toLocaleDateString()}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'customers.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers ({customers.length})</h1>
        <button onClick={exportCSV} className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="w-full border border-gray-300 rounded-lg ps-10 pe-4 py-2.5 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-start px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">Email</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-start px-4 py-3 font-medium text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                  <td className="px-4 py-3 text-gray-600" dir="ltr">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.created_at ? new Date(c.created_at).toLocaleDateString('fr-DZ') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-8 text-gray-400">No customers found</p>}
        </div>
      )}
    </div>
  );
}

// ─── COLLECTIONS MANAGEMENT ─────────────────────────────────────────────────
function CollectionsSection() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', handle: '', title_ar: '', title_en: '', desc_fr: '', desc_ar: '', desc_en: '', is_visible: true, image_url: '' });
  const [productLinks, setProductLinks] = useState<Record<string, any[]>>({});

  const fetchCollections = async () => {
    setLoading(true);
    const { data } = await supabase.from('ecom_collections').select('*').order('title');
    setCollections(data || []);

    // Fetch product counts per collection
    const links: Record<string, any[]> = {};
    if (data) {
      for (const col of data) {
        const { data: pl } = await supabase.from('ecom_product_collections').select('product_id').eq('collection_id', col.id);
        links[col.id] = pl || [];
      }
    }
    setProductLinks(links);
    setLoading(false);
  };

  useEffect(() => { fetchCollections(); }, []);

  const resetForm = () => {
    setForm({ title: '', handle: '', title_ar: '', title_en: '', desc_fr: '', desc_ar: '', desc_en: '', is_visible: true, image_url: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const editCollection = (c: any) => {
    let parsed: any = {};
    try { parsed = JSON.parse(c.description || '{}'); } catch {}
    setForm({
      title: c.title || '', handle: c.handle || '',
      title_ar: parsed.title_ar || '', title_en: parsed.title_en || '',
      desc_fr: parsed.desc_fr || '', desc_ar: parsed.desc_ar || '', desc_en: parsed.desc_en || '',
      is_visible: c.is_visible !== false, image_url: c.image_url || '',
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const saveCollection = async () => {
    setSaving(true);
    const slug = form.handle || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const description = JSON.stringify({
      title_ar: form.title_ar, title_en: form.title_en,
      desc_fr: form.desc_fr, desc_ar: form.desc_ar, desc_en: form.desc_en,
    });

    const payload = {
      title: form.title, handle: slug, description,
      is_visible: form.is_visible, image_url: form.image_url || null,
    };

    if (editingId) {
      await supabase.from('ecom_collections').update(payload).eq('id', editingId);
    } else {
      await supabase.from('ecom_collections').insert(payload);
    }
    resetForm();
    fetchCollections();
    setSaving(false);
  };

  const deleteCollection = async (id: string) => {
    if (!confirm('Delete this collection?')) return;
    await supabase.from('ecom_product_collections').delete().eq('collection_id', id);
    await supabase.from('ecom_collections').delete().eq('id', id);
    fetchCollections();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Collections ({collections.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Collection
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Collection' : 'New Collection'}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title (FR) *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Handle (URL)</label>
              <input value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title (AR)</label>
              <input dir="rtl" value={form.title_ar} onChange={e => setForm({ ...form, title_ar: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title (EN)</label>
              <input value={form.title_en} onChange={e => setForm({ ...form, title_en: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description (FR)</label>
              <input value={form.desc_fr} onChange={e => setForm({ ...form, desc_fr: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
              <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} className="rounded border-gray-300 text-teal-600" />
              <label className="text-sm text-gray-700">Visible</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={resetForm} className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            <button onClick={saveCollection} disabled={saving || !form.title} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 flex items-center gap-2">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(c => {
            let parsed: any = {};
            try { parsed = JSON.parse(c.description || '{}'); } catch {}
            return (
              <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.title}</h3>
                    {parsed.title_ar && <p className="text-xs text-gray-500" dir="rtl">{parsed.title_ar}</p>}
                    {parsed.title_en && <p className="text-xs text-gray-500">{parsed.title_en}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_visible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{productLinks[c.id]?.length || 0} products · /{c.handle}</p>
                <div className="flex gap-2">
                  <button onClick={() => editCollection(c)} className="flex-1 text-xs border border-gray-300 text-gray-700 py-1.5 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => deleteCollection(c.id)} className="text-xs border border-red-200 text-red-500 py-1.5 px-3 rounded-lg hover:bg-red-50">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
