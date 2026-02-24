import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { formatPrice, getProductName, getProductDescription } from '@/lib/helpers';
import ProductCard from '@/components/ProductCard';
import { ShoppingCart, Truck, Shield, Minus, Plus, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const { t, locale, isRTL } = useLanguage();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!handle) return;
      setLoading(true);
      setSelectedVariant(null);
      setSelectedSize('');
      setQuantity(1);
      setActiveImage(0);

      const { data } = await supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .eq('handle', handle)
        .single();

      if (data) {
        let variants = data.variants || [];
        if (data.has_variants && variants.length === 0) {
          const { data: vd } = await supabase
            .from('ecom_product_variants')
            .select('*')
            .eq('product_id', data.id)
            .order('position');
          variants = vd || [];
          data.variants = variants;
        }
        setProduct(data);

        if (variants.length > 0) {
          const sorted = [...variants].sort((a: any, b: any) => (a.position || 0) - (b.position || 0));
          const first = sorted.find((v: any) => v.inventory_qty == null || v.inventory_qty > 0) || sorted[0];
          setSelectedVariant(first);
          setSelectedSize(first?.option1 || '');
        }

        // Fetch related products from the same collection only
        const { data: modeCol } = await supabase
          .from('ecom_collections')
          .select('id')
          .eq('handle', 'mode-accessoires')
          .single();

        if (modeCol) {
          const { data: links } = await supabase
            .from('ecom_product_collections')
            .select('product_id')
            .eq('collection_id', modeCol.id);

          const allowedIds = (links || []).map(l => l.product_id).filter(id => id !== data.id);
          if (allowedIds.length > 0) {
            const { data: related } = await supabase
              .from('ecom_products')
              .select('*, variants:ecom_product_variants(*)')
              .eq('status', 'active')
              .in('id', allowedIds)
              .limit(4);
            setRelatedProducts(related || []);
          }
        }

      }
      setLoading(false);
    };
    fetchProduct();
  }, [handle]);

  const hasVariants = product?.has_variants && product?.variants?.length > 0;
  const variantSizes = [...new Set(product?.variants?.map((v: any) => v.option1).filter(Boolean) || [])];

  const getInStock = (): boolean => {
    if (selectedVariant) {
      if (selectedVariant.inventory_qty == null) return true;
      return selectedVariant.inventory_qty > 0;
    }
    if (product?.variants?.length > 0) {
      return product.variants.some((v: any) => v.inventory_qty == null || v.inventory_qty > 0);
    }
    if (product?.has_variants) return true;
    if (product?.inventory_qty == null) return true;
    return product.inventory_qty > 0;
  };
  const inStock = product ? getInStock() : false;
  const currentPrice = selectedVariant?.price || product?.price || 0;
  const comparePrice = product?.metadata?.compare_at_price;
  const images = product?.images || [];
  const name = product ? getProductName(product, locale) : '';
  const description = product ? getProductDescription(product, locale) : '';

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    const variant = product?.variants?.find((v: any) =>
      v.option1 === size || v.title?.toLowerCase().includes(size.toLowerCase())
    );
    if (variant) setSelectedVariant(variant);
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (hasVariants && !selectedSize) return;
    if (!inStock) return;

    addToCart({
      product_id: product.id,
      variant_id: selectedVariant?.id || undefined,
      name: product.name,
      variant_title: selectedVariant?.title || selectedSize || undefined,
      sku: selectedVariant?.sku || product.sku || product.handle,
      price: selectedVariant?.price || product.price,
      image: images[0],
      metadata: { name_ar: product.metadata?.name_ar, name_en: product.metadata?.name_en },
    }, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-gray-100 rounded w-1/4 animate-pulse"></div>
            <div className="h-24 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('search.no_results')}</h2>
        <Link to="/products" className="text-teal-600 hover:underline">{t('nav.all_products')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-teal-600">{t('nav.home')}</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-teal-600">{t('nav.all_products')}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4">
            {images.length > 0 ? (
              <img src={images[activeImage]} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage(i => (i > 0 ? i - 1 : images.length - 1))}
                  className="absolute start-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                >
                  {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                <button
                  onClick={() => setActiveImage(i => (i < images.length - 1 ? i + 1 : 0))}
                  className="absolute end-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow"
                >
                  {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
              </>
            )}
            {comparePrice && comparePrice > currentPrice && (
              <span className="absolute top-3 start-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
                -{Math.round(((comparePrice - currentPrice) / comparePrice) * 100)}%
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-teal-500' : 'border-transparent hover:border-gray-300'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{name}</h1>

          {product.sku && (
            <p className="text-sm text-gray-500 mb-3">{t('product.sku')}: {selectedVariant?.sku || product.sku}</p>
          )}

          <div className="flex items-end gap-3 mb-6">
            <span className="text-3xl font-bold text-teal-700">{formatPrice(currentPrice, locale)}</span>
            {comparePrice && comparePrice > currentPrice && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(comparePrice, locale)}</span>
            )}
          </div>

          {/* Stock status */}
          <div className="mb-6">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                {t('product.in_stock')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                {t('product.out_of_stock')}
              </span>
            )}
          </div>

          {/* Size selector */}
          {variantSizes.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t('product.select_size')}</label>
              <div className="flex flex-wrap gap-2">
                {variantSizes.map(size => {
                  const variant = product.variants?.find((v: any) => v.option1 === size);
                  const sizeInStock = variant ? (variant.inventory_qty == null || variant.inventory_qty > 0) : true;
                  return (
                    <button
                      key={size}
                      onClick={() => sizeInStock && handleSizeSelect(size)}
                      disabled={!sizeInStock}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-teal-600 text-white border-teal-600'
                          : sizeInStock
                          ? 'border-gray-300 hover:border-teal-400 text-gray-700'
                          : 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-2">{t('product.quantity')}</label>
            <div className="flex items-center gap-0 border border-gray-300 rounded-lg w-fit">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-gray-50 text-gray-600"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 font-medium text-gray-900 min-w-[40px] text-center border-x border-gray-300">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="px-3 py-2 hover:bg-gray-50 text-gray-600"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={(hasVariants && !selectedSize) || !inStock}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={18} />
              {!inStock ? t('product.out_of_stock') : hasVariants && !selectedSize ? t('product.select_size') : t('product.add_to_cart')}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={(hasVariants && !selectedSize) || !inStock}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('product.buy_now')}
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Truck size={18} className="text-teal-600 shrink-0" />
              <span>{locale === 'ar' ? 'توصيل إلى 58 ولاية - يبدأ من 200 د.ج' : locale === 'en' ? 'Delivery to 58 wilayas - Starting from 200 DA' : 'Livraison 58 wilayas - À partir de 200 DA'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Shield size={18} className="text-teal-600 shrink-0" />
              <span>{locale === 'ar' ? 'ضمان الجودة' : locale === 'en' ? 'Quality Guarantee' : 'Garantie Qualité'}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <div className="flex border-b border-gray-200">
          {['description', 'specifications'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(`product.${tab}`)}
            </button>
          ))}
        </div>
        <div className="py-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p>{description || (locale === 'ar' ? 'لا يوجد وصف متاح' : locale === 'en' ? 'No description available' : 'Aucune description disponible')}</p>
            </div>
          )}
          {activeTab === 'specifications' && product.metadata && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(product.metadata)
                .filter(([key]) => !['name_ar', 'name_en', 'description_ar', 'description_en', 'compare_at_price'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('product.related')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
