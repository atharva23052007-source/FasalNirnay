import express, { Request, Response, NextFunction } from 'express';
import https from 'https';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Pesticide, InputOrder, MarketPrice, ReportSummary } from './models.js';
// @ts-ignore
import Lot from '../src/models/Lots.ts';
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

let MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI || process.env.MONGO_URI ||
  process.env.MONGO_URL_LOTS || 'mongodb://127.0.0.1:27017/fasalnirnay';
if (MONGO_URI.endsWith(';')) {
  MONGO_URI = MONGO_URI.slice(0, -1);
}

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  identifier: { type: String, required: true, unique: true }, // Email or Mobile
  password: { type: String, required: true },
  role: { type: String, enum: ['Farmer', 'Admin', 'NGO/FPO'], default: 'Farmer' },
  location: { type: String, default: '' },
  coordinates: {
    lat: { type: Number },
    lon: { type: Number },
  },
  farmSizeAcres: { type: Number, default: 4.0 },
  mainCrops: { type: [String], default: ['Tomato', 'Red Onion', 'Spinach'] },
  gstin: { type: String, required: false },
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
  gstin?: string;
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
    location: '',
    coordinates: { lat: 0, lon: 0 },
    farmSizeAcres: 4.5,
    mainCrops: ['Tomato', 'Red Onion', 'Spinach'],
  });

  memoryUsers.set('ramesh@farmer.com', {
    id: 'demo_farmer_2',
    name: 'Ramesh Patil',
    identifier: 'ramesh@farmer.com',
    passwordHash: hash,
    role: 'Farmer',
    location: '',
    coordinates: { lat: 0, lon: 0 },
    farmSizeAcres: 4.0,
    mainCrops: ['Tomato', 'Onion'],
  });
})();

import dns from 'dns';

