import React from 'react';
import ReactDOM from 'react-dom/client';

// Simple test component
function App() {
  return (
    <div>
      <h1>Chirp App</h1>
      <p>Web version is working!</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
