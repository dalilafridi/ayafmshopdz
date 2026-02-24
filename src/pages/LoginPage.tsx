import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User, Phone } from 'lucide-react';

export default function LoginPage() {
  const { t, locale } = useLanguage();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'register') {
      if (form.password !== form.confirmPassword) {
        setError(locale === 'ar' ? 'كلمات المرور غير متطابقة' : locale === 'en' ? 'Passwords do not match' : 'Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }
      if (form.password.length < 6) {
        setError(locale === 'ar' ? 'كلمة المرور قصيرة جداً' : locale === 'en' ? 'Password too short' : 'Mot de passe trop court');
        setLoading(false);
        return;
      }
      const result = await register(form.email, form.password, form.name, form.phone);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/account');
      }
    } else {
      const result = await login(form.email, form.password);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/account');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Tabs */}
        <div className="flex mb-8 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'login' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500'}`}
          >
            {t('auth.login')}
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === 'register' ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500'}`}
          >
            {t('auth.register')}
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.name')}</label>
                  <div className="relative">
                    <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => updateForm('name', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg ps-10 pe-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone')}</label>
                  <div className="relative">
                    <Phone size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      dir="ltr"
                      value={form.phone}
                      onChange={e => updateForm('phone', e.target.value)}
                      placeholder="07XX XXX XXX"
                      className="w-full border border-gray-300 rounded-lg ps-10 pe-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={e => updateForm('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg ps-10 pe-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={form.password}
                  onChange={e => updateForm('password', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg ps-10 pe-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirm_password')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => updateForm('confirmPassword', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg ps-10 pe-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {mode === 'login' ? t('auth.logging_in') : t('auth.registering')}
                </>
              ) : (
                mode === 'login' ? t('auth.login_btn') : t('auth.register_btn')
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === 'login' ? t('auth.no_account') : t('auth.has_account')}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              {mode === 'login' ? t('auth.register_btn') : t('auth.login_btn')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
