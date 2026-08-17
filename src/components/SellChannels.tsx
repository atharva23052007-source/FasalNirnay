import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import React from 'react';
import { useLanguage, AutoTranslate } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { mockBuyerChannels } from '../data/mockData';
import { Check, ArrowRight, Store, Users, ShoppingBag, X, Phone, MapPin } from 'lucide-react';

const mockDirectBuyers = [
  { id: 1, name: 'Ramesh Agro Traders', distance: '3.2 km', phone: '+91 74990 40709', type: 'Wholesaler', demand: 'High' },
  { id: 2, name: 'Fresh Farms Organics', distance: '5.1 km', phone: '+91 95189 19385', type: 'Retail Chain', demand: 'Medium' },
  { id: 3, name: 'Sahyadri FPCs', distance: '8.4 km', phone: '+91 76543 21098', type: 'FPC / Bulk Buyer', demand: 'High' },
  { id: 4, name: 'Nashik Hotel Suppliers', distance: '12.0 km', phone: '+91 65432 10987', type: 'Institutional Buyer', demand: 'Medium' },
];

export const SellChannels: React.FC = () => {
  const { t } = useLanguage();
  const { setSelectedChannelModal, selectedCropToSell } = useApp();
  const [showBuyersModal, setShowBuyersModal] = useState(false);

  const getChannelGraphic = (type: string) => {
    switch (type) {
      case 'blinkit':
        return (
          <div className="h-20 flex items-center justify-center overflow-hidden">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Blinkit-yellow-app-icon.svg/512px-Blinkit-yellow-app-icon.svg.png"
              alt="Blinkit Quick Commerce Delivery"
              className="h-full max-w-full object-contain drop-shadow-sm rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=300&auto=format&fit=crop&q=80';
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=300&auto=format&fit=crop&q=80';
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
              <span className="absolute -top-1 -right-1 text-[10px] bg-emerald-700 text-white font-extrabold px-1 py-0.5 rounded">
                eNAM
              </span>
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

  const getDynamicPriceMessage = (channelType: string) => {
    if (!selectedCropToSell) return null;
    
    const cropName = selectedCropToSell.defaultCropName;
    const basePrice = selectedCropToSell.currentPriceKg || 18;
    
    switch (channelType) {
      case 'blinkit':
        return `Current Best: ₹${(basePrice * 1.3).toFixed(1)}/kg (${cropName})`;
      case 'swiggy':
        return `High Demand: ₹${(basePrice * 1.25).toFixed(1)}/kg (${cropName})`;
      case 'mandi':
        return `Average: ₹${(basePrice * 0.95).toFixed(1)}/kg (Bulk ${cropName})`;
      case 'direct':
        return `Contract: ₹${(basePrice * 1.1).toFixed(1)}/kg (Flexible ${cropName})`;
      default:
        return null;
    }
  };

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading font-extrabold text-lg sm:text-xl text-[#167A42] tracking-tight">
          {t('sellProduceTitle', 'Sell Your Produce – Reach More Buyers')}
          {selectedCropToSell && (
            <span className="text-gray-500 font-medium ml-2 text-base">for {selectedCropToSell.defaultCropName}</span>
          )}
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
        {mockBuyerChannels.map(channel => {
          const priceMessage = selectedCropToSell ? getDynamicPriceMessage(channel.type) : channel.trendingPriceMessage;

          return (
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
                
                {priceMessage && (
                  <div className="mt-2 inline-flex items-center w-fit gap-1 bg-[#F2FCE8] border border-[#167A42]/30 px-2.5 py-1.5 rounded-lg shadow-sm">
                    <span className="text-[#167A42] font-extrabold text-[11px] tracking-wide">
                      📈 {priceMessage}
                    </span>
                  </div>
                )}
        {mockBuyerChannels.map((channel) => (
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
                  <AutoTranslate text={channel.name} />
                </span>
              )}
              <span className="text-xs text-gray-500 font-medium">
                <AutoTranslate text={channel.subtitle} />
              </span>
            </div>

            {/* Features & Graphic */}
            <div className="flex flex-col gap-3 mt-3">
              <ul className="space-y-1.5">
                {channel.features.map((feat, idx) => (
                  <li key={idx} className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#167A42] stroke-[3]" />
                    <span><AutoTranslate text={feat} /></span>
                  </li>
                ))}
              </ul>

              <div className="my-1">{getChannelGraphic(channel.type)}</div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                let url = '';
                switch (channel.type) {
                  case 'blinkit': url = 'https://blinkit.com/'; break;
                  case 'swiggy': url = 'https://www.swiggy.com/instamart'; break;
                  case 'mandi': url = 'https://enam.gov.in/'; break;
                  case 'direct': 
                    setShowBuyersModal(true); 
                    return;
                }
                if (url) window.open(url, '_blank', 'noopener,noreferrer');
              }}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs transition-all ${getButtonStyles(channel.type)}`}
              onClick={() => setSelectedChannelModal(channel)}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs transition-all ${getButtonStyles(
                channel.type
              )}`}
            >
              <AutoTranslate text={channel.buttonText} />
            </button>
          </div>
          );
        })}
      </div>

      {/* Direct Buyers Modal */}
      {showBuyersModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-heading font-bold text-lg text-gray-900">Nearby Buyers</h3>
              </div>
              <button 
                onClick={() => setShowBuyersModal(false)}
                className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* List */}
            <div className="p-4 overflow-y-auto flex flex-col gap-3">
              {selectedCropToSell && (
                <p className="text-sm text-gray-600 mb-2">
                  Showing buyers interested in <strong>{selectedCropToSell.defaultCropName}</strong>:
                </p>
              )}
              {mockDirectBuyers.map(buyer => (
                <div key={buyer.id} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{buyer.name}</span>
                      <span className="text-xs font-medium text-gray-500">{buyer.type}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${buyer.demand === 'High' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                      {buyer.demand} Demand
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{buyer.distance}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{buyer.phone}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={async () => {
                      const cleanPhone = buyer.phone.replace(/[\s+]/g, '');
                      const cropText = selectedCropToSell ? ` my ${selectedCropToSell.defaultCropName}` : ' my crop';
                      const msg = `Hello ${buyer.name}, I am reaching out from the FasalNirnay app. I would like to sell${cropText} to you in bulk. Are you interested?`;
                      
                      try {
                        const res = await fetch('/api/send-sms', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone: cleanPhone, message: msg })
                        });
                        const data = await res.json();
                        if (data.success) {
                          alert(data.message);
                        } else {
                          alert(data.error);
                        }
                      } catch (err) {
                        alert("Error communicating with backend SMS gateway.");
                      }
                    }}
                    className="w-full mt-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 transition-all font-bold text-sm py-2 rounded-lg"
                  >
                    Contact Buyer
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
