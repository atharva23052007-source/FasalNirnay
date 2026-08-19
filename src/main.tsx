import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Global Fetch Interceptor to automatically attach Accept-Language header
const originalFetch = window.fetch;
window.fetch = function (url, options) {
  const currentLang = localStorage.getItem('fasal_nirnay_lang') || 'en';
  // If request is made to our local backend, inject Accept-Language
  if (
    typeof url === 'string' && url.includes('/api/')
  ) {
    options = options || {};
    const headers = new Headers(options.headers || {});
    if (!headers.has('Accept-Language')) {
      headers.set('Accept-Language', currentLang);
    }
    options.headers = headers;
  }
  return originalFetch.call(this, url, options);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
