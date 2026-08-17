import React, { useState, useEffect } from 'react';
import { CropRecommendation, FarmerLot } from '../types';
import { useLanguage } from '../context/LanguageContext';
import React from 'react';
import { CropRecommendation } from '../types';
import { useLanguage, AutoTranslate } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { Lightbulb, Scale, X, Recycle } from 'lucide-react';
import { fetchCropImage } from '../utils/imageUtils';

const getWasteToWealthRecommendation = (cropName?: string) => {
  if (!cropName) {
    return 'Sell to nearby wholesalers or processors immediately to minimize losses.';
  }
  const lower = cropName.toLowerCase();
  if (lower.includes('tomato')) {
    return 'Convert to puree, ketchup, or sell to local processing units.';
  }
  if (lower.includes('onion')) {
    return 'Dehydrate into onion flakes/powder or sell to local wholesalers.';
  }
  if (lower.includes('leafy') || lower.includes('spinach') || lower.includes('cabbage')) {
    return 'Dry for culinary use, make organic compost, or sell to local food stalls immediately.';
  }
  if (lower.includes('grape') || lower.includes('pomegranate')) {
    return 'Process into juices, dry them (raisins), or sell to local wineries/beverage factories.';
  }
  if (lower.includes('potato')) {
    return 'Process into potato chips, fries, or sell to snack manufacturers.';
  }
  return 'Sell to nearby wholesalers or processors immediately to minimize losses.';
};

interface ActionCardProps {
  crop: CropRecommendation | FarmerLot;
  onRemove?: (id: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ crop, onRemove }) => {
  const { t } = useLanguage();
  const { setSelectedCropModal, setActiveTab, setSelectedCropToSell } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);
  const [dynamicImage, setDynamicImage] = useState<string>((crop as any).image || '');

  const isLot = 'storageStatus' in crop;
  const resolvedCropName = isLot ? (crop as FarmerLot).cropName : (crop as CropRecommendation).defaultCropName;

  useEffect(() => {
    const loadImage = async () => {
      if ((crop as any).image?.includes('1592924357228')) {
        const pixabayUrl = await fetchCropImage(resolvedCropName);
        if (pixabayUrl) {
          setDynamicImage(pixabayUrl);
        }
      }
    };
    loadImage();
  }, [(crop as any).image, resolvedCropName]);

  const getBorderColor = () => {
    switch ((crop as any).actionType) {
      case 'green': return 'border-t-4 border-t-emerald-600';
      case 'red': return 'border-t-4 border-t-red-600';
      case 'orange': return 'border-t-4 border-t-amber-500';
      default: return 'border-t-4 border-t-gray-400';
    }
  };

  const getAdviceStyles = () => {
    switch ((crop as any).actionType) {
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
      default:
        return {
          bg: 'bg-gray-50',
          label: 'text-gray-700',
          action: 'text-gray-700',
          benefit: 'text-gray-700',
        };
    }
  };

  const getButtonStyles = () => {
    switch ((crop as any).actionType) {
      case 'green':
        return 'border-emerald-600 text-emerald-700 hover:bg-emerald-50';
      case 'red':
        return 'border-red-600 text-red-700 hover:bg-red-50';
      case 'orange':
        return 'border-amber-600 text-amber-800 hover:bg-amber-50';
      default:
        return 'border-gray-600 text-gray-700 hover:bg-gray-50';
    }
  };

  const adviceStyles = getAdviceStyles();
  const cropName = t((crop as any).cropNameKey, (crop as any).defaultCropName);
  const actionText = t((crop as any).actionKey, (crop as any).defaultAction);
  const benefitText = t((crop as any).benefitTextKey, (crop as any).defaultBenefitText);
  const sellTimelineText = t((crop as any).sellTimelineKey, (crop as any).defaultSellTimeline);
  const rationaleText = t((crop as any).rationaleKey, (crop as any).defaultRationale);

  const isHighRisk = (crop as any).spoilageRiskPercent >= 30 || (crop as any).actionType === 'orange' || (crop as any).actionType === 'red';
  const wasteToWealthText = getWasteToWealthRecommendation(resolvedCropName);

  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-5 flex flex-col hover:shadow-md transition-all h-full relative ${getBorderColor()}`}
      className={`bg-white border border-gray-200 rounded-xl p-5 flex flex-col hover:shadow-md transition-all h-full font-sans ${getBorderColor()}`}
    >
      {onRemove && (
        <div className="absolute -top-3 -right-3 z-10 flex flex-col items-end">
          {showConfirm ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-2 mb-1 animate-in fade-in zoom-in-95 duration-200">
              <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">{t('confirmRemove', 'Remove?')}</span>
              <button 
                onClick={() => onRemove(crop.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold transition-colors"
              >
                {t('yes', 'Yes')}
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-[10px] font-bold transition-colors"
              >
                {t('no', 'No')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all shadow-sm"
              title={t('remove', 'Remove')}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Header: Crop Info */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center p-0.5">
            <img
              src={dynamicImage}
              alt={cropName}
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="font-heading font-bold text-lg text-gray-900 leading-tight">
              <AutoTranslate text={cropName} />
            </h3>
            <div className="flex items-center text-xs text-gray-600 gap-2">
              <span className="font-semibold text-gray-800 flex items-center gap-1">
                <Scale className="w-3 h-3 text-gray-500" />
                {(crop.quantityKg || 0).toLocaleString()} kg
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 text-[11.5px]">
                {t('harvested', 'Harvested')}: <AutoTranslate text={crop.harvestDate} />
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
          <AutoTranslate text={actionText} />
        </h4>
        <p className={`text-sm font-medium ${adviceStyles.benefit}`}>
          <AutoTranslate text={benefitText} />
        </p>
      </div>

      {/* Rationale */}
      <div className="flex flex-col gap-1.5 flex-grow mb-5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
          <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" />
          <span>{t('why', 'Why?')}</span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          <AutoTranslate text={rationaleText} />
        </p>
      </div>

      {/* Waste to Wealth Section (Only for High Risk) */}
      {isHighRisk && (
        <div className="flex flex-col gap-1.5 flex-grow mb-5 bg-green-50 p-3 rounded-lg border border-green-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-green-800">
            <Recycle className="w-4 h-4 text-green-600" />
            <span>{t('wasteToWealth', 'Waste to Wealth ♻️')}</span>
          </div>
          <p className="text-xs text-green-700 leading-relaxed font-medium">
            {t('wasteToWealthSuggestion', wasteToWealthText)}
          </p>
        </div>
      )}


      {/* Action Button & Timeline */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
        <div className="flex flex-col">
           <span className="text-xs text-gray-500 font-medium">{sellTimelineText}</span>
           <span className="font-heading font-bold text-sm text-gray-900">{(crop as any).sellDateText}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCropModal(crop as any)}
            className={`inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-bold border transition-all ${getButtonStyles()}`}
          >
            <span>{t('seeDetails', 'See Details')}</span>
          </button>
          <button
            onClick={() => {
              setSelectedCropToSell(crop as any);
              setActiveTab('Sell');
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold text-white bg-[#167A42] hover:bg-[#126335] transition-all shadow-sm"
          >
            Sell Now
          </button>
          <span className="text-xs text-gray-500 font-medium">
            <AutoTranslate text={sellTimelineText} />
          </span>
          <span className="font-heading font-bold text-sm text-gray-900">
            <AutoTranslate text={crop.sellDateText} />
          </span>
        </div>
      </div>
    </div>
  );
};
