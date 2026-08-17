import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { mockCropRecommendations } from '../data/mockData';
import { ActionCard } from './ActionCard';
import { Info } from 'lucide-react';

export const BestActions: React.FC = () => {
  const { t } = useLanguage();
  const { setIsWhyModalOpen } = useApp();

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E6F4EA] flex items-center justify-center flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#167A42" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>
          
          <div>
            <h2 className="font-heading font-extrabold text-xl text-gray-900 tracking-tight leading-tight">
              {t('bestActionsTitle', "Today's Best Actions")}
            </h2>
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-0.5">
              {t('bestActionsSubtitle', 'AI suggests the best action to get you maximum profit.')}
              <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsWhyModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-blue-500 text-blue-600 text-xs font-bold hover:bg-blue-50 transition-all self-start sm:self-auto"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{t('whyTheseActions', 'Why these actions?')}</span>
        </button>

      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockCropRecommendations.map(crop => (
          <ActionCard key={crop.id} crop={crop} />
        ))}
      </div>

    </section>
  );
};
