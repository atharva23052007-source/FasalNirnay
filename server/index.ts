import express, { Request, Response, NextFunction } from 'express';
import https from 'https';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Lot, Pesticide, InputOrder, MarketPrice, ReportSummary } from './models.js';
import { mockPesticides, mockInputPurchaseHistory, mockFarmerLots, mockMarketPricesDetails, mockReportSummary } from '../src/data/mockData.js';
import bcrypt from 'bcryptjs';
import { languageMiddleware } from './middleware/languageMiddleware';
import { translateResponse } from './utils/responseTranslator';
import { translateText } from './services/translationService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fasal_nirnay';

// Enable CORS, JSON parsing & Language Middleware
app.use(cors());
app.use(express.json());
app.use(languageMiddleware);

// API Routes
// In-memory fallbacks when MongoDB is offline
let localLots = [...mockFarmerLots];
let localOrders = [...mockInputPurchaseHistory];

// --- MONGODB SETUP ---
let isMongoConnected = false;

let MONGO_URI = process.env.MONGO_URL_LOTS || process.env.MONGODB_URI || process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/fasalnirnay';
if (MONGO_URI.endsWith(';')) {
  MONGO_URI = MONGO_URI.slice(0, -1);
}

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  identifier: { type: String, required: true, unique: true }, // Email or Mobile
  password: { type: String, required: true },
  role: { type: String, enum: ['Farmer', 'Admin', 'NGO/FPO'], default: 'Farmer' },
  location: { type: String, default: 'Nashik, Maharashtra' },
  coordinates: {
    lat: { type: Number, default: 20.0003 },
    lon: { type: Number, default: 73.7898 },
  },
  farmSizeAcres: { type: Number, default: 4.0 },
  mainCrops: { type: [String], default: ['Tomato', 'Red Onion', 'Spinach'] },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

// In-Memory User Store
interface InMemoryUser {
  id: string;
  name: string;
  identifier: string;
  passwordHash: string;
  role: 'Farmer' | 'Admin' | 'NGO/FPO';
  location: string;
  coordinates: { lat: number; lon: number };
  farmSizeAcres: number;
  mainCrops: string[];
}

const memoryUsers: Map<string, InMemoryUser> = new Map();

// Seed Default Demo Accounts
(async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);

  memoryUsers.set('9822012345', {
    id: 'demo_farmer_1',
    name: 'Ayush Patil',
    identifier: '9822012345',
    passwordHash: hash,
    role: 'Farmer',
    location: 'Nashik, Maharashtra',
    coordinates: { lat: 20.0003, lon: 73.7898 },
    farmSizeAcres: 4.5,
    mainCrops: ['Tomato', 'Red Onion', 'Spinach'],
  });

  memoryUsers.set('ramesh@farmer.com', {
    id: 'demo_farmer_2',
    name: 'Ramesh Patil',
    identifier: 'ramesh@farmer.com',
    passwordHash: hash,
    role: 'Farmer',
    location: 'Nashik, Maharashtra',
    coordinates: { lat: 20.0003, lon: 73.7898 },
    farmSizeAcres: 4.0,
    mainCrops: ['Tomato', 'Onion'],
  });
})();

// Initialize MongoDB Connection
mongoose.set('strictQuery', false);
console.log(`Connecting to MongoDB...`);
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 3000,
})
  .then(async () => {
    isMongoConnected = true;
    console.log('🚀 Connected to MongoDB successfully');
    await seedDatabase();
  })
  .catch(err => {
    isMongoConnected = false;
    console.warn(`⚠️ MongoDB connection warning (${err.message}). Operating with in-memory auth fallback.`);
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

    console.log('🌱 Re-seeding default market prices to MongoDB...');
    await MarketPrice.deleteMany({});
    await MarketPrice.insertMany(mockMarketPricesDetails);

    console.log('🌱 Re-seeding default report summaries to MongoDB...');
    await ReportSummary.deleteMany({});
    await ReportSummary.create(mockReportSummary);
  } catch (err: any) {
    console.error('❌ Error seeding database:', err.message);
  }
}

// --- AUTHENTICATION ROUTES ---

