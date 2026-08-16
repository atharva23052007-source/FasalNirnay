import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, Snowflake, MapPin, Calendar } from 'lucide-react';

export const BookStorageModal: React.FC = () => {
  const { selectedStorageFacility, setSelectedStorageFacility } = useApp();
  const [reservedMT, setReservedMT] = useState<number>(5);
  const [days, setDays] = useState<number>(7);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!selectedStorageFacility) return null;

  const store = selectedStorageFacility;
  const totalCost = reservedMT * store.pricePerTonPerDayRs * days;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedStorageFacility(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedStorageFacility(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-gray-900">Cold Storage Reserved!</h3>
            <p className="text-xs text-gray-500 max-w-xs">
              Reservation confirmed at <strong>{store.name}</strong> for {reservedMT} MT ({days} days).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Snowflake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-gray-900">{store.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {store.location} ({store.distanceKm} km)
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-xs text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Temperature Control:</span>
                  <strong className="text-blue-800">{store.tempRangeCelsius}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Daily Rate:</span>
                  <strong className="text-gray-900">₹{store.pricePerTonPerDayRs} / MT / Day</strong>
                </div>
                <div className="flex justify-between">
                  <span>Available Space:</span>
                  <strong className="text-emerald-700">{store.availableCapacityMT} MT Available</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Capacity Needed (MT):</label>
                  <input
                    type="number"
                    value={reservedMT}
                    onChange={(e) => setReservedMT(Number(e.target.value))}
                    min={1}
                    max={store.availableCapacityMT}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Holding Days:
                  </label>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    min={1}
                    max={90}
                    className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center text-xs font-bold text-gray-900">
                <span>Estimated Total Storage Fee:</span>
                <span className="font-heading text-lg text-emerald-800">₹{totalCost.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#167A42] hover:bg-[#126335] transition-all shadow-md"
            >
              Confirm Reservation & Vault Space
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
