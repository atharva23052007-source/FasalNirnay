import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Cpu, TrendingUp, Clock, Scale } from 'lucide-react';

export const WhyActionsModal: React.FC = () => {
  const { isWhyModalOpen, setIsWhyModalOpen } = useApp();

  if (!isWhyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsWhyModalOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-gray-900">How AI Decision Engine Works</h3>
            <p className="text-xs text-gray-500">Real-time market intelligence analyzing 120+ Mandis across India.</p>
          </div>
        </div>

        <div className="space-y-3 my-4">
          
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex gap-3 items-start">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-bold text-gray-900 block">1. Arrival Volume Forecast</strong>
              <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                Tracks truck movements and harvest declarations to predict supply gluts or shortages before prices fluctuate.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex gap-3 items-start">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-bold text-gray-900 block">2. Shelf Life & Spoilage Index</strong>
              <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                Uses local temperature, humidity, and harvest timestamps to calculate exact perishability windows.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 flex gap-3 items-start">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700 flex-shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-xs font-bold text-gray-900 block">3. Multi-Channel Profit Optimization</strong>
              <p className="text-xs text-gray-600 mt-0.5 leading-snug">
                Compares local APMC mandi rates against Quick Commerce (Blinkit/Swiggy) and direct buyer offers to maximize net profit after logistics.
              </p>
            </div>
          </div>

        </div>

        <button
          onClick={() => setIsWhyModalOpen(false)}
          className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-[#167A42] hover:bg-[#126335] transition-all"
        >
          Got it
        </button>

      </div>
    </div>
  );
};
