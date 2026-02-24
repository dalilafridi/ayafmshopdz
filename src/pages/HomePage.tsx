import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Truck, Shield, Award, Headphones, ArrowRight } from 'lucide-react';

const HERO_IMAGE = 'https://d64gsuwffb70l.cloudfront.net/699c95d06b179c72c432491e_1771869788053_03cba039.png';

export default function HomePage() {
  const { t, locale, isRTL } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch products from Fashion & Accessories (Mode & Accessoires) collection only
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
          const { data: prodData } = await supabase
            .from('ecom_products')
            .select('*, variants:ecom_product_variants(*)')
            .in('id', productIds)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(12);
          if (prodData) setProducts(prodData);
        }
      } else {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const trustBadges = [
    { icon: Truck, title: t('home.why_delivery'), desc: t('home.why_delivery_desc'), color: 'text-teal-600 bg-teal-50' },
    { icon: Shield, title: t('home.why_payment'), desc: t('home.why_payment_desc'), color: 'text-blue-600 bg-blue-50' },
    { icon: Award, title: t('home.why_quality'), desc: t('home.why_quality_desc'), color: 'text-orange-600 bg-orange-50' },
    { icon: Headphones, title: t('home.why_support'), desc: t('home.why_support_desc'), color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800">
        <div className="absolute inset-0 opacity-20">
          <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 via-teal-800/60 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full mb-6">
              <Truck size={16} />
              <span>{t('hero.badge')} - {t('hero.badge_sub')}</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-teal-100 mb-8 leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/30"
              >
                {t('hero.cta')}
                <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-3.5 rounded-xl transition-all border border-white/20"
              >
                {t('nav.about')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`p-2.5 rounded-lg ${badge.color} shrink-0`}>
                  <badge.icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{badge.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{t('home.featured_products')}</h2>
            <Link to="/products" className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1">
              {t('home.view_all')}
              <ArrowRight size={16} className={isRTL ? 'rotate-180' : ''} />
            </Link>
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
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg">{t('search.no_results')}</p>
              <p className="text-sm mt-2">{t('common.loading')}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {locale === 'ar' ? 'تسوق الآن مع توصيل سريع لكل الولايات' : locale === 'en' ? 'Shop Now with Fast Delivery Nationwide' : 'Achetez Maintenant avec Livraison Rapide Partout'}
          </h2>
          <p className="text-orange-100 mb-8 max-w-2xl mx-auto">
            {locale === 'ar' ? 'توصيل إلى جميع الولايات الـ 69 في الجزائر - توصيل للمنزل أو نقطة استلام' : locale === 'en' ? 'Delivery to all 58 wilayas across Algeria - Home delivery or Stop Desk pickup' : 'Livraison vers les 58 wilayas d\'Algérie - À domicile ou en point de relais'}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-all hover:shadow-lg"
          >
            {t('hero.cta')}
            <ArrowRight size={18} className={isRTL ? 'rotate-180' : ''} />
          </Link>
        </div>
      </section>
    </div>
  );
}
