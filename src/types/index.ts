export type Language = 'en' | 'hi' | 'mr';

export interface LocationOption {
  id: string;
  name: string;
  state: string;
}

export interface CropRecommendation {
  id: string;
  cropNameKey: string;
  defaultCropName: string;
  image: string;
  quantityKg: number;
  harvestDate: string;
  actionKey: string;
  defaultAction: string;
  actionType: 'green' | 'red' | 'orange';
  benefitTextKey: string;
  defaultBenefitText: string;
  sellTimelineKey: string;
  defaultSellTimeline: string;
  sellDateText: string;
  sellTimeDetail: string;
  rationaleKey: string;
  defaultRationale: string;
  
  // Detail Modal Metrics
  spoilageRiskPercent: number;
  shelfLifeDays: number;
  currentPriceKg: number;
  expectedPriceKg: number;
  priceTrend: { day: string; price: number }[];
  costsBreakdown: {
    harvestCost: number;
    storageCost: number;
    transportCost: number;
  };
  expectedNetOutcome: number;
  detailedAnalysisKey: string;
  defaultDetailedAnalysis: string;
}

export interface MarketMetric {
  id: string;
  cropName: string;
  mandiName: string;
  priceKg: number;
  trendPercent: number;
  isUp: boolean;
  arrivalMT: number;
  emoji: string;
}

export interface BuyerChannel {
  id: string;
  name: string;
  subtitle: string;
  type: 'blinkit' | 'swiggy' | 'mandi' | 'direct';
  features: string[];
  image: string;
  buttonText: string;
  themeColor: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'price' | 'demand' | 'weather';
}

export interface FarmerLot {
  id: string;
  cropName: string;
  variety: string;
  quantityKg: number;
  harvestDate: string;
  grade: 'Grade A (Premium)' | 'Grade B (Standard)' | 'Grade C (Processing)';
  storageStatus: 'On Farm' | 'In Cold Storage' | 'Dispatched';
  location: string;
  estValueRs: number;
  image: string;
}

export interface StorageFacility {
  id: string;
  name: string;
  type: 'Controlled Atmosphere Cold Storage' | 'Dry Grain Warehouse' | 'Multi-Commodity Cold Chain';
  location: string;
  distanceKm: number;
  totalCapacityMT: number;
  availableCapacityMT: number;
  tempRangeCelsius: string;
  humidityPercent: string;
  pricePerTonPerDayRs: number;
  suitableCrops: string[];
  rating: number;
  phone: string;
  image: string;
}

export interface MarketPriceDetail {
  id: string;
  crop: string;
  mandi: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalQtyMT: number;
  priceChangePercent: number;
  lastUpdated: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  channel: 'Blinkit' | 'Swiggy Instamart' | 'Local Mandi (eNAM)' | 'Direct Buyer';
  crop: string;
  quantityKg: number;
  ratePerKg: number;
  totalAmountRs: number;
  orderDate: string;
  pickupDate: string;
  status: 'Pending Pickup' | 'In Transit' | 'Completed' | 'Payment Processed';
  payoutStatus: 'Paid' | 'Processing (24h)' | 'Pending';
}

export interface ReportSummary {
  totalRevenueRs: number;
  totalHarvestKg: number;
  activeLotsCount: number;
  avgProfitMarginPercent: number;
  monthlyBreakdown: { month: string; revenue: number; yield: number }[];
  channelShare: { channel: string; percent: number; amount: number }[];
}

// --- USER & AUTH TYPES ---

export interface FarmerUser {
  name: string;
  mobile: string;
  location: string;
  farmSizeAcres: number;
  mainCrops: string[];
  isLoggedIn: boolean;
  avatarUrl: string;
}
