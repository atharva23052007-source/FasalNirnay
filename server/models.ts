import mongoose, { Schema, Document } from 'mongoose';

// 1. FarmerLot Model Schema
export interface ILot extends Document {
  id: string;
  cropName: string;
  variety: string;
  quantityKg: number;
  harvestDate: string;
  grade: string;
  storageStatus: string;
  location: string;
  estValueRs: number;
  image: string;
}

const LotSchema = new Schema<ILot>({
  id: { type: String, required: true, unique: true },
  cropName: { type: String, required: true },
  variety: { type: String, required: true },
  quantityKg: { type: Number, required: true },
  harvestDate: { type: String, required: true },
  grade: { type: String, required: true },
  storageStatus: { type: String, required: true },
  location: { type: String, required: true },
  estValueRs: { type: Number, required: true },
  image: { type: String, required: true },
}, { timestamps: true });

// 2. PesticideProduct Model Schema
export interface IPesticide extends Document {
  id: string;
  name: string;
  brand: string;
  category: string;
  targetProblems: string[];
  suitableCrops: string[];
  image: string;
  purpose: string;
  dosage: string;
  usageInstructions: string[];
  precautions: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  packOptions: { label: string; priceRs: number }[];
}

const PesticideSchema = new Schema<IPesticide>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  targetProblems: [{ type: String }],
  suitableCrops: [{ type: String }],
  image: { type: String, required: true },
  purpose: { type: String, required: true },
  dosage: { type: String, required: true },
  usageInstructions: [{ type: String }],
  precautions: [{ type: String }],
  rating: { type: Number, required: true },
  reviewCount: { type: Number, required: true },
  inStock: { type: Boolean, required: true },
  packOptions: [{
    label: { type: String, required: true },
    priceRs: { type: Number, required: true }
  }]
}, { timestamps: true });

// 3. InputPurchaseOrder Model Schema
export interface IInputOrder extends Document {
  id: string;
  orderNumber: string;
  date: string;
  items: {
    productName: string;
    brand: string;
    packLabel: string;
    qty: number;
    priceRs: number;
  }[];
  totalRs: number;
  status: string;
  estimatedDelivery: string;
}

const InputOrderSchema = new Schema<IInputOrder>({
  id: { type: String, required: true, unique: true },
  orderNumber: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  items: [{
    productName: { type: String, required: true },
    brand: { type: String, required: true },
    packLabel: { type: String, required: true },
    qty: { type: Number, required: true },
    priceRs: { type: Number, required: true }
  }],
  totalRs: { type: Number, required: true },
  status: { type: String, required: true },
  estimatedDelivery: { type: String, required: true }
}, { timestamps: true });

export const Lot = mongoose.models.Lot || mongoose.model<ILot>('Lot', LotSchema);
export const Pesticide = mongoose.models.Pesticide || mongoose.model<IPesticide>('Pesticide', PesticideSchema);
export const InputOrder = mongoose.models.InputOrder || mongoose.model<IInputOrder>('InputOrder', InputOrderSchema);

// 4. MarketPrice Model Schema
export interface IMarketPrice extends Document {
  id: string;
  crop: string;
  mandi: string;
  state: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceChangePercent: number;
  arrivalQtyMT: number;
  lastUpdated: string;
}

const MarketPriceSchema = new Schema<IMarketPrice>({
  id: { type: String, required: true, unique: true },
  crop: { type: String, required: true },
  mandi: { type: String, required: true },
  state: { type: String, required: true },
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
  modalPrice: { type: Number, required: true },
  priceChangePercent: { type: Number, required: true },
  arrivalQtyMT: { type: Number, required: true },
  lastUpdated: { type: String, required: true }
}, { timestamps: true });

export const MarketPrice = mongoose.models.MarketPrice || mongoose.model<IMarketPrice>('MarketPrice', MarketPriceSchema);

// 5. ReportSummary Model Schema
export interface IReportSummary extends Document {
  totalRevenueRs: number;
  totalHarvestKg: number;
  avgProfitMarginPercent: number;
  activeLotsCount: number;
  monthlyBreakdown: {
    month: string;
    revenue: number;
    yield: number;
  }[];
  channelShare: {
    channel: string;
    amount: number;
    percent: number;
  }[];
}

const ReportSummarySchema = new Schema<IReportSummary>({
  totalRevenueRs: { type: Number, required: true },
  totalHarvestKg: { type: Number, required: true },
  avgProfitMarginPercent: { type: Number, required: true },
  activeLotsCount: { type: Number, required: true },
  monthlyBreakdown: [{
    month: { type: String, required: true },
    revenue: { type: Number, required: true },
    yield: { type: Number, required: true }
  }],
  channelShare: [{
    channel: { type: String, required: true },
    amount: { type: Number, required: true },
    percent: { type: Number, required: true }
  }]
}, { timestamps: true });

export const ReportSummary = mongoose.models.ReportSummary || mongoose.model<IReportSummary>('ReportSummary', ReportSummarySchema);
