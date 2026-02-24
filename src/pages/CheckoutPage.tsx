import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/helpers';
import { wilayas, getWilayaName } from '@/lib/wilayas';
import {
  getDeliveryPrice,
  getDeliveryZoneInfo,
  getEstimatedDeliveryDays,
  type DeliveryType,
  type DeliveryZone,
} from '@/lib/delivery-pricing';
import {
  CreditCard,
  Banknote,
  ArrowRight,
  ShoppingBag,
  Loader2,
  Truck,
  Home,
  Building2,
  Clock,
  MapPin,
  Package,
  CheckCircle2,
  Shield,
  Info,
} from 'lucide-react';


// ─── Delivery Option Card ────────────────────────────────────────────────────
interface DeliveryCardProps {
  type: DeliveryType;
  selected: boolean;
  onSelect: () => void;
  wilayaCode: string;
  locale: string;
  otherTypePrice: number;
}

function DeliveryOptionCard({
  type,
  selected,
  onSelect,
  wilayaCode,
  locale,
  otherTypePrice,
}: DeliveryCardProps) {
  const price = getDeliveryPrice(wilayaCode, type);
  const days = getEstimatedDeliveryDays(wilayaCode);


  // Stop desk adds ~0 extra days but is cheaper; home is door-to-door
  const estimatedMin = type === 'stopdesk' ? days.min : days.min;
  const estimatedMax = type === 'stopdesk' ? days.max : days.max + 1;

  const isHome = type === 'home';
  const icon = isHome ? (
    <Home size={28} className={selected ? 'text-white' : 'text-teal-600'} />
  ) : (
    <Building2 size={28} className={selected ? 'text-white' : 'text-teal-600'} />
  );

  const title = isHome
    ? locale === 'ar'
      ? 'توصيل للمنزل'
      : locale === 'en'
      ? 'Home Delivery'
      : 'Livraison à Domicile'
    : locale === 'ar'
    ? 'نقطة استلام'
    : locale === 'en'
    ? 'Stop Desk'
    : 'Point de Relais';

  const subtitle = isHome
    ? locale === 'ar'
      ? 'التوصيل مباشرة إلى باب منزلك'
      : locale === 'en'
      ? 'Delivered directly to your door'
      : 'Livré directement chez vous'
    : locale === 'ar'
    ? 'استلم طردك من أقرب نقطة استلام'
    : locale === 'en'
    ? 'Pick up from nearest collection point'
    : 'Récupérez au point de relais le plus proche';

  const daysLabel =
    locale === 'ar' ? 'أيام عمل' : locale === 'en' ? 'business days' : 'jours ouvrables';

  // Calculate savings for stop desk
  const savings = !isHome ? otherTypePrice - price : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col w-full rounded-2xl border-2 p-5 text-start transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
        selected
          ? 'border-teal-500 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/20 scale-[1.02]'
          : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-md'
      }`}
    >
      {/* Selection indicator */}
      <div
        className={`absolute top-3 ${
          locale === 'ar' ? 'left-3' : 'right-3'
        } transition-all duration-300`}
      >
        {selected ? (
          <CheckCircle2 size={22} className="text-white" />
        ) : (
          <div className="w-[22px] h-[22px] rounded-full border-2 border-gray-300" />
        )}
      </div>

      {/* Savings badge for stop desk */}
      {!isHome && savings > 0 && (
        <div
          className={`absolute top-3 ${
            locale === 'ar' ? 'right-3' : 'left-3'
          } px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
            selected
              ? 'bg-white/25 text-white'
              : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {locale === 'ar'
            ? `وفّر ${formatPrice(savings, locale)}`
            : locale === 'en'
            ? `Save ${formatPrice(savings, locale)}`
            : `Économisez ${formatPrice(savings, locale)}`}
        </div>
      )}

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 mt-2 transition-colors ${
          selected ? 'bg-white/20' : 'bg-teal-50'
        }`}
      >
        {icon}
      </div>

      {/* Title */}
      <h3 className={`text-base font-bold mb-1 ${selected ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>

      {/* Description */}
      <p
        className={`text-xs mb-4 leading-relaxed ${
          selected ? 'text-white/80' : 'text-gray-500'
        }`}
      >
        {subtitle}
      </p>

      {/* Price */}
      <div className="mt-auto">
        <div
          className={`text-2xl font-extrabold tracking-tight ${
            selected ? 'text-white' : 'text-gray-900'
          }`}
        >
          {formatPrice(price, locale)}
        </div>
      </div>

      {/* Estimated days */}
      <div
        className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${
          selected ? 'text-white/80' : 'text-gray-500'
        }`}
      >
        <Clock size={13} />
        <span>
          {estimatedMin}-{estimatedMax} {daysLabel}
        </span>
      </div>
    </button>
  );
}

// ─── Delivery Zone Badge ─────────────────────────────────────────────────────
function DeliveryZoneBadge({
  zone,
  locale,
}: {
  zone: DeliveryZone;
  locale: string;
}) {
  const label =
    locale === 'ar' ? zone.label_ar : locale === 'en' ? zone.label_en : zone.label_fr;
  const zoneLabel =
    locale === 'ar' ? 'المنطقة' : locale === 'en' ? 'Zone' : 'Zone';

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium">
      <MapPin size={12} />
      <span>
        {zoneLabel}: {label}
      </span>
    </div>
  );
}

// ─── Main Checkout Page ──────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { t, locale, isRTL } = useLanguage();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const deliverySectionRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    wilaya: '',
    commune: '',
    address: '',
    notes: '',
  });
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('home');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeliveryPreview, setShowDeliveryPreview] = useState(false);

  const selectedWilaya = wilayas.find((w) => w.code === form.wilaya);
  const communes = selectedWilaya?.communes || [];

  // Calculate delivery cost based on selected wilaya and delivery type
  const shippingCost = useMemo(() => {
    if (!form.wilaya) return 0;
    return getDeliveryPrice(form.wilaya, deliveryType);
  }, [form.wilaya, deliveryType]);

  const deliveryZone = useMemo(() => {
    if (!form.wilaya) return null;
    return getDeliveryZoneInfo(form.wilaya);
  }, [form.wilaya]);

  const total = subtotal + shippingCost;

  // Animate delivery preview when wilaya changes
  useEffect(() => {
    if (form.wilaya) {
      setShowDeliveryPreview(false);
      const timer = setTimeout(() => {
        setShowDeliveryPreview(true);
        // Smooth scroll to delivery section on mobile
        if (window.innerWidth < 768 && deliverySectionRef.current) {
          setTimeout(() => {
            deliverySectionRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }, 100);
        }
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setShowDeliveryPreview(false);
    }
  }, [form.wilaya]);

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    if (field === 'wilaya') setForm((prev) => ({ ...prev, [field]: value, commune: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = locale === 'ar' ? 'مطلوب' : 'Required';
    if (!form.email.trim()) errs.email = locale === 'ar' ? 'مطلوب' : 'Required';
    if (!form.phone.trim()) errs.phone = locale === 'ar' ? 'مطلوب' : 'Required';
    else if (!/^(0[567]\d{8})$/.test(form.phone.replace(/\s/g, ''))) {
      errs.phone =
        locale === 'ar'
          ? 'رقم هاتف غير صالح'
          : locale === 'en'
          ? 'Invalid phone number'
          : 'Numéro invalide';
    }
    if (!form.wilaya) errs.wilaya = locale === 'ar' ? 'مطلوب' : 'Required';
    if (!form.commune) errs.commune = locale === 'ar' ? 'مطلوب' : 'Required';
    if (!form.address.trim()) errs.address = locale === 'ar' ? 'مطلوب' : 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || items.length === 0) return;

    setProcessing(true);
    try {
      const { data: customer } = await supabase
        .from('ecom_customers')
        .upsert(
          {
            email: form.email,
            name: form.name,
            phone: form.phone,
          },
          { onConflict: 'email' }
        )
        .select('id')
        .single();

      const { data: order } = await supabase
        .from('ecom_orders')
        .insert({
          customer_id: customer?.id,
          status: 'pending',
          subtotal,
          tax: 0,
          shipping: shippingCost,
          total,
          shipping_address: {
            name: form.name,
            phone: form.phone,
            wilaya: selectedWilaya?.name_fr || form.wilaya,
            wilaya_code: form.wilaya,
            commune: form.commune,
            address: form.address,
            delivery_type: deliveryType,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cod' ? 'unpaid' : 'needs_review',
          },
          notes: form.notes || null,
        })
        .select('id')
        .single();

      if (order) {
        const orderItems = items.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          variant_id: item.variant_id || null,
          product_name: item.name,
          variant_title: item.variant_title || null,
          sku: item.sku || null,
          quantity: item.quantity,
          unit_price: item.price,
          total: item.price * item.quantity,
        }));
        await supabase.from('ecom_order_items').insert(orderItems);

        try {
          await supabase.functions.invoke('send-order-confirmation', {
            body: {
              orderId: order.id,
              customerEmail: form.email,
              customerName: form.name,
              orderItems,
              subtotal,
              shipping: shippingCost,
              tax: 0,
              total,
              shippingAddress: {
                name: form.name,
                line1: form.address,
                city: form.commune,
                state: selectedWilaya?.name_fr || '',
                postal_code: '',
                country: 'Algeria',
              },
              paymentMethod,
              locale,
            },
          });
        } catch (emailErr) {
          console.error('Email error:', emailErr);
        }

        clearCart();
        navigate(`/order-confirmation/${order.id}?method=${paymentMethod}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
    setProcessing(false);
  };

  // ─── Empty cart state ────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('cart.empty')}</h2>
        <Link to="/products" className="text-teal-600 hover:underline">
          {t('cart.continue_shopping')}
        </Link>
      </div>
    );
  }

  const inputClass = (field: string) =>
    `w-full border ${
      errors[field] ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow`;

  // Delivery type labels for the order summary
  const deliveryTypeShortLabel =
    deliveryType === 'home'
      ? locale === 'ar'
        ? 'منزل'
        : locale === 'en'
        ? 'Home'
        : 'Domicile'
      : locale === 'ar'
      ? 'نقطة استلام'
      : locale === 'en'
      ? 'Stop Desk'
      : 'Point Relais';

  // Home delivery price for savings calculation
  const homePriceForSavings = form.wilaya ? getDeliveryPrice(form.wilaya, 'home') : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
        {t('checkout.title')}
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* ─── Left Column: Form ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* ── Shipping Info ─────────────────────────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('checkout.shipping_info')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.full_name')} *
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    className={inputClass('name')}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.email')} *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => updateForm('email', e.target.value)}
                    className={inputClass('email')}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.phone')} *
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => updateForm('phone', e.target.value)}
                    placeholder="07XX XXX XXX"
                    className={inputClass('phone')}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.wilaya')} *
                  </label>
                  <div className="relative">
                    <select
                      value={form.wilaya}
                      onChange={(e) => updateForm('wilaya', e.target.value)}
                      className={inputClass('wilaya')}
                    >
                      <option value="">{t('checkout.select_wilaya')}</option>
                      {wilayas.map((w) => (
                        <option key={w.code} value={w.code}>
                          {w.code} - {getWilayaName(w, locale)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.wilaya && (
                    <p className="text-red-500 text-xs mt-1">{errors.wilaya}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.commune')} *
                  </label>
                  <select
                    value={form.commune}
                    onChange={(e) => updateForm('commune', e.target.value)}
                    className={inputClass('commune')}
                    disabled={!form.wilaya}
                  >
                    <option value="">{t('checkout.select_commune')}</option>
                    {communes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.commune && (
                    <p className="text-red-500 text-xs mt-1">{errors.commune}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.address')} *
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                    className={inputClass('address')}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('checkout.notes')}
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => updateForm('notes', e.target.value)}
                    rows={3}
                    className={inputClass('notes')}
                  />
                </div>
              </div>
            </div>

            {/* ── Delivery Type – Side-by-Side Cards ───────────────────── */}
            <div
              ref={deliverySectionRef}
              className={`transition-all duration-500 ${
                form.wilaya
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-40 pointer-events-none translate-y-2'
              }`}
            >
              <div className="bg-white border border-gray-100 rounded-xl p-6">
                {/* Section header */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <Truck size={20} className="text-teal-600" />
                    <h2 className="text-lg font-bold text-gray-900">
                      {locale === 'ar'
                        ? 'اختر طريقة التوصيل'
                        : locale === 'en'
                        ? 'Choose Delivery Method'
                        : 'Choisir le Mode de Livraison'}
                    </h2>
                  </div>
                  {deliveryZone && <DeliveryZoneBadge zone={deliveryZone} locale={locale} />}
                </div>

                {/* Prompt when no wilaya selected */}
                {!form.wilaya && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">
                    <Info size={18} className="shrink-0" />
                    <span>
                      {locale === 'ar'
                        ? 'اختر ولايتك أعلاه لعرض أسعار التوصيل'
                        : locale === 'en'
                        ? 'Select your wilaya above to see delivery prices'
                        : 'Sélectionnez votre wilaya ci-dessus pour voir les tarifs'}
                    </span>
                  </div>
                )}

                {/* Side-by-side delivery cards */}
                {form.wilaya && (
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-all duration-500 ${
                      showDeliveryPreview
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <DeliveryOptionCard
                      type="home"
                      selected={deliveryType === 'home'}
                      onSelect={() => setDeliveryType('home')}
                      wilayaCode={form.wilaya}
                      locale={locale}
                      otherTypePrice={getDeliveryPrice(form.wilaya, 'stopdesk')}
                    />
                    <DeliveryOptionCard
                      type="stopdesk"
                      selected={deliveryType === 'stopdesk'}
                      onSelect={() => setDeliveryType('stopdesk')}
                      wilayaCode={form.wilaya}
                      locale={locale}
                      otherTypePrice={homePriceForSavings}
                    />
                  </div>
                )}

                {/* Delivery info footer */}
                {form.wilaya && showDeliveryPreview && (
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Shield size={13} className="text-teal-600" />
                      <span>
                        {locale === 'ar'
                          ? 'تتبع الطرد متاح'
                          : locale === 'en'
                          ? 'Package tracking available'
                          : 'Suivi du colis disponible'}
                      </span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1">
                      <Package size={13} className="text-teal-600" />
                      <span>
                        {locale === 'ar'
                          ? 'التوصيل إلى 58 ولاية'
                          : locale === 'en'
                          ? 'Delivery to all 58 wilayas'
                          : 'Livraison dans les 58 wilayas'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Payment Method ────────────────────────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('checkout.payment_method')}
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote size={20} className="text-teal-600" />
                      <span className="font-semibold text-gray-900">
                        {t('checkout.cod')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{t('checkout.cod_desc')}</p>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="mt-1 text-teal-600 focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard size={20} className="text-teal-600" />
                      <span className="font-semibold text-gray-900">
                        {t('checkout.bank_transfer')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {t('checkout.bank_transfer_desc')}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Order Summary ────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {t('checkout.order_summary')}
              </h2>

              {/* Cart items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.product_id + (item.variant_id || '')}
                    className="flex gap-3"
                  >
                    <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      {item.variant_title && (
                        <p className="text-xs text-gray-500">{item.variant_title}</p>
                      )}
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium shrink-0">
                      {formatPrice(item.price * item.quantity, locale)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2.5 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span className="font-medium">{formatPrice(subtotal, locale)}</span>
                </div>

                {/* Shipping line */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <Truck size={14} className="text-gray-400" />
                    {t('cart.shipping')}
                  </span>
                  {form.wilaya ? (
                    <div className="text-end">
                      <span className="font-semibold text-orange-600">
                        {formatPrice(shippingCost, locale)}
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">
                        {deliveryTypeShortLabel}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">
                      {locale === 'ar'
                        ? 'اختر الولاية'
                        : locale === 'en'
                        ? 'Select wilaya'
                        : 'Choisir wilaya'}
                    </span>
                  )}
                </div>

                {/* Delivery type quick-switch in summary */}
                {form.wilaya && (
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('home')}
                      className={`flex-1 text-[11px] py-1.5 rounded-lg border font-medium transition-all ${
                        deliveryType === 'home'
                          ? 'bg-teal-50 border-teal-400 text-teal-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <Home size={11} className="inline mr-1 -mt-0.5" />
                      {formatPrice(getDeliveryPrice(form.wilaya, 'home'), locale)}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('stopdesk')}
                      className={`flex-1 text-[11px] py-1.5 rounded-lg border font-medium transition-all ${
                        deliveryType === 'stopdesk'
                          ? 'bg-teal-50 border-teal-400 text-teal-700'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <Building2 size={11} className="inline mr-1 -mt-0.5" />
                      {formatPrice(getDeliveryPrice(form.wilaya, 'stopdesk'), locale)}
                    </button>
                  </div>
                )}
              </div>

              {/* Grand total */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold">{t('cart.total')}</span>
                  <span
                    className={`text-xl font-extrabold text-teal-700 transition-all duration-300`}
                  >
                    {formatPrice(total, locale)}
                  </span>
                </div>
                {form.wilaya && deliveryType === 'stopdesk' && homePriceForSavings > shippingCost && (
                  <p className="text-xs text-emerald-600 mt-1 text-end font-medium">
                    {locale === 'ar'
                      ? `وفّرت ${formatPrice(homePriceForSavings - shippingCost, locale)} باختيار نقطة الاستلام`
                      : locale === 'en'
                      ? `You save ${formatPrice(homePriceForSavings - shippingCost, locale)} with Stop Desk`
                      : `Vous économisez ${formatPrice(homePriceForSavings - shippingCost, locale)} avec Point Relais`}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={processing}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t('checkout.processing')}
                  </>
                ) : (
                  <>
                    {t('checkout.place_order')}
                    <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
