import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { mockLocations } from '../data/mockData';
import { Language } from '../types';
import { MapPin, Globe, Bell, ChevronDown } from 'lucide-react';
import { NotificationsDropdown } from './NotificationsDropdown';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const {
    activeTab,
    setActiveTab,
    selectedLocation,
    setSelectedLocation,
    isNotifOpen,
    setIsNotifOpen,
    notifications,
    user,
    openProfileModal,
  } = useApp();

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isLocMenuOpen, setIsLocMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const locRef = useRef<HTMLDivElement>(null);

  // Auto-close dropdowns when clicking outside
  useEffect(() => {
    const handleDocumentClick = () => {
      setIsLangMenuOpen(false);
      setIsLocMenuOpen(false);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'Dashboard', key: 'navDashboard' },
    { id: 'My Lots', key: 'navMyLots' },
    { id: 'Market Prices', key: 'navMarketPrices' },
    { id: 'Storage Locator', key: 'navStorageLocator' },
    { id: 'Orders', key: 'navOrders' },
    { id: 'Reports', key: 'navReports' },
  ];

  const languages: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'hi', label: 'हिंदी (Hindi)' },
    { id: 'mr', label: 'मराठी (Marathi)' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('Dashboard')}>
          <div className="w-8 h-8 rounded-full bg-[#E6F4EA] flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="#167A42" fillOpacity="0.15"/>
              <path d="M7.5 15.5C9 13.5 11.5 11 15 10.5M15 10.5C14.5 14 12 16.5 10 18M15 10.5L7 18.5" stroke="#167A42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16.5 7.5C14.5 7.5 11 9 9.5 12" stroke="#167A42" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-heading font-extrabold text-xl text-[#167A42] tracking-tight">
              {t('brandName', 'FasalNirnay')}
            </span>
            <span className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase mt-0.5">
              {t('brandTagline', 'AI Crop Decision Engine')}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="hidden lg:flex items-center gap-6 h-full">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative h-full text-sm font-medium transition-colors flex items-center ${
                  isActive ? 'text-[#167A42] font-bold' : 'text-gray-700 hover:text-[#167A42]'
                }`}
              >
                {t(item.key, item.id)}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#167A42] rounded-t-sm" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">

          {/* Location Selector */}
          <div className="relative" ref={locRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLocMenuOpen(!isLocMenuOpen);
                setIsLangMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">{selectedLocation.name}, {selectedLocation.state}</span>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:inline" />
            </button>

            {isLocMenuOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-slideDown border-gray-200/50"
              >
                <div className="px-4 py-1.5 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Location
                </div>
                {mockLocations.map(loc => {
                  const active = selectedLocation.id === loc.id;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setIsLocMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                        active
                          ? 'text-[#167A42] bg-[#E6F4EA]/40 font-bold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#167A42]' : 'bg-transparent'}`} />
                        <span>{loc.name}, {loc.state}</span>
                      </div>
                      {active && (
                        <svg className="w-3.5 h-3.5 text-[#167A42]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weather Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-xs">
            <span>☀️</span>
            <span className="font-bold text-gray-900">26°C</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500 font-medium">Sunny</span>
          </div>

          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLangMenuOpen(!isLangMenuOpen);
                setIsLocMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">{languages.find(l => l.id === language)?.label.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:inline" />
            </button>

            {isLangMenuOpen && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-slideDown border-gray-200/50"
              >
                <div className="px-4 py-1.5 border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Select Language
                </div>
                {languages.map(lang => {
                  const active = language === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id);
                        setIsLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                        active
                          ? 'text-[#167A42] bg-[#E6F4EA]/40 font-bold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#167A42]' : 'bg-transparent'}`} />
                        <span>{lang.label}</span>
                      </div>
                      {active && (
                        <svg className="w-3.5 h-3.5 text-[#167A42]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Icon & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-700 shadow-sm"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && <NotificationsDropdown />}
          </div>

          {/* User Profile & Role Badge */}
          <div className="flex items-center gap-2">
            <div
              onClick={openProfileModal}
              className="flex items-center gap-2 cursor-pointer hover:bg-emerald-50 p-1 px-2.5 rounded-full transition-all border border-emerald-100 hover:border-emerald-300 shadow-sm"
              title="Account & Profile Details"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-emerald-300 bg-gray-100 flex-shrink-0">
                <img
                  src={user.isLoggedIn ? user.avatarUrl : 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&auto=format&fit=crop&q=80'}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=100&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div className="hidden md:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-gray-900">
                  {user.isLoggedIn ? user.name : t('hiFarmer', 'Hi, Farmer')}
                </span>
                <span className="text-[10px] font-extrabold text-[#167A42] bg-emerald-100 px-1.5 py-0.5 rounded-full mt-0.5 w-fit">
                  {user.role || 'Farmer'}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
