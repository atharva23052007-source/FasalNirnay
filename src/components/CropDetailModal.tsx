import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { X, TrendingUp, AlertTriangle, ShieldCheck, DollarSign, Clock } from 'lucide-react';

export const CropDetailModal: React.FC = () => {
  const { selectedCropModal, setSelectedCropModal } = useApp();
  const { t } = useLanguage();

  if (!selectedCropModal) return null;

  const crop = selectedCropModal;
  const cropName = t(crop.cropNameKey, crop.defaultCropName);
  const actionText = t(crop.actionKey, crop.defaultAction);
  const detailedAnalysis = t(crop.detailedAnalysisKey, crop.defaultDetailedAnalysis);

  const totalCosts = crop.costsBreakdown.harvestCost + crop.costsBreakdown.storageCost + crop.costsBreakdown.transportCost;
  const grossRevenue = crop.quantityKg * crop.expectedPriceKg;
  const netIncome = grossRevenue - totalCosts;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedCropModal(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
            <img src={crop.image} alt={cropName} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-xl text-gray-900">{cropName}</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> AI Recommended
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">
              Lot Size: <strong>{crop.quantityKg.toLocaleString()} kg</strong> | Harvested: <strong>{crop.harvestDate}</strong>
            </p>
          </div>
        </div>

        {/* Key Recommendation Card */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase">Recommended Action</span>
            <div className="font-heading font-extrabold text-base text-emerald-800 mt-0.5">{actionText}</div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase">Optimal Window</span>
            <div className="font-heading font-extrabold text-base text-gray-900 mt-0.5">{crop.sellDateText}</div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase">Expected Target Price</span>
            <div className="font-heading font-extrabold text-base text-emerald-700 mt-0.5">₹{crop.expectedPriceKg.toFixed(2)}/kg</div>
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 uppercase">Net Expected Profit</span>
            <div className="font-heading font-extrabold text-base text-emerald-800 mt-0.5">₹{netIncome.toLocaleString()}</div>
          </div>
        </div>

        {/* Spoilage & Shelf Life Gauges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                {t('spoilageRisk', 'Spoilage Risk Index')}
              </span>
              <span className="text-xs font-extrabold text-gray-900">{crop.spoilageRiskPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden mb-1">
              <div
                className={`h-full rounded-full transition-all ${
                  crop.spoilageRiskPercent > 50 ? 'bg-red-500' : crop.spoilageRiskPercent > 25 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${crop.spoilageRiskPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-gray-500">
              Estimated safe holding period: <strong>{crop.shelfLifeDays} days</strong>
            </span>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-500" />
                {t('costsBreakdown', 'Costs Breakdown')}
              </span>
              <span className="text-xs font-extrabold text-gray-900">Total ₹{totalCosts.toLocaleString()}</span>
            </div>
            <div className="text-[11.5px] text-gray-600 space-y-1 mt-1">
              <div className="flex justify-between">
                <span>Harvesting & Labor:</span>
                <span className="font-semibold">₹{crop.costsBreakdown.harvestCost}</span>
              </div>
              <div className="flex justify-between">
                <span>Cold Storage & Holding:</span>
                <span className="font-semibold">₹{crop.costsBreakdown.storageCost}</span>
              </div>
              <div className="flex justify-between">
                <span>Transport & Logistics:</span>
                <span className="font-semibold">₹{crop.costsBreakdown.transportCost}</span>
              </div>
            </div>
          </div>

        </div>

        {/* 7-Day Price Trend Chart */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
          <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            7-Day Mandi Price Trend & AI Projection
          </h4>

          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
            {crop.priceTrend.map((pt, idx) => (
              <div key={idx} className="bg-white p-2 rounded-lg border border-gray-100 shadow-2xs">
                <span className="text-[10px] text-gray-500 font-medium block truncate">{pt.day}</span>
                <span className="text-xs font-extrabold text-emerald-700 block mt-0.5">₹{pt.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Market Rationale & Action Button */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-gray-900 mb-1">AI Recommendation Context</h4>
          <p className="text-xs text-gray-600 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100">
            {detailedAnalysis}
          </p>
        </div>

        <button
          onClick={() => {
            alert(`Confirmed recommendation for ${cropName}! Market logistics hold placed.`);
            setSelectedCropModal(null);
          }}
          className="w-full py-3 bg-[#167A42] hover:bg-[#126335] text-white font-bold text-sm rounded-xl transition-all shadow-md"
        >
          {t('confirmAction', 'Accept & Initiate Recommendation')}
        </button>

      </div>
    </div>
  );
};
