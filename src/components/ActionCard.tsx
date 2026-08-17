import React from 'react';
import { CropRecommendation } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { Lightbulb, ArrowRight, Scale } from 'lucide-react';

interface ActionCardProps {
  crop: CropRecommendation;
}

export const ActionCard: React.FC<ActionCardProps> = ({ crop }) => {
  const { t } = useLanguage();
  const { setSelectedCropModal } = useApp();

  const getBorderColor = () => {
    switch (crop.actionType) {
      case 'green': return 'border-t-4 border-t-emerald-600';
      case 'red': return 'border-t-4 border-t-red-600';
      case 'orange': return 'border-t-4 border-t-amber-500';
    }
  };

  const getAdviceStyles = () => {
    switch (crop.actionType) {
      case 'green':
        return {
          bg: 'bg-emerald-50',
          label: 'text-emerald-700',
          action: 'text-emerald-700',
          benefit: 'text-emerald-700',
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          label: 'text-red-700',
          action: 'text-red-700',
          benefit: 'text-red-700',
        };
      case 'orange':
        return {
          bg: 'bg-amber-50',
          label: 'text-amber-800',
          action: 'text-amber-800',
          benefit: 'text-amber-800',
        };
    }
  };



  const getButtonStyles = () => {
    switch (crop.actionType) {
      case 'green':
        return 'border-emerald-600 text-emerald-700 hover:bg-emerald-50';
      case 'red':
        return 'border-red-600 text-red-700 hover:bg-red-50';
      case 'orange':
        return 'border-amber-600 text-amber-800 hover:bg-amber-50';
    }
  };

  const adviceStyles = getAdviceStyles();
  const cropName = t(crop.cropNameKey, crop.defaultCropName);
  const actionText = t(crop.actionKey, crop.defaultAction);
  const benefitText = t(crop.benefitTextKey, crop.defaultBenefitText);
  const sellTimelineText = t(crop.sellTimelineKey, crop.defaultSellTimeline);
  const rationaleText = t(crop.rationaleKey, crop.defaultRationale);

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-5 flex flex-col hover:shadow-md transition-all h-full ${getBorderColor()}`}
    >
      {/* Header: Crop Info */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center p-0.5">
            <img
              src={crop.image}
              alt={cropName}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                // Fallback SVG image if Unsplash fails
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="font-heading font-bold text-lg text-gray-900 leading-tight">
              {cropName}
            </h3>
            <div className="flex items-center text-xs text-gray-600 gap-2">
              <span className="font-semibold text-gray-800 flex items-center gap-1">
                <Scale className="w-3 h-3 text-gray-500" />
                {crop.quantityKg.toLocaleString()} kg
              </span>
            </div>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${adviceStyles.bg} ${adviceStyles.label}`}>
          {t('aiSays', 'AI SAYS')}
        </div>
      </div>

      {/* Action Advice */}
      <div className="flex flex-col gap-1 mb-4">
        <h4 className={`font-heading font-extrabold text-2xl tracking-tight leading-tight ${adviceStyles.action}`}>
          {actionText}
        </h4>
        <p className={`text-sm font-medium ${adviceStyles.benefit}`}>
          {benefitText}
        </p>
      </div>

      {/* Rationale */}
      <div className="flex flex-col gap-1.5 flex-grow mb-5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
          <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>{t('why', 'Why?')}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {rationaleText}
        </p>
      </div>

      {/* Action Button & Timeline */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
           <span className="text-xs text-gray-500 font-medium">{sellTimelineText}</span>
           <span className="font-heading font-bold text-sm text-gray-900">{crop.sellDateText}</span>
        </div>
        <button
          onClick={() => setSelectedCropModal(crop)}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${getButtonStyles()}`}
        >
          <span>{t('seeDetails', 'See Details')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
