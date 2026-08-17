import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include language property
declare global {
  namespace Express {
    interface Request {
      language: string;
    }
  }
}

export function languageMiddleware(req: Request, res: Response, next: NextFunction): void {
  const envLanguages = process.env.SUPPORTED_LANGUAGES || 'en,hi,mr';
  const supportedLangs = envLanguages.split(',').map((l) => l.trim().toLowerCase());

  // 1. Read Accept-Language header
  const headerLang = req.headers['accept-language'] || req.headers['Accept-Language'];
  let targetLang = 'en';

  if (headerLang && typeof headerLang === 'string') {
    // Handle formats like "mr", "hi-IN", "en-US,en;q=0.9"
    const parsedLang = headerLang.split(',')[0].split('-')[0].trim().toLowerCase();
    if (supportedLangs.includes(parsedLang)) {
      targetLang = parsedLang;
    }
  }

  // 2. Attach validated target language to Request object
  req.language = targetLang;
  
  // Set Content-Language header on response for transparency
  res.setHeader('Content-Language', targetLang);

  next();
}
