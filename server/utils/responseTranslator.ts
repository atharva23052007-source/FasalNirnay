import { translateBatch } from '../services/translationService';

/**
 * Default translatable fields list containing human-readable text properties.
 */
export const DEFAULT_TRANSLATABLE_FIELDS = [
  'crop',
  'cropName',
  'action',
  'rationale',
  'mandi',
  'mandiName',
  'description',
  'message',
  'title',
  'subtitle',
  'profitImpact',
  'statusText',
];

/**
 * Recursively translates an API response data payload, preserving exact JSON structure,
 * numbers, IDs, dates, URLs, prices, and non-translatable technical identifiers.
 */
export async function translateResponse(
  data: any,
  targetLanguage: string = 'en',
  translatableFields: string[] = DEFAULT_TRANSLATABLE_FIELDS
): Promise<any> {
  if (!data || targetLanguage === 'en') {
    return data;
  }

  // 1. Collect all translatable string paths & values
  const stringItems: { path: (string | number)[]; value: string }[] = [];

  function extractStrings(node: any, path: (string | number)[]) {
    if (node === null || node === undefined) return;

    if (Array.isArray(node)) {
      node.forEach((item, index) => extractStrings(item, [...path, index]));
    } else if (typeof node === 'object') {
      for (const key of Object.keys(node)) {
        const val = node[key];
        const lowerKey = key.toLowerCase();

        // Check if field is configured as translatable
        const isTranslatableKey = translatableFields.some(
          (field) => field.toLowerCase() === lowerKey
        );

        if (isTranslatableKey && typeof val === 'string' && val.trim() !== '') {
          // Exclude URLs, dates, IDs, and numeric strings
          if (!isNonTranslatableString(val, key)) {
            stringItems.push({ path: [...path, key], value: val });
          }
        } else if (typeof val === 'object') {
          extractStrings(val, [...path, key]);
        }
      }
    }
  }

  extractStrings(data, []);

  if (stringItems.length === 0) {
    return data;
  }

  // 2. Perform Batch Translation via Translation Service
  const rawTexts = stringItems.map((item) => item.value);
  const translatedTexts = await translateBatch(rawTexts, targetLanguage, 'en');

  // 3. Deep Clone & Re-map Translated Strings into Response
  const clonedData = JSON.parse(JSON.stringify(data));

  stringItems.forEach((item, idx) => {
    const translatedVal = translatedTexts[idx] || item.value;
    setDeepValue(clonedData, item.path, translatedVal);
  });

  return clonedData;
}

/**
 * Helper to identify non-translatable strings like URLs, ISO dates, IDs, or numeric values
 */
function isNonTranslatableString(val: string, key: string): boolean {
  const trimmed = val.trim();

  // Exclude URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/assets/')) {
    return true;
  }
  // Exclude ISO Dates or date-times
  if (!isNaN(Date.parse(trimmed)) && trimmed.length >= 10 && /\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return true;
  }
  // Exclude IDs
  if (key.toLowerCase().endsWith('id') || key.toLowerCase().endsWith('_id')) {
    return true;
  }
  // Exclude purely numeric strings
  if (!isNaN(Number(trimmed))) {
    return true;
  }

  return false;
}

/**
 * Helper to set value at deep path in object
 */
function setDeepValue(obj: any, path: (string | number)[], val: any): void {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (current[key] === undefined) return;
    current = current[key];
  }
  const lastKey = path[path.length - 1];
  current[lastKey] = val;
}
