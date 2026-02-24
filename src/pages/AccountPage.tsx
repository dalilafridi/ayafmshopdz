import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, getStatusColor, getStatusLabel } from '@/lib/helpers';
import { User, Package, LogOut, ChevronRight, ShoppingBag } from 'lucide-react';

export default function AccountPage() {
  const { t, locale, isRTL } = useLanguage();
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user?.email) return;
    setLoading(true);

    const { data: customer } = await supabase
      .from('ecom_customers')
      .select('id')
      .eq('email', user.email)
      .single();

    if (customer) {
      const { data: ordersData } = await supabase
        .from('ecom_orders')
        .select('*, items:ecom_order_items(*)')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });
      setOrders(ordersData || []);
    }
    setLoading(false);
  };

  if (authLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">{t('common.loading')}</div>;
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">{t('account.title')}</h1>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-teal-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name || user.email.split('@')[0]}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Package size={16} /> {t('account.orders')}
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <User size={16} /> {t('account.profile')}
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} /> {t('nav.logout')}
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('account.orders')}</h2>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 bg-white border border-gray-100 rounded-xl">
                  <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-4">{t('account.no_orders')}</p>
                  <Link to="/products" className="text-teal-600 hover:underline font-medium">{t('cart.continue_shopping')}</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <Link
                      key={order.id}
                      to={`/order-confirmation/${order.id}?method=${order.shipping_address?.payment_method || 'cod'}`}
                      className="block bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status, t)}
                          </span>
                        </div>
                        <ChevronRight size={16} className={`text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{new Date(order.created_at).toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ')}</span>
                        <span className="font-semibold text-gray-900">{formatPrice(order.total, locale)}</span>
                      </div>
                      {order.items && order.items.length > 0 && (
                        <p className="text-xs text-gray-400 mt-2">
                          {order.items.map((i: any) => i.product_name).join(', ')}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{t('account.profile')}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('auth.name')}</label>
                  <p className="text-gray-900">{user.name || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('auth.email')}</label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t('auth.phone')}</label>
                  <p className="text-gray-900" dir="ltr">{user.phone || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
