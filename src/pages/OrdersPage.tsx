import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingCart, Search, SlidersHorizontal, Star, X, Plus, Minus, Trash2,
  ChevronDown, ChevronUp, Package, CheckCircle2, Truck, Clock,
  AlertTriangle, FlaskConical, Leaf, Sprout, ShieldCheck, ShoppingBag,
  MapPin, CreditCard, Smartphone, Banknote, ChevronRight, History,
} from 'lucide-react';
import { mockPesticides, mockInputPurchaseHistory, mockOrders } from '../data/mockData';
import { PesticideProduct, PackOption, CartItem, InputPurchaseOrder } from '../types';
import { useApp } from '../context/AppContext';
import { AutoTranslate, useLanguage } from '../context/LanguageContext';

// ─── Constants ────────────────────────────────────────────────────────────────

const PROBLEM_FILTERS = [
  'All',
  'Insects & Pests',
  'Fungal Disease',
  'Nutrient Deficiency',
  'Weed Control',
  'Bio-Organic',
];
const CATEGORY_FILTERS = ['All', 'Insecticide', 'Fungicide', 'Herbicide', 'Nutrient & Fertilizer', 'Bio-Pesticide'];
const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

const DELIVERY_FEE = 49;
const FREE_DELIVERY_THRESHOLD = 500;
const GST_RATE = 0.18;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const categoryColor: Record<string, string> = {
  Insecticide: 'bg-red-50 text-red-700 border-red-200',
  Fungicide: 'bg-purple-50 text-purple-700 border-purple-200',
  Herbicide: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Nutrient & Fertilizer': 'bg-amber-50 text-amber-700 border-amber-200',
  'Bio-Pesticide': 'bg-green-50 text-green-700 border-green-200',
};

const categoryIcon = (cat: string) => {
  switch (cat) {
    case 'Insecticide': return <AlertTriangle className="w-3 h-3" />;
    case 'Fungicide': return <FlaskConical className="w-3 h-3" />;
    case 'Herbicide': return <Sprout className="w-3 h-3" />;
    case 'Nutrient & Fertilizer': return <Leaf className="w-3 h-3" />;
    case 'Bio-Pesticide': return <ShieldCheck className="w-3 h-3" />;
    default: return null;
  }
};

const problemToCategory: Record<string, string[]> = {
  'Insects & Pests': ['Insecticide', 'Bio-Pesticide'],
  'Fungal Disease': ['Fungicide'],
  'Nutrient Deficiency': ['Nutrient & Fertilizer'],
  'Weed Control': ['Herbicide'],
  'Bio-Organic': ['Bio-Pesticide'],
};

const Stars: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'w-3.5 h-3.5' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} className={`${size} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ProductCardProps {
  product: PesticideProduct;
  onViewDetails: (p: PesticideProduct) => void;
  onAddToCart: (p: PesticideProduct, pack: PackOption) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onAddToCart }) => {
  const [selectedPackIdx, setSelectedPackIdx] = useState(0);
  const selectedPack = product.packOptions[selectedPackIdx];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80'; }}
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 font-bold text-xs px-3 py-1.5 rounded-full">Out of Stock</span>
          </div>
        )}
        <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full border ${categoryColor[product.category]}`}>
          {categoryIcon(product.category)} {product.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">{product.brand}</p>
          <h3 className="font-heading font-extrabold text-sm text-gray-900 mt-0.5 leading-snug">{product.name}</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{product.purpose}</p>
        </div>

        {/* Suitable crops */}
        <div className="flex flex-wrap gap-1">
          {product.suitableCrops.slice(0, 3).map(c => (
            <span key={c} className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#E6F4EA] text-[#167A42] rounded-full">{c}</span>
          ))}
          {product.suitableCrops.length > 3 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-full">+{product.suitableCrops.length - 3}</span>
          )}
        </div>

        {/* Dosage */}
        <p className="text-[11px] text-gray-500"><span className="font-bold text-gray-700">Dosage:</span> {product.dosage}</p>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-xs font-bold text-gray-700">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviewCount})</span>
        </div>

        {/* Pack selector + price */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          <select
            value={selectedPackIdx}
            onChange={e => setSelectedPackIdx(Number(e.target.value))}
            className="flex-1 text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {product.packOptions.map((p, i) => (
              <option key={i} value={i}>{p.label} — ₹{p.priceRs}</option>
            ))}
          </select>
          <span className="font-heading font-extrabold text-base text-[#167A42]">₹{selectedPack.priceRs}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onViewDetails(product)}
            className="flex-1 text-xs font-bold py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
          <button
            disabled={!product.inStock}
            onClick={() => onAddToCart(product, selectedPack)}
            className="flex-1 text-xs font-bold py-2 rounded-xl bg-[#167A42] text-white hover:bg-[#0e5c30] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Product Detail Modal ─────────────────────────────────────────────────────

