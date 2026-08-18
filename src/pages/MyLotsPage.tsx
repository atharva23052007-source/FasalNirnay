import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage, AutoTranslate } from '../context/LanguageContext';
import {
  Plus,
  Scale,
  MapPin,
  Calendar,
  Warehouse,
  Tag,
  Trash2,
  ShieldAlert,
  Search,
  ShieldCheck,
} from 'lucide-react';

export const MyLotsPage: React.FC = () => {
  const { farmerLots, setIsAddLotModalOpen, deleteFarmerLot, user } = useApp();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [approvedLotIds, setApprovedLotIds] = useState<string[]>([]);

  const visibleLots = useMemo(() => {
    let list = farmerLots;
    if (user.role === 'Farmer') {
      list = farmerLots.filter(
        (lot) =>
          !lot.farmerName ||
          lot.farmerName.toLowerCase() === user.name.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (lot) =>
          lot.cropName.toLowerCase().includes(q) ||
          lot.variety.toLowerCase().includes(q) ||
          (lot.farmerName && lot.farmerName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [farmerLots, user, searchQuery]);

  // Role-specific Header Title and Subtitle
  const getHeaderTitle = () => {
    if (user.role === 'NGO/FPO') {
      return 'Consortium Harvest Lots';
    }
    if (user.role === 'Admin') {
      return 'Global Lot Registry (Admin)';
    }
    return 'My Harvest Lots';
  };

  const getHeaderSubtitle = () => {
    if (user.role === 'NGO/FPO') {
      return 'Manage, monitor, and analyze registered crop lots for all member farmers under your group.';
    }
    if (user.role === 'Admin') {
      return 'Monitor, moderate, and verify all registered harvest lots across the system.';
    }
    return 'Manage your registered crops, track storage status, and receive real-time AI sell recommendations.';
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Page Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight">
            <AutoTranslate text={getHeaderTitle()} />
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            <AutoTranslate text={getHeaderSubtitle()} />
          </p>
        </div>

        <button
          onClick={() => setIsAddLotModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#167A42] hover:bg-[#126335] text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>
            <AutoTranslate text="Add New Crop Lot" />
          </span>
        </button>
      </div>

      {/* Search Filter for NGO/FPO/Admin */}
      {(user.role === 'NGO/FPO' || user.role === 'Admin') && (
        <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl p-3 px-4 shadow-sm w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by farmer name, crop, or variety..."
            className="pl-8 w-full text-xs font-semibold text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none"
          />
        </div>
      )}

      {/* Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleLots.length > 0 ? (
          visibleLots.map((lot) => (
            <div
              key={lot.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all w-full flex flex-col gap-4"
            >
              {/* Header section with image and title */}
              <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                  <img
                    src={lot.image}
                    alt={lot.cropName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-extrabold text-gray-900 text-base">
                      {lot.cropName} Lot
                    </h3>
                    <span className="bg-emerald-50 text-[#167A42] text-[10.5px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                      <AutoTranslate text={lot.grade || 'Grade A'} />
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">
                    ID: {lot.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Grid for details */}
              <div className="grid grid-cols-3 gap-3 text-xs bg-gray-50 rounded-xl p-3 border border-gray-100/60">
                <div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase block">
                    Quantity
                  </span>
                  <span className="font-extrabold text-gray-900 mt-0.5 block">
                    {lot.quantityKg.toLocaleString()} kg
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase block">
                    Harvested
                  </span>
                  <span className="font-bold text-gray-800 mt-0.5 block">
                    {lot.harvestDate}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] font-bold uppercase block">
                    Variety
                  </span>
                  <span className="font-bold text-gray-800 mt-0.5 block truncate">
                    {lot.variety || 'Local'}
                  </span>
                </div>
              </div>

              {/* Owner details for NGO/FPO/Admin */}
              {(user.role === 'NGO/FPO' || user.role === 'Admin') && (
                <div className="flex items-center justify-between text-xs bg-blue-50/50 rounded-xl p-3 border border-blue-100/40">
                  <div>
                    <span className="text-gray-400 text-[9px] font-bold uppercase block">
                      Farmer Name
                    </span>
                    <span className="font-extrabold text-blue-900 mt-0.5 block">
                      {lot.farmerName || 'Self (Demo Farmer)'}
                    </span>
                  </div>
                  {user.role === 'Admin' && (
                    <div>
                      <span className="text-gray-400 text-[9px] font-bold uppercase block text-right">
                        Verification
                      </span>
                      <span className="mt-0.5 block">
                        {approvedLotIds.includes(lot.id) ? (
                          <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-green-600" />{' '}
                            Verified
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setApprovedLotIds((prev) => [...prev, lot.id]);
                              alert(
                                `Lot for ${
                                  lot.cropName
                                } (${lot.id
                                  .slice(-6)
                                  .toUpperCase()}) approved successfully!`
                              );
                            }}
                            className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full hover:bg-blue-100 transition"
                          >
                            Approve
                          </button>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Row for Recommendation & Storage */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="border border-gray-100 rounded-xl p-3 bg-white flex flex-col justify-between">
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase block">
                      Storage Status
                    </span>
                    <span className="font-bold text-gray-900 flex items-center gap-1 mt-1">
                      <Warehouse className="w-3.5 h-3.5 text-[#167A42]" />
                      <AutoTranslate text={lot.storageStatus || 'On Farm'} />
                    </span>
                  </div>
                </div>
                <div className="border border-gray-100 rounded-xl p-3 bg-white flex flex-col justify-between">
                  <div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase block">
                      Est. Market Value
                    </span>
                    <span className="font-heading font-extrabold text-[#167A42] text-sm mt-1 block">
                      ₹
                      {lot.estValueRs
                        ? lot.estValueRs.toLocaleString()
                        : (lot.quantityKg * 20).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Spoilage Risk & AI Action block */}
              {lot.recommendation && (
                <div className="bg-emerald-50/40 border border-emerald-100/60 rounded-xl p-3 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="text-gray-400 text-[9.5px] font-bold uppercase block">
                        AI Advice
                      </span>
                      <span className="font-bold text-emerald-800">
                        <AutoTranslate
                          text={lot.recommendation.defaultAction}
                        />
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-[9.5px] font-bold uppercase block">
                      Spoilage Risk
                    </span>
                    <span className="font-bold text-amber-700">
                      {lot.recommendation.spoilageRiskPercent}%
                    </span>
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1">
                <span className="text-gray-500 flex items-center gap-1 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />{' '}
                  <AutoTranslate text={lot.location} />
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to remove the lot for ${lot.cropName}?`
                        )
                      ) {
                        deleteFarmerLot(lot.id);
                      }
                    }}
                    className="text-red-600 hover:text-red-800 font-bold transition-all text-xs flex items-center gap-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />{' '}
                    <AutoTranslate text="Remove" />
                  </button>
                  <button
                    onClick={() =>
                      alert(`AI analysis refreshed for ${lot.cropName}`)
                    }
                    className="text-[#167A42] font-bold text-xs hover:underline"
                  >
                    <AutoTranslate text="Analyze Lot →" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-white border border-gray-200 rounded-3xl p-12 text-center shadow-sm">
            <Warehouse className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="font-heading font-extrabold text-lg text-gray-900">
              No harvest lots found
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-2">
              {user.role === 'Farmer'
                ? "You haven't registered any crop lots yet. Click 'Add New Crop Lot' to record your harvest."
                : "No matching harvest lots found for the search query or active filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
