import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Search } from 'lucide-react';

const ALLOWED_COLLECTION_HANDLE = 'mode-accessoires';

export default function SearchPage() {
  const { t, locale } = useLanguage();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) { setProducts([]); setLoading(false); return; }
      setLoading(true);

      // Get the allowed collection
      const { data: col } = await supabase
        .from('ecom_collections')
        .select('id')
        .eq('handle', ALLOWED_COLLECTION_HANDLE)
        .single();

      if (!col) { setProducts([]); setLoading(false); return; }

      // Get product IDs in the allowed collection
      const { data: links } = await supabase
        .from('ecom_product_collections')
        .select('product_id')
        .eq('collection_id', col.id);

      if (!links || links.length === 0) { setProducts([]); setLoading(false); return; }

      const allowedIds = links.map(l => l.product_id);

      // Search only within allowed products
      const { data } = await supabase
        .from('ecom_products')
        .select('*, variants:ecom_product_variants(*)')
        .eq('status', 'active')
        .in('id', allowedIds)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(50);

      setProducts(data || []);
      setLoading(false);
    };
    search();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t('search.results')}</h1>
        {query && (
          <p className="text-gray-500">
            {products.length} {t('search.results_for')} "<span className="font-medium text-gray-900">{query}</span>"
          </p>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl animate-pulse aspect-[3/4]"></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg mb-4">{t('search.no_results')}</p>
          <Link to="/products" className="text-teal-600 hover:underline font-medium">{t('nav.all_products')}</Link>
        </div>
      )}
    </div>
  );
}