// Initialize MongoDB Connection
dns.setServers(['8.8.8.8', '8.8.4.4']); // Bypass restrictive local DNS for MongoDB Atlas SRV lookup
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
    const { name, identifier, password, role, location, coordinates, farmSizeAcres, gstin } = req.body;

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
      try {
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
          gstin: gstin || undefined,
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
      } catch (dbErr: any) {
        console.warn('MongoDB query failed during signup, falling back to memory store:', dbErr.message);
        isMongoConnected = false;
      }
    }
    
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
        gstin: gstin || undefined,
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
      try {
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

        let updated = false;
        if (role && user.role !== role) {
          user.role = role;
          updated = true;
        }
        if (req.body.location && req.body.coordinates) {
          user.location = req.body.location;
          user.coordinates = req.body.coordinates;
          updated = true;
        }
        if (updated) {
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
      } catch (dbErr: any) {
        console.warn('MongoDB query failed during login, falling back to memory store:', dbErr.message);
        isMongoConnected = false;
      }
    }
    
    // In-Memory Authentication Lookup
      const memUser = memoryUsers.get(cleanIdentifier);
      if (memUser) {
        const isMatch = await bcrypt.compare(password, memUser.passwordHash);
        if (isMatch) {
          if (role && memUser.role !== role) {
            memUser.role = role;
          }
          if (req.body.location && req.body.coordinates) {
            memUser.location = req.body.location;
            memUser.coordinates = req.body.coordinates;
          }
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
        } else {
          res.status(401).json({ error: 'Incorrect password. Please verify your password.' });
          return;
        }
      } else {
        res.status(401).json({ error: 'Account not found with this Phone/Email. Please Sign Up first.' });
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

// --- Caching and Utils ---
const apiCache = new Map<string, { data: any; timestamp: number }>();
const mandiGeocodeCache = new Map<string, { lat: number; lon: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getMandiCoordinates = async (mandiName: string, state: string) => {
  const cacheKey = `${mandiName}_${state}`;
  if (mandiGeocodeCache.has(cacheKey)) {
    return mandiGeocodeCache.get(cacheKey);
  }
  try {
    const query = encodeURIComponent(`${mandiName.replace(/APMC/i, '').trim()}, ${state}, India`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
    if (res.ok) {
      const data = await res.json() as any[];
      if (data && data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        mandiGeocodeCache.set(cacheKey, coords);
        return coords;
      }
    }
  } catch (err) {
    console.warn(`Geocoding failed for ${mandiName}:`, err);
  }
  return null;
};
// -------------------------

app.get('/api/market-prices', async (req: Request, res: Response): Promise<void> => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : null;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : null;
    
    if (!lat || !lon) {
      res.json([]);
      return;
    }
    
    let state = '';
    let district = '';

    try {
      const nomRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (nomRes.ok) {
        const nomData = await nomRes.json() as any;
        if (nomData?.address) {
          state = nomData.address.state || state;
          district = nomData.address.state_district || nomData.address.county || nomData.address.district || nomData.address.city || district;
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding failed:', err);
    }

    district = district.replace(/ District/i, '').trim();
    const apiKey = process.env.DATA_GOV_API_KEY;
    let pricesArray: any[] = [];
    
    if (apiKey) {
      const cacheKey = `market-prices-${state}-${district}`;
      const cached = apiCache.get(cacheKey);
      
      let agmarknetData: any = { records: [] };
      
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        agmarknetData = cached.data;
      } else {
        let apiUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=50&filters[state]=${encodeURIComponent(state)}`;
        if (district) apiUrl += `&filters[district]=${encodeURIComponent(district)}`;
        
        try {
          const agRes = await fetch(apiUrl);
          if (agRes.ok) agmarknetData = await agRes.json();
        } catch (err) {
          console.warn('AGMARKNET API failed:', err);
        }
        
        if (agmarknetData?.records?.length === 0 && district) {
           try {
             const fallbackUrl = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&limit=50&filters[state]=${encodeURIComponent(state)}`;
             const agFallbackRes = await fetch(fallbackUrl);
             if (agFallbackRes.ok) agmarknetData = await agFallbackRes.json();
           } catch (err) {
             console.warn('AGMARKNET Fallback API failed:', err);
           }
        }
        
        if (agmarknetData?.records?.length > 0) {
          apiCache.set(cacheKey, { data: agmarknetData, timestamp: Date.now() });
        }
      }

      if (agmarknetData?.records?.length > 0) {
        const mappedPromises = agmarknetData.records.map(async (r: any, idx: number) => {
          let distanceKm = null;
          if (lat && lon) {
             const mandiCoords = await getMandiCoordinates(r.market, r.state);
             if (mandiCoords) {
                distanceKm = haversineDistance(lat, lon, mandiCoords.lat, mandiCoords.lon);
             }
          }
          
          return {
            id: `mp-${idx}-${Date.now()}`,
            crop: r.commodity,
            mandi: r.market,
            state: r.state,
            minPrice: r.min_price ? Number(r.min_price) / 100 : 0,
            maxPrice: r.max_price ? Number(r.max_price) / 100 : 0,
            modalPrice: r.modal_price ? Number(r.modal_price) / 100 : 0,
            arrivalQtyMT: 0,
            priceChangePercent: 0,
            lastUpdated: r.arrival_date,
            distanceKm: distanceKm ? Math.round(distanceKm * 10) / 10 : null
          };
        });
        
        pricesArray = await Promise.all(mappedPromises);
      }
    }

    const translatedPayload = await translateResponse(pricesArray, req.language);
    res.json(translatedPayload);
  } catch (error: any) {
    console.error('Market prices error:', error);
    res.status(500).json({ error: error.message });
  }
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

// =====================================================
// POST /api/chat - Multilingual AI Assistant (Hindi/Marathi/English)
// =====================================================
app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, language } = req.body;
    const lang: string = language || req.language || 'en';

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const userMsg = messages[messages.length - 1]?.text || '';
    const hfToken = process.env.HF_TOKEN || process.env.HF_API_TOKEN || '';

    // Language-aware system prompt
    const systemPrompts: Record<string, string> = {
      en: `You are FasalNirnay AI, a helpful agricultural assistant for Indian farmers. Answer concisely in English about crops, APMC market prices, weather impact on crops, cold storage, Blinkit/Swiggy sales channels, and farming best practices. Keep answers short (2-4 sentences) and practical.`,
      hi: `आप FasalNirnay AI हैं, भारतीय किसानों के लिए एक सहायक कृषि सहायक। केवल हिंदी में संक्षिप्त उत्तर दें — फसल, मंडी भाव, मौसम का असर, कोल्ड स्टोरेज, ब्लिंकिट/स्वीगी चैनल और खेती के बारे में। उत्तर 2-4 वाक्यों में दें।`,
      mr: `तुम्ही FasalNirnay AI आहात, भारतीय शेतकऱ्यांसाठी एक उपयुक्त कृषी सहाय्यक. फक्त मराठीत उत्तर द्या — पीक, बाजार भाव, हवामान परिणाम, कोल्ड स्टोरेज, ब्लिंकिट/स्वीगी विक्री मार्ग आणि शेतीबद्दल. 2-4 वाक्यांत उत्तर द्या.`,
    };

    const systemPrompt = systemPrompts[lang] || systemPrompts['en'];

    // Build conversation text for model
    const conversationHistory = messages
      .slice(-6) // Last 6 messages for context
      .map((m: any) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');

    const fullPrompt = `${systemPrompt}\n\n${conversationHistory}\nAssistant:`;

    // Try HuggingFace LLM
    if (hfToken) {
      try {
        const hfModel = process.env.HF_MODEL || 'meta-llama/Llama-3.2-3B-Instruct';
        const hfRes = await fetch(
          `https://router.huggingface.co/hf-inference/models/${hfModel}/v1/chat/completions`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${hfToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: hfModel,
              messages: [
                { role: 'system', content: systemPrompt },
                ...messages.slice(-5).map((m: any) => ({
                  role: m.sender === 'user' ? 'user' : 'assistant',
                  content: m.text,
                })),
              ],
              max_tokens: 250,
              temperature: 0.6,
              stream: false,
            }),
          }
        );

        if (hfRes.ok) {
          const data = await hfRes.json() as any;
          const reply = data?.choices?.[0]?.message?.content?.trim();
          if (reply) {
            res.json({ success: true, reply, model: hfModel, language: lang });
            return;
          }
        }
      } catch (hfErr: any) {
        console.warn('[Chat] HuggingFace API error:', hfErr.message);
      }
    }

    // Fallback: Smart rules-based agricultural KB responses
    const lower = userMsg.toLowerCase();

    const kbResponses: Record<string, Record<string, string>> = {
      tomato: {
        en: '🍅 Tomato prices in Nashik APMC are currently ₹18/kg with a -2.8% trend. Arrivals are 120 MT today. Consider waiting 2 days as prices are expected to rise to ₹20.50/kg based on supply data.',
        hi: '🍅 नासिक APMC में टमाटर का भाव ₹18/kg है, जो -2.8% नीचे है। आज 120 MT आवक हुई है। 2 दिन प्रतीक्षा करें क्योंकि भाव ₹20.50/kg तक जा सकते हैं।',
        mr: '🍅 नाशिक APMC मध्ये टोमॅटो दर ₹18/kg आहे, -2.8% खाली आहे. आज 120 MT आवक. 2 दिवस थांबा कारण दर ₹20.50/kg पर्यंत जाण्याची शक्यता आहे.',
      },
      onion: {
        en: '🧅 Onion (Red) prices at Lasalgaon APMC are ₹16.20/kg with +1.6% uptick. Today\'s arrival is 85 MT. Sell today as prices may drop tomorrow with more arrivals expected.',
        hi: '🧅 लासलगांव APMC में प्याज ₹16.20/kg, +1.6% ऊपर। आज 85 MT आवक। आज ही बेचें क्योंकि कल कीमतें गिर सकती हैं।',
        mr: '🧅 लासलगाव APMC मध्ये कांदा ₹16.20/kg, +1.6% वाढ. आज 85 MT आवक. आजच विका कारण उद्या दर घसरू शकतात.',
      },
      weather: {
        en: '🌤️ Weather forecast for Nashik region: Partly cloudy with moderate humidity (65-70%). Good conditions for outdoor drying of onions. Tomato crops may benefit from cooler nights this week.',
        hi: '🌤️ नासिक क्षेत्र का मौसम: आंशिक बादल, मध्यम नमी (65-70%)। प्याज सुखाने के लिए अच्छी स्थिति है। इस हफ्ते ठंडी रातें टमाटर की फसल के लिए अच्छी हैं।',
        mr: '🌤️ नाशिक परिसर हवामान: अंशतः ढगाळ, मध्यम आर्द्रता (65-70%). कांदा वाळवण्यासाठी योग्य. या आठवड्यात थंड रात्री टोमॅटो पिकासाठी उपयुक्त.',
      },
      blinkit: {
        en: '🟡 Blinkit quick commerce accepts Grade A tomatoes, leafy vegetables, and onions. Pickup happens within 2 hours of order. Price premium of 15-25% over mandi rates. Register at blinkit.com/partner.',
        hi: '🟡 ब्लिंकिट ग्रेड A टमाटर, पालक और प्याज खरीदता है। ऑर्डर के 2 घंटे में पिकअप। मंडी से 15-25% ज्यादा भाव मिलता है। blinkit.com/partner पर रजिस्टर करें।',
        mr: '🟡 ब्लिंकिट ग्रेड A टोमॅटो, पालेभाज्या आणि कांदा घेतो. ऑर्डरनंतर 2 तासात पिकअप. मंडी दरापेक्षा 15-25% जास्त भाव. blinkit.com/partner वर नोंदणी करा.',
      },
      storage: {
        en: '🏭 Nearest cold storage: Nashik Cold Chain Hub (4.2 km) at ₹45/ton/day for tomatoes. Lasalgaon APMC Storage Vault (12.8 km) at ₹38/ton/day for onions. Use the Storage Locator tab for more options.',
        hi: '🏭 निकटतम कोल्ड स्टोरेज: नासिक कोल्ड चेन हब (4.2 km) ₹45/टन/दिन टमाटर के लिए। लासलगांव APMC वॉल्ट (12.8 km) ₹38/टन/दिन प्याज के लिए। अधिक विकल्पों के लिए Storage Locator टैब देखें।',
        mr: '🏭 जवळचे कोल्ड स्टोरेज: नाशिक कोल्ड चेन हब (4.2 km) ₹45/टन/दिवस टोमॅटोसाठी. लासलगाव APMC व्हॉल्ट (12.8 km) ₹38/टन/दिवस कांद्यासाठी. अधिक पर्यायांसाठी Storage Locator टॅब पहा.',
      },
    };

    let reply = '';
    const langKey = (lang === 'hi' || lang === 'mr') ? lang : 'en';

    if (lower.includes('tomato') || lower.includes('टमाटर') || lower.includes('टोमॅटो')) {
      reply = kbResponses.tomato[langKey];
    } else if (lower.includes('onion') || lower.includes('प्याज') || lower.includes('कांदा')) {
      reply = kbResponses.onion[langKey];
    } else if (lower.includes('weather') || lower.includes('मौसम') || lower.includes('हवामान')) {
      reply = kbResponses.weather[langKey];
    } else if (lower.includes('blinkit') || lower.includes('ब्लिंकिट')) {
      reply = kbResponses.blinkit[langKey];
    } else if (lower.includes('storage') || lower.includes('cold') || lower.includes('स्टोरेज') || lower.includes('कोल्ड') || lower.includes('कोल्ड स्टोरेज')) {
      reply = kbResponses.storage[langKey];
    } else {
      const defaultReplies: Record<string, string> = {
        en: '🌾 I can help you with tomato & onion prices, weather impact, cold storage options, Blinkit/Swiggy sales, and market trends. What would you like to know?',
        hi: '🌾 मैं टमाटर/प्याज के भाव, मौसम का असर, कोल्ड स्टोरेज, ब्लिंकिट/स्वीगी बिक्री और बाजार ट्रेंड के बारे में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?',
        mr: '🌾 मी टोमॅटो/कांदा भाव, हवामान परिणाम, कोल्ड स्टोरेज, ब्लिंकिट/स्वीगी विक्री आणि बाजार ट्रेंडबद्दल मदत करू शकतो. तुम्हाला काय जाणून घ्यायचे आहे?',
      };
      reply = defaultReplies[langKey] || defaultReplies['en'];
    }

    res.json({ success: true, reply, model: 'FasalNirnay-KB-v1', language: lang });
  } catch (error: any) {
    console.error('[Chat Error]', error.message);
    res.status(500).json({ error: 'Chat failed', message: error.message });
  }
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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 FasalNirnay Express API Server running on port ${PORT}`);
  });
}

export default app;

