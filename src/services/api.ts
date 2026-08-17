/**
 * Centralized API Client Service
 * Automatically attaches `Accept-Language: <lang-code>` header from localStorage on all backend requests.
 */

export async function fetchApi<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const currentLang = localStorage.getItem('fasal_nirnay_lang') || 'en';

  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept-Language')) {
    headers.set('Accept-Language', currentLang);
  }
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { text };
  }

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `HTTP ${response.status} Error`;
    throw new Error(errorMsg);
  }

  return data as T;
}
