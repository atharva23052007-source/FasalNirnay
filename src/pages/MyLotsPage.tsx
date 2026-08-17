import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage, AutoTranslate } from '../context/LanguageContext';
import { Plus, Scale, MapPin, Calendar, Warehouse, Tag, Trash2 } from 'lucide-react';

export const MyLotsPage: React.FC = () => {
  const { farmerLots, setIsAddLotModalOpen, deleteFarmerLot } = useApp();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight">
            <AutoTranslate text="My Harvest Lots" />
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            <AutoTranslate text="Manage your registered crops, track storage status, and receive real-time AI sell recommendations." />
          </p>
        </div>

        <button
          onClick={() => setIsAddLotModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#167A42] hover:bg-[#126335] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span><AutoTranslate text="Add New Crop Lot" /></span>
        </button>
      </div>

      {/* Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {farmerLots.map((lot) => (
          <div
            key={lot.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all w-full flex flex-col gap-4"
          >
            {/* Header section with image and title */}
            <div className="flex items-center gap-4 border-b border-gray-50 pb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                <img 
                  src={lot.image} 
                  alt={lot.cropName} 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
              <div className="flex items-center gap-3">
                <h3 className="font-heading font-extrabold text-[#1a202c] text-[17px]">
                  {lot.cropName} Lot - {lot.id.slice(-4).toUpperCase()}
                </h3>
                <span className="bg-[#e6f4ea] text-[#167a42] text-[11px] font-bold px-2.5 py-1 rounded-full">
                  Active
                </span>
              </div>
            </div>

            {/* Grid for details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
              {/* Column 1 */}
              <div className="flex flex-col gap-1">
                <span className="text-[#4a5568] text-[11px] font-bold uppercase tracking-wider">Qty</span>
                <span className="text-[#1a202c] text-[15px] font-extrabold">{lot.quantityKg.toLocaleString()} kg</span>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-1 md:border-r md:border-gray-100 md:pr-4">
                <span className="text-[#4a5568] text-[11px] font-bold uppercase tracking-wider">Harvest Date</span>
                <span className="text-[#1a202c] text-[15px] font-extrabold">{lot.harvestDate}</span>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col gap-1 md:pl-2">
                <span className="text-[#4a5568] text-[11px] font-bold uppercase tracking-wider">Shelf Life Left</span>
                <span className="text-[#1a202c] text-[15px] font-extrabold">{lot.recommendation?.shelfLifeDays || 3} days</span>
                {/* Progress bar simulation */}
                <div className="h-1 w-full bg-gray-200 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-green-500 w-2/3 rounded-full"></div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-lg text-gray-900">
                    <AutoTranslate text={lot.cropName} />
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    <AutoTranslate text={lot.grade} />
                  </span>
                </div>

                <span className="text-xs font-semibold text-gray-500">
                  <AutoTranslate text="Variety" />: <AutoTranslate text={lot.variety} />
                </span>

                <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                  <span className="flex items-center gap-1 font-bold text-gray-900">
                    <Scale className="w-3.5 h-3.5 text-gray-400" /> {lot.quantityKg.toLocaleString()} kg
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> <AutoTranslate text={lot.harvestDate} />
                  </span>
                </div>
              </div>

              {/* Column 4 */}
              <div className="flex flex-col gap-1 border-l border-gray-100 pl-4">
                <span className="text-[#167a42] text-[11px] font-bold uppercase tracking-wider">AI Recommendation</span>
                <span className="text-[#167a42] text-[15px] font-extrabold">{lot.recommendation?.defaultAction || 'HOLD 2 DAYS'}</span>
              </div>

              {/* Row 2, Column 1 */}
              <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
                <span className="text-[#4a5568] text-[11px] font-bold uppercase tracking-wider">Location</span>
                <span className="text-[#1a202c] text-[15px] font-extrabold">{lot.location}</span>
              </div>

              {/* Spacer for grid alignment */}
              <div className="hidden md:block md:border-r md:border-gray-100"></div>

              {/* Row 2, Column 3 */}
              <div className="flex flex-col gap-1 md:pl-2">
                <span className="text-[#4a5568] text-[11px] font-bold uppercase tracking-wider">Spoilage Risk</span>
                <span className="text-[#dd6b20] text-[15px] font-extrabold flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#dd6b20]">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  {lot.recommendation?.spoilageRiskPercent || 9}%
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400 text-[10.5px] font-bold uppercase block">
                  <AutoTranslate text="Storage Status" />
                </span>
                <span className="font-bold text-gray-900 flex items-center gap-1 mt-0.5">
                  <Warehouse className="w-3.5 h-3.5 text-[#167A42]" /> <AutoTranslate text={lot.storageStatus} />
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10.5px] font-bold uppercase block">
                  <AutoTranslate text="Estimated Market Value" />
                </span>
                <span className="font-heading font-extrabold text-emerald-700 text-sm mt-0.5 block">
                  ₹{lot.estValueRs.toLocaleString()}
                </span>
              </div>

              {/* Row 2, Column 4 */}
              <div className="flex flex-col gap-1 border-l border-gray-100 pl-4">
                <span className="text-[#4a5568] text-[11px] font-bold uppercase tracking-wider">Est. Net Value</span>
                <span className="text-[#167a42] text-[16px] font-extrabold">₹{lot.estValueRs.toLocaleString()}</span>
            <div className="flex items-center justify-between pt-1 text-xs border-t border-gray-100 mt-2 pt-3">
              <span className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> <AutoTranslate text={lot.location} />
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove the lot for ${lot.cropName}?`)) {
                      deleteFarmerLot(lot.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-800 font-bold transition-all text-[11px] flex items-center gap-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> <AutoTranslate text="Remove" />
                </button>
                <button
                  onClick={() => alert(`AI analysis refreshed for ${lot.cropName}`)}
                  className="text-[#167A42] font-bold hover:underline"
                >
                  <AutoTranslate text="Analyze Lot →" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
