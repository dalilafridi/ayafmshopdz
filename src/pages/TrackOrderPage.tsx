import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/helpers';

import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
  XCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface OrderData {
  id: string;
  status: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address: any;
  notes: string;
  created_at: string;
  updated_at: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  } | null;
  items: {
    id: string;
    product_name: string;
    variant_title: string;
    quantity: number;
    unit_price: number;
    total: number;
    sku: string;
  }[];
}

// Timeline stages
const STAGES = ['confirmed', 'processing', 'shipped', 'delivered'] as const;
type Stage = typeof STAGES[number];

function getStageIndex(status: string): number {
  switch (status) {
    case 'pending':
      return 0;
    case 'paid':
    case 'confirmed':
      return 1;
    case 'shipped':
      return 2;
    case 'delivered':
      return 3;
    case 'cancelled':
    case 'refunded':
      return -1;
    default:
      return 0;
  }
}

function getEstimatedDates(createdAt: string) {
  const created = new Date(createdAt);
  const confirmed = new Date(created);
  confirmed.setHours(confirmed.getHours() + 2);

  const processing = new Date(created);
  processing.setDate(processing.getDate() + 1);

  const shipped = new Date(created);
  shipped.setDate(shipped.getDate() + 2);

  const deliveredMin = new Date(created);
  deliveredMin.setDate(deliveredMin.getDate() + 3);
  const deliveredMax = new Date(created);
  deliveredMax.setDate(deliveredMax.getDate() + 7);

  return { confirmed, processing, shipped, deliveredMin, deliveredMax };
}

