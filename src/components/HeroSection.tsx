import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { MarketOverview } from './MarketOverview';
import { CloudSun } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { t } = useLanguage();
  const { selectedLocation } = useApp();

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-5">
      
      {/* Left Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden min-h-[250px] flex items-end p-6 sm:p-8 shadow-sm bg-emerald-900 border border-emerald-800">
        
        {/* Background Image & Overlay */}
        <img
          src="https://images.unsplash.com/photo-1595273670150-bd0c3c392e46?w=1200&auto=format&fit=crop&q=80"
          alt="Indian Farmer Harvest"
          className="absolute inset-0 w-full h-full object-cover object-[center_30%] z-0 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/20 z-10" />

        {/* Banner Content */}
        <div className="relative z-20 max-w-lg flex flex-col gap-2">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight flex items-center gap-2">
            {t('goodMorning', 'Good Morning, Farmer!')}
          </h1>
          
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight tracking-tight">
            {t('heroSubtitle1', 'Get the best value for your harvest')}<br />
            <span className="text-[#167A42] font-extrabold">{t('heroSubtitle2', '— in one place.')}</span>
          </h2>
          
          <p className="text-xs sm:text-sm text-gray-600 font-medium whitespace-pre-line mt-1">
            {t('heroDesc', 'AI-driven recommendations to sell smarter\nand order what you need.')}
          </p>

          {/* Weather & Location Widget */}
          <div className="mt-3.5 inline-flex items-center gap-4 bg-white/90 backdrop-blur-md border border-white/80 rounded-xl px-4 py-2.5 shadow-sm w-fit">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⛅</span>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-extrabold text-gray-900">28°C</span>
                <span className="text-[11px] font-semibold text-gray-500">{t('partlyCloudy', 'Partly Cloudy')}</span>
              </div>
            </div>
            
            <div className="w-[1px] h-7 bg-gray-200" />
            
            <div className="flex flex-col leading-snug">
              <span className="text-xs font-bold text-gray-900">16 May 2025, 08:30 AM</span>
              <span className="text-[11px] font-medium text-gray-500">
                {selectedLocation.name}, {selectedLocation.state}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Right Market Overview */}
      <MarketOverview />

    </section>
  );
};
