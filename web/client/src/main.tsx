console.log('🔍 main.tsx: Starting to load...');

console.log('🔍 main.tsx: Importing React...');
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
console.log('✅ main.tsx: React imported successfully');

console.log('🔍 main.tsx: Importing ReactDOM...');
console.log('✅ main.tsx: ReactDOM imported successfully');

console.log('🔍 main.tsx: Importing App...');
console.log('✅ main.tsx: App imported successfully');

console.log('🔍 main.tsx: Importing CSS...');
console.log('✅ main.tsx: CSS imported successfully');

console.log('🔍 main.tsx: Creating root element...');
const rootElement = document.getElementById('root');
console.log('✅ main.tsx: Root element found', { rootElement });

console.log('🔍 main.tsx: Creating React root...');
const root = ReactDOM.createRoot(rootElement!);
console.log('✅ main.tsx: React root created successfully');

console.log('🔍 main.tsx: Rendering App...');
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
console.log('✅ main.tsx: App rendered successfully');