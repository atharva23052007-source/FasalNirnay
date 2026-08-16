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
