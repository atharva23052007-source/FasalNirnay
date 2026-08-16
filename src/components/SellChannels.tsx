import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { mockBuyerChannels } from '../data/mockData';
import { Check, ArrowRight, Store, Users, ShoppingBag } from 'lucide-react';

export const SellChannels: React.FC = () => {
  const { t } = useLanguage();
  const { setSelectedChannelModal } = useApp();

  const getChannelGraphic = (type: string) => {
    switch (type) {
      case 'blinkit':
        return (
          <div className="h-20 flex items-center justify-center overflow-hidden">
            <img
              src="/assets/scooter.jpg"
              alt="Blinkit Quick Commerce Delivery Rider"
              className="h-full max-w-full object-contain drop-shadow-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=300&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        );
      case 'swiggy':
        return (
          <div className="h-20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-100/70 border border-orange-200 flex items-center justify-center relative shadow-2xs">
              <ShoppingBag className="w-8 h-8 text-orange-600" />
              <span className="absolute -top-1 -right-1 text-sm">🥦</span>
            </div>
          </div>
        );
      case 'mandi':
        return (
          <div className="h-20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center relative shadow-2xs">
              <Store className="w-8 h-8 text-emerald-700" />
              <span className="absolute -top-1 -right-1 text-[10px] bg-emerald-700 text-white font-extrabold px-1 py-0.5 rounded">eNAM</span>
            </div>
          </div>
        );
      case 'direct':
        return (
          <div className="h-20 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-100/70 border border-blue-200 flex items-center justify-center relative shadow-2xs">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="absolute -bottom-1 -right-1 text-sm">🤝</span>
            </div>
          </div>
        );
    }
  };

  const getButtonStyles = (type: string) => {
    switch (type) {
      case 'blinkit':
        return 'bg-[#0e6231] text-white hover:bg-[#0b4e27]';
      case 'swiggy':
        return 'bg-[#f25c05] text-white hover:bg-[#d95204]';
      case 'mandi':
        return 'bg-[#055a29] text-white hover:bg-[#044720]';
      case 'direct':
        return 'bg-white border border-blue-600 text-blue-600 hover:bg-blue-50';
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#167A42] tracking-tight">
          {t('sellProduceTitle', 'Sell Your Produce – Reach More Buyers')}
        </h2>
        <a
          href="#channels"
          className="text-xs font-bold text-[#167A42] hover:underline flex items-center gap-1"
        >
          <span>{t('viewAllChannels', 'View All Channels')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockBuyerChannels.map(channel => (
          <div
            key={channel.id}
            className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            
            {/* Header */}
            <div className="flex flex-col gap-1">
              {channel.type === 'blinkit' ? (
                <div className="bg-[#ffc107] px-2 py-0.5 rounded text-black font-black text-sm w-fit tracking-tight">
                  blinkit
                </div>
              ) : (
                <span className="font-heading font-bold text-base text-gray-900">
                  {channel.name}
                </span>
              )}
              <span className="text-xs text-gray-500 font-medium">
                {channel.subtitle}
              </span>
            </div>

            {/* Features & Graphic */}
            <div className="flex flex-col gap-3">
              <ul className="space-y-1.5">
                {channel.features.map((feat, idx) => (
                  <li key={idx} className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#167A42] stroke-[3]" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <div className="my-1">
                {getChannelGraphic(channel.type)}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => setSelectedChannelModal(channel)}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs transition-all ${getButtonStyles(channel.type)}`}
            >
              {t(`sellOn${channel.name.replace(/\s+/g, '')}`, channel.buttonText)}
            </button>

          </div>
        ))}
      </div>

    </section>
  );
};
