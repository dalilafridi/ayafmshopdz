import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { getCollectionName, getCollectionDescription } from '@/lib/helpers';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';

export default function CollectionPage() {
  const { handle } = useParams<{ handle: string }>();
  const { t, locale } = useLanguage();
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!handle) return;
      setLoading(true);

      const { data: colData } = await supabase
        .from('ecom_collections')
        .select('*')
        .eq('handle', handle)
        .single();

      if (!colData) { setLoading(false); return; }
      setCollection(colData);

      const { data: links } = await supabase
        .from('ecom_product_collections')
        .select('product_id, position')
        .eq('collection_id', colData.id)
        .order('position');

      if (!links || links.length === 0) { setProducts([]); setLoading(false); return; }

      const ids = links.map(l => l.product_id);
      const { data: prods } = await supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .in('id', ids)
        .eq('status', 'active');

      const sorted = ids.map(id => prods?.find(p => p.id === id)).filter(Boolean);
      setProducts(sorted as any[]);
      setLoading(false);
    };
    fetchData();
  }, [handle]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (minPrice) {
      const min = parseFloat(minPrice) * 100;
      result = result.filter(p => (p.price || 0) >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice) * 100;
      result = result.filter(p => (p.price || 0) <= max);
    }
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
  }, [products, sortBy, minPrice, maxPrice, inStockOnly]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[3/4]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Collection not found</h2>
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
        <span className="text-gray-900 font-medium">{getCollectionName(collection, locale)}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getCollectionName(collection, locale)}</h1>
        {collection.description && (
          <p className="text-gray-600">{getCollectionDescription(collection, locale)}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">{filteredProducts.length} {t('filter.products_count')}</p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          <SlidersHorizontal size={16} />
          {t('filter.title')}
        </button>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">{t('filter.sort')}:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="newest">{t('filter.sort_newest')}</option>
            <option value="price-asc">{t('filter.sort_price_asc')}</option>
            <option value="price-desc">{t('filter.sort_price_desc')}</option>
            <option value="name">{t('filter.sort_name')}</option>
          </select>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4 mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('filter.min_price')} (DA)</label>
            <input
              type="number"
              value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              placeholder="0"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{t('filter.max_price')} (DA)</label>
            <input
              type="number"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              placeholder="50000"
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-32"
            />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={e => setInStockOnly(e.target.checked)}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            {t('filter.in_stock')}
          </label>
          <button
            onClick={() => { setMinPrice(''); setMaxPrice(''); setInStockOnly(false); }}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X size={14} /> {t('filter.reset')}
          </button>
        </div>
      )}

      {/* Products grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">{t('search.no_results')}</p>
        </div>
      )}
    </div>
  );
}
