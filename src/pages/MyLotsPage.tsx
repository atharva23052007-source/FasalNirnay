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
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                <img src={lot.image} alt={lot.cropName} className="w-full h-full object-cover" />
              </div>

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
            </div>

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
            </div>

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
