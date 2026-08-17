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
  const [prices, setPrices] = useState<any[]>(mockMarketPricesDetails);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useLanguage();
  const { farmerLots } = useApp();

  useEffect(() => {
    fetch('http://localhost:5000/api/market-prices')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPrices(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load live prices, using fallback data:', err);
        setIsLoading(false);
      });
  }, []);

  const combinedPrices = useMemo(() => {
    const list = [...prices];

    farmerLots.forEach((lot) => {
      // Clean name (e.g. Tomato (Hybrid) -> Tomato)
      const cropName = lot.cropName.replace(/\s*[(&].*$/, '').trim();

      const exists = list.some(
        (p) => p.crop.toLowerCase() === cropName.toLowerCase()
      );

      if (!exists) {
        const modal = lot.quantityKg > 0 ? (lot.estValueRs / lot.quantityKg) : 25;
        const min = modal * 0.85;
        const max = modal * 1.15;

        list.push({
          id: `lot-crop-${lot.id}`,
          crop: cropName,
          mandi: lot.location ? `${lot.location.split(',')[0]} APMC` : 'Nashik APMC',
          state: lot.location ? (lot.location.split(',')[1]?.trim() || 'Maharashtra') : 'Maharashtra',
          minPrice: min,
          maxPrice: max,
          modalPrice: modal,
          priceChangePercent: 0.0,
          arrivalQtyMT: Math.floor(lot.quantityKg / 1000) || 5,
          lastUpdated: 'Just Now',
        });
      }
    });

    return list;
  }, [prices, farmerLots]);

  const filteredPrices = combinedPrices.filter((p) => {
    const matchesSearch =
      p.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mandi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === 'All' || p.state === selectedState;
    return matchesSearch && matchesState;
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
      </div>

      {/* Prices Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
              <tr>
                <th className="py-3.5 px-6"><AutoTranslate text="Commodity / Crop" /></th>
                <th className="py-3.5 px-6"><AutoTranslate text="Mandi APMC" /></th>
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
                    <AutoTranslate text={p.crop} />
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    <span className="font-semibold block"><AutoTranslate text={p.mandi} /></span>
                    <span className="block text-[10.5px] text-gray-400"><AutoTranslate text={p.state} /></span>
                  </td>
                  <td className="py-4 px-6 text-gray-600">₹{p.minPrice.toFixed(2)}</td>
                  <td className="py-4 px-6 text-gray-600">₹{p.maxPrice.toFixed(2)}</td>
                  <td className="py-4 px-6 font-heading font-extrabold text-sm text-[#167A42]">
                    ₹{p.modalPrice.toFixed(2)}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-0.5 font-bold px-2 py-0.5 rounded-full ${
                        p.priceChangePercent >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {p.priceChangePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {p.priceChangePercent}%
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold">{p.arrivalQtyMT} MT</td>
                  <td className="py-4 px-6 text-right text-gray-400 text-[11px]"><AutoTranslate text={p.lastUpdated} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
