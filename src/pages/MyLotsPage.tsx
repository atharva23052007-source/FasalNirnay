import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Plus, Scale, MapPin, Calendar, Warehouse, Tag } from 'lucide-react';

export const MyLotsPage: React.FC = () => {
  const { farmerLots, setIsAddLotModalOpen } = useApp();
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6">
      
      {/* Page Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight">
            My Harvest Lots
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Manage your registered crops, track storage status, and receive real-time AI sell recommendations.
          </p>
        </div>

        <button
          onClick={() => setIsAddLotModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#167A42] hover:bg-[#126335] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Crop Lot</span>
        </button>
      </div>

      {/* Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {farmerLots.map(lot => (
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
                </span>
              </div>

              {/* Row 2, Column 4 */}
              <div className="flex flex-col gap-1 border-l border-gray-100 pl-4">
                <span className="text-[#4a5568] text-[11px] font-bold uppercase tracking-wider">Est. Net Value</span>
                <span className="text-[#167a42] text-[16px] font-extrabold">₹{lot.estValueRs.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
