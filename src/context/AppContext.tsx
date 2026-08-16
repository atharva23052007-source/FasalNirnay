import React, { createContext, useContext, useState } from 'react';
import { CropRecommendation, BuyerChannel, LocationOption, NotificationItem } from '../types';
import { mockLocations, mockNotifications, mockCropRecommendations } from '../data/mockData';

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedLocation: LocationOption;
  setSelectedLocation: (loc: LocationOption) => void;
  selectedCropModal: CropRecommendation | null;
  setSelectedCropModal: (crop: CropRecommendation | null) => void;
  selectedChannelModal: BuyerChannel | null;
  setSelectedChannelModal: (channel: BuyerChannel | null) => void;
  isWhyModalOpen: boolean;
  setIsWhyModalOpen: (open: boolean) => void;
  isNotifOpen: boolean;
  setIsNotifOpen: (open: boolean) => void;
  notifications: NotificationItem[];
  markNotifRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(mockLocations[0]);
  const [selectedCropModal, setSelectedCropModal] = useState<CropRecommendation | null>(null);
  const [selectedChannelModal, setSelectedChannelModal] = useState<BuyerChannel | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  const markNotifRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedLocation,
        setSelectedLocation,
        selectedCropModal,
        setSelectedCropModal,
        selectedChannelModal,
        setSelectedChannelModal,
        isWhyModalOpen,
        setIsWhyModalOpen,
        isNotifOpen,
        setIsNotifOpen,
        notifications,
        markNotifRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
