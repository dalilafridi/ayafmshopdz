import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Phone, Mail, Clock, Send, PackageSearch } from 'lucide-react';


export default function Footer() {
  const { t, locale } = useLanguage();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter bar */}
      <div className="bg-teal-600">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white text-center md:text-start">
            <h3 className="font-bold text-lg">{t('footer.newsletter')}</h3>
            <p className="text-teal-100 text-sm">{t('footer.newsletter_text')}</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('footer.email_placeholder')}
              className="flex-1 px-4 py-2.5 rounded-s-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300"
              required
            />
            <button type="submit" className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-e-lg transition-colors flex items-center gap-2">
              <Send size={16} />
              {subscribed ? '✓' : t('footer.subscribe')}
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">DZ</div>
              <span className="text-lg font-bold text-white">DZ <span className="text-teal-400">Market</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">{t('footer.about_text')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.quick_links')}</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-sm hover:text-teal-400 transition-colors">{t('nav.all_products')}</Link></li>
              <li><Link to="/about" className="text-sm hover:text-teal-400 transition-colors">{t('nav.about')}</Link></li>
              <li><Link to="/contact" className="text-sm hover:text-teal-400 transition-colors">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.customer_service')}</h4>
            <ul className="space-y-2">
              <li><Link to="/delivery" className="text-sm hover:text-teal-400 transition-colors">{t('nav.delivery')}</Link></li>
              <li><Link to="/returns" className="text-sm hover:text-teal-400 transition-colors">{t('nav.returns')}</Link></li>
              <li>
                <Link to="/track-order" className="text-sm hover:text-teal-400 transition-colors flex items-center gap-1.5">
                  <PackageSearch size={14} />
                  {locale === 'ar' ? 'تتبع طلبي' : locale === 'en' ? 'Track My Order' : 'Suivre ma Commande'}
                </Link>
              </li>
              <li><Link to="/account/orders" className="text-sm hover:text-teal-400 transition-colors">{t('nav.orders')}</Link></li>
              <li><Link to="/login" className="text-sm hover:text-teal-400 transition-colors">{t('nav.login')}</Link></li>
            </ul>
          </div>


          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t('footer.contact_us')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin size={16} className="text-teal-400 mt-0.5 shrink-0" />
                <span>{t('contact.address_value')}</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone size={16} className="text-teal-400 shrink-0" />
                <span dir="ltr">{t('contact.phone_value')}</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail size={16} className="text-teal-400 shrink-0" />
                <span>{t('contact.email_value')}</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Clock size={16} className="text-teal-400 shrink-0" />
                <span>{t('contact.hours_value')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>&copy; {new Date().getFullYear()} DZ Market. {t('footer.rights')}</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-gray-300">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-gray-300">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
