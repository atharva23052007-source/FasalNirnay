import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AutoTranslate } from '../context/LanguageContext';
import { Snowflake, MapPin, Star, ArrowRight } from 'lucide-react';

export const StorageLocatorPage: React.FC = () => {
  const { storageFacilities, setSelectedStorageFacility, selectedLocation } = useApp();
  const [cropFilter, setCropFilter] = useState('All');

  const filteredFacilities = storageFacilities.filter((s) => {
    if (cropFilter === 'All') return true;
    return s.suitableCrops.some((c) => c.toLowerCase().includes(cropFilter.toLowerCase()));
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header & Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-2">
            <Snowflake className="w-6 h-6 text-blue-600" />
            <AutoTranslate text="Nearby Cold Storage Locator" />
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            <AutoTranslate text="Verified temperature-controlled warehouses & cold chains near" />{' '}
            <strong><AutoTranslate text={selectedLocation.name} /></strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-600">
            <AutoTranslate text="Filter by Suitable Crop:" />
          </span>
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 bg-gray-50 outline-none"
          >
            <option value="All"><AutoTranslate text="All Crops" /></option>
            <option value="Tomato"><AutoTranslate text="Tomato (10°C–14°C)" /></option>
            <option value="Onion"><AutoTranslate text="Onion (0°C–4°C)" /></option>
            <option value="Leafy Vegetables"><AutoTranslate text="Leafy Vegetables (2°C–6°C)" /></option>
            <option value="Wheat"><AutoTranslate text="Wheat (Dry Grain)" /></option>
          </select>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredFacilities.map((store) => (
          <div
            key={store.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-base text-gray-900">
                    <AutoTranslate text={store.name} />
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {store.rating}
                  </span>
                </div>

                <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> <AutoTranslate text={store.location} /> (
                  <strong>{store.distanceKm} km <AutoTranslate text="away" /></strong>)
                </span>

                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                    <AutoTranslate text="Temp" />: {store.tempRangeCelsius}
                  </span>
                  <span className="bg-gray-100 text-gray-700 font-medium px-2 py-0.5 rounded-md">
                    <AutoTranslate text="Humidity" />: {store.humidityPercent}
                  </span>
                </div>
              </div>
            </div>

            {/* Storage Info Metrics */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-gray-400 text-[10px] font-bold uppercase block">
                  <AutoTranslate text="Total Capacity" />
                </span>
                <span className="font-extrabold text-gray-900 mt-0.5 block">
                  {store.totalCapacityMT.toLocaleString()} MT
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] font-bold uppercase block">
                  <AutoTranslate text="Available Space" />
                </span>
                <span className="font-extrabold text-emerald-700 mt-0.5 block">
                  {store.availableCapacityMT.toLocaleString()} MT
                </span>
              </div>
              <div>
                <span className="text-gray-400 text-[10px] font-bold uppercase block">
                  <AutoTranslate text="Rate / Ton / Day" />
                </span>
                <span className="font-heading font-extrabold text-gray-900 mt-0.5 block">
                  ₹{store.pricePerTonPerDayRs}
                </span>
              </div>
            </div>

            {/* Suitable Crops Tags & Book Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-gray-400">
                  <AutoTranslate text="Suitable For:" />
                </span>
                {store.suitableCrops.map((c, i) => (
                  <span key={i} className="bg-green-50 text-[#167A42] font-bold text-[10.5px] px-2 py-0.5 rounded">
                    <AutoTranslate text={c} />
                  </span>
                ))}
              </div>

              <button
                onClick={() => setSelectedStorageFacility(store)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#167A42] hover:bg-[#126335] text-white font-bold text-xs shadow-sm transition-all"
              >
                <span><AutoTranslate text="Reserve Space" /></span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
