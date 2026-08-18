import React, { useState } from 'react';
import { useLanguage, AutoTranslate } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { MapPin, TrendingUp, Calendar, Sprout, ArrowRight, X, ShieldCheck } from 'lucide-react';

export const FutureCropRecommendations: React.FC = () => {
  const { t } = useLanguage();
  const { selectedLocation } = useApp();
  const [selectedBlueprint, setSelectedBlueprint] = useState<any | null>(null);

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
      image: '/assets/pomegranate.png',
      blueprint: {
        investment: '₹70,000 / acre',
        soil: 'Well-drained loamy or sandy loam soil, pH 6.5 - 7.5.',
        irrigation: 'Precision drip irrigation (High water efficiency, sensitive to roots).',
        stages: [
          { phase: 'Month 1-2: Land Preparation & Planting', tasks: 'Perform deep ploughing, mix organic compost, and plant saplings at 4.5m x 3.0m spacing.' },
          { phase: 'Month 3-5: Canopy Training & Weed Control', tasks: 'Prune shoots to maintain a strong single trunk, and apply light fertilizations.' },
          { phase: 'Month 6-7: Flowering & Blight Care', tasks: 'Switch water supply to precision drip cycle, monitor for bacterial blight and apply thrips treatment.' },
          { phase: 'Month 8-9: Harvest & Packaging', tasks: 'Harvest when skin turns yellowish-red. Sort and select Grade A premium fruits for export markets.' }
        ],
        tips: 'Pomegranate Bhagwa is highly profitable but requires strict blight monitoring during high humidity seasons.'
      }
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
      image: '/assets/soyabean.png',
      blueprint: {
        investment: '₹15,000 / acre',
        soil: 'Rich loamy to clayey soil with good organic content, pH 6.0 - 7.0.',
        irrigation: 'Mainly monsoon-dependent. Supplementary sprinkler irrigation during dry spells.',
        stages: [
          { phase: 'Month 1: Seed Treatment & Sowing', tasks: 'Inoculate seeds with Rhizobium culture. Sow at 3-5 cm depth with row spacing of 45 cm.' },
          { phase: 'Month 2: Active Weeding & Podding', tasks: 'Conduct manual weeding at day 20 and 40. Apply pod-growth booster nutrients.' },
          { phase: 'Month 3: Seed Filling & Nutrients', tasks: 'Perform foliar spray of NPK nutrients. Ensure soil remains moist during seed development.' },
          { phase: 'Month 4: Maturity & Harvesting', tasks: 'Harvest once leaves yellow and drop. Machine-thresh seeds and store dry (moisture < 12%).' }
        ],
        tips: 'Inoculating seeds with Rhizobium culture increases nitrogen fixation and improves seed yield by up to 20%.'
      }
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
      image: '/assets/grapes.png',
      blueprint: {
        investment: '₹1,20,000 / acre',
        soil: 'Well-drained gravelly or sandy loam soil, pH 6.5 - 8.0.',
        irrigation: 'Automated precision drip irrigation (vital for berry sizing and sugar concentration).',
        stages: [
          { phase: 'October (Pruning & Bud-burst)', tasks: 'Conduct main pruning to determine the fruit cycle. Apply nitrogen and potassium fertilizations.' },
          { phase: 'Nov-Dec (Berry Sizing)', tasks: 'Thin out clusters. Apply Gibberellic Acid sprays to elongate and size berries up to export standards.' },
          { phase: 'Jan-Feb (Crop Protection)', tasks: 'Perform mildew prevention sprays. Setup netting to protect berries from birds and wind.' },
          { phase: 'Mar-Apr (Harvesting & Testing)', tasks: 'Test brix levels (target sweetness > 16°). Harvest during cool mornings. Pack in cold-store boxes.' }
        ],
        tips: 'Precision girdling of stems right after flowering helps redirect energy into berry expansion, raising yield sizing.'
      }
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
            <div className="p-4 flex-1 flex flex-col gap-4">
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Est. Revenue</span>
                  <div className="flex items-center gap-1 text-emerald-700 font-extrabold">
                    <span>{rec.revenue}</span>
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
                <button 
                  onClick={() => setSelectedBlueprint(rec)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-[#167A42] bg-[#F2FCE8] hover:bg-[#E2F7CE] transition-colors"
                >
                  View Crop Blueprint
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Blueprint Detail Modal */}
      {selectedBlueprint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBlueprint(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Banner */}
            <div className="h-40 rounded-2xl overflow-hidden relative mb-5">
              <img src={selectedBlueprint.image} alt={selectedBlueprint.crop} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="bg-[#167A42] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider block w-fit mb-1.5">
                  AI Cultivation Blueprint
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-white">
                  {selectedBlueprint.crop}
                </h3>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-5 text-xs text-center">
              <div className="bg-[#F2FCE8] rounded-xl p-3 border border-emerald-100/60">
                <span className="text-gray-500 text-[10px] font-bold uppercase block">Est. Net Revenue</span>
                <span className="font-extrabold text-[#167A42] text-sm mt-0.5 block">{selectedBlueprint.revenue} {selectedBlueprint.unit}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <span className="text-gray-500 text-[10px] font-bold uppercase block">Est. Cost / Acre</span>
                <span className="font-extrabold text-gray-900 text-sm mt-0.5 block">{selectedBlueprint.blueprint.investment}</span>
              </div>
            </div>

            {/* Key Information */}
            <div className="space-y-4 text-xs mb-5">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-gray-400 uppercase text-[9.5px]">Ideal Soil & Climate</span>
                <span className="font-bold text-gray-800 bg-gray-50 rounded-xl p-3 border border-gray-100 block">{selectedBlueprint.blueprint.soil}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-gray-400 uppercase text-[9.5px]">Irrigation Requirement</span>
                <span className="font-bold text-gray-800 bg-gray-50 rounded-xl p-3 border border-gray-100 block">{selectedBlueprint.blueprint.irrigation}</span>
              </div>
            </div>

            {/* Month-by-month stages */}
            <div className="mb-5">
              <span className="font-bold text-gray-400 uppercase text-[9.5px] block mb-2">Cultivation Roadmap</span>
              <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                {selectedBlueprint.blueprint.stages.map((stage: any, index: number) => (
                  <div key={index} className="p-3.5 bg-white flex gap-3 text-xs">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 text-[#167A42] font-bold flex items-center justify-center flex-shrink-0 text-[10.5px]">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-extrabold text-gray-900 mb-0.5">{stage.phase}</p>
                      <p className="text-gray-500 font-medium leading-relaxed">{stage.tasks}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expert Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs flex gap-3">
              <div className="text-amber-600 text-lg">💡</div>
              <div>
                <p className="font-extrabold text-amber-900 mb-0.5">Agronomist Recommendation</p>
                <p className="text-amber-800 font-medium leading-relaxed">{selectedBlueprint.blueprint.tips}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
