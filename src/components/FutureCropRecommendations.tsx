import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { MapPin, TrendingUp, Calendar, Sprout, ArrowRight } from 'lucide-react';

export const FutureCropRecommendations: React.FC = () => {
  const { t } = useLanguage();
  const { selectedLocation } = useApp();

  const recommendations = [
    {
      id: 1,
      crop: 'Pomegranate (Bhagwa)',
      revenue: '₹3.5L - ₹4L',
      unit: '/ acre',
      duration: '8-9 Months',
      demand: 'High Export Demand',
      reason: `Ideal for ${selectedLocation.name}'s upcoming dry spell. Current soil moisture is optimal for early rooting.`,
      color: 'rose',
      image: '/assets/pomegranate.png'
    },
    {
      id: 2,
      crop: 'Soyabean',
      revenue: '₹45k - ₹55k',
      unit: '/ acre',
      duration: '3-4 Months',
      demand: 'Steady Domestic Demand',
      reason: `Market trends indicate a 15% price surge by harvest time. Very low investment required for ${selectedLocation.state} farmers.`,
      color: 'emerald',
      image: '/assets/soyabean.png'
    },
    {
      id: 3,
      crop: 'Grapes (Export Quality)',
      revenue: '₹5L - ₹7L',
      unit: '/ acre',
      duration: 'Perennial',
      demand: 'Surging European Demand',
      reason: `Government subsidies currently active for vineyards in ${selectedLocation.name}. Highly profitable long-term crop.`,
      color: 'purple',
      image: '/assets/grapes.png'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'rose': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <section className="flex flex-col gap-4 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-[#167A42]" />
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-gray-900 tracking-tight">
              {t('whatToGrowNext', 'What to Grow Next')}
            </h2>
          </div>
          <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            AI Recommendations tailored specifically for <span className="font-bold text-gray-800">{selectedLocation.name}, {selectedLocation.state}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {recommendations.map((rec) => (
          <div key={rec.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all group cursor-pointer">
            
            {/* Image Banner */}
            <div className="h-32 relative overflow-hidden">
              <img 
                src={rec.image} 
                alt={rec.crop} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop&q=80';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <h3 className="absolute bottom-3 left-4 font-heading font-bold text-white text-lg drop-shadow-md">
                {rec.crop}
              </h3>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-4 flex-1">
              
              {/* Highlight Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Est. Revenue</span>
                  <div className="flex items-baseline gap-1 text-gray-900">
                    <span className="font-extrabold text-base">{rec.revenue}</span>
                    <span className="text-xs font-semibold text-gray-500">{rec.unit}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</span>
                  <div className="flex items-center gap-1.5 text-gray-900">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-sm">{rec.duration}</span>
                  </div>
                </div>
              </div>

              {/* Rationale / Reason */}
              <div className={`p-3 rounded-xl border text-xs font-medium leading-relaxed ${getColorClasses(rec.color)}`}>
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {rec.demand}
                </div>
                {rec.reason}
              </div>

              {/* Action */}
              <div className="mt-auto pt-2">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-[#167A42] bg-[#F2FCE8] hover:bg-[#E2F7CE] transition-colors">
                  View Crop Blueprint
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
