import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice, getProductName } from '@/lib/helpers';
import { ShoppingCart, Eye } from 'lucide-react';
interface ProductCardProps {
  product: any;
  compact?: boolean;
}
export default function ProductCard({
  product,
  compact
}: ProductCardProps) {
  const {
    locale,
    t
  } = useLanguage();
  const {
    addToCart
  } = useCart();
  if (!product) return null;
  const name = getProductName(product, locale);
  const price = product.variants?.length > 0 ? Math.min(...product.variants.map((v: any) => v.price || product.price || 0)) : product.price || 0;
  const comparePrice = product.metadata?.compare_at_price;
  const image = product.images?.[0] || '/placeholder.png';
  const inStock = product.inventory_qty == null || product.inventory_qty > 0 || product.variants?.length > 0 && product.variants.some((v: any) => v.inventory_qty == null || v.inventory_qty > 0);
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    const variant = product.variants?.[0];
    addToCart({
      product_id: product.id,
      variant_id: variant?.id || undefined,
      name: product.name,
      variant_title: variant?.title || undefined,
      sku: variant?.sku || product.sku || product.handle,
      price: variant?.price || product.price,
      image,
      metadata: {
        name_ar: product.metadata?.name_ar,
        name_en: product.metadata?.name_en
      }
    });
  };
  return <Link to={`/product/${product.handle}`} className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        {!inStock && <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
              {t('product.out_of_stock')}
            </span>
          </div>}
        {comparePrice && comparePrice > price && <span className="absolute top-2 start-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg" data-mixed-content="true">
            -{Math.round((comparePrice - price) / comparePrice * 100)}%
          </span>}
        {/* Hover actions */}
        <div className="absolute bottom-0 inset-x-0 p-2 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          {inStock && <button onClick={handleAddToCart} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
              <ShoppingCart size={14} />
              {!compact && t('product.add_to_cart')}
            </button>}
          <button className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-lg transition-colors">
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-teal-600 transition-colors">
          {name}
        </h3>
        <div className="mt-auto flex items-end gap-2">
          <span className="text-lg font-bold text-teal-700">{formatPrice(price, locale)}3500 DA</span>
          {comparePrice && comparePrice > price && <span className="text-xs text-gray-400 line-through">{formatPrice(comparePrice, locale)}</span>}
        </div>
        {inStock && <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            {t('product.in_stock')}
          </span>}
      </div>
    </Link>;
}