import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice, getProductName } from '@/lib/helpers';
import { getDeliveryPriceRange } from '@/lib/delivery-pricing';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck, MapPin } from 'lucide-react';

export default function CartPage() {
  const { t, locale, isRTL } = useLanguage();
  const { items, removeFromCart, updateQuantity, subtotal, itemCount, clearCart } = useCart();
  const navigate = useNavigate();

  const homeRange = getDeliveryPriceRange('home');
  const stopdeskRange = getDeliveryPriceRange('stopdesk');

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h2>
        <p className="text-gray-500 mb-6">
          {locale === 'ar' ? 'ابدأ التسوق الآن واكتشف منتجاتنا' : locale === 'en' ? 'Start shopping and discover our products' : 'Commencez vos achats et découvrez nos produits'}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          {t('cart.continue_shopping')}
          <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
        </Link>
      </div>
    );
  }

  const getItemName = (item: any) => {
    if (locale === 'ar' && item.metadata?.name_ar) return item.metadata.name_ar;
    if (locale === 'en' && item.metadata?.name_en) return item.metadata.name_en;
    return item.name;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t('cart.title')}</h1>
      <p className="text-gray-500 mb-8">{itemCount} {t('cart.items')}</p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.product_id + (item.variant_id || '')} className="flex gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ShoppingBag size={24} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{getItemName(item)}</h3>
                {item.variant_title && (
                  <p className="text-sm text-gray-500 mt-0.5">{item.variant_title}</p>
                )}
                <p className="text-teal-700 font-bold mt-1">{formatPrice(item.price, locale)}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-0 border border-gray-300 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium border-x border-gray-300 min-w-[32px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                      className="px-2.5 py-1.5 hover:bg-gray-50 text-gray-600"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatPrice(item.price * item.quantity, locale)}</span>
                    <button
                      onClick={() => removeFromCart(item.product_id, item.variant_id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{t('checkout.order_summary')}</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('cart.subtotal')}</span>
                <span className="font-medium">{formatPrice(subtotal, locale)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('cart.shipping')}</span>
                <span className="text-xs text-gray-400 italic">
                  {locale === 'ar' ? 'يُحسب عند الدفع' : locale === 'en' ? 'Calculated at checkout' : 'Calculé au paiement'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-gray-900">{t('cart.total')}</span>
                <span className="text-lg font-bold text-teal-700">{formatPrice(subtotal, locale)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {t('cart.checkout')}
              <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
            </button>

            <Link
              to="/products"
              className="block text-center text-sm text-teal-600 hover:text-teal-700 mt-4"
            >
              {t('cart.continue_shopping')}
            </Link>

            {/* Delivery pricing info */}
            <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-800">
                <Truck size={16} className="shrink-0" />
                <span>{locale === 'ar' ? 'أسعار التوصيل' : locale === 'en' ? 'Delivery Rates' : 'Tarifs de Livraison'}</span>
              </div>
              <div className="text-xs text-orange-700 space-y-1">
                <div className="flex justify-between">
                  <span>{locale === 'ar' ? 'توصيل للمنزل' : locale === 'en' ? 'Home Delivery' : 'À Domicile'}</span>
                  <span className="font-medium">{formatPrice(homeRange.min, locale)} - {formatPrice(homeRange.max, locale)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stop Desk</span>
                  <span className="font-medium">{formatPrice(stopdeskRange.min, locale)} - {formatPrice(stopdeskRange.max, locale)}</span>
                </div>
              </div>
              <p className="text-xs text-orange-600 flex items-center gap-1">
                <MapPin size={12} />
                {locale === 'ar' ? 'يعتمد السعر على ولايتك' : locale === 'en' ? 'Price depends on your wilaya' : 'Le prix dépend de votre wilaya'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
