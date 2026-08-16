import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check, TrendingUp, ShoppingBag, CloudRain } from 'lucide-react';

export const NotificationsDropdown: React.FC = () => {
  const { notifications, markNotifRead, setIsNotifOpen } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'price':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'demand':
        return <ShoppingBag className="w-4 h-4 text-orange-600" />;
      case 'weather':
        return <CloudRain className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
      <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#167A42]" />
          <span className="font-heading font-bold text-sm text-gray-900">Notifications</span>
        </div>
        <button
          onClick={() => setIsNotifOpen(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => markNotifRead(n.id)}
            className={`p-3 text-xs hover:bg-gray-50 cursor-pointer transition-colors flex gap-3 items-start ${
              !n.read ? 'bg-green-50/40' : ''
            }`}
          >
            <div className="p-2 rounded-lg bg-gray-100 flex-shrink-0 mt-0.5">
              {getIcon(n.type)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between font-semibold text-gray-900 mb-0.5">
                <span>{n.title}</span>
                <span className="text-[10px] font-normal text-gray-400">{n.time}</span>
              </div>
              <p className="text-gray-600 leading-snug">{n.message}</p>
            </div>
            {!n.read && (
              <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0 mt-1.5" />
            )}
          </div>
        ))}
      </div>

      <div className="p-2.5 border-t border-gray-100 bg-gray-50 text-center">
        <button
          onClick={() => setIsNotifOpen(false)}
          className="text-xs font-semibold text-[#167A42] hover:underline"
        >
          Close Notifications
        </button>
      </div>
    </div>
  );
};
