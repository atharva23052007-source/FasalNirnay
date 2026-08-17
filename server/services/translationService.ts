import crypto from 'crypto';

// In-Memory Translation Cache Map (Acts as fast fallback if Redis is unconfigured)
const memoryCache: Map<string, string> = new Map();

// Local translation dictionary for common domain terms (0ms response)
const domainDictionary: Record<string, Record<string, string>> = {
  Tomato: { hi: 'टमाटर', mr: 'टोमॅटो' },
  Onion: { hi: 'प्याज', mr: 'कांदा' },
  'Red Onion': { hi: 'लाल प्याज', mr: 'लाल कांदा' },
  Spinach: { hi: 'पालक', mr: 'पालक' },
  'Leafy Vegetables': { hi: 'हरी पत्तेदार सब्जियां', mr: 'पालक व पालेभाज्या' },
  'WAIT 2 DAYS': { hi: '2 दिन प्रतीक्षा करें', mr: '२ दिवस थांबा' },
  'SELL TODAY': { hi: 'आज ही बेचें', mr: 'आजच विका' },
  'PROCESS TODAY': { hi: 'आज ही प्रोसेसिंग करें', mr: 'आजच प्रक्रिया करा' },
  'Best price available now': {
    hi: 'वर्तमान में सर्वोत्तम मूल्य उपलब्ध है',
    mr: 'सध्या उत्तम दर उपलब्ध आहे',
  },
  'Spoilage risk is high': {
    hi: 'खराब होने का उच्च जोखिम',
    mr: 'खराब होण्याचा धोका जास्त',
  },
  'Price is expected to rise and your crop can safely wait.': {
    hi: 'कीमत बढ़ने की उम्मीद है और आपकी फसल सुरक्षित रह सकती है।',
    mr: 'दर वाढण्याची शक्यता आहे आणि पीक सुरक्षित राहू शकते.',
  },
  'Prices may drop tomorrow and spoilage risk will increase.': {
    hi: 'कल कीमतें गिर सकती हैं और खराब होने का जोखिम बढ़ जाएगा।',
    mr: 'उद्या दर घसरू शकतात और नुकसान वाढू शकते.',
  },
  'Crop spoils fast and value reduces quickly.': {
    hi: 'फसल तेजी से खराब होती है और मूल्य घटता है।',
    mr: 'पालेभाज्या लवकर खराब होतात व मूल्य कमी होते.',
  },
};

/**
 * Generates MD5 hash for translation cache keys: translation:<src>:<tgt>:<hash>
 */
function getCacheKey(text: string, srcLang: string, tgtLang: string): string {
  const hash = crypto.createHash('md5').update(text.trim()).digest('hex');
  return `translation:${srcLang}:${tgtLang}:${hash}`;
}

/**
 * Translates a single text string safely using Hugging Face Inference API / fallback
 */
export async function translateText(
  text: string,
  targetLanguage: string = 'en',
  sourceLanguage: string = 'en'
): Promise<string> {
  if (!text || typeof text !== 'string' || text.trim() === '') return text;
  const trimmed = text.trim();
  if (sourceLanguage === targetLanguage || targetLanguage === 'en') return trimmed;

  const cacheKey = getCacheKey(trimmed, sourceLanguage, targetLanguage);

  // 1. Check Memory / Redis Cache
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey)!;
  }

  // 2. Check Domain Dictionary
  if (domainDictionary[trimmed] && domainDictionary[trimmed][targetLanguage]) {
    const dictVal = domainDictionary[trimmed][targetLanguage];
    memoryCache.set(cacheKey, dictVal);
    return dictVal;
  }

  const hfToken = process.env.HF_API_TOKEN || '';

  // 3. Query Hugging Face Router API (Hindi or NLLB models)
  if ((targetLanguage === 'hi' || targetLanguage === 'mr') && hfToken) {
    try {
      const baseModel = process.env.HF_TRANSLATION_MODEL || 'Helsinki-NLP/opus-mt-en-hi';
      let hfModel = baseModel;
      if (targetLanguage === 'mr' && baseModel.endsWith('-hi')) {
        hfModel = baseModel.slice(0, -2) + 'mr';
      }

      const response = await fetch(
        `https://router.huggingface.co/hf-inference/models/${hfModel}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${hfToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: trimmed }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.translation_text) {
          const result = data[0].translation_text;
          memoryCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (err: any) {
      console.warn(`[Backend Translation Warning] HuggingFace API call failed: ${err.message}`);
    }
  }

  // 4. Free translation fallback for Marathi/Hindi
  try {
    const fallbackRes = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(
        trimmed
      )}`
    );
    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      if (fbData && fbData[0] && fbData[0][0] && fbData[0][0][0]) {
        const result = fbData[0][0][0];
        memoryCache.set(cacheKey, result);
        return result;
      }
    }
  } catch (err: any) {
    console.warn(`[Backend Translation Warning] Fallback service error: ${err.message}`);
  }

  // 5. Ultimate Fallback: Return original text safely without crashing
  return trimmed;
}

/**
 * Batch translation function: Translates multiple text items efficiently
 */
export async function translateBatch(
  texts: string[],
  targetLanguage: string = 'en',
  sourceLanguage: string = 'en'
): Promise<string[]> {
  if (!texts || !Array.isArray(texts) || texts.length === 0) return [];
  if (targetLanguage === 'en' || sourceLanguage === targetLanguage) return texts;

  // Translate all items concurrently in batch
  return Promise.all(
    texts.map((t) => translateText(t, targetLanguage, sourceLanguage))
  );
}
