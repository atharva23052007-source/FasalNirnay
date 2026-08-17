import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Lot, Pesticide, InputOrder } from './models.js';
import { mockPesticides, mockInputPurchaseHistory, mockFarmerLots } from '../src/data/mockData.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// In-memory fallbacks when MongoDB is offline
let localLots = [...mockFarmerLots];
let localOrders = [...mockInputPurchaseHistory];

// Connect to MongoDB
let MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/fasalnirnay';
if (MONGO_URI.endsWith(';')) {
  MONGO_URI = MONGO_URI.slice(0, -1);
}
console.log(`Connecting to MongoDB...`);
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('🚀 Connected to MongoDB successfully');
    await seedDatabase();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
  });

async function seedDatabase() {
  try {
    const lotCount = await Lot.countDocuments();
    if (lotCount === 0) {
      console.log('🌱 Seeding default lots to MongoDB...');
      await Lot.insertMany(mockFarmerLots);
    }

    console.log('🌱 Re-seeding default pesticide products to MongoDB...');
    await Pesticide.deleteMany({});
    await Pesticide.insertMany(mockPesticides);

    const orderCount = await InputOrder.countDocuments();
    if (orderCount === 0) {
      console.log('🌱 Seeding default input purchase orders to MongoDB...');
      await InputOrder.insertMany(mockInputPurchaseHistory);
    }
  } catch (err: any) {
    console.error('❌ Error seeding database:', err.message);
  }
}

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    engine: 'FasalNirnay AI Crop Decision Engine v1.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/market-prices', (req: Request, res: Response) => {
  res.json({
    mandi: 'Nashik APMC',
    timestamp: new Date().toISOString(),
    prices: [
      { crop: 'Tomato', modalPriceKg: 18.00, changePercent: -2.8, arrivalMT: 120 },
      { crop: 'Onion', modalPriceKg: 16.20, changePercent: 1.6, arrivalMT: 85 },
    ],
  });
});

app.get('/api/recommendations', (req: Request, res: Response) => {
  res.json({
    recommendations: [
      {
        id: 'crop-1',
        crop: 'Tomato',
        action: 'WAIT 2 DAYS',
        profitImpact: '+₹1,850',
        optimalDate: '25 May Morning',
        rationale: 'Price is expected to rise and your crop can safely wait.',
      },
      {
        id: 'crop-2',
        crop: 'Onion',
        action: 'SELL TODAY',
        profitImpact: 'Best price available now',
        optimalDate: 'Today Evening',
        rationale: 'Prices may drop tomorrow and spoilage risk will increase.',
      },
      {
        id: 'crop-3',
        crop: 'Leafy Vegetables',
        action: 'PROCESS TODAY',
        profitImpact: 'Spoilage risk is high',
        optimalDate: 'Today Afternoon',
        rationale: 'Crop spoils fast and value reduces quickly.',
      },
    ],
  });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { channel, crop, location } = req.body;
  if (!channel || !crop) {
    res.status(400).json({ error: 'Channel and crop fields are required' });
    return;
  }

  res.status(201).json({
    success: true,
    orderId: `FN-${Math.floor(100000 + Math.random() * 900000)}`,
    channel,
    crop,
    location: location || 'Nashik, Maharashtra',
    status: 'DISPATCH_SCHEDULED',
    estimatedPickup: 'Within 2 hours',
  });
});

// --- NEW ENDPOINTS FOR FARMER LOTS ---

app.get('/api/lots', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json(localLots);
      return;
    }
    const lots = await Lot.find().sort({ createdAt: -1 });
    res.json(lots);
  } catch (err) {
    next(err);
  }
});

app.post('/api/lots', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lotData = req.body;
    if (mongoose.connection.readyState !== 1) {
      if (!lotData.id) {
        lotData.id = `lot-${Date.now()}`;
      }
      localLots.unshift(lotData);
      res.status(201).json(lotData);
      return;
    }
    const newLot = new Lot(lotData);
    await newLot.save();
    res.status(201).json(newLot);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/lots/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState !== 1) {
      const initialLength = localLots.length;
      localLots = localLots.filter(l => l.id !== id);
      if (localLots.length === initialLength) {
        res.status(404).json({ error: 'Lot not found' });
        return;
      }
      res.json({ success: true, message: 'Lot deleted successfully' });
      return;
    }
    const result = await Lot.findOneAndDelete({ id });
    if (!result) {
      res.status(404).json({ error: 'Lot not found' });
      return;
    }
    res.json({ success: true, message: 'Lot deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// --- NEW ENDPOINTS FOR PESTICIDES/INPUTS ---

app.get('/api/pesticides', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json(mockPesticides);
      return;
    }
    const products = await Pesticide.find();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

app.get('/api/orders/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json(localOrders);
      return;
    }
    const orders = await InputOrder.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

app.post('/api/orders/history', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderData = req.body;
    if (mongoose.connection.readyState !== 1) {
      if (!orderData.id) {
        orderData.id = `order-${Date.now()}`;
      }
      localOrders.unshift(orderData);
      res.status(201).json(orderData);
      return;
    }
    const newOrder = new InputOrder(orderData);
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    next(err);
  }
});

// Global Error Handler Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 FasalNirnay Express API Server running on port ${PORT}`);
  });
}

export default app;

