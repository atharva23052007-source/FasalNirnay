import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { mockMarketMetrics } from '../data/mockData';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export const MarketOverview: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="font-heading font-bold text-base text-gray-900">
          {t('marketTitle', "Today's Market Overview")}
        </h3>
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          {t('sourceAgmarknet', 'Source: AGMARKNET')}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3.5 mb-3.5">
        {mockMarketMetrics.map(m => (
          <div
            key={m.id}
            className="bg-[#FAFBFC] border border-[#EDF0F2] rounded-xl p-3.5 flex flex-col gap-1"
          >
            <span className="text-xs font-semibold text-gray-700">{m.cropName}</span>
            
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-2xl font-extrabold text-[#167A42] tracking-tight">
                ₹{m.priceKg.toFixed(2)}
              </span>
              <span className="text-xs font-semibold text-gray-500">/kg</span>
            </div>

            <div className="flex items-center justify-between text-[11.5px] mt-1">
              <span className="text-gray-500 font-medium">{t('modalPrice', 'Modal Price')}</span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  m.isUp ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {m.isUp ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                {m.trendPercent}% {t('vsYesterday', 'vs yesterday')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Arrival Footer */}
      <div className="bg-gray-50 rounded-lg p-2.5 px-3.5 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-900">
          {t('arrivalQty', 'Arrival Quantity (Today)')}
        </span>
        <div className="flex items-center gap-4 text-xs text-gray-700">
          <span className="flex items-center gap-1">
            <span>🍅</span> {t('tomato', 'Tomato')}: <strong className="text-gray-900 font-extrabold">120 MT</strong>
          </span>
          <span className="flex items-center gap-1">
            <span>🧅</span> {t('onion', 'Onion')}: <strong className="text-gray-900 font-extrabold">85 MT</strong>
          </span>
        </div>
      </div>

    </div>
  );
};
