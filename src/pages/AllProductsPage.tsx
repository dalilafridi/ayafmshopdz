import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';

export default function AllProductsPage() {
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [productTypes, setProductTypes] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // Only show products from Mode & Accessoires collection
      const { data: modeCol } = await supabase
        .from('ecom_collections')
        .select('id')
        .eq('handle', 'mode-accessoires')
        .single();

      if (modeCol) {
        const { data: productLinks } = await supabase
          .from('ecom_product_collections')
          .select('product_id')
          .eq('collection_id', modeCol.id);

        if (productLinks && productLinks.length > 0) {
          const productIds = productLinks.map(pl => pl.product_id);
          const { data } = await supabase
            .from('ecom_products')
            .select('*, variants:ecom_product_variants(*)')
            .in('id', productIds)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

          if (data) {
            setProducts(data);
            const types = [...new Set(data.map(p => p.product_type).filter(Boolean))];
            setProductTypes(types);
          }
        }
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);


  const filteredProducts = useMemo(() => {
    let result = [...products];
    if (selectedType) result = result.filter(p => p.product_type === selectedType);
    if (minPrice) result = result.filter(p => (p.price || 0) >= parseFloat(minPrice) * 100);
    if (maxPrice) result = result.filter(p => (p.price || 0) <= parseFloat(maxPrice) * 100);
    if (inStockOnly) {
      result = result.filter(p =>
        p.inventory_qty == null || p.inventory_qty > 0 ||
        (p.variants?.length > 0 && p.variants.some((v: any) => v.inventory_qty == null || v.inventory_qty > 0))
      );
    }
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'price-desc': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case 'name': result.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
      default: break;
    }
    return result;
  }, [products, sortBy, minPrice, maxPrice, inStockOnly, selectedType]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-teal-600">{t('nav.home')}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{t('nav.all_products')}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('nav.all_products')}</h1>
          <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} {t('filter.products_count')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <SlidersHorizontal size={16} /> {t('filter.title')}
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="newest">{t('filter.sort_newest')}</option>
            <option value="price-asc">{t('filter.sort_price_asc')}</option>
            <option value="price-desc">{t('filter.sort_price_desc')}</option>
            <option value="name">{t('filter.sort_name')}</option>
          </select>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 flex flex-wrap items-end gap-4">
          {productTypes.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{t('product.category')}</label>
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">{t('nav.all_products')}</option>
                {productTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('filter.min_price')} (DA)</label>
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('filter.max_price')} (DA)</label>
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="50000" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28" />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="rounded border-gray-300 text-teal-600" />
            {t('filter.in_stock')}
          </label>
          <button onClick={() => { setMinPrice(''); setMaxPrice(''); setInStockOnly(false); setSelectedType(''); }} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            <X size={14} /> {t('filter.reset')}
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[3/4]"></div>)}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">{t('search.no_results')}</div>
      )}
    </div>
  );
}
