import React, { useState, useEffect, useMemo } from 'react';
import { mockMarketPricesDetails } from '../data/mockData';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { AutoTranslate, useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';

const STATES_OF_INDIA = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export const MarketPricesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCropFilter, setSelectedCropFilter] = useState('All');
  const [prices, setPrices] = useState<any[]>(mockMarketPricesDetails);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  const { farmerLots, user } = useApp();

  const lat = user?.coordinates?.lat;
  const lon = user?.coordinates?.lon;

  useEffect(() => {
    if (!lat || !lon) {
      setPrices([]);
      setIsLoading(false);
      return;
    }

    fetch(`/api/market-prices?lat=${lat}&lon=${lon}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setPrices(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load live prices:', err);
        setPrices([]); // Fallback to empty if real fetch fails
        setIsLoading(false);
      });
  }, [lat, lon]);

  const normalizeCropName = (name: string) => {
    if (!name) return '';
    const lower = name.toLowerCase();
    if (lower.includes('tomato')) return 'tomato';
    if (lower.includes('onion')) return 'onion';
    if (lower.includes('spinach')) return 'spinach';
    if (lower.includes('pomegranate')) return 'pomegranate';
    if (lower.includes('potato')) return 'potato';
    if (lower.includes('wheat')) return 'wheat';
    if (lower.includes('maize') || lower.includes('corn')) return 'maize';
    return name.replace(/\s*[(&].*$/, '').trim().toLowerCase();
  };

  const farmerCrops = useMemo(() => Array.from(new Set(farmerLots.map((lot) => normalizeCropName(lot.cropName)))), [farmerLots]);

  const bestPrices = useMemo(() => {
    const best = new Map<string, string>();
    farmerCrops.forEach(crop => {
      let maxModal = 0;
      let bestId: string | null = null;
      prices.forEach(p => {
         if (normalizeCropName(p.crop) === crop && p.modalPrice > maxModal) {
           maxModal = p.modalPrice;
           bestId = p.id;
         }
      });
      if (bestId) best.set(crop, bestId);
    });
    return best;
  }, [prices, farmerCrops]);

  const filteredPrices = prices.filter((p) => {
    const matchesSearch =
      p.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mandi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'All' || p.state === selectedState;
    const matchesCrop = selectedCropFilter === 'All' || normalizeCropName(p.crop) === selectedCropFilter;
    return matchesSearch && matchesState && matchesCrop;
  });

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header & Controls */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight">
            <AutoTranslate text="Live APMC Mandi Prices" />
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            <AutoTranslate text="Real-time price feed aggregated from 120+ Mandi APMCs (Source: AGMARKNET)." />
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t('searchCropOrMandi', 'Search crop or mandi...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs bg-gray-50 focus:ring-2 focus:ring-[#167A42] outline-none w-56 font-medium text-gray-900"
            />
          </div>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#167A42]/20"
          >
            <option value="All"><AutoTranslate text="All States" /></option>
            {STATES_OF_INDIA.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        
        {farmerCrops.length > 0 && (
          <div className="w-full flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 flex-wrap">
            <span className="text-xs font-bold text-gray-500 mr-2"><AutoTranslate text="Your Lots:" /></span>
            <button
              onClick={() => setSelectedCropFilter('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedCropFilter === 'All' ? 'bg-[#167A42] text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}
            >
              <AutoTranslate text="All" />
            </button>
            {farmerCrops.map(c => (
               <button
                 key={c}
                 onClick={() => setSelectedCropFilter(c)}
                 className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors capitalize ${selectedCropFilter === c ? 'bg-[#167A42] text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}
               >
                 <AutoTranslate text={c} />
               </button>
            ))}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-sm text-center">
          <p className="text-gray-500 font-medium"><AutoTranslate text="Loading market prices..." /></p>
        </div>
      ) : (!lat || !lon) ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-sm text-center flex flex-col items-center">
          <h3 className="text-gray-700 font-bold text-lg mb-1"><AutoTranslate text="Location Required" /></h3>
          <p className="text-gray-500 font-medium text-sm"><AutoTranslate text="Please enable GPS or select a location during login to view local market prices." /></p>
        </div>
      ) : filteredPrices.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-sm text-center">
          <p className="text-gray-500 font-medium"><AutoTranslate text="No mandi price data found for your district today. Please try searching another state." /></p>
        </div>
      ) : (
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
              <tr>
                <th className="py-3.5 px-6"><AutoTranslate text="Commodity / Crop" /></th>
                <th className="py-3.5 px-6"><AutoTranslate text="Mandi APMC" /></th>
                <th className="py-3.5 px-6"><AutoTranslate text="Distance" /></th>
                <th className="py-3.5 px-6"><AutoTranslate text="Min Price" /></th>
                <th className="py-3.5 px-6"><AutoTranslate text="Max Price" /></th>
                <th className="py-3.5 px-6"><AutoTranslate text="Modal Rate (/kg)" /></th>
                <th className="py-3.5 px-6"><AutoTranslate text="24h Change" /></th>
                <th className="py-3.5 px-6"><AutoTranslate text="Arrival Qty" /></th>
                <th className="py-3.5 px-6 text-right"><AutoTranslate text="Last Sync" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {filteredPrices.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <AutoTranslate text={p.crop} />
                      {Array.from(bestPrices.values()).includes(p.id) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-100 text-amber-800 tracking-wide uppercase whitespace-nowrap">
                          ⭐ Best Price
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    <span className="font-semibold block"><AutoTranslate text={p.mandi} /></span>
                    <span className="block text-[10.5px] text-gray-400"><AutoTranslate text={p.state} /></span>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-500 whitespace-nowrap">
                    {p.distanceKm !== null && p.distanceKm !== undefined ? `${p.distanceKm} km` : '-'}
                  </td>
                  <td className="py-4 px-6 text-gray-600">₹{p.minPrice.toFixed(2)}</td>
                  <td className="py-4 px-6 text-gray-600">₹{p.maxPrice.toFixed(2)}</td>
                  <td className="py-4 px-6 font-heading font-extrabold text-sm text-[#167A42]">
                    ₹{p.modalPrice.toFixed(2)}
                  </td>
                  <td className="py-4 px-6 text-gray-400 font-medium">
                    {p.priceChangePercent === 0 ? '-' : (
                      <span
                        className={`inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-full ${
                          p.priceChangePercent > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {p.priceChangePercent > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(p.priceChangePercent)}%
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-semibold">{p.arrivalQtyMT ? `${p.arrivalQtyMT} MT` : '-'}</td>
                  <td className="py-4 px-6 text-right text-gray-400 text-[11px]"><AutoTranslate text={p.lastUpdated} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 border-t border-gray-200 p-3 text-center">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest"><AutoTranslate text="Data Source: AGMARKNET / Government of India" /></p>
        </div>
      </div>
      )}
    </div>
  );
};
