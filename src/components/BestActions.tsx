import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { mockCropRecommendations } from '../data/mockData';
import { ActionCard } from './ActionCard';
import { Info, Plus } from 'lucide-react';

export const BestActions: React.FC = () => {
  const { t } = useLanguage();
  const { setIsWhyModalOpen, setIsAddLotModalOpen, cropRecommendations, removeCropRecommendation } = useApp();

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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddLotModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addLot', 'Add Lot')}</span>
          </button>
          <button
            onClick={() => setIsWhyModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-blue-500 text-blue-600 text-xs font-bold hover:bg-blue-50 transition-all"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{t('whyTheseActions', 'Why these actions?')}</span>
          </button>
        </div>

      </div>

      {/* Cards List or Empty State */}
      {cropRecommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-center">
          <div className="w-16 h-16 mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-gray-900 font-bold text-lg mb-2">No Harvest Lots Found</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-5">
            You haven't added any harvest lots yet. Add your crop details to receive personalized AI recommendations on when and where to sell.
          </p>
          <button
            onClick={() => setIsAddLotModalOpen(true)}
            className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm"
          >
            Add Your First Lot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cropRecommendations.map(crop => (
            <ActionCard key={crop.id} crop={crop} onRemove={removeCropRecommendation} />
          ))}
        </div>
      )}

    </section>
  );
};
