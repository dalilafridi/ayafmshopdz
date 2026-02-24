import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/helpers';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Loader2, Download, Calendar, TrendingUp, DollarSign, ShoppingCart,
  Users, Package, ArrowUpRight, ArrowDownRight, Filter
} from 'lucide-react';

type DateRange = '7d' | '30d' | '90d' | '365d' | 'all';

interface OrderData {
  id: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: string;
  created_at: string;
  shipping_address: any;
  customer_id: string;
}

interface OrderItemData {
  product_name: string;
  variant_title: string;
  quantity: number;
  total: number;
  unit_price: number;
  order_id: string;
}

const COLORS = ['#0d9488', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminAnalytics() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItemData[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [ordersRes, itemsRes, customersRes, productsRes] = await Promise.all([
        supabase.from('ecom_orders').select('*').order('created_at', { ascending: true }),
        supabase.from('ecom_order_items').select('*'),
        supabase.from('ecom_customers').select('*').order('created_at', { ascending: true }),
        supabase.from('ecom_products').select('id, name, product_type, price').eq('status', 'active'),
      ]);
      setOrders(ordersRes.data || []);
      setOrderItems(itemsRes.data || []);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    if (dateRange === 'all') return orders;
    const days = parseInt(dateRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return orders.filter(o => new Date(o.created_at) >= cutoff);
  }, [orders, dateRange]);

  const filteredItems = useMemo(() => {
    const orderIds = new Set(filteredOrders.map(o => o.id));
    return orderItems.filter(i => orderIds.has(i.order_id));
  }, [filteredOrders, orderItems]);

  // KPI calculations
  const totalRevenue = filteredOrders.reduce((s, o) => s + (o.total || 0), 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const paidOrders = filteredOrders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status));
  const paidRevenue = paidOrders.reduce((s, o) => s + (o.total || 0), 0);

  // Previous period comparison
  const prevPeriodOrders = useMemo(() => {
    if (dateRange === 'all') return [];
    const days = parseInt(dateRange);
    const cutoffEnd = new Date();
    cutoffEnd.setDate(cutoffEnd.getDate() - days);
    const cutoffStart = new Date(cutoffEnd);
    cutoffStart.setDate(cutoffStart.getDate() - days);
    return orders.filter(o => {
      const d = new Date(o.created_at);
      return d >= cutoffStart && d < cutoffEnd;
    });
  }, [orders, dateRange]);

  const prevRevenue = prevPeriodOrders.reduce((s, o) => s + (o.total || 0), 0);
  const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100) : 0;
  const prevOrderCount = prevPeriodOrders.length;
  const orderChange = prevOrderCount > 0 ? ((totalOrders - prevOrderCount) / prevOrderCount * 100) : 0;

  // Revenue over time (daily/weekly/monthly based on range)
  const revenueChartData = useMemo(() => {
    const groupBy = dateRange === '7d' ? 'day' : dateRange === '30d' ? 'day' : dateRange === '90d' ? 'week' : 'month';
    const map: Record<string, { date: string; revenue: number; orders: number }> = {};

    filteredOrders.forEach(o => {
      const d = new Date(o.created_at);
      let key: string;
      if (groupBy === 'day') {
        key = d.toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit' });
      } else if (groupBy === 'week') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toLocaleDateString('fr-DZ', { day: '2-digit', month: '2-digit' });
      } else {
        key = d.toLocaleDateString('fr-DZ', { month: 'short', year: '2-digit' });
      }
      if (!map[key]) map[key] = { date: key, revenue: 0, orders: 0 };
      map[key].revenue += (o.total || 0) / 100;
      map[key].orders += 1;
    });

    return Object.values(map);
  }, [filteredOrders, dateRange]);

  // Revenue by product type
  const revenueByType = useMemo(() => {
    const productTypeMap: Record<string, string> = {};
    products.forEach(p => { productTypeMap[p.name] = p.product_type || 'Autre'; });

    const map: Record<string, number> = {};
    filteredItems.forEach(item => {
      const type = productTypeMap[item.product_name] || 'Autre';
      map[type] = (map[type] || 0) + (item.total || 0);
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value / 100) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredItems, products]);

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {};
    filteredOrders.forEach(o => {
      const method = o.shipping_address?.payment_method === 'bank_transfer' ? 'Virement' : 'COD';
      if (!map[method]) map[method] = { count: 0, revenue: 0 };
      map[method].count += 1;
      map[method].revenue += (o.total || 0);
    });
    return Object.entries(map).map(([name, data]) => ({
      name,
      count: data.count,
      revenue: Math.round(data.revenue / 100),
    }));
  }, [filteredOrders]);

  // Top 10 products by revenue and quantity
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; qty: number; revenue: number }> = {};
    filteredItems.forEach(item => {
      const key = item.product_name;
      if (!map[key]) map[key] = { name: key, qty: 0, revenue: 0 };
      map[key].qty += item.quantity || 0;
      map[key].revenue += item.total || 0;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  }, [filteredItems]);

  // Customer acquisition over time
  const customerAcquisition = useMemo(() => {
    const cutoff = dateRange === 'all' ? null : (() => {
      const d = new Date();
      d.setDate(d.getDate() - parseInt(dateRange));
      return d;
    })();

    const filtered = cutoff ? customers.filter(c => new Date(c.created_at) >= cutoff) : customers;
    const map: Record<string, number> = {};
    filtered.forEach(c => {
      const d = new Date(c.created_at);
      const key = d.toLocaleDateString('fr-DZ', { month: 'short', year: '2-digit' });
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count }));
  }, [customers, dateRange]);

  // Order status distribution
  const statusDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const s = o.status || 'unknown';
      map[s] = (map[s] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  // Export CSV
  const exportCSV = (type: 'revenue' | 'products' | 'orders') => {
    let csv = '';
    if (type === 'revenue') {
      csv = 'Date,Revenue (DA),Orders\n';
      revenueChartData.forEach(r => { csv += `"${r.date}",${r.revenue},${r.orders}\n`; });
    } else if (type === 'products') {
      csv = 'Product,Quantity Sold,Revenue (DA)\n';
      topProducts.forEach(p => { csv += `"${p.name}",${p.qty},${(p.revenue / 100).toFixed(0)}\n`; });
    } else {
      csv = 'Order ID,Date,Status,Total (DA),Payment Method,Customer\n';
      filteredOrders.forEach(o => {
        csv += `"${o.id.slice(0, 8).toUpperCase()}","${new Date(o.created_at).toLocaleDateString('fr-DZ')}","${o.status}",${(o.total / 100).toFixed(0)},"${o.shipping_address?.payment_method || 'cod'}","${o.shipping_address?.name || ''}"\n`;
      });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${type}-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Revenue Totale',
      value: formatPrice(totalRevenue, 'fr'),
      change: revenueChange,
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Revenue Confirmée',
      value: formatPrice(paidRevenue, 'fr'),
      change: null,
      icon: TrendingUp,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      label: 'Commandes',
      value: totalOrders,
      change: orderChange,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Panier Moyen',
      value: formatPrice(avgOrderValue, 'fr'),
      change: null,
      icon: Package,
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Rapports</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            {(['7d', '30d', '90d', '365d', 'all'] as DateRange[]).map(range => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  dateRange === range ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {range === 'all' ? 'Tout' : range === '7d' ? '7J' : range === '30d' ? '30J' : range === '90d' ? '90J' : '1A'}
              </button>
            ))}
          </div>
          <div className="relative group">
            <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
              <Download size={16} /> Export
            </button>
            <div className="absolute end-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px] z-50 hidden group-hover:block">
              <button onClick={() => exportCSV('revenue')} className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50">Revenue CSV</button>
              <button onClick={() => exportCSV('products')} className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50">Products CSV</button>
              <button onClick={() => exportCSV('orders')} className="w-full text-start px-4 py-2 text-sm hover:bg-gray-50">Orders CSV</button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            {card.change !== null && card.change !== 0 && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${card.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {card.change > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {Math.abs(card.change).toFixed(1)}% vs période précédente
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={18} /> Revenue & Commandes
        </h3>
        {revenueChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number, name: string) =>
                  name === 'revenue' ? [`${value.toLocaleString()} DA`, 'Revenue'] : [value, 'Commandes']
                }
              />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#0d9488" fill="url(#colorRevenue)" name="Revenue (DA)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} name="Commandes" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center py-12 text-gray-400">Aucune donnée pour cette période</p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue by Category */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue par Catégorie</h3>
          {revenueByType.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={revenueByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toLocaleString()} DA`}
                >
                  {revenueByType.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toLocaleString()} DA`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12 text-gray-400">Aucune donnée</p>
          )}
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Mode de Paiement</h3>
          {paymentBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={paymentBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number, name: string) =>
                    name === 'revenue' ? [`${value.toLocaleString()} DA`, 'Revenue'] : [value, 'Commandes']
                  } />
                  <Bar dataKey="count" fill="#3b82f6" name="Commandes" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="#0d9488" name="Revenue (DA)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {paymentBreakdown.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{p.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{p.count} commandes</span>
                      <span className="font-bold text-gray-900">{p.revenue.toLocaleString()} DA</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-center py-12 text-gray-400">Aucune donnée</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Top 10 Products */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Top 10 Produits</h3>
            <button onClick={() => exportCSV('products')} className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
              <Download size={12} /> CSV
            </button>
          </div>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((p, i) => {
                const maxRevenue = topProducts[0]?.revenue || 1;
                const barWidth = (p.revenue / maxRevenue) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-5">{i + 1}</span>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{p.name}</span>
                      </div>
                      <div className="text-end">
                        <span className="text-sm font-bold text-gray-900">{formatPrice(p.revenue, 'fr')}</span>
                        <span className="text-xs text-gray-500 ms-2">{p.qty} vendus</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="bg-teal-500 h-1.5 rounded-full transition-all" style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center py-12 text-gray-400">Aucune donnée</p>
          )}
        </div>

        {/* Customer Acquisition */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users size={18} /> Acquisition Clients
          </h3>
          {customerAcquisition.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={customerAcquisition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={(value: number) => [value, 'Nouveaux clients']} />
                <Bar dataKey="count" fill="#8b5cf6" name="Nouveaux clients" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12 text-gray-400">Aucune donnée</p>
          )}
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Distribution des Statuts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {statusDistribution.map((s, i) => {
            const colorMap: Record<string, string> = {
              pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
              paid: 'bg-blue-50 border-blue-200 text-blue-700',
              shipped: 'bg-purple-50 border-purple-200 text-purple-700',
              delivered: 'bg-green-50 border-green-200 text-green-700',
              cancelled: 'bg-red-50 border-red-200 text-red-700',
            };
            return (
              <div key={i} className={`rounded-xl border p-4 text-center ${colorMap[s.name] || 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs font-medium capitalize mt-1">{s.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
