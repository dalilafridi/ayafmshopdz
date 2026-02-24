import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapPin, Phone, Mail, Clock, Send, Truck, CreditCard, RotateCcw, CheckCircle, ArrowRight } from 'lucide-react';

export function AboutPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('about.title')}</h1>
      <div className="prose max-w-none">
        <p className="text-gray-700 text-lg leading-relaxed mb-8">{t('about.text')}</p>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-teal-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-teal-900 mb-3">{t('about.mission')}</h2>
            <p className="text-teal-700">{t('about.mission_text')}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-6">
            <h2 className="text-xl font-bold text-orange-900 mb-3">{t('about.values')}</h2>
            <ul className="space-y-2 text-orange-700">
              <li className="flex items-start gap-2"><CheckCircle size={16} className="mt-1 shrink-0" />{t('about.value_1')}</li>
              <li className="flex items-start gap-2"><CheckCircle size={16} className="mt-1 shrink-0" />{t('about.value_2')}</li>
              <li className="flex items-start gap-2"><CheckCircle size={16} className="mt-1 shrink-0" />{t('about.value_3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeliveryPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('delivery.title')}</h1>
      <div className="space-y-8">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-50 rounded-lg"><Truck size={24} className="text-teal-600" /></div>
            <h2 className="text-xl font-bold text-gray-900">{t('delivery.shipping_title')}</h2>
          </div>
          <p className="text-gray-700 mb-3">{t('delivery.shipping_text')}</p>
          <p className="text-gray-700 font-medium">{t('delivery.shipping_free')}</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('delivery.payment_title')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={18} className="text-green-600" />
                <h3 className="font-semibold text-green-900">{t('delivery.cod_title')}</h3>
              </div>
              <p className="text-sm text-green-700">{t('delivery.cod_text')}</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={18} className="text-blue-600" />
                <h3 className="font-semibold text-blue-900">{t('delivery.bank_title')}</h3>
              </div>
              <p className="text-sm text-blue-700">{t('delivery.bank_text')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg"><MapPin size={24} className="text-purple-600" /></div>
            <h2 className="text-xl font-bold text-gray-900">{t('delivery.tracking')}</h2>
          </div>
          <p className="text-gray-700">{t('delivery.tracking_text')}</p>
        </div>
      </div>
    </div>
  );
}

export function ReturnsPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('returns.title')}</h1>
      <p className="text-gray-700 text-lg mb-8">{t('returns.text')}</p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('returns.conditions')}</h2>
          <ul className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <li key={i} className="flex items-start gap-2 text-gray-700">
                <CheckCircle size={16} className="text-teal-600 mt-1 shrink-0" />
                {t(`returns.condition_${i}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('returns.process')}</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">{i}</div>
                <p className="text-gray-700 pt-1">{t(`returns.step_${i}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { t, locale } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulate send
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setSending(false);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('contact.title')}</h1>
      <p className="text-gray-600 mb-8">{t('contact.subtitle')}</p>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: Phone, label: t('contact.phone_label'), value: t('contact.phone_value'), dir: 'ltr' },
            { icon: Mail, label: t('contact.email_label'), value: t('contact.email_value') },
            { icon: MapPin, label: t('contact.address_label'), value: t('contact.address_value') },
            { icon: Clock, label: t('contact.hours_label'), value: t('contact.hours_value') },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-xl">
              <div className="p-2 bg-teal-50 rounded-lg"><item.icon size={18} className="text-teal-600" /></div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-600" dir={item.dir}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {sent && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-4 flex items-center gap-2">
              <CheckCircle size={18} /> {t('contact.sent')}
            </div>
          )}
          <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.name')}</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email')}</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.subject')}</label>
              <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.message')}</label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={5} required className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <button type="submit" disabled={sending} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50">
              <Send size={16} />
              {sending ? t('contact.sending') : t('contact.send')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
