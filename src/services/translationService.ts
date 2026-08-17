/// <reference types="vite/client" />
import { Language } from '../types';
import { translations } from '../data/translations';

const translationCache: Map<string, string> = new Map();

// Helper to sanitize key
const getKey = (text: string, lang: Language) => `${lang}___${text.trim()}`;

const HUGGINGFACE_TOKEN =
  ((import.meta as any).env && (import.meta as any).env.VITE_HUGGINGFACE_TOKEN) || '';

/**
 * Translates dynamic text (from APIs, backend, or user inputs) into target language (en, hi, mr).
 * Uses local dictionary first for 0ms response, then HuggingFace API with token fallback.
 */
export async function translateDynamicText(
  text: string,
  targetLang: Language
): Promise<string> {
  if (!text || typeof text !== 'string') return text || '';
  const trimmed = text.trim();
  if (!trimmed || targetLang === 'en') return trimmed;

  const cacheKey = getKey(trimmed, targetLang);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 1. Check local translation dictionary
  const dict = translations[targetLang];
  if (dict) {
    for (const key in dict) {
      if (key.toLowerCase() === trimmed.toLowerCase() || dict[key] === trimmed) {
        translationCache.set(cacheKey, dict[key]);
        return dict[key];
      }
    }
  }

  // Common crop & UI word translations map
  const commonMap: Record<string, Record<Language, string>> = {
    tomato: { en: 'Tomato', hi: 'टमाटर', mr: 'टोमॅटो' },
    onion: { en: 'Onion', hi: 'प्याज', mr: 'कांदा' },
    'red onion': { en: 'Red Onion', hi: 'लाल प्याज', mr: 'लाल कांदा' },
    spinach: { en: 'Spinach', hi: 'पालक', mr: 'पालक' },
    'leafy vegetables': { en: 'Leafy Vegetables', hi: 'हरी पत्तेदार सब्जियां', mr: 'पालक व पालेभाज्या' },
    'sell today': { en: 'SELL TODAY', hi: 'आज ही बेचें', mr: 'आजच विका' },
    'wait 2 days': { en: 'WAIT 2 DAYS', hi: '2 दिन प्रतीक्षा करें', mr: '२ दिवस थांबा' },
    'process today': { en: 'PROCESS TODAY', hi: 'आज ही प्रोसेसिंग करें', mr: 'आजच प्रक्रिया करा' },
    'best price available now': {
      en: 'Best price available now',
      hi: 'वर्तमान में सर्वोत्तम मूल्य उपलब्ध है',
      mr: 'सध्या उत्तम दर उपलब्ध आहे',
    },
    'spoilage risk is high': {
      en: 'Spoilage risk is high',
      hi: 'खराब होने का उच्च जोखिम',
      mr: 'खराब होण्याचा धोका जास्त',
    },
  };

  const lowerText = trimmed.toLowerCase();
  if (commonMap[lowerText] && commonMap[lowerText][targetLang]) {
    const val = commonMap[lowerText][targetLang];
    translationCache.set(cacheKey, val);
    return val;
  }

  // 2. Call HuggingFace Inference API with Router URL & Token
  if ((targetLang === 'hi' || targetLang === 'mr') && HUGGINGFACE_TOKEN) {
    try {
      const baseModel = (import.meta.env.VITE_HF_TRANSLATION_MODEL) || 'Helsinki-NLP/opus-mt-en-hi';
      let hfModel = baseModel;
      if (targetLang === 'mr' && baseModel.endsWith('-hi')) {
        hfModel = baseModel.slice(0, -2) + 'mr';
      }

      const response = await fetch(
        `https://router.huggingface.co/hf-inference/models/${hfModel}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: trimmed,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.translation_text) {
          const translatedStr = data[0].translation_text;
          translationCache.set(cacheKey, translatedStr);
          return translatedStr;
        }
      }
    } catch (err) {
      // Fallback below
    }
  }

  // 3. Robust free translation API fallback for Marathi / Hindi
  try {
    const ftRes = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(
        trimmed
      )}`
    );
    if (ftRes.ok) {
      const ftData = await ftRes.json();
      if (ftData && ftData[0] && ftData[0][0] && ftData[0][0][0]) {
        const result = ftData[0][0][0];
        translationCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err) {
    // ignore
  }

  return trimmed;
}
