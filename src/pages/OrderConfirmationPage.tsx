import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/helpers';
import { CheckCircle, Copy, Upload, ArrowRight, Banknote, CreditCard, PackageSearch } from 'lucide-react';


export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method') || 'cod';
  const { t, locale, isRTL } = useLanguage();
  const [order, setOrder] = useState<any>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      const { data: o } = await supabase.from('ecom_orders').select('*').eq('id', orderId).single();
      if (o) setOrder(o);
      const { data: items } = await supabase.from('ecom_order_items').select('*').eq('order_id', orderId);
      if (items) setOrderItems(items);
    };
    fetchOrder();
  }, [orderId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('order.confirmation')}</h1>
        <p className="text-gray-600 text-lg">{t('order.thank_you')}</p>
      </div>

      {/* Order number */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-8 text-center">
        <p className="text-sm text-teal-700 mb-1">{t('order.number')}</p>
        <p className="text-xl font-mono font-bold text-teal-900">{orderId?.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* Bank transfer instructions */}
      {method === 'bank_transfer' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={20} className="text-amber-700" />
            <h2 className="text-lg font-bold text-amber-900">{t('order.bank_instructions')}</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: 'bank', value: t('order.bank_name') },
              { label: 'account', value: t('order.account_name') },
              { label: 'rip', value: t('order.rip') },
              { label: 'ccp', value: t('order.ccp') },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between bg-white rounded-lg p-3">
                <span className="text-sm text-gray-700">{item.value}</span>
                <button
                  onClick={() => copyToClipboard(item.value, item.label)}
                  className="text-amber-600 hover:text-amber-700 p-1"
                  title="Copy"
                >
                  {copied === item.label ? <CheckCircle size={16} /> : <Copy size={16} />}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-amber-100 rounded-lg">
            <p className="text-sm font-medium text-amber-800">{t('order.reference')}</p>
            <p className="text-sm font-mono font-bold text-amber-900 mt-1">{orderId?.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
      )}

      {method === 'cod' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Banknote size={20} className="text-green-700" />
            <h2 className="text-lg font-bold text-green-900">{t('checkout.cod')}</h2>
          </div>
          <p className="text-sm text-green-700">{t('checkout.cod_desc')}</p>
        </div>
      )}

      {/* Order items */}
      {orderItems.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('order.items')}</h2>
          <div className="space-y-3">
            {orderItems.map(item => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                  {item.variant_title && <p className="text-xs text-gray-500">{item.variant_title}</p>}
                  <p className="text-xs text-gray-500">x{item.quantity}</p>
                </div>
                <span className="text-sm font-medium">{formatPrice(item.total, locale)}</span>
              </div>
            ))}
          </div>
          {order && (
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span>{formatPrice(order.subtotal, locale)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{t('cart.shipping')}</span>
                <span>{order.shipping > 0 ? formatPrice(order.shipping, locale) : <span className="text-green-600">{t('cart.free')}</span>}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                <span>{t('cart.total')}</span>
                <span className="text-teal-700">{formatPrice(order.total, locale)}</span>
              </div>
            </div>
          )}
        </div>

      )}

      {/* Shipping info */}
      {order?.shipping_address && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t('checkout.shipping_info')}</h2>
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-medium">{order.shipping_address.name}</p>
            <p dir="ltr">{order.shipping_address.phone}</p>
            <p>{order.shipping_address.address}</p>
            <p>{order.shipping_address.commune}, {order.shipping_address.wilaya}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to={`/track-order`}
          className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          <PackageSearch size={18} />
          {locale === 'ar' ? 'تتبع طلبي' : locale === 'en' ? 'Track My Order' : 'Suivre ma Commande'}
        </Link>
        <Link
          to="/account/orders"
          className="inline-flex items-center justify-center gap-2 border border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          {t('order.view_details')}
        </Link>
        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          {t('order.continue_shopping')}
          <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
        </Link>
      </div>

    </div>
  );
}
