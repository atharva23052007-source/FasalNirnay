import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CropRecommendation,
  BuyerChannel,
  LocationOption,
  NotificationItem,
  FarmerLot,
  StorageFacility,
  FarmerUser,
  UserRole,
} from '../types';
import {
  mockLocations,
  mockNotifications,
  mockFarmerLots,
  mockStorageFacilities,
} from '../data/mockData';

export type ProfileTab = 'login' | 'signup' | 'forgot' | 'profile';

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
  
  // Page Data & Actions
  farmerLots: FarmerLot[];
  addFarmerLot: (lot: Omit<FarmerLot, 'id'>) => void;
  deleteFarmerLot: (id: string) => void;
  storageFacilities: StorageFacility[];
  isAddLotModalOpen: boolean;
  setIsAddLotModalOpen: (open: boolean) => void;
  selectedStorageFacility: StorageFacility | null;
  setSelectedStorageFacility: (store: StorageFacility | null) => void;

  // Profile Auth State
  user: FarmerUser;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  profileModalTab: ProfileTab;
  setProfileModalTab: (tab: ProfileTab) => void;
  loginUser: (identifier: string, name?: string, role?: UserRole, token?: string) => void;
  signupUser: (name: string, identifier: string, location: string, farmSize: number, role?: UserRole, token?: string) => void;
  logoutUser: () => void;
  openProfileModal: () => void;
}

const defaultUser: FarmerUser = {
  name: '',
  mobile: '',
  emailOrPhone: '',
  role: 'Farmer',
  location: 'Nashik, Maharashtra',
  farmSizeAcres: 4.0,
  mainCrops: ['Tomato', 'Red Onion', 'Spinach'],
  isLoggedIn: false,
  avatarUrl: '/assets/farmer_banner.jpg',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(mockLocations[0]);
  const [selectedCropModal, setSelectedCropModal] = useState<CropRecommendation | null>(null);
  const [selectedChannelModal, setSelectedChannelModal] = useState<BuyerChannel | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  
  // Dynamic Page State
  const [farmerLots, setFarmerLots] = useState<FarmerLot[]>([]);
  const [storageFacilities] = useState<StorageFacility[]>(mockStorageFacilities);
  const [isAddLotModalOpen, setIsAddLotModalOpen] = useState<boolean>(false);
  const [selectedStorageFacility, setSelectedStorageFacility] = useState<StorageFacility | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/lots')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setFarmerLots(data);
        } else {
          setFarmerLots(mockFarmerLots);
        }
      })
      .catch(err => {
        console.error('Error fetching lots:', err);
        setFarmerLots(mockFarmerLots);
      });
  }, []);

  // User Auth State
  const [user, setUser] = useState<FarmerUser>(() => {
    try {
      const savedUser = localStorage.getItem('fasal_nirnay_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.isLoggedIn) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved auth state', e);
    }
    return defaultUser;
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profileModalTab, setProfileModalTab] = useState<ProfileTab>('profile');

  // Persist user on changes
  useEffect(() => {
    if (user.isLoggedIn) {
      localStorage.setItem('fasal_nirnay_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fasal_nirnay_user');
    }
  }, [user]);

  const markNotifRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const addFarmerLot = (newLotData: Omit<FarmerLot, 'id'>) => {
    const newLot: FarmerLot = {
      ...newLotData,
      id: `lot-${Date.now()}`,
    };
    setFarmerLots(prev => [newLot, ...prev]);

    fetch('http://localhost:5000/api/lots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newLot),
    })
    .then(res => res.json())
    .then(savedLot => {
      console.log('Saved lot to backend:', savedLot);
    })
    .catch(err => {
      console.error('Error saving lot to backend:', err);
    });
  };

  const deleteFarmerLot = (id: string) => {
    setFarmerLots(prev => prev.filter(l => l.id !== id));

    fetch(`http://localhost:5000/api/lots/${id}`, {
      method: 'DELETE',
    })
    .then(res => res.json())
    .then(data => {
      console.log('Deleted lot from backend:', data);
    })
    .catch(err => {
      console.error('Error deleting lot from backend:', err);
    });
  };

  const openProfileModal = () => {
    if (user.isLoggedIn) {
      setProfileModalTab('profile');
    } else {
      setProfileModalTab('login');
    }
    setIsProfileModalOpen(true);
  };

  const loginUser = (
    identifier: string,
    name?: string,
    role: UserRole = 'Farmer',
    token?: string
  ) => {
    const newUserState: FarmerUser = {
      name: name || (identifier.includes('@') ? identifier.split('@')[0] : 'Farmer User'),
      mobile: identifier,
      emailOrPhone: identifier,
      role: role,
      location: `${selectedLocation.name}, ${selectedLocation.state}`,
      farmSizeAcres: 4.5,
      mainCrops: role === 'Farmer' ? ['Tomato', 'Red Onion', 'Spinach'] : ['Operations'],
      isLoggedIn: true,
      avatarUrl: '/assets/farmer_banner.jpg',
      token: token || `token_${Date.now()}`,
    };
    setUser(newUserState);
    setProfileModalTab('profile');
    setIsProfileModalOpen(false);
  };

  const signupUser = (
    name: string,
    identifier: string,
    location: string,
    farmSize: number,
    role: UserRole = 'Farmer',
    token?: string
  ) => {
    const newUserState: FarmerUser = {
      name,
      mobile: identifier,
      emailOrPhone: identifier,
      role: role,
      location: location || 'Nashik, Maharashtra',
      farmSizeAcres: farmSize || 3.0,
      mainCrops: role === 'Farmer' ? ['Tomato', 'Onion'] : ['Operations'],
      isLoggedIn: true,
      avatarUrl: '/assets/farmer_banner.jpg',
      token: token || `token_${Date.now()}`,
    };
    setUser(newUserState);
    setProfileModalTab('profile');
    setIsProfileModalOpen(false);
  };

  const logoutUser = () => {
    setUser(defaultUser);
    localStorage.removeItem('fasal_nirnay_user');
    setProfileModalTab('login');
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
        farmerLots,
        addFarmerLot,
        deleteFarmerLot,
        storageFacilities,
        isAddLotModalOpen,
        setIsAddLotModalOpen,
        selectedStorageFacility,
        setSelectedStorageFacility,
        user,
        isProfileModalOpen,
        setIsProfileModalOpen,
        profileModalTab,
        setProfileModalTab,
        loginUser,
        signupUser,
        logoutUser,
        openProfileModal,
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
