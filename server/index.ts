import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
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

// --- MONGODB SETUP ---
let isMongoConnected = false;

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
mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 3000,
  })
  .then(() => {
    isMongoConnected = true;
    console.log(`🍃 Connected to MongoDB successfully at: ${MONGODB_URI}`);
  })
  .catch((err) => {
    isMongoConnected = false;
    console.warn(`⚠️ MongoDB connection warning (${err.message}). Operating with in-memory auth fallback.`);
  });

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
