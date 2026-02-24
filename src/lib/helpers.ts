import { Locale } from './translations';

export function formatPrice(cents: number, locale: Locale = 'fr'): string {
  const amount = cents / 100;
  const formatted = amount.toLocaleString(locale === 'ar' ? 'ar-DZ' : 'fr-DZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const currency = locale === 'ar' ? 'د.ج' : 'DA';
  return locale === 'ar' ? `${formatted} ${currency}` : `${formatted} ${currency}`;
}

export function getProductName(product: any, locale: Locale): string {
  if (!product) return '';
  if (locale === 'ar' && product.metadata?.name_ar) return product.metadata.name_ar;
  if (locale === 'en' && product.metadata?.name_en) return product.metadata.name_en;
  return product.name || '';
}

export function getProductDescription(product: any, locale: Locale): string {
  if (!product) return '';
  if (locale === 'ar' && product.metadata?.description_ar) return product.metadata.description_ar;
  if (locale === 'en' && product.metadata?.description_en) return product.metadata.description_en;
  return product.description || '';
}

export function getCollectionName(collection: any, locale: Locale): string {
  if (!collection) return '';
  if (locale === 'ar' && collection.description) {
    // Try to parse multilingual description
    try {
      const parsed = JSON.parse(collection.description);
      if (parsed.title_ar) return parsed.title_ar;
    } catch {}
  }
  if (locale === 'en') {
    try {
      const parsed = JSON.parse(collection.description);
      if (parsed.title_en) return parsed.title_en;
    } catch {}
  }
  return collection.title || '';
}

export function getCollectionDescription(collection: any, locale: Locale): string {
  if (!collection) return '';
  try {
    const parsed = JSON.parse(collection.description);
    if (locale === 'ar' && parsed.desc_ar) return parsed.desc_ar;
    if (locale === 'en' && parsed.desc_en) return parsed.desc_en;
    if (parsed.desc_fr) return parsed.desc_fr;
  } catch {}
  return collection.description || '';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'paid':
    case 'confirmed': return 'bg-blue-100 text-blue-800';
    case 'shipped': return 'bg-purple-100 text-purple-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled':
    case 'refunded': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getStatusLabel(status: string, t: (key: string) => string): string {
  switch (status) {
    case 'pending': return t('order.pending');
    case 'paid': return t('order.paid');
    case 'shipped': return t('order.shipped');
    case 'delivered': return t('order.delivered');
    case 'cancelled': return t('order.cancelled');
    default: return status;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
