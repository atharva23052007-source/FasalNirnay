import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole, Language } from '../types';
import { LocationIQPicker } from '../components/LocationIQPicker';
import {
  Sprout,
  ShieldCheck,
  Users,
  Lock,
  Phone,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Award,
  Globe,
  Globe2,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { loginUser, signupUser } = useApp();
  const { language, setLanguage, t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'signup'>('signup');

  // Common Fields
  const [role, setRole] = useState<UserRole>('Farmer');
  const [identifier, setIdentifier] = useState('9822012345');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sign Up Extra Fields
  const [fullName, setFullName] = useState('Ayush Patil');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [locationName, setLocationName] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }>({
    lat: 19.4276,
    lon: 72.8481,
  });
  const [farmSize, setFarmSize] = useState<number>(4.0);

  // Feedback & Status
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languagesList: { id: Language; label: string; flag: string }[] = [
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { id: 'mr', label: 'मराठी (Marathi)', flag: '🚩' },
  ];

  const rolesList: { id: UserRole; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'Farmer',
      title: t('farmerRole', 'Farmer'),
      subtitle: t('farmerRoleSubtitle', 'Farmer / Producer'),
      icon: <Sprout className="w-5 h-5 text-[#167A42]" />,
    },
    {
      id: 'NGO/FPO',
      title: t('ngoFpoRole', 'NGO/FPO'),
      subtitle: t('ngoFpoRoleSubtitle', 'NGO / FPO Alliance'),
      icon: <Users className="w-5 h-5 text-blue-600" />,
    },
    {
      id: 'Admin',
      title: t('adminRole', 'Admin'),
      subtitle: t('adminRoleSubtitle', 'Administrator'),
      icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
    },
  ];

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your Phone Number or Email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role }),
      });

      let data;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (pErr) {
        data = {};
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Incorrect Phone/Email or Password. Please check your credentials.');
        return;
      }

      setSuccessMessage('Authentication successful! Welcome to FasalNirnay.');
      setTimeout(() => {
        loginUser(data.user.emailOrPhone || data.user.mobile, data.user.name, data.user.role, data.user.token);
      }, 400);
    } catch (err: any) {
      setErrorMessage('Server connection error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!identifier.trim()) {
      setErrorMessage('Please enter a valid Phone Number or Email address.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          identifier,
          password,
          role,
          location: locationName,
          coordinates,
          farmSizeAcres: farmSize,
          preferredLanguage: language,
        }),
      });

      let data;
      const text = await res.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch (pErr) {
        data = {};
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Registration failed. An account with this Phone/Email may already exist.');
        return;
      }

      setSuccessMessage('Account registered successfully! Redirecting...');
      setTimeout(() => {
        signupUser(
          data.user.name,
          data.user.mobile,
          data.user.location,
          data.user.farmSizeAcres,
          data.user.role,
          data.user.token
        );
      }, 400);
    } catch (err: any) {
      setErrorMessage('Server connection error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f7f4] text-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto">
        
        {/* Left Side Branding Visuals */}
        <div className="lg:col-span-5 space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E6F4EA] border border-emerald-200 text-[#167A42] text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#167A42]" /> {t('brandName', 'FasalNirnay')} AI Engine v1.0
            </div>

            {/* Quick Language Selector Pill on Top Bar */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
              {languagesList.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    language === lang.id
                      ? 'bg-[#167A42] text-white shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={lang.label}
                >
                  {lang.flag} {lang.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-gray-900 leading-tight tracking-tight">
              {t('heroTitlePrefix', 'Maximize Harvest Profitability with')}{' '}
              <span className="text-[#167A42]">{t('heroTitleSuffix', 'Precision Intelligence')}</span>
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t('heroDescText', 'Empowering farmers, FPOs, and agricultural admins across India with real-time APMC price predictions, spoilage prevention, and instant channel sales.')}
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-[#167A42]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">{t('bestActionsTitle', "Real-Time Mandi Price Spikes")}</h4>
                <p className="text-xs text-gray-500 mt-0.5">Get 48-hour price movement forecasts for Nashik, Azadpur & key APMCs.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-[#167A42]">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">LocationIQ Geolocation Engine</h4>
                <p className="text-xs text-gray-500 mt-0.5">Auto-detect GPS & locate nearest cold storage facilities with map tokens.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-[#167A42]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">Multi-Role Support (Farmer / FPO / Admin)</h4>
                <p className="text-xs text-gray-500 mt-0.5">Tailored dashboards for direct crop sales, cluster logistics, and admin control.</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-4 text-xs font-bold text-gray-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#167A42]" /> 50,000+ Active Farmers
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#167A42]" /> MongoDB Secured
            </span>
          </div>
        </div>

        {/* Right Side Auth Card */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <h2 className="font-heading font-extrabold text-2xl text-gray-900">
                  {mode === 'login' ? t('welcomeBack', 'Welcome Back') : t('createAccount', 'Create Account')}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {mode === 'login'
                    ? t('loginSubtitle', 'Enter your credentials to access your FasalNirnay dashboard')
                    : t('signupSubtitle', 'Sign up with your location to get tailored AI crop recommendations')}
                </p>
              </div>

              {/* Mode Switch Pills */}
              <div className="bg-gray-100 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-[#167A42] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('logInTab', 'Log In')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    mode === 'signup'
                      ? 'bg-[#167A42] text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('signUpTab', 'Sign Up')}
                </button>
              </div>
            </div>

            {/* Feedback Notifications */}
            {errorMessage && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#167A42]" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Role Selection Cards */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                {t('selectAccessRole', 'Select Your Access Role:')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {rolesList.map((r) => {
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-2 border-[#167A42] text-[#167A42] shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="p-1.5 rounded-xl bg-white border border-gray-200 shadow-2xs">
                          {r.icon}
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#167A42]" />
                        )}
                      </div>
                      <h4 className="font-extrabold text-xs text-gray-900">{r.title}</h4>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{r.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" /> {t('phoneEmailLabel', 'Phone Number or Email Address:')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9822012345 or ramesh@farmer.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#167A42] focus:border-[#167A42] outline-none transition-all shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-gray-400" /> {t('passwordLabel', 'Password:')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-3 pr-10 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#167A42] focus:border-[#167A42] outline-none transition-all shadow-2xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Auto-fill demo button */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier('9822012345');
                      setPassword('password123');
                    }}
                    className="text-[#167A42] hover:underline font-bold"
                  >
                    {t('autoFillDemo', 'Auto-fill Demo Credentials')}
                  </button>
                  <span>Role: <strong className="text-gray-900">{role}</strong></span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-extrabold text-xs text-white bg-[#167A42] hover:bg-[#126335] transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
                >
                  <span>{isSubmitting ? 'Authenticating...' : `${t('logInBtn', 'Log In as')} ${role}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* SIGN UP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" /> {t('fullNameLabel', 'Full Name / Farmer Name:')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ayush Patil"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#167A42] focus:border-[#167A42] outline-none shadow-2xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {t('phoneEmailLabel', 'Phone or Email:')}
                    </label>
                    <input
                      type="text"
                      placeholder="9822012345 or email@domain.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#167A42] outline-none shadow-2xs"
                      required
                    />
                  </div>

                  {role === 'Farmer' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t('landHoldingLabel', 'Land Holding (Acres):')}
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={farmSize}
                        onChange={(e) => setFarmSize(Number(e.target.value))}
                        className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-3 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#167A42] outline-none shadow-2xs"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* Preferred Language Selector in Sign Up Form */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#167A42]" /> {t('prefLangLabel', 'Preferred App Language / भाषा निवडा:')}
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {languagesList.map((lang) => {
                      const isSelected = language === lang.id;
                      return (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => setLanguage(lang.id)}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-50 border-2 border-[#167A42] text-[#167A42] shadow-2xs'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* LocationIQ Geolocation Component with Interactive Map */}
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
                  <LocationIQPicker
                    value={locationName}
                    onChange={(loc, coords) => {
                      setLocationName(loc);
                      if (coords) setCoordinates(coords);
                    }}
                    label={t('farmLocationLabel', 'Farm / Village Location (LocationIQ GPS):')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-gray-400" /> {t('passwordLabel', 'Password:')}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-3 pr-10 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#167A42] outline-none shadow-2xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-gray-400" /> {t('confirmPasswordLabel', 'Confirm Password:')}
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-xs font-semibold border border-gray-300 rounded-xl p-3 pr-10 bg-gray-50 text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#167A42] outline-none shadow-2xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl font-extrabold text-xs text-white bg-[#167A42] hover:bg-[#126335] transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
                >
                  <span>{isSubmitting ? 'Registering...' : t('registerBtn', 'Register & Access Dashboard')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="mt-5 text-center text-xs text-gray-500">
              {t('byProceeding', 'By proceeding, you agree to FasalNirnay AI Terms of Service & Privacy Policy.')}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
