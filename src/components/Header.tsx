import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';
import { getCollectionName } from '@/lib/helpers';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Globe, LogOut, Package, LayoutDashboard } from 'lucide-react';

export default function Header() {
  const { locale, setLocale, t, isRTL } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState<any[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from('ecom_collections')
        .select('id, title, handle, description')
        .eq('is_visible', true)
        .order('title');
      if (data) setCollections(data);
    };
    fetchCollections();
  }, []);


  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) setShowLangMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const langLabels = { fr: 'FR', ar: 'عربي', en: 'EN' };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      {/* Top bar */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span className="hidden sm:inline">{t('hero.badge')} - {t('hero.badge_sub')}</span>
          <span className="sm:hidden text-center w-full">{t('hero.badge')}</span>
          <div className="hidden sm:flex items-center gap-4">
            <Link to="/track-order" className="hover:underline flex items-center gap-1">
              <Package size={12} />
              {locale === 'ar' ? 'تتبع طلبي' : locale === 'en' ? 'Track Order' : 'Suivre ma Commande'}
            </Link>
            <Link to="/delivery" className="hover:underline">{t('nav.delivery')}</Link>
            <Link to="/contact" className="hover:underline">{t('nav.contact')}</Link>
          </div>
        </div>
      </div>


      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              DZ
            </div>
            <span className="hidden sm:block text-xl font-bold text-gray-900">
              DZ <span className="text-teal-600">Market</span>
            </span>
          </Link>

          {/* Search bar - desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 pe-10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              />
              <button type="submit" className="absolute end-0 top-0 h-full px-3 text-gray-500 hover:text-teal-600">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2 ms-auto">
            {/* Language switcher */}
            <div ref={langMenuRef} className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Globe size={18} />
                <span className="hidden sm:inline">{langLabels[locale]}</span>
                <ChevronDown size={14} />
              </button>
              {showLangMenu && (
                <div className="absolute end-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-50">
                  {(['fr', 'ar', 'en'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => { setLocale(lang); setShowLangMenu(false); }}
                      className={`w-full text-start px-4 py-2 text-sm hover:bg-gray-50 ${locale === lang ? 'text-teal-600 font-semibold bg-teal-50' : 'text-gray-700'}`}
                    >
                      {lang === 'fr' ? 'Français' : lang === 'ar' ? 'العربية' : 'English'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => user ? setShowUserMenu(!showUserMenu) : navigate('/login')}
                className="flex items-center gap-1 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <User size={18} />
                <span className="hidden sm:inline">{user ? (user.name || user.email.split('@')[0]) : t('nav.login')}</span>
              </button>
              {showUserMenu && user && (
                <div className="absolute end-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[180px] z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name || user.email}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/account" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User size={16} /> {t('account.profile')}
                  </Link>
                  <Link to="/account/orders" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Package size={16} /> {t('account.orders')}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      <LayoutDashboard size={16} /> {t('nav.admin')}
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={16} /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              className="relative flex items-center gap-1 px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -end-0.5 bg-orange-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
              <span className="hidden sm:inline">{t('nav.cart')}</span>
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full border border-gray-300 rounded-lg py-2.5 px-4 pe-10 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            />
            <button type="submit" className="absolute end-0 top-0 h-full px-3 text-gray-500">
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Category nav - desktop */}
      <nav className="hidden lg:block border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-0">
            <Link to="/products" className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-white rounded-t-lg whitespace-nowrap transition-colors">
              {t('nav.all_products')}
            </Link>
            {collections.map(col => (
              <Link
                key={col.id}
                to={`/collections/${col.handle}`}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-teal-600 hover:bg-white rounded-t-lg whitespace-nowrap transition-colors"
              >
                {getCollectionName(col, locale)}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
              {t('nav.all_products')}
            </Link>
            {collections.map(col => (
              <Link
                key={col.id}
                to={`/collections/${col.handle}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                {getCollectionName(col, locale)}
              </Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-teal-600 font-medium hover:bg-teal-50 rounded-lg">
                <Package size={16} />
                {locale === 'ar' ? 'تتبع طلبي' : locale === 'en' ? 'Track My Order' : 'Suivre ma Commande'}
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">{t('nav.about')}</Link>
              <Link to="/delivery" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">{t('nav.delivery')}</Link>
              <Link to="/returns" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">{t('nav.returns')}</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">{t('nav.contact')}</Link>
            </div>
          </nav>
        </div>
      )}

    </header>
  );
}
