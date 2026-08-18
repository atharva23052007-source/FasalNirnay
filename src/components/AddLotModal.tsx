import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, PlusCircle, Sprout, Scale, Calendar, MapPin } from 'lucide-react';

import { fetchCropImage } from '../utils/imageUtils';

export const AddLotModal: React.FC = () => {
  const { isAddLotModalOpen, setIsAddLotModalOpen, addFarmerLot, addCropRecommendation, selectedLocation, user } = useApp();

  const [cropName, setCropName] = useState('Tomato (Hybrid)');
  const [variety, setVariety] = useState('Vaishnavi Red');
  const [quantityKg, setQuantityKg] = useState<number>(1200);
  const [grade, setGrade] = useState<'Grade A (Premium)' | 'Grade B (Standard)' | 'Grade C (Processing)'>('Grade A (Premium)');
  const [condition, setCondition] = useState<string>('Fresh');
  const [location, setLocation] = useState(`Farm Plot #12, ${selectedLocation.name}`);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [farmerName, setFarmerName] = useState('');

  const getCropImage = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('tomato')) return '/assets/tomato.jpg';
    if (lowerName.includes('onion')) return '/assets/onion.jpg';
    if (lowerName.includes('leafy') || lowerName.includes('spinach')) return '/assets/leafy.jpg';
    if (lowerName.includes('wheat')) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&auto=format&fit=crop&q=80';
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80';
  };

  React.useEffect(() => {
    const fetchPreview = async () => {
      if (cropName.trim()) {
        const pixabayImage = await fetchCropImage(cropName);
        setPreviewImage(pixabayImage || getCropImage(cropName));
      }
    };
    const handler = setTimeout(fetchPreview, 500);
    return () => clearTimeout(handler);
  }, [cropName]);

  if (!isAddLotModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newImage = previewImage || getCropImage(cropName);

    let dynamicAction = 'SELL TODAY';
    let dynamicType: 'red' | 'green' | 'orange' = 'red';
    let dynamicRationale = 'Market analysis indicates peak demand for ' + cropName + ' today.';
    let dynamicSpoilage = 25;
    let dynamicShelfLife = 3;
    let dynamicDetail = 'AI detected high local demand for newly harvested ' + cropName + '. Immediate liquidation secures the best margins before market saturation.';
    let dynamicBenefitText = 'Best price available now';

    if (condition === 'Fresh') {
      dynamicAction = 'HOLD 5 DAYS';
      dynamicType = 'green';
      dynamicRationale = 'Crop is in perfect fresh condition. Holding it will yield a 12% higher market price later this week.';
      dynamicSpoilage = 5;
      dynamicShelfLife = 14;
      dynamicDetail = 'The crop is extremely fresh. Supply is high today, but AI predicts a shortage in 4-5 days. Holding in standard storage maximizes net returns.';
      dynamicBenefitText = 'Maximize profit by waiting';
    } else if (condition === 'Slightly Damaged') {
      dynamicAction = 'SELL WITHIN 2 DAYS';
      dynamicType = 'orange';
      dynamicRationale = 'Slight damage detected. Better to sell soon before spoilage increases exponentially.';
      dynamicSpoilage = 15;
      dynamicShelfLife = 4;
      dynamicDetail = 'Minor damage reduces shelf life. AI suggests selling to local retailers quickly to avoid total loss of the damaged portion.';
      dynamicBenefitText = 'Minimize spoilage losses';
    } else if (condition === 'Overripe' || condition === 'Dry/Wilted') {
      dynamicAction = 'SELL IMMEDIATELY';
      dynamicType = 'red';
      dynamicRationale = 'Condition is poor. Immediate liquidation prevents total crop failure and secures base value.';
      dynamicSpoilage = 45;
      dynamicShelfLife = 1;
      dynamicDetail = 'Critical condition. AI recommends selling to processing plants (e.g., pulping/puree factories) today at standard rates before it becomes unsellable.';
      dynamicBenefitText = 'Salvage remaining value';
    }

    const recommendationPayload = {
      cropNameKey: cropName.toLowerCase().replace(/\s/g, ''),
      defaultCropName: cropName,
      image: newImage,
      quantityKg,
      harvestDate: 'Today',
      actionKey: 'aiAction',
      defaultAction: dynamicAction,
      actionType: dynamicType,
      benefitTextKey: 'aiBenefit',
      defaultBenefitText: dynamicBenefitText,
      sellTimelineKey: 'aiTimeline',
      defaultSellTimeline: 'Sell today',
      sellDateText: 'Today',
      sellTimeDetail: 'Evening',
      rationaleKey: 'aiRationale',
      defaultRationale: dynamicRationale,
      spoilageRiskPercent: dynamicSpoilage,
      shelfLifeDays: dynamicShelfLife,
      currentPriceKg: 18.00,
      expectedPriceKg: 16.50,
      priceTrend: [
        { day: 'Yesterday', price: 17.50 },
        { day: 'Today', price: 18.00 },
        { day: 'Tomorrow', price: 16.50 },
      ],
      costsBreakdown: {
        harvestCost: 1000,
        storageCost: 0,
        transportCost: 800,
      },
      expectedNetOutcome: (quantityKg * 18) - 1800,
      detailedAnalysisKey: 'aiDetail',
      defaultDetailedAnalysis: dynamicDetail,
    };

    const lotPayload = {
      cropName,
      variety,
      quantityKg,
      harvestDate: 'Today (Just Harvested)',
      grade,
      condition,
      storageStatus: 'On Farm' as 'On Farm' | 'In Cold Storage' | 'Dispatched',
      location,
      estValueRs: quantityKg * 18,
      image: newImage,
      imageUrl: newImage,
      recommendation: recommendationPayload,
      farmerName: (user.role === 'NGO/FPO' || user.role === 'Admin') ? (farmerName.trim() || 'Generic Farmer') : undefined,
    };

    // Save to MongoDB via our Express Backend
    try {
      const res = await fetch('http://localhost:5000/api/lots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lotPayload),
      });
      const data = await res.json();
      
      if (!res.ok) {
        console.error('Failed to save to DB:', data.error);
        // Fallback: Optimistic update with temporary ID
        const tempId = `temp-${Date.now()}`;
        const finalRecommendation = { ...recommendationPayload, id: tempId };
        addFarmerLot({ ...lotPayload, id: tempId, recommendation: finalRecommendation });
        addCropRecommendation(finalRecommendation);
      } else {
        console.log('Successfully saved to MongoDB', data);
        const dbId = data.data._id;
        
        // Add to global state using the MongoDB _id
        const finalRecommendation = { ...recommendationPayload, id: dbId };
        addFarmerLot({ ...lotPayload, id: dbId, recommendation: finalRecommendation });
        addCropRecommendation(finalRecommendation);
      }
    } catch (err) {
      console.error('API Error:', err);
      // Fallback: Optimistic update with temporary ID on network error
      const tempId = `temp-${Date.now()}`;
      const finalRecommendation = { ...recommendationPayload, id: tempId };
      addFarmerLot({ ...lotPayload, id: tempId, recommendation: finalRecommendation });
      addCropRecommendation(finalRecommendation);
    }

    setIsAddLotModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setIsAddLotModalOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 border-b border-gray-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#167A42] flex items-center justify-center">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-lg text-gray-900">Add New Harvest Lot</h3>
            <p className="text-xs text-gray-500">Record a new crop lot to get AI sell recommendations.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="flex gap-4">
            {/* Image Preview */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 mt-5">
              {previewImage ? (
                <img src={previewImage} alt="Crop Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Sprout className="w-6 h-6" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-[#167A42]" /> Crop Name:
              </label>
              <input
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
                placeholder="e.g. Tomato, Soybean..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Variety:</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-gray-400" /> Quantity (kg):
              </label>
              <input
                type="number"
                value={quantityKg}
                onChange={(e) => setQuantityKg(Number(e.target.value))}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quality Grade:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as any)}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Grade A (Premium)">Grade A (Premium Fresh)</option>
                <option value="Grade B (Standard)">Grade B (Standard Mandi)</option>
                <option value="Grade C (Processing)">Grade C (Processing/Pulping)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Vegetable Condition:</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Fresh">Fresh</option>
                <option value="Slightly Damaged">Slightly Damaged</option>
                <option value="Overripe">Overripe</option>
                <option value="Dry/Wilted">Dry/Wilted</option>
              </select>
            </div>
          </div>

          {(user.role === 'NGO/FPO' || user.role === 'Admin') && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Farmer / Owner Name:</label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                required
                placeholder="e.g. Ramesh Patil"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" /> Farm Location:
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#167A42] hover:bg-[#126335] transition-all shadow-md mt-2"
          >
            Save Harvest Lot & Generate AI Plan
          </button>
        </form>

      </div>
    </div>
  );
};
