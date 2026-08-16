import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, PlusCircle, Sprout, Scale, Calendar, MapPin } from 'lucide-react';

export const AddLotModal: React.FC = () => {
  const { isAddLotModalOpen, setIsAddLotModalOpen, addFarmerLot, selectedLocation } = useApp();

  const [cropName, setCropName] = useState('Tomato (Hybrid)');
  const [variety, setVariety] = useState('Vaishnavi Red');
  const [quantityKg, setQuantityKg] = useState<number>(1200);
  const [grade, setGrade] = useState<'Grade A (Premium)' | 'Grade B (Standard)' | 'Grade C (Processing)'>('Grade A (Premium)');
  const [location, setLocation] = useState(`Farm Plot #12, ${selectedLocation.name}`);

  if (!isAddLotModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFarmerLot({
      cropName,
      variety,
      quantityKg,
      harvestDate: 'Today (Just Harvested)',
      grade,
      storageStatus: 'On Farm',
      location,
      estValueRs: quantityKg * 18,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&auto=format&fit=crop&q=80',
    });
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
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-[#167A42]" /> Crop Name:
            </label>
            <input
              type="text"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              className="w-full text-xs font-medium border border-gray-200 rounded-xl p-2.5 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
              required
            />
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
