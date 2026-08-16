import React from 'react';
import { CropRecommendation } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, ArrowRight, Scale } from 'lucide-react';

interface ActionCardProps {
  crop: CropRecommendation;
}

export const ActionCard: React.FC<ActionCardProps> = ({ crop }) => {
  const { t } = useLanguage();
  const { setSelectedCropModal } = useApp();

  const getBorderColor = () => {
    switch (crop.actionType) {
      case 'green': return 'border-l-4 border-l-emerald-600';
      case 'red': return 'border-l-4 border-l-red-600';
      case 'orange': return 'border-l-4 border-l-amber-500';
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

  const getTimelineStyles = () => {
    switch (crop.actionType) {
      case 'green':
        return {
          bg: 'bg-[#F8FDF9]',
          iconBg: 'bg-emerald-100/70 text-emerald-700',
          icon: <TrendingUp className="w-5.5 h-5.5 text-emerald-700" />,
        };
      case 'red':
        return {
          bg: 'bg-[#FFF9F9]',
          iconBg: 'bg-red-100/70 text-red-700',
          icon: <TrendingDown className="w-5.5 h-5.5 text-red-700" />,
        };
      case 'orange':
        return {
          bg: 'bg-[#FFFDF5]',
          iconBg: 'bg-amber-100/80 text-amber-700',
          icon: <AlertTriangle className="w-5.5 h-5.5 text-amber-700" />,
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
  const timelineStyles = getTimelineStyles();
  const cropName = t(crop.cropNameKey, crop.defaultCropName);
  const actionText = t(crop.actionKey, crop.defaultAction);
  const benefitText = t(crop.benefitTextKey, crop.defaultBenefitText);
  const sellTimelineText = t(crop.sellTimelineKey, crop.defaultSellTimeline);
  const rationaleText = t(crop.rationaleKey, crop.defaultRationale);

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr_1.3fr_1.1fr_1.5fr_1fr] items-center gap-4 sm:gap-5 hover:shadow-md transition-all ${getBorderColor()}`}
    >
      {/* Col 1: Crop Info */}
      <div className="flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center p-0.5">
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
          <div className="flex flex-col text-xs text-gray-600">
            <span className="font-semibold text-gray-800 flex items-center gap-1">
              <Scale className="w-3 h-3 text-gray-500" />
              {crop.quantityKg.toLocaleString()} kg
            </span>
            <span className="text-gray-500 text-[11.5px]">
              {t('harvested', 'Harvested')}: {crop.harvestDate}
            </span>
          </div>
        </div>
      </div>

      {/* Col 2: AI Advice Box */}
      <div className={`rounded-xl p-3.5 px-4 flex flex-col justify-center min-h-[76px] ${adviceStyles.bg}`}>
        <span className={`text-[10.5px] font-extrabold tracking-wider ${adviceStyles.label}`}>
          {t('aiSays', 'AI SAYS')}
        </span>
        <h4 className={`font-heading font-extrabold text-lg tracking-tight leading-tight my-0.5 ${adviceStyles.action}`}>
          {actionText}
        </h4>
        <p className={`text-xs font-medium ${adviceStyles.benefit}`}>
          {benefitText}
        </p>
      </div>

      {/* Col 3: Timeline Box */}
      <div className={`rounded-xl p-3 px-4 flex items-center gap-3 min-h-[76px] ${timelineStyles.bg}`}>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${timelineStyles.iconBg}`}>
          {timelineStyles.icon}
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-xs text-gray-500 font-medium">{sellTimelineText}</span>
          <span className="font-heading font-extrabold text-base text-gray-900">{crop.sellDateText}</span>
          <span className="text-[11.5px] text-gray-600 font-semibold">{t(crop.sellTimeDetail.toLowerCase(), crop.sellTimeDetail)}</span>
        </div>
      </div>

      {/* Col 4: Rationale Box */}
      <div className="flex flex-col gap-1 pr-2">
        <div className="flex items-center gap-1 text-xs font-bold text-gray-900">
          <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>{t('why', 'Why?')}</span>
        </div>
        <p className="text-xs text-gray-700 leading-snug">
          {rationaleText}
        </p>
      </div>

      {/* Col 5: Action Button */}
      <div className="flex justify-start lg:justify-end">
        <button
          onClick={() => setSelectedCropModal(crop)}
          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${getButtonStyles()}`}
        >
          <span>{t('seeDetails', 'See Details')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
