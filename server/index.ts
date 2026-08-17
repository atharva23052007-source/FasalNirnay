import express, { Request, Response, NextFunction } from 'express';
import fetch from 'node-fetch';
import https from 'https';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
// @ts-ignore
import Lot from '../src/models/Lots.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URL_LOTS;
if (MONGO_URI) {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB (Lots Database)'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));
} else {
  console.warn('⚠️ MONGO_URL_LOTS is not defined in .env. MongoDB will not be connected.');
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

// GET all lots
app.get('/api/lots', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lots = await Lot.find().sort({ createdAt: -1 });
    res.json({ success: true, data: lots });
  } catch (error) {
    next(error);
  }
});

// Endpoint to save a new Lot to MongoDB
app.post('/api/lots', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cropName, variety, quantityKg, grade, condition, location, harvestDate, storageStatus, estValueRs, image, imageUrl, recommendation } = req.body;
    
    if (!cropName || !quantityKg || !recommendation) {
      res.status(400).json({ error: 'cropName, quantityKg, and recommendation are required' });
      return;
    }

    const newLot = new Lot({
      cropName,
      variety,
      quantityKg,
      grade,
      condition,
      location,
      harvestDate,
      storageStatus,
      estValueRs,
      image,
      imageUrl,
      recommendation
    });

    const savedLot = await newLot.save();
    res.status(201).json({ success: true, data: savedLot });
  } catch (error) {
    next(error);
  }
});

// DELETE a lot
app.delete('/api/lots/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedLot = await Lot.findByIdAndDelete(id);
    if (!deletedLot) {
      res.status(404).json({ error: 'Lot not found' });
      return;
    }
    res.json({ success: true, data: deletedLot });
  } catch (error) {
    next(error);
  }
});

// Chatbot Endpoint (Hugging Face Integration)
app.post('/api/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages, language } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Conversation history (messages array) is required' });
      return;
    }

    const hfToken = process.env.HF_API_TOKEN || process.env.HF_TOKEN;
    const hfModel = process.env.HF_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';

    if (!hfToken) {
      console.warn('HF_TOKEN missing in .env');
      res.status(500).json({ error: 'AI Assistant is currently unavailable (Missing API Key).' });
      return;
    }

    const systemPrompt = `You are FasalNirnay AI, a highly knowledgeable agricultural assistant designed to help farmers in India.
You provide expert advice on crop prices, market trends, weather impact, and farming techniques.
Keep your answers concise, helpful, and friendly. Maximum 3-4 sentences.

CRITICAL INSTRUCTION: You MUST automatically detect the language of the user's message and reply entirely in that SAME language. 
If the user asks in Hindi, answer in Hindi. If Marathi, answer in Marathi. If English, answer in English. 
Do not translate the user's message, just respond naturally in their language. Always preserve the user's meaning, context, and tone.`;

    // Map frontend messages to HF format
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
    ];

    try {
      // DNS Patch for Indian ISPs blocking HuggingFace API subdomains
      const customAgent = new https.Agent({
        lookup: (hostname: string, options: any, callback: any) => {
          if (hostname.includes('huggingface.co')) {
             if (typeof options === 'object' && options.all) {
               return callback(null, [{address: '108.159.80.125', family: 4}]);
             }
             return callback(null, '108.159.80.125', 4);
          }
          return require('dns').lookup(hostname, options, callback);
        }
      });

      const payload = {
        model: hfModel,
        messages: formattedMessages,
        max_tokens: 250
      };

      const fetchResponse = await fetch(`https://router.huggingface.co/hf-inference/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        agent: customAgent
      });

      if (!fetchResponse.ok) {
        const errText = await fetchResponse.text();
        console.error('HF API Error:', fetchResponse.status, errText);
        res.status(502).json({ error: `Hugging Face API Error (${fetchResponse.status}): ${errText}` });
        return;
      }

      const data = await fetchResponse.json() as any;
      let aiReply = 'Sorry, I could not generate a response.';
      
      if (data.choices && data.choices.length > 0) {
        aiReply = data.choices[0].message.content.trim();
      }

      res.json({ success: true, reply: aiReply });
    } catch (hfError: any) {
      console.error('Hugging Face Fetch Error:', hfError.message);
      res.status(502).json({ error: `Hugging Face Connection Error: ${hfError.message}` });
    }
  } catch (error) {
    next(error);
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
