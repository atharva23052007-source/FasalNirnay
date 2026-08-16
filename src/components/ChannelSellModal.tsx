import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, Truck, MapPin, Package } from 'lucide-react';

export const ChannelSellModal: React.FC = () => {
  const { selectedChannelModal, setSelectedChannelModal, selectedLocation } = useApp();
  const [selectedCrop, setSelectedCrop] = useState('Tomato — 1,000 kg');
  const [address, setAddress] = useState(`Farm #42, Dindori Road, ${selectedLocation.name}`);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!selectedChannelModal) return null;

  const channel = selectedChannelModal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setSelectedChannelModal(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={() => setSelectedChannelModal(null)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-heading font-extrabold text-xl text-gray-900">Order Placed Successfully!</h3>
            <p className="text-xs text-gray-500 max-w-xs">
              Dispatch request submitted to <strong>{channel.name}</strong>. Partner agent will contact you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                <Truck className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-gray-900">
                  Sell on {channel.name}
                </h3>
                <p className="text-xs text-gray-500">{channel.description}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-gray-400" /> Select Crop Lot to Dispatch:
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full text-xs font-medium border border-gray-200 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Tomato — 1,000 kg">Tomato — 1,000 kg (Harvested 20 May)</option>
                  <option value="Onion — 2,000 kg">Onion — 2,000 kg (Harvested 21 May)</option>
                  <option value="Leafy Vegetables — 750 kg">Leafy Vegetables — 750 kg (Harvested 21 May)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" /> Pickup Farm Location:
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs font-medium border border-gray-200 rounded-xl p-3 bg-gray-50 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Channel Partner:</span>
                  <span className="text-gray-900">{channel.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guaranteed Payment Window:</span>
                  <span className="text-emerald-700 font-bold">Within 24 Hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Logistics Transport:</span>
                  <span className="text-gray-900 font-medium">Free Doorstep Pickup</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-md transition-all bg-[#167A42] hover:bg-[#126335]"
            >
              Confirm Dispatch Order & Request Pickup
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
