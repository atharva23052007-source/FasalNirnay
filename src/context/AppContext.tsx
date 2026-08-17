import React, { createContext, useContext, useState } from 'react';
import {
  CropRecommendation,
  BuyerChannel,
  LocationOption,
  NotificationItem,
  FarmerLot,
  StorageFacility,
  FarmerUser,
} from '../types';
import {
  mockLocations,
  mockNotifications,
  mockFarmerLots,
  mockStorageFacilities,
  mockCropRecommendations,
} from '../data/mockData';

export type ProfileTab = 'login' | 'signup' | 'forgot' | 'profile';

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedLocation: LocationOption;
  setSelectedLocation: (loc: LocationOption) => void;
  selectedCropModal: CropRecommendation | null;
  setSelectedCropModal: (crop: CropRecommendation | null) => void;
  selectedCropToSell: CropRecommendation | null;
  setSelectedCropToSell: (crop: CropRecommendation | null) => void;
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
  addFarmerLot: (lot: Omit<FarmerLot, 'id'> | FarmerLot) => void;
  cropRecommendations: CropRecommendation[];
  addCropRecommendation: (rec: Omit<CropRecommendation, 'id'> | CropRecommendation) => void;
  removeCropRecommendation: (id: string) => void;
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
  loginUser: (mobile: string, name?: string) => void;
  signupUser: (name: string, mobile: string, location: string, farmSize: number) => void;
  logoutUser: () => void;
  openProfileModal: () => void;
}

const defaultUser: FarmerUser = {
  name: 'Ramesh Patil',
  mobile: '98220 12345',
  location: 'Nashik, Maharashtra',
  farmSizeAcres: 4.5,
  mainCrops: ['Tomato', 'Red Onion', 'Spinach'],
  isLoggedIn: true,
  avatarUrl: '/assets/farmer_banner.jpg',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(mockLocations[0]);
  const [selectedCropModal, setSelectedCropModal] = useState<CropRecommendation | null>(null);
  const [selectedCropToSell, setSelectedCropToSell] = useState<CropRecommendation | null>(null);
  const [selectedChannelModal, setSelectedChannelModal] = useState<BuyerChannel | null>(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);
  
  // Dynamic Page State
  const [farmerLots, setFarmerLots] = useState<FarmerLot[]>(mockFarmerLots);
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendation[]>(mockCropRecommendations);
  const [storageFacilities] = useState<StorageFacility[]>(mockStorageFacilities);
  const [isAddLotModalOpen, setIsAddLotModalOpen] = useState<boolean>(false);
  const [selectedStorageFacility, setSelectedStorageFacility] = useState<StorageFacility | null>(null);

  // Fetch Lots from MongoDB on Mount
  React.useEffect(() => {
    const fetchLots = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/lots');
        const json = await response.json();
        if (json.success) {
          const lots = json.data;
          
          // Map MongoDB docs to FarmerLot format
          const mappedLots: FarmerLot[] = lots.map((doc: any) => ({
            id: doc._id,
            cropName: doc.cropName,
            variety: doc.variety,
            quantityKg: doc.quantityKg,
            harvestDate: doc.harvestDate,
            grade: doc.grade,
            storageStatus: doc.storageStatus,
            location: doc.location,
            condition: doc.condition || 'Fresh',
            estValueRs: doc.estValueRs,
            image: doc.image,
            recommendation: doc.recommendation
          }));
          
          // Map MongoDB docs to CropRecommendation format
          const mappedRecs: CropRecommendation[] = lots.map((doc: any) => {
            if (!doc.recommendation) return null;
            return { ...doc.recommendation, id: doc._id };
          }).filter(Boolean);
          
          setFarmerLots([...mappedLots, ...mockFarmerLots]);
          setCropRecommendations([...mappedRecs, ...mockCropRecommendations]);
        }
      } catch (error) {
        console.error('Error fetching lots from MongoDB:', error);
      }
    };
    fetchLots();
  }, []);

  // User Auth State
  const [user, setUser] = useState<FarmerUser>(defaultUser);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [profileModalTab, setProfileModalTab] = useState<ProfileTab>('profile');

  const markNotifRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const addFarmerLot = (newLotData: Omit<FarmerLot, 'id'> | FarmerLot) => {
    setFarmerLots(prev => [newLotData as FarmerLot, ...prev]);
  };

  const addCropRecommendation = (recData: Omit<CropRecommendation, 'id'> | CropRecommendation) => {
    setCropRecommendations(prev => [recData as CropRecommendation, ...prev]);
  };

  const removeCropRecommendation = async (id: string) => {
    try {
      // First, attempt to delete from MongoDB if the ID matches a MongoDB _id
      await fetch(`http://localhost:5000/api/lots/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Failed to delete lot from MongoDB:', error);
    }
    // Update local state
    setCropRecommendations(prev => prev.filter(rec => rec.id !== id));
    setFarmerLots(prev => prev.filter(lot => lot.id !== id));
  };

  const openProfileModal = () => {
    if (user.isLoggedIn) {
      setProfileModalTab('profile');
    } else {
      setProfileModalTab('login');
    }
    setIsProfileModalOpen(true);
  };

  const loginUser = (mobile: string, name?: string) => {
    setUser({
      name: name || 'Ramesh Patil',
      mobile: mobile.startsWith('+91') ? mobile : `+91 ${mobile}`,
      location: `${selectedLocation.name}, ${selectedLocation.state}`,
      farmSizeAcres: 4.5,
      mainCrops: ['Tomato', 'Red Onion', 'Spinach'],
      isLoggedIn: true,
      avatarUrl: '/assets/farmer_banner.jpg',
    });
    setProfileModalTab('profile');
  };

  const signupUser = (name: string, mobile: string, location: string, farmSize: number) => {
    setUser({
      name,
      mobile: mobile.startsWith('+91') ? mobile : `+91 ${mobile}`,
      location,
      farmSizeAcres: farmSize || 3.0,
      mainCrops: ['Tomato', 'Onion'],
      isLoggedIn: true,
      avatarUrl: '/assets/farmer_banner.jpg',
    });
    setProfileModalTab('profile');
  };

  const logoutUser = () => {
    setUser(prev => ({ ...prev, isLoggedIn: false }));
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
        selectedCropToSell,
        setSelectedCropToSell,
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
        cropRecommendations,
        addCropRecommendation,
        removeCropRecommendation,
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
