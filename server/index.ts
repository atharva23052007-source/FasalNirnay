import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

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