// POST /api/auth/signup
app.post('/api/auth/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, identifier, password, role, location, coordinates, farmSizeAcres } = req.body;

    if (!name || !identifier || !password) {
      res.status(400).json({ error: 'Name, Phone/Email, and Password are required.' });
      return;
    }

    const cleanIdentifier = identifier.toString().trim().toLowerCase();
    const userRole = role || 'Farmer';
    const userLocation = location || 'Nashik, Maharashtra';
    const userCoords = coordinates || { lat: 20.0003, lon: 73.7898 };
    const userFarmSize = farmSizeAcres ? Number(farmSizeAcres) : 4.0;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (isMongoConnected) {
      const existing = await User.findOne({ identifier: cleanIdentifier });
      if (existing) {
        res.status(400).json({ error: 'An account with this Phone/Email already exists. Please Log In.' });
        return;
      }

      const newUser = new User({
        name,
        identifier: cleanIdentifier,
        password: passwordHash,
        role: userRole,
        location: userLocation,
        coordinates: userCoords,
        farmSizeAcres: userFarmSize,
        mainCrops: userRole === 'Farmer' ? ['Tomato', 'Red Onion'] : ['Operations'],
      });

      await newUser.save();

      const userRes = {
        id: newUser._id.toString(),
        name: newUser.name,
        mobile: newUser.identifier,
        emailOrPhone: newUser.identifier,
        role: newUser.role,
        location: newUser.location,
        coordinates: newUser.coordinates,
        farmSizeAcres: newUser.farmSizeAcres,
        mainCrops: newUser.mainCrops,
        isLoggedIn: true,
        avatarUrl: '/assets/farmer_banner.jpg',
        token: `fn_token_${newUser._id}_${Date.now()}`,
      };

      res.status(201).json({ success: true, user: userRes });
      return;
    } else {
      // In-Memory Store
      if (memoryUsers.has(cleanIdentifier)) {
        res.status(400).json({ error: 'An account with this Phone/Email already exists. Please Log In.' });
        return;
      }

      const newId = `mem_usr_${Date.now()}`;
      const memUser: InMemoryUser = {
        id: newId,
        name,
        identifier: cleanIdentifier,
        passwordHash,
        role: userRole,
        location: userLocation,
        coordinates: userCoords,
        farmSizeAcres: userFarmSize,
        mainCrops: userRole === 'Farmer' ? ['Tomato', 'Red Onion'] : ['Operations'],
      };
      memoryUsers.set(cleanIdentifier, memUser);

      const userRes = {
        id: memUser.id,
        name: memUser.name,
        mobile: memUser.identifier,
        emailOrPhone: memUser.identifier,
        role: memUser.role,
        location: memUser.location,
        coordinates: memUser.coordinates,
        farmSizeAcres: memUser.farmSizeAcres,
        mainCrops: memUser.mainCrops,
        isLoggedIn: true,
        avatarUrl: '/assets/farmer_banner.jpg',
        token: `fn_token_${memUser.id}_${Date.now()}`,
      };

      res.status(201).json({ success: true, user: userRes });
      return;
    }
  } catch (error: any) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Server signup failed: ' + error.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      res.status(400).json({ error: 'Phone/Email and Password are required.' });
      return;
    }

    const cleanIdentifier = identifier.toString().trim().toLowerCase();

    if (isMongoConnected) {
      const user = await User.findOne({ identifier: cleanIdentifier });
      if (!user) {
        res.status(401).json({ error: 'Account not found with this Phone/Email. Please Sign Up first.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ error: 'Incorrect password. Please verify your password.' });
        return;
      }

      if (role && user.role !== role) {
        user.role = role;
        await user.save();
      }

      const userRes = {
        id: user._id.toString(),
        name: user.name,
        mobile: user.identifier,
        emailOrPhone: user.identifier,
        role: user.role,
        location: user.location,
        coordinates: user.coordinates,
        farmSizeAcres: user.farmSizeAcres,
        mainCrops: user.mainCrops,
        isLoggedIn: true,
        avatarUrl: '/assets/farmer_banner.jpg',
        token: `fn_token_${user._id}_${Date.now()}`,
      };

      res.json({ success: true, user: userRes });
      return;
    } else {
      // In-Memory Authentication Lookup
      const memUser = memoryUsers.get(cleanIdentifier);
      if (!memUser) {
        res.status(401).json({ error: 'Account not found with this Phone/Email. Please Sign Up first.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, memUser.passwordHash);
      if (!isMatch) {
        res.status(401).json({ error: 'Incorrect password. Please verify your password.' });
        return;
      }

      if (role) memUser.role = role;

      const userRes = {
        id: memUser.id,
        name: memUser.name,
        mobile: memUser.identifier,
        emailOrPhone: memUser.identifier,
        role: memUser.role,
        location: memUser.location,
        coordinates: memUser.coordinates,
        farmSizeAcres: memUser.farmSizeAcres,
        mainCrops: memUser.mainCrops,
        isLoggedIn: true,
        avatarUrl: '/assets/farmer_banner.jpg',
        token: `fn_token_${memUser.id}_${Date.now()}`,
      };

      res.json({ success: true, user: userRes });
      return;
    }
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Server login failed: ' + error.message });
  }
});

// GET /api/auth/status
app.get('/api/auth/status', (req: Request, res: Response) => {
  res.json({
    mongoConnected: isMongoConnected,
    mode: isMongoConnected ? 'MongoDB Persisted' : 'In-Memory Auth',
    requestLanguage: req.language,
    timestamp: new Date().toISOString(),
  });
});

// API Routes with Dynamic Response Translation
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    engine: 'FasalNirnay AI Crop Decision Engine v1.0',
    mongoConnected: isMongoConnected,
    requestedLanguage: req.language,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/market-prices', async (req: Request, res: Response): Promise<void> => {
  const payload = {
    mandi: 'Nashik APMC',
    timestamp: new Date().toISOString(),
    prices: [
      { crop: 'Tomato', modalPriceKg: 18.0, changePercent: -2.8, arrivalMT: 120 },
      { crop: 'Onion', modalPriceKg: 16.2, changePercent: 1.6, arrivalMT: 85 },
    ],
  };

  const translatedPayload = await translateResponse(payload, req.language);
  res.json(translatedPayload);
});