export default function TrackOrderPage() {
  const { t, locale, isRTL } = useLanguage();
  const [searchInput, setSearchInput] = useState('');
  const [searchType, setSearchType] = useState<'order_id' | 'phone'>('order_id');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  const labels = {
    fr: {
      title: 'Suivre ma Commande',
      subtitle: 'Entrez votre numéro de commande ou numéro de téléphone pour suivre votre colis',
      searchByOrder: 'N° de Commande',
      searchByPhone: 'N° de Téléphone',
      orderPlaceholder: 'Ex: A1B2C3D4 ou ID complet',
      phonePlaceholder: 'Ex: 07XX XXX XXX',
      searchBtn: 'Rechercher',
      noResults: 'Aucune commande trouvée',
      noResultsDesc: 'Vérifiez votre numéro de commande ou numéro de téléphone et réessayez.',
      orderNumber: 'Commande',
      placedOn: 'Passée le',
      status: 'Statut',
      timeline: 'Suivi de la commande',
      confirmed: 'Confirmée',
      processing: 'En Préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
      refunded: 'Remboursée',
      estimatedDelivery: 'Livraison estimée',
      shippingAddress: 'Adresse de Livraison',
      orderItems: 'Articles Commandés',
      total: 'Total',
      subtotal: 'Sous-total',
      shippingCost: 'Livraison',
      free: 'Gratuit',
      needHelp: 'Besoin d\'aide ?',
      needHelpDesc: 'Un problème avec votre commande ? Notre équipe est là pour vous aider.',
      contactSupport: 'Contacter le Support',
      yourName: 'Votre Nom',
      yourEmail: 'Votre Email',
      yourMessage: 'Décrivez votre problème',
      sendMessage: 'Envoyer',
      messageSent: 'Message envoyé ! Nous vous répondrons dans les plus brefs délais.',
      orCallUs: 'Ou appelez-nous au',
      businessDays: 'jours ouvrables',
      pending: 'En attente de confirmation',
      confirmedDesc: 'Votre commande a été confirmée',
      processingDesc: 'Votre commande est en cours de préparation',
      shippedDesc: 'Votre colis est en route',
      deliveredDesc: 'Votre colis a été livré',
      cancelledDesc: 'Cette commande a été annulée',
      refundedDesc: 'Cette commande a été remboursée',
      estimatedBetween: 'Entre',
      and: 'et',
      viewDetails: 'Voir les détails',
      hideDetails: 'Masquer les détails',
      trackAnother: 'Suivre une autre commande',
      secureTracking: 'Suivi sécurisé',
      secureTrackingDesc: 'Vos informations sont protégées',
      fastDelivery: 'Livraison rapide',
      fastDeliveryDesc: '3-7 jours ouvrables',
      support247: 'Support disponible',
      support247Desc: 'Dim - Jeu: 9h - 18h',
    },
    ar: {
      title: 'تتبع طلبي',
      subtitle: 'أدخل رقم طلبك أو رقم هاتفك لتتبع طردك',
      searchByOrder: 'رقم الطلب',
      searchByPhone: 'رقم الهاتف',
      orderPlaceholder: 'مثال: A1B2C3D4 أو المعرف الكامل',
      phonePlaceholder: 'مثال: 07XX XXX XXX',
      searchBtn: 'بحث',
      noResults: 'لم يتم العثور على طلبات',
      noResultsDesc: 'تحقق من رقم طلبك أو رقم هاتفك وحاول مرة أخرى.',
      orderNumber: 'الطلب',
      placedOn: 'تم الطلب في',
      status: 'الحالة',
      timeline: 'تتبع الطلب',
      confirmed: 'مؤكد',
      processing: 'قيد التحضير',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
      refunded: 'مسترد',
      estimatedDelivery: 'التوصيل المتوقع',
      shippingAddress: 'عنوان التوصيل',
      orderItems: 'المنتجات المطلوبة',
      total: 'المجموع',
      subtotal: 'المجموع الفرعي',
      shippingCost: 'التوصيل',
      free: 'مجاني',
      needHelp: 'تحتاج مساعدة؟',
      needHelpDesc: 'مشكلة في طلبك؟ فريقنا هنا لمساعدتك.',
      contactSupport: 'اتصل بالدعم',
      yourName: 'اسمك',
      yourEmail: 'بريدك الإلكتروني',
      yourMessage: 'صف مشكلتك',
      sendMessage: 'إرسال',
      messageSent: 'تم إرسال الرسالة! سنرد عليك في أقرب وقت.',
      orCallUs: 'أو اتصل بنا على',
      businessDays: 'أيام عمل',
      pending: 'في انتظار التأكيد',
      confirmedDesc: 'تم تأكيد طلبك',
      processingDesc: 'طلبك قيد التحضير',
      shippedDesc: 'طردك في الطريق',
      deliveredDesc: 'تم توصيل طردك',
      cancelledDesc: 'تم إلغاء هذا الطلب',
      refundedDesc: 'تم استرداد هذا الطلب',
      estimatedBetween: 'بين',
      and: 'و',
      viewDetails: 'عرض التفاصيل',
      hideDetails: 'إخفاء التفاصيل',
      trackAnother: 'تتبع طلب آخر',
      secureTracking: 'تتبع آمن',
      secureTrackingDesc: 'معلوماتك محمية',
      fastDelivery: 'توصيل سريع',
      fastDeliveryDesc: '3-7 أيام عمل',
      support247: 'دعم متاح',
      support247Desc: 'الأحد - الخميس: 9ص - 6م',
    },
    en: {
      title: 'Track My Order',
      subtitle: 'Enter your order number or phone number to track your package',
      searchByOrder: 'Order Number',
      searchByPhone: 'Phone Number',
      orderPlaceholder: 'e.g. A1B2C3D4 or full ID',
      phonePlaceholder: 'e.g. 07XX XXX XXX',
      searchBtn: 'Search',
      noResults: 'No orders found',
      noResultsDesc: 'Check your order number or phone number and try again.',
      orderNumber: 'Order',
      placedOn: 'Placed on',
      status: 'Status',
      timeline: 'Order Tracking',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      estimatedDelivery: 'Estimated Delivery',
      shippingAddress: 'Shipping Address',
      orderItems: 'Order Items',
      total: 'Total',
      subtotal: 'Subtotal',
      shippingCost: 'Shipping',
      free: 'Free',
      needHelp: 'Need Help?',
      needHelpDesc: 'Having an issue with your order? Our team is here to help.',
      contactSupport: 'Contact Support',
      yourName: 'Your Name',
      yourEmail: 'Your Email',
      yourMessage: 'Describe your issue',
      sendMessage: 'Send Message',
      messageSent: 'Message sent! We\'ll get back to you as soon as possible.',
      orCallUs: 'Or call us at',
      businessDays: 'business days',
      pending: 'Awaiting confirmation',
      confirmedDesc: 'Your order has been confirmed',
      processingDesc: 'Your order is being prepared',
      shippedDesc: 'Your package is on its way',
      deliveredDesc: 'Your package has been delivered',
      cancelledDesc: 'This order has been cancelled',
      refundedDesc: 'This order has been refunded',
      estimatedBetween: 'Between',
      and: 'and',
      viewDetails: 'View Details',
      hideDetails: 'Hide Details',
      trackAnother: 'Track Another Order',
      secureTracking: 'Secure Tracking',
      secureTrackingDesc: 'Your information is protected',
      fastDelivery: 'Fast Delivery',
      fastDeliveryDesc: '3-7 business days',
      support247: 'Support Available',
      support247Desc: 'Sun - Thu: 9am - 6pm',
    },
  };

  const l = labels[locale] || labels.fr;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-US' : 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : locale === 'en' ? 'en-US' : 'fr-FR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    setLoading(true);
    setError('');
    setOrders([]);
    setSearched(true);
    setExpandedOrder(null);

    try {
      let foundOrders: OrderData[] = [];

      if (searchType === 'phone') {
        // Search by phone: find customers with this phone, then their orders
        const cleanPhone = query.replace(/\s/g, '');
        const { data: customers } = await supabase
          .from('ecom_customers')
          .select('id, name, email, phone')
          .or(`phone.eq.${cleanPhone},phone.ilike.%${cleanPhone}%`);

        if (customers && customers.length > 0) {
          const customerIds = customers.map(c => c.id);
          const { data: ordersData } = await supabase
            .from('ecom_orders')
            .select('*')
            .in('customer_id', customerIds)
            .order('created_at', { ascending: false })
            .limit(10);

          if (ordersData) {
            for (const order of ordersData) {
              const { data: items } = await supabase
                .from('ecom_order_items')
                .select('*')
                .eq('order_id', order.id);

              const customer = customers.find(c => c.id === order.customer_id);
              foundOrders.push({
                ...order,
                customer: customer ? { name: customer.name, email: customer.email, phone: customer.phone } : null,
                items: items || [],
              });
            }
          }
        }
      } else {
        // Search by order ID - try exact match first, then prefix match


        // If it looks like a short ID (8 chars), try ilike on id
        if (query.length < 36) {
          const { data: ordersData } = await supabase
            .from('ecom_orders')
            .select('*')
            .ilike('id', `${query}%`)
            .order('created_at', { ascending: false })
            .limit(5);

          if (ordersData && ordersData.length > 0) {
            for (const order of ordersData) {
              const { data: items } = await supabase
                .from('ecom_order_items')
                .select('*')
                .eq('order_id', order.id);

              let customer = null;
              if (order.customer_id) {
                const { data: cust } = await supabase
                  .from('ecom_customers')
                  .select('name, email, phone')
                  .eq('id', order.customer_id)
                  .single();
                customer = cust;
              }

              foundOrders.push({
                ...order,
                customer,
                items: items || [],
              });
            }
          }
        } else {
          // Full UUID match
          const { data: orderData } = await supabase
            .from('ecom_orders')
            .select('*')
            .eq('id', query)
            .single();

          if (orderData) {
            const { data: items } = await supabase
              .from('ecom_order_items')
              .select('*')
              .eq('order_id', orderData.id);

            let customer = null;
            if (orderData.customer_id) {
              const { data: cust } = await supabase
                .from('ecom_customers')
                .select('name, email, phone')
                .eq('id', orderData.customer_id)
                .single();
              customer = cust;
            }

            foundOrders.push({
              ...orderData,
              customer,
              items: items || [],
            });
          }
        }
      }

      setOrders(foundOrders);
      if (foundOrders.length === 1) {
        setExpandedOrder(foundOrders[0].id);
      }
    } catch (err) {
      console.error('Track order error:', err);
      setError(locale === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : locale === 'en' ? 'An error occurred. Please try again.' : 'Une erreur est survenue. Veuillez réessayer.');
    }
    setLoading(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSent(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setContactSent(false), 5000);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      paid: 'bg-blue-100 text-blue-800 border-blue-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      shipped: 'bg-purple-100 text-purple-800 border-purple-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    const statusLabels: Record<string, string> = {
      pending: l.pending,
      paid: l.confirmed,
      confirmed: l.confirmed,
      shipped: l.shipped,
      delivered: l.delivered,
      cancelled: l.cancelled,
      refunded: l.refunded,
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const isCancelled = (status: string) => status === 'cancelled' || status === 'refunded';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <Package size={32} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{l.title}</h1>
            <p className="text-teal-100 text-lg mb-8">{l.subtitle}</p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-xl shadow-teal-900/20">
              {/* Toggle between order ID and phone */}
              <div className="flex mb-2 bg-gray-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => { setSearchType('order_id'); setSearchInput(''); }}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    searchType === 'order_id'
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ClipboardList size={16} className="inline-block me-1.5 -mt-0.5" />
                  {l.searchByOrder}
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchType('phone'); setSearchInput(''); }}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    searchType === 'phone'
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Phone size={16} className="inline-block me-1.5 -mt-0.5" />
                  {l.searchByPhone}
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type={searchType === 'phone' ? 'tel' : 'text'}
                  dir={searchType === 'phone' ? 'ltr' : undefined}
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder={searchType === 'order_id' ? l.orderPlaceholder : l.phonePlaceholder}
                  className="flex-1 px-4 py-3.5 text-gray-900 text-sm rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  <span className="hidden sm:inline">{l.searchBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Features bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{l.secureTracking}</p>
                <p className="text-xs text-gray-500">{l.secureTrackingDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <Truck size={20} className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{l.fastDelivery}</p>
                <p className="text-xs text-gray-500">{l.fastDeliveryDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-end">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <MessageCircle size={20} className="text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{l.support247}</p>
                <p className="text-xs text-gray-500">{l.support247Desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* No results */}
        {searched && !loading && orders.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{l.noResults}</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">{l.noResultsDesc}</p>
            <button
              onClick={() => { setSearched(false); setSearchInput(''); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium text-sm"
            >
              <RefreshCw size={16} />
              {l.trackAnother}
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 size={40} className="animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-500">{t('common.loading')}</p>
          </div>
        )}

        {/* Order Results */}
        {orders.length > 0 && (
          <div className="space-y-6">
            {/* Track another button */}
            {orders.length > 0 && (
              <button
                onClick={() => { setSearched(false); setOrders([]); setSearchInput(''); }}
                className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                <RefreshCw size={14} />
                {l.trackAnother}
              </button>
            )}

            {orders.map(order => {
              const stageIndex = getStageIndex(order.status);
              const cancelled = isCancelled(order.status);
              const dates = getEstimatedDates(order.created_at);
              const isExpanded = expandedOrder === order.id;

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {l.orderNumber} #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {l.placedOn} {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-end">
                        <p className="text-sm text-gray-500">{l.total}</p>
                        <p className="text-xl font-bold text-teal-700">{formatPrice(order.total, locale)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Visual Timeline */}
                  <div className="p-6 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-700 mb-6">{l.timeline}</h4>

                    {cancelled ? (
                      <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                          <XCircle size={24} className="text-red-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-800">
                            {order.status === 'cancelled' ? l.cancelled : l.refunded}
                          </p>
                          <p className="text-sm text-red-600">
                            {order.status === 'cancelled' ? l.cancelledDesc : l.refundedDesc}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Desktop Timeline */}
                        <div className="hidden md:block">
                          <div className="flex items-start justify-between relative">
                            {/* Progress bar background */}
                            <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 rounded-full" />
                            {/* Progress bar fill */}
                            <div
                              className="absolute top-6 left-6 h-1 bg-teal-500 rounded-full transition-all duration-700"
                              style={{ width: `calc(${(Math.max(0, stageIndex) / (STAGES.length - 1)) * 100}% - 48px)` }}
                            />

                            {STAGES.map((stage, index) => {
                              const isCompleted = stageIndex >= index;
                              const isCurrent = stageIndex === index;
                              const stageIcons = [
                                <CheckCircle2 size={20} />,
                                <ClipboardList size={20} />,
                                <Truck size={20} />,
                                <Package size={20} />,
                              ];
                              const stageLabels = [l.confirmed, l.processing, l.shipped, l.delivered];
                              const stageDescs = [l.confirmedDesc, l.processingDesc, l.shippedDesc, l.deliveredDesc];
                              const stageDates = [dates.confirmed, dates.processing, dates.shipped, dates.deliveredMin];

                              return (
                                <div key={stage} className="flex flex-col items-center relative z-10 flex-1">
                                  <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                                      isCompleted
                                        ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30'
                                        : 'bg-white text-gray-400 border-2 border-gray-200'
                                    } ${isCurrent ? 'ring-4 ring-teal-100 scale-110' : ''}`}
                                  >
                                    {stageIcons[index]}
                                  </div>
                                  <p className={`mt-3 text-sm font-semibold ${isCompleted ? 'text-teal-700' : 'text-gray-400'}`}>
                                    {stageLabels[index]}
                                  </p>
                                  <p className={`text-xs mt-0.5 ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                                    {isCompleted && stageIndex > index
                                      ? formatShortDate(stageDates[index])
                                      : isCurrent
                                      ? stageDescs[index]
                                      : formatShortDate(stageDates[index])
                                    }
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Mobile Timeline */}
                        <div className="md:hidden space-y-0">
                          {STAGES.map((stage, index) => {
                            const isCompleted = stageIndex >= index;
                            const isCurrent = stageIndex === index;
                            const isLast = index === STAGES.length - 1;
                            const stageIcons = [
                              <CheckCircle2 size={18} />,
                              <ClipboardList size={18} />,
                              <Truck size={18} />,
                              <Package size={18} />,
                            ];
                            const stageLabels = [l.confirmed, l.processing, l.shipped, l.delivered];
                            const stageDescs = [l.confirmedDesc, l.processingDesc, l.shippedDesc, l.deliveredDesc];
                            const stageDates = [dates.confirmed, dates.processing, dates.shipped, dates.deliveredMin];

                            return (
                              <div key={stage} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                      isCompleted
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-white text-gray-400 border-2 border-gray-200'
                                    } ${isCurrent ? 'ring-4 ring-teal-100' : ''}`}
                                  >
                                    {stageIcons[index]}
                                  </div>
                                  {!isLast && (
                                    <div className={`w-0.5 h-12 ${isCompleted && stageIndex > index ? 'bg-teal-500' : 'bg-gray-200'}`} />
                                  )}
                                </div>
                                <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                                  <p className={`text-sm font-semibold ${isCompleted ? 'text-teal-700' : 'text-gray-400'}`}>
                                    {stageLabels[index]}
                                  </p>
                                  <p className={`text-xs ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>
                                    {isCurrent ? stageDescs[index] : formatShortDate(stageDates[index])}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Estimated Delivery */}
                        {stageIndex < 3 && (
                          <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100 flex items-center gap-3">
                            <Clock size={20} className="text-teal-600 shrink-0" />
                            <div>
                              <p className="text-sm font-semibold text-teal-800">{l.estimatedDelivery}</p>
                              <p className="text-sm text-teal-600">
                                {l.estimatedBetween} {formatShortDate(dates.deliveredMin)} {l.and} {formatShortDate(dates.deliveredMax)} (3-7 {l.businessDays})
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Expand/Collapse Details */}
                  <button
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                    className="w-full px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors border-t border-gray-100"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp size={16} />
                        {l.hideDetails}
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} />
                        {l.viewDetails}
                      </>
                    )}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      <div className="grid md:grid-cols-2 gap-0 md:gap-0">
                        {/* Order Items */}
                        <div className="p-6 border-b md:border-b-0 md:border-e border-gray-100">
                          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Package size={16} />
                            {l.orderItems}
                          </h4>
                          <div className="space-y-3">
                            {order.items.map(item => (
                              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                                  <Package size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                                  {item.variant_title && (
                                    <p className="text-xs text-gray-500">{item.variant_title}</p>
                                  )}
                                  <p className="text-xs text-gray-400">x{item.quantity}</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-900 shrink-0">
                                  {formatPrice(item.total, locale)}
                                </p>
                              </div>
                            ))}
                          </div>

                          {/* Order totals */}
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{l.subtotal}</span>
                              <span>{formatPrice(order.subtotal, locale)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">{l.shippingCost}</span>
                              <span className="text-green-600">{order.shipping === 0 ? l.free : formatPrice(order.shipping, locale)}</span>
                            </div>
                            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-200">
                              <span>{l.total}</span>
                              <span className="text-teal-700">{formatPrice(order.total, locale)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="p-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <MapPin size={16} />
                            {l.shippingAddress}
                          </h4>
                          {order.shipping_address ? (
                            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                              {order.shipping_address.name && (
                                <p className="text-sm font-medium text-gray-900">{order.shipping_address.name}</p>
                              )}
                              {order.shipping_address.phone && (
                                <p className="text-sm text-gray-600 flex items-center gap-2" dir="ltr">
                                  <Phone size={14} className="text-gray-400" />
                                  {order.shipping_address.phone}
                                </p>
                              )}
                              {order.shipping_address.address && (
                                <p className="text-sm text-gray-600 flex items-start gap-2">
                                  <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                  {order.shipping_address.address}
                                </p>
                              )}
                              {(order.shipping_address.commune || order.shipping_address.wilaya) && (
                                <p className="text-sm text-gray-600 ps-6">
                                  {[order.shipping_address.commune, order.shipping_address.wilaya].filter(Boolean).join(', ')}
                                </p>
                              )}
                              {order.shipping_address.city && order.shipping_address.state && (
                                <p className="text-sm text-gray-600 ps-6">
                                  {order.shipping_address.city}, {order.shipping_address.state}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 italic">-</p>
                          )}

                          {/* Customer info */}
                          {order.customer && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                {locale === 'ar' ? 'معلومات العميل' : locale === 'en' ? 'Customer Info' : 'Informations Client'}
                              </h4>
                              <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <Mail size={14} className="text-gray-400" />
                                  {order.customer.email}
                                </p>
                                {order.customer.phone && (
                                  <p className="text-sm text-gray-600 flex items-center gap-2" dir="ltr">
                                    <Phone size={14} className="text-gray-400" />
                                    {order.customer.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {order.notes && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                {locale === 'ar' ? 'ملاحظات' : 'Notes'}
                              </h4>
                              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">{order.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Contact Support Section */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <MessageCircle size={24} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{l.needHelp}</h3>
                    <p className="text-sm text-gray-500">{l.needHelpDesc}</p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                  <Phone size={18} className="text-teal-600" />
                  <div>
                    <p className="text-xs text-gray-500">{l.orCallUs}</p>
                    <p className="text-sm font-semibold text-gray-900" dir="ltr">+213 555 123 456</p>
                  </div>
                </div>

                <div className="mt-3 p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                  <Mail size={18} className="text-teal-600" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-semibold text-gray-900">contact@dzmarket.dz</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="flex-1">
                <button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="w-full md:hidden flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition-colors mb-4"
                >
                  <MessageCircle size={18} />
                  {l.contactSupport}
                </button>

                <div className={`${showContactForm ? 'block' : 'hidden'} md:block`}>
                  {contactSent ? (
                    <div className="p-6 bg-green-50 rounded-xl border border-green-200 text-center">
                      <CheckCircle2 size={32} className="text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-green-800">{l.messageSent}</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3">
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder={l.yourName}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder={l.yourEmail}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                      <textarea
                        value={contactForm.message}
                        onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder={l.yourMessage}
                        rows={4}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full px-5 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
                        {l.sendMessage}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