interface DetailModalProps {
  product: PesticideProduct;
  onClose: () => void;
  onAddToCart: (p: PesticideProduct, pack: PackOption, qty: number) => void;
}

const ProductDetailModal: React.FC<DetailModalProps> = ({ product, onClose, onAddToCart }) => {
  const [packIdx, setPackIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const pack = product.packOptions[packIdx];

  const handleBuyNow = () => {
    onAddToCart(product, pack, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-52 overflow-hidden rounded-t-2xl bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80'; }}
          />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <span className={`absolute bottom-3 left-3 inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${categoryColor[product.category]}`}>
            {categoryIcon(product.category)} {product.category}
          </span>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Title */}
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{product.brand}</p>
            <h2 className="font-heading font-extrabold text-xl text-gray-900 mt-1">{product.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{product.purpose}</p>
            <div className="flex items-center gap-2 mt-2">
              <Stars rating={product.rating} size="w-4 h-4" />
              <span className="text-sm font-bold text-gray-700">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviewCount} reviews)</span>
            </div>
          </div>

          {/* Crop & Problems */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Suitable Crops</p>
              <div className="flex flex-wrap gap-1.5">
                {product.suitableCrops.map(c => (
                  <span key={c} className="text-xs font-semibold px-2 py-1 bg-[#E6F4EA] text-[#167A42] rounded-full">{c}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Controls</p>
              <div className="flex flex-wrap gap-1.5">
                {product.targetProblems.map(p => (
                  <span key={p} className="text-xs font-semibold px-2 py-1 bg-red-50 text-red-700 rounded-full capitalize">{p}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Dosage */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-700 uppercase mb-0.5">Recommended Dosage</p>
            <p className="text-sm font-semibold text-blue-900">{product.dosage}</p>
          </div>

          {/* Usage Instructions */}
          <div>
            <p className="text-xs font-bold text-gray-700 uppercase mb-2">Usage Instructions</p>
            <ol className="flex flex-col gap-2">
              {product.usageInstructions.map((inst, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-gray-600 leading-relaxed">
                  <span className="w-5 h-5 min-w-[20px] flex items-center justify-center rounded-full bg-[#E6F4EA] text-[#167A42] font-bold text-[11px] mt-0.5">{i + 1}</span>
                  {inst}
                </li>
              ))}
            </ol>
          </div>

          {/* Precautions */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Precautions
            </p>
            <ul className="flex flex-col gap-1.5">
              {product.precautions.map((prec, i) => (
                <li key={i} className="text-xs text-amber-800 leading-relaxed flex gap-2">
                  <span className="text-amber-500 mt-0.5">•</span> {prec}
                </li>
              ))}
            </ul>
          </div>

          {/* Buy Section */}
          <div className="border-t border-gray-100 pt-5">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              {/* Pack Size */}
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-600 mb-2">Pack Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.packOptions.map((p, i) => (
                    <button
                      key={p.label}
                      onClick={() => setPackIdx(i)}
                      className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${
                        packIdx === i
                          ? 'bg-[#167A42] text-white border-[#167A42]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {p.label} · ₹{p.priceRs}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 py-2 bg-white">
                <button
                  disabled={qty <= 1}
                  onClick={() => setQty(q => q - 1)}
                  className="text-gray-500 hover:text-gray-800 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold text-sm select-none">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="text-gray-500 hover:text-gray-800">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add & Total */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Price</p>
                  <p className="font-heading font-extrabold text-xl text-[#167A42] mt-0.5">₹{(pack.priceRs * qty).toLocaleString()}</p>
                </div>
                <button
                  disabled={!product.inStock}
                  onClick={handleBuyNow}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#167A42] hover:bg-[#0e5c30] text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition-all"
                >
                  <ShoppingCart className="w-4 h-4" /> Add & Buy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

interface CartDrawerProps {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQty: (pId: string, label: string, delta: number) => void;
  onRemove: (pId: string, label: string) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ cart, onClose, onUpdateQty, onRemove, onCheckout }) => {
  const subtotal = cart.reduce((s, i) => s + i.packOption.priceRs * i.qty, 0);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const gst = Math.round((subtotal + delivery) * GST_RATE);
  const grand = subtotal + delivery + gst;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />
      <div
        className="w-full max-w-sm bg-white flex flex-col shadow-2xl h-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-heading font-extrabold text-lg text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#167A42]" /> My Cart
            <span className="text-sm font-bold text-white bg-[#167A42] rounded-full w-6 h-6 flex items-center justify-center">
              {cart.reduce((s, i) => s + i.qty, 0)}
            </span>
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
              <ShoppingBag className="w-12 h-12 text-gray-200" />
              <p className="font-semibold text-sm">Your cart is empty</p>
              <p className="text-xs text-center">Add pesticides or fertilizers to get started</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={`${item.product.id}-${item.packOption.label}`} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 leading-snug truncate">{item.product.name}</p>
                  <p className="text-[11px] text-gray-400">{item.product.brand} · {item.packOption.label}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button onClick={() => onUpdateQty(item.product.id, item.packOption.label, -1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                      <button onClick={() => onUpdateQty(item.product.id, item.packOption.label, 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-extrabold text-sm text-[#167A42]">₹{(item.packOption.priceRs * item.qty).toLocaleString()}</span>
                      <button onClick={() => onRemove(item.product.id, item.packOption.label)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery {delivery === 0 && <span className="text-emerald-600 font-bold">(Free!)</span>}</span>
                <span className="font-semibold">{delivery === 0 ? '₹0' : `₹${delivery}`}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span className="font-semibold">₹{gst.toLocaleString()}</span>
              </div>
              {subtotal < FREE_DELIVERY_THRESHOLD && (
                <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg px-2 py-1.5">
                  Add ₹{FREE_DELIVERY_THRESHOLD - subtotal} more for free delivery
                </p>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1">
                <span>Total Amount</span>
                <span className="font-heading font-extrabold text-lg text-[#167A42]">₹{grand.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-3 rounded-xl bg-[#167A42] hover:bg-[#0e5c30] text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 mt-1"
            >
              Secure Checkout <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Checkout Modal ───────────────────────────────────────────────────────────

type PaymentMethod = 'upi' | 'cod' | 'kcc';

interface CheckoutModalProps {
  cart: CartItem[];
  onClose: () => void;
  onOrderPlaced: (o: InputPurchaseOrder) => void;
  userLocation: string;
  userName: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ cart, onClose, onOrderPlaced, userLocation, userName }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [address, setAddress] = useState(`${userName}'s Farm, ${userLocation}`);
  const [placedOrder, setPlacedOrder] = useState<InputPurchaseOrder | null>(null);

  const subtotal = cart.reduce((s, i) => s + i.packOption.priceRs * i.qty, 0);
  const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const gst = Math.round((subtotal + delivery) * GST_RATE);
  const grand = subtotal + delivery + gst;

  const paymentLabels: Record<PaymentMethod, string> = {
    upi: 'UPI / PhonePe / GPay',
    cod: 'Cash on Delivery',
    kcc: 'Kisan Credit Card',
  };

  const handlePlaceOrder = () => {
    const orderNum = `FNB-${Math.floor(20000 + Math.random() * 10000)}`;
    const today = new Date();
    const delivery3 = new Date(today);
    delivery3.setDate(today.getDate() + 3);
    const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const newOrder: InputPurchaseOrder = {
      id: `iord-new-${Date.now()}`,
      orderNumber: orderNum,
      date: fmt(today),
      items: cart.map(i => ({
        productName: i.product.name,
        brand: i.product.brand,
        packLabel: i.packOption.label,
        qty: i.qty,
        priceRs: i.packOption.priceRs,
      })),
      totalRs: grand,
      status: 'Processing',
      estimatedDelivery: fmt(delivery3),
    };
    setPlacedOrder(newOrder);
    setStep('success');
    onOrderPlaced(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {step === 'success' && placedOrder ? (
          <div className="flex flex-col items-center gap-5 p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-gray-900">Order Placed!</h2>
              <p className="text-sm text-gray-500 mt-1">Your agricultural inputs are on their way</p>
            </div>
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-left flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order Number</span>
                <span className="font-bold text-gray-900">{placedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items</span>
                <span className="font-semibold text-gray-900">{placedOrder.items.length} product(s)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-heading font-extrabold text-[#167A42]">₹{placedOrder.totalRs.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estimated Delivery</span>
                <span className="font-bold text-gray-900">{placedOrder.estimatedDelivery}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-1">
                <span className="text-gray-500">Delivery Address</span>
                <span className="font-semibold text-gray-900 text-xs text-right max-w-[200px] truncate">{address}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#167A42] hover:bg-[#0e5c30] text-white font-bold text-sm shadow-sm transition-all"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-5">
            <div>
              <h2 className="font-heading font-extrabold text-xl text-gray-900 font-bold">Secure Checkout</h2>
              <p className="text-xs text-gray-500 mt-0.5">Please confirm your delivery address & payment method</p>
            </div>

            {/* Delivery address */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2 font-bold">Delivery Address</label>
              <textarea
                rows={2}
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#167A42]/20 font-medium"
              />
            </div>

            {/* Payment method */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2 font-bold">Payment Method</label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['upi', 'cod', 'kcc'] as PaymentMethod[]).map(m => {
                  const active = paymentMethod === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                        active
                          ? 'border-[#167A42] bg-[#E6F4EA]/30 text-[#167A42]'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {m === 'upi' && <Smartphone className="w-5 h-5 stroke-[1.5]" />}
                      {m === 'cod' && <Banknote className="w-5 h-5 stroke-[1.5]" />}
                      {m === 'kcc' && <CreditCard className="w-5 h-5 stroke-[1.5]" />}
                      <span className="text-[10px] font-bold">{paymentLabels[m].split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2 text-xs border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Products Subtotal</span>
                <span className="font-semibold text-gray-700">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-semibold text-gray-700">{delivery === 0 ? '₹0' : `₹${delivery}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">GST (18%)</span>
                <span className="font-semibold text-gray-700">₹{gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
                <span>Grand Total</span>
                <span className="font-heading font-extrabold text-[#167A42] text-base">₹{grand.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-sm text-gray-700 hover:bg-gray-50 transition-all"
              >
                Go Back
              </button>
              <button
                onClick={handlePlaceOrder}
                className="flex-1 py-3 rounded-xl bg-[#167A42] hover:bg-[#0e5c30] text-white font-bold text-sm shadow-sm transition-all"
              >
                Place Order (₹{grand.toLocaleString()})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Purchase History ─────────────────────────────────────────────────────────

const statusBadge = (status: string) => {
  switch (status) {
    case 'Delivered':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">✓ Delivered</span>;
    case 'Processing':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">⟳ Processing</span>;
    case 'Cancelled':
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">✗ Cancelled</span>;
    default:
      return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">{status}</span>;
  }
};

interface PurchaseHistoryProps {
  orders: InputPurchaseOrder[];
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ orders }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden w-full max-w-full">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 hover:bg-gray-50 transition-colors"
      >
        <h3 className="font-heading font-extrabold text-sm sm:text-base text-gray-900 flex items-center gap-2">
          <History className="w-5 h-5 text-[#167A42]" />
          Previous Input Purchases
          <span className="text-xs font-bold text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{orders.length}</span>
        </h3>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 overflow-x-auto w-full max-w-full">
          <table className="min-w-[650px] w-full text-xs text-left">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-100">
              <tr>
                <th className="py-3 px-4 sm:px-6">Order #</th>
                <th className="py-3 px-4 sm:px-6">Date</th>
                <th className="py-3 px-4 sm:px-6">Items</th>
                <th className="py-3 px-4 sm:px-6">Total</th>
                <th className="py-3 px-4 sm:px-6">Status</th>
                <th className="py-3 px-4 sm:px-6 text-right">Delivery Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 font-medium">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-gray-900">{order.orderNumber}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-gray-500">{order.date}</td>
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex flex-col gap-0.5">
                      {order.items.map((it, idx) => (
                        <span key={idx} className="text-[11px] text-gray-600">
                          {it.productName} · {it.packLabel} × {it.qty}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-heading font-extrabold text-[#167A42]">₹{order.totalRs.toLocaleString()}</td>
                  <td className="py-3.5 px-4 sm:px-6">{statusBadge(order.status)}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-right text-gray-500">{order.estimatedDelivery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Checks if a single crop name matches the product's suitable crops
const isSuitableForCropName = (product: PesticideProduct, cropName: string): boolean => {
  const fc = cropName.toLowerCase();
  return product.suitableCrops.some(suitableCrop => {
    const sc = suitableCrop.toLowerCase();
    if (fc.includes(sc) || sc.includes(fc)) return true;
    if (sc === 'leafy vegetables' &&
      (fc.includes('spinach') || fc.includes('leafy') ||
        fc.includes('greens') || fc.includes('palak'))) return true;
    if (sc === 'onion' && (fc.includes('onion') || fc.includes('shallot'))) return true;
    return false;
  });
};

// Returns the DISPLAY NAMES of the farmer's lots that make this product relevant.
const getMatchingLotNames = (product: PesticideProduct, farmerLots: any[]): string[] => {
  if (farmerLots.length === 0) return [];

  const matched: string[] = [];

  for (const lot of farmerLots) {
    const displayName = lot.cropName
      .replace(/\s*[(&].*$/, '')  // strip " (Grade A)" or " & something"
      .trim();

    if (isSuitableForCropName(product, displayName)) {
      matched.push(displayName);
    }
  }

  // Deduplicate matched names
  return Array.from(new Set(matched));
};

// Checks if product is suitable for any of the farmer's registered crops in their lots
const isSuitableForFarmerCrops = (product: PesticideProduct, farmerLots: any[]): boolean => {
  if (farmerLots.length === 0) return false;
  return farmerLots.some(lot => {
    const cropName = lot.cropName.replace(/\s*[(&].*$/, '').trim();
    return isSuitableForCropName(product, cropName);
  });
};

// ─── Main Orders Page Component ───────────────────────────────────────────────

export const OrdersPage: React.FC = () => {
  const [subTab, setSubTab] = useState<'buy' | 'sales'>('buy');
  const { user } = useApp();

  // --- Buy Inputs States & Logic ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<PesticideProduct | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedProblem, setSelectedProblem] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyRecommended, setShowOnlyRecommended] = useState(true);

  const [pesticides, setPesticides] = useState<PesticideProduct[]>(mockPesticides);
  const [purchaseHistory, setPurchaseHistory] = useState<InputPurchaseOrder[]>(mockInputPurchaseHistory);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { farmerLots } = useApp();

  useEffect(() => {
    setIsLoading(true);
    Promise.allSettled([
      fetch('/api/pesticides').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
      fetch('/api/orders/history').then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      }),
    ]).then(([pestResult, histResult]) => {
      if (pestResult.status === 'fulfilled' && Array.isArray(pestResult.value) && pestResult.value.length > 0) {
        setPesticides(pestResult.value);
        setFetchError(null);
      } else if (pestResult.status === 'rejected') {
        console.warn('Backend server unreachable or query failed. Operating in offline fallback.');
        setFetchError('Offline Fallback active');
      }

      if (histResult.status === 'fulfilled' && Array.isArray(histResult.value)) {
        setPurchaseHistory(histResult.value);
      }
      setIsLoading(false);
    }).catch(err => {
      console.warn('Sync failed:', err);
      setIsLoading(false);
    });
  }, []);

  const dynamicCropFilters = useMemo(() => {
    const list = new Set(['All']);
    pesticides.forEach(p => p.suitableCrops.forEach(c => list.add(c)));
    return Array.from(list);
  }, [pesticides]);

  const addToCart = (product: PesticideProduct, packOption: PackOption, quantity = 1) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id && item.packOption.label === packOption.label);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + quantity };
        return next;
      }
      return [...prev, { product, packOption, qty: quantity }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (pId: string, label: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === pId && item.packOption.label === label) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter((x): x is CartItem => x !== null));
  };

  const removeItem = (pId: string, label: string) => {
    setCart(prev => prev.filter(item => !(item.product.id === pId && item.packOption.label === label)));
  };

  const handleOrderPlaced = async (newOrder: InputPurchaseOrder) => {
    setCart([]);
    setPurchaseHistory(prev => [newOrder, ...prev]);

    try {
      await fetch('/api/orders/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      });
    } catch (err) {
      console.warn('Failed to persist order to server. Order saved in memory.', err);
    }
  };

  const combinedRecommended = useMemo(() => {
    if (farmerLots.length === 0) return [];
    const matches = pesticides.filter(p => isSuitableForFarmerCrops(p, farmerLots));
    const sorted = [...matches].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    return sorted.slice(0, 6);
  }, [pesticides, farmerLots]);

  const filtered = useMemo(() => {
    let list = [...pesticides];

    if (showOnlyRecommended && farmerLots.length > 0) {
      list = list.filter(p => isSuitableForFarmerCrops(p, farmerLots));
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.purpose.toLowerCase().includes(q) ||
        p.targetProblems.some(prob => prob.toLowerCase().includes(q))
      );
    }

    if (selectedCrop !== 'All') {
      list = list.filter(p => isSuitableForCropName(p, selectedCrop));
    }

    if (selectedProblem !== 'All') {
      const cats = problemToCategory[selectedProblem] || [];
      list = list.filter(p => cats.includes(p.category));
    }

    if (selectedCategory !== 'All') {
      list = list.filter(p => p.category === selectedCategory);
    }

    if (sortBy === 'popular') {
      list.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => a.packOptions[0].priceRs - b.packOptions[0].priceRs);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.packOptions[0].priceRs - a.packOptions[0].priceRs);
    }

    return list;
  }, [pesticides, searchTerm, selectedCrop, selectedProblem, selectedCategory, sortBy, showOnlyRecommended, farmerLots]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // --- Sell Orders / Dispatches Logic ---
  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case 'Blinkit':
        return <span className="bg-[#ffc107] text-black font-extrabold px-2.5 py-0.5 rounded text-[11px]"><AutoTranslate text="Blinkit" /></span>;
      case 'Swiggy Instamart':
        return <span className="bg-[#f25c05] text-white font-extrabold px-2.5 py-0.5 rounded text-[11px]"><AutoTranslate text="Swiggy Instamart" /></span>;
      case 'Local Mandi (eNAM)':
        return <span className="bg-[#055a29] text-white font-extrabold px-2.5 py-0.5 rounded text-[11px]"><AutoTranslate text="Local Mandi (eNAM)" /></span>;
      default:
        return <span className="bg-blue-600 text-white font-extrabold px-2.5 py-0.5 rounded text-[11px]"><AutoTranslate text={channel} /></span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" /> <AutoTranslate text="Completed" />
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold text-xs">
            <Truck className="w-3.5 h-3.5" /> <AutoTranslate text="In Transit" />
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold text-xs">
            <Clock className="w-3.5 h-3.5" /> <AutoTranslate text="Pending Pickup" />
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Sub-Tab Navigation Switcher */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1.5 shadow-sm gap-2 w-full">
        <button
          onClick={() => setSubTab('buy')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            subTab === 'buy'
              ? 'bg-[#167A42] text-white shadow-sm'
              : 'text-gray-600 hover:text-[#167A42] hover:bg-green-50/50'
          }`}
        >
          <Package className="w-4 h-4" />
          <AutoTranslate text="Buy Inputs & Seeds" />
        </button>
        <button
          onClick={() => setSubTab('sales')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            subTab === 'sales'
              ? 'bg-[#167A42] text-white shadow-sm'
              : 'text-gray-600 hover:text-[#167A42] hover:bg-green-50/50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <AutoTranslate text="My Sales & Shipments" />
        </button>
      </div>

      {subTab === 'buy' ? (
        <>
          {/* ── Page Header ─────────────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-2">
                <Package className="w-6 h-6 text-[#167A42]" />
                <AutoTranslate text="Agricultural Inputs" />
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                <AutoTranslate text="Buy pesticides, fertilizers & crop protection products — delivered to your farm in 2–3 days." />
              </p>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#167A42] text-white font-bold text-sm hover:bg-[#0e5c30] transition-colors shadow-sm self-start sm:self-auto"
            >
              <ShoppingCart className="w-4 h-4" />
              <AutoTranslate text="My Cart" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Recommendation status banner */}
          {farmerLots.length > 0 ? (
            <div className="bg-[#E6F4EA] border border-emerald-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start md:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#167A42] flex items-center justify-center flex-shrink-0">
                  <Sprout className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-gray-900 leading-snug">
                    <AutoTranslate text="AI Recommended Inputs Active" />
                  </h4>
                  <p className="text-xs text-emerald-800 font-semibold mt-0.5 leading-relaxed">
                    <AutoTranslate text="Showing relevant inputs for your registered crops: " />
                    {farmerLots.map(l => l.cropName.split(' ')[0]).join(', ')}
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-emerald-300 shadow-sm hover:bg-emerald-50 transition-all self-start md:self-auto">
                <input
                  type="checkbox"
                  checked={showOnlyRecommended}
                  onChange={e => setShowOnlyRecommended(e.target.checked)}
                  className="w-4 h-4 accent-[#167A42] cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-700 select-none"><AutoTranslate text="Show Recommended Only" /></span>
              </label>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-sm text-gray-900 leading-snug">
                  <AutoTranslate text="Personalize Your Input recommendations" />
                </h4>
                <p className="text-xs text-amber-800 font-semibold mt-0.5 leading-relaxed">
                  <AutoTranslate text='Add harvest lots under the "My Lots" page to dynamically see recommended pesticides, fertilizers and crop protection products.' />
                </p>
              </div>
            </div>
          )}

          {/* Recommended for Your Crops - horizontal row section (shown when toggle is ON) */}
          {showOnlyRecommended && combinedRecommended.length > 0 && (
            <div className="bg-[#fcfdfd] border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4 w-full max-w-full overflow-hidden">
              <div>
                <h3 className="font-heading font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-[#167A42]" />
                  <AutoTranslate text="Recommended for Your Crops" />
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  <AutoTranslate text="The best inputs, crop protection, and nutrients suitable for your registered crops: " />
                  {Array.from(new Set(farmerLots.map(l => l.cropName.replace(/\s*[(&].*$/, '').trim()))).join(', ')}.
                </p>
              </div>

              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin scrollbar-thumb-gray-200 scroll-smooth w-full max-w-full">
                {combinedRecommended.map(product => (
                  <div key={product.id} className="w-64 sm:w-72 flex-shrink-0 snap-start">
                    <ProductCard
                      product={product}
                      onViewDetails={p => setDetailProduct(p)}
                      onAddToCart={(p, pack) => addToCart(p, pack)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Search + Sort + Filter Toggle ──────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products, brands, problems…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-emerald-400 focus:outline-none shadow-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(f => !f)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all shadow-sm ${
                showFilters ? 'bg-[#167A42] text-white border-[#167A42]' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> <AutoTranslate text="Filters" />
            </button>
          </div>

          {/* ── Filters Panel ───────────────────────────────────────────────────── */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
              {/* Crop Filter */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2"><AutoTranslate text="Filter by Crop" /></p>
                <div className="flex flex-wrap gap-2">
                  {dynamicCropFilters.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedCrop(c)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                        selectedCrop === c
                          ? 'bg-[#167A42] text-white border-[#167A42]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <AutoTranslate text={c} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Problem Filter */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2"><AutoTranslate text="Filter by Problem" /></p>
                <div className="flex flex-wrap gap-2">
                  {PROBLEM_FILTERS.map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedProblem(p)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                        selectedProblem === p
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <AutoTranslate text={p} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-2"><AutoTranslate text="Filter by Category" /></p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_FILTERS.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                        selectedCategory === cat
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <AutoTranslate text={cat} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {(selectedCrop !== 'All' || selectedProblem !== 'All' || selectedCategory !== 'All') && (
                <button
                  onClick={() => { setSelectedCrop('All'); setSelectedProblem('All'); setSelectedCategory('All'); }}
                  className="self-start text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> <AutoTranslate text="Reset all filters" />
                </button>
              )}
            </div>
          )}

          {/* ── Active Filter Pills ──────────────────────────────────────────────── */}
          {(selectedCrop !== 'All' || selectedProblem !== 'All' || selectedCategory !== 'All' || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-semibold"><AutoTranslate text="Active:" /></span>
              {searchTerm && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100">
                  "{searchTerm}" <button onClick={() => setSearchTerm('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedCrop !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-[#E6F4EA] text-[#167A42] text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  🌱 <AutoTranslate text={selectedCrop} /> <button onClick={() => setSelectedCrop('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedProblem !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100">
                  🐛 <AutoTranslate text={selectedProblem} /> <button onClick={() => setSelectedProblem('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full border border-purple-100">
                  🧪 <AutoTranslate text={selectedCategory} /> <button onClick={() => setSelectedCategory('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <span className="text-xs text-gray-400 ml-1">
                {filtered.length} <AutoTranslate text={filtered.length !== 1 ? 'products' : 'product'} />
              </span>
            </div>
          )}

          {/* ── Sync banner — shown while backend fetch is in progress or errored ─ */}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
              <div className="w-3 h-3 border-2 border-[#167A42] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
              <AutoTranslate text="Syncing with server catalogue…" />
            </div>
          )}
          {fetchError && !isLoading && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span className="text-amber-800 font-semibold flex-1">
                <AutoTranslate text={fetchError} /> — <AutoTranslate text="showing local catalogue." />
              </span>
              <button
                onClick={() => {
                  setFetchError(null);
                  setIsLoading(true);
                  Promise.allSettled([
                    fetch('/api/pesticides').then(r => r.json()),
                    fetch('/api/orders/history').then(r => r.json()),
                  ]).then(([pestResult, histResult]) => {
                    if (pestResult.status === 'fulfilled' && Array.isArray(pestResult.value) && pestResult.value.length > 0) setPesticides(pestResult.value);
                    if (histResult.status === 'fulfilled' && Array.isArray(histResult.value)) setPurchaseHistory(histResult.value);
                    setIsLoading(false);
                  });
                }}
                className="font-bold text-[#167A42] hover:underline whitespace-nowrap"
              >
                <AutoTranslate text="Retry ↻" />
              </button>
            </div>
          )}

          {/* ── Product Grid ─────────────────────────────────────────────────────── */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={p => setDetailProduct(p)}
                  onAddToCart={(p, pack) => addToCart(p, pack)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-gray-500"><AutoTranslate text="No products found" /></p>
              <p className="text-xs text-gray-400 mt-1"><AutoTranslate text="Try a different crop, problem, or search term." /></p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCrop('All'); setSelectedProblem('All'); setSelectedCategory('All'); }}
                className="mt-4 text-xs font-bold text-[#167A42] hover:underline"
              >
                <AutoTranslate text="Clear all filters" />
              </button>
            </div>
          )}

          {/* ── Purchase History ──────────────────────────────────────────────────── */}
          <PurchaseHistory orders={purchaseHistory} />

          {/* ── Modals ────────────────────────────────────────────────────────────── */}

          {detailProduct && (
            <ProductDetailModal
              product={detailProduct}
              onClose={() => setDetailProduct(null)}
              onAddToCart={(p, pack, qty) => { addToCart(p, pack, qty); setDetailProduct(null); }}
            />
          )}

          {isCartOpen && (
            <CartDrawer
              cart={cart}
              onClose={() => setIsCartOpen(false)}
              onUpdateQty={updateQty}
              onRemove={removeItem}
              onCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
            />
          )}

          {isCheckoutOpen && (
            <CheckoutModal
              cart={cart}
              onClose={() => setIsCheckoutOpen(false)}
              onOrderPlaced={handleOrderPlaced}
              userLocation={user.location}
              userName={user.name}
            />
          )}
        </>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading font-extrabold text-2xl text-gray-900 tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-[#167A42]" />
                <AutoTranslate text="Sell Orders & Channel Dispatches" />
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                <AutoTranslate text="Track active crop shipments, dispatch timelines, and 24-hour payout statuses." />
              </p>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm w-full max-w-full">
            <div className="overflow-x-auto w-full">
              <table className="min-w-[750px] w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                  <tr>
                    <th className="py-3.5 px-6"><AutoTranslate text="Order ID" /></th>
                    <th className="py-3.5 px-6"><AutoTranslate text="Channel" /></th>
                    <th className="py-3.5 px-6"><AutoTranslate text="Crop Commodity" /></th>
                    <th className="py-3.5 px-6"><AutoTranslate text="Quantity (kg)" /></th>
                    <th className="py-3.5 px-6"><AutoTranslate text="Rate (/kg)" /></th>
                    <th className="py-3.5 px-6"><AutoTranslate text="Total Amount" /></th>
                    <th className="py-3.5 px-6"><AutoTranslate text="Status" /></th>
                    <th className="py-3.5 px-6 text-right"><AutoTranslate text="Payout" /></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-800">
                  {mockOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">{ord.orderNumber}</td>
                      <td className="py-4 px-6">{getChannelBadge(ord.channel)}</td>
                      <td className="py-4 px-6 font-semibold text-gray-900"><AutoTranslate text={ord.crop} /></td>
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
                          <AutoTranslate text={ord.payoutStatus} />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
