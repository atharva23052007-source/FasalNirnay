import React from 'react';
import { mockOrders } from '../data/mockData';
import { ShoppingBag, Truck, CheckCircle2, Clock } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'Blinkit':
        return <span className="bg-[#ffc107] text-black font-extrabold px-2.5 py-0.5 rounded text-[11px]">Blinkit</span>;
      case 'Swiggy Instamart':
        return <span className="bg-[#f25c05] text-white font-extrabold px-2.5 py-0.5 rounded text-[11px]">Swiggy Instamart</span>;
      case 'Local Mandi (eNAM)':
        return <span className="bg-[#055a29] text-white font-extrabold px-2.5 py-0.5 rounded text-[11px]">Local Mandi</span>;
      default:
        return <span className="bg-blue-600 text-white font-extrabold px-2.5 py-0.5 rounded text-[11px]">Direct Buyer</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold text-xs">
            <Truck className="w-3.5 h-3.5" /> In Transit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold text-xs">
            <Clock className="w-3.5 h-3.5" /> Pending Pickup
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-[#167A42]" />
            Sell Orders & Channel Dispatches
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Track active crop shipments, dispatch timelines, and 24-hour payout statuses.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
              <tr>
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Channel</th>
                <th className="py-3.5 px-6">Crop Commodity</th>
                <th className="py-3.5 px-6">Quantity (kg)</th>
                <th className="py-3.5 px-6">Rate (/kg)</th>
                <th className="py-3.5 px-6">Total Amount</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
              {mockOrders.map(ord => (
                <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-4 px-6 font-bold text-gray-900">{ord.orderNumber}</td>
                  <td className="py-4 px-6">{getChannelBadge(ord.channel)}</td>
                  <td className="py-4 px-6 font-semibold text-gray-900">{ord.crop}</td>
                  <td className="py-4 px-6">{ord.quantityKg.toLocaleString()} kg</td>
                  <td className="py-4 px-6">₹{ord.ratePerKg.toFixed(2)}</td>
                  <td className="py-4 px-6 font-heading font-extrabold text-sm text-[#167A42]">
                    ₹{ord.totalAmountRs.toLocaleString()}
                  </td>
                  <td className="py-4 px-6">{getStatusBadge(ord.status)}</td>
                  <td className="py-4 px-6 text-right">
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        ord.payoutStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.payoutStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