app.post('/api/send-sms', async (req: Request, res: Response) => {
  try {
    const { phone, message } = req.body;
    const apiKey = process.env.FAST2SMS_API_KEY;

    if (!apiKey) {
      res.status(400).json({ error: 'To send a real SMS to your phone, please create a free account on fast2sms.com and add FAST2SMS_API_KEY to your .env file!' });
      return;
    }

    const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'v3',
        sender_id: 'TXTIND',
        message: message,
        language: 'english',
        flash: 0,
        numbers: phone.replace(/[^0-9]/g, '').slice(-10)
      })
    });

    const data = await response.json() as any;
    if (data.return) {
      res.json({ success: true, message: 'SMS Sent Successfully to your phone!' });
    } else {
      res.status(400).json({ error: data.message || 'Failed to send SMS' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/images', async (req: Request, res: Response) => {
  const query = req.query.q as string;
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: 'Pixabay API key not configured on server' });
    return;
  }

  if (!query) {
    res.status(400).json({ error: 'Query parameter "q" is required' });
    return;
  }

  try {
    const fetchResponse = await fetch(
      `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&image_type=photo&orientation=horizontal&per_page=3`
    );
    const data = await fetchResponse.json() as any;

    if (data.hits && data.hits.length > 0) {
      res.json({ url: data.hits[0].webformatURL });
    } else {
      res.status(404).json({ error: 'No images found' });
    }
  } catch (error) {
    console.error('Pixabay API Error:', error);
    res.status(500).json({ error: 'Failed to fetch image from Pixabay' });
  }
});

app.get('/api/recommendations', async (req: Request, res: Response): Promise<void> => {
  const payload = {
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
  };

  const translatedPayload = await translateResponse(payload, req.language);
  res.json(translatedPayload);
});

    app.post('/api/orders', async (req: Request, res: Response): Promise<void> => {
      const { channel, crop, location } = req.body;
      if (!channel || !crop) {
        res.status(400).json({ error: 'Channel and crop fields are required' });
        return;
      }

      const payload = {
        success: true,
        orderId: `FN-${Math.floor(100000 + Math.random() * 900000)}`,
        channel,
        crop,
        location: location || 'Nashik, Maharashtra',
        status: 'DISPATCH_SCHEDULED',
        statusText: 'Pickup dispatched within 2 hours',
        estimatedPickup: 'Within 2 hours',
      };

      const translatedPayload = await translateResponse(payload, req.language);
      res.status(201).json(translatedPayload);
    });

    // Explicit Text Translation Endpoint
    app.post('/api/translate', async (req: Request, res: Response): Promise<void> => {
      try {
        const { text, targetLanguage } = req.body;
        const tgt = targetLanguage || req.language || 'en';

        if (!text || typeof text !== 'string') {
          res.status(400).json({ error: 'Valid text string is required' });
          return;
        }

        const translatedText = await translateText(text, tgt);
        res.json({ text, targetLanguage: tgt, translatedText });
      } catch (error: any) {
        res.status(500).json({ error: 'Translation failed', message: error.message });
      }
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

    if(process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
      console.log(`🚀 FasalNirnay Express API Server running on port ${PORT}`);
    });
  }

  export default app;

