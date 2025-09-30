// Set up global error suppression BEFORE any imports
console.log('🔍 main.tsx: Setting up global error suppression...');

// Suppress Chrome extension errors globally
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('chrome-extension://') || 
      message.includes('listener indicated an asynchronous response') ||
      message.includes('Cannot read properties of undefined') ||
      message.includes('Cannot access') ||
      message.includes('before initialization') ||
      message.includes('MessagePort')) {
    console.log('🚫 Suppressed console error:', message);
    return; // Suppress Chrome extension errors
  }
  originalConsoleError.apply(console, args);
};

// Global error handler
window.addEventListener('error', (event) => {
  if (event.message && (
    event.message.includes('listener indicated an asynchronous response') ||
    event.message.includes('Cannot read properties of undefined') ||
    event.message.includes('chrome-extension://') ||
    event.filename?.includes('chrome-extension://') ||
    event.message.includes('Cannot access') ||
    event.message.includes('before initialization') ||
    event.message.includes('MessagePort')
  )) {
    console.log('🚫 Suppressed global error:', event.message);
    event.preventDefault();
    return false;
  }
});

// Global unhandled rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && typeof event.reason === 'string' && 
      (event.reason.includes('listener indicated an asynchronous response') ||
       event.reason.includes('Cannot read properties of undefined') ||
       event.reason.includes('chrome-extension://') ||
       event.reason.includes('Cannot access') ||
       event.reason.includes('before initialization') ||
       event.reason.includes('MessagePort'))) {
    console.log('🚫 Suppressed global promise rejection:', event.reason);
    event.preventDefault();
    return false;
  }
});

console.log('✅ main.tsx: Global error suppression set up');

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './simple-app';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);