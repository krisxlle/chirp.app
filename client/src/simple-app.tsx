import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';

// Create a simple query client
const queryClient = new (require('@tanstack/react-query').QueryClient)({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple landing page
function Landing() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Welcome to Chirp!</h1>
      <p>Your social media app is loading...</p>
      <button onClick={() => alert('Chirp is working!')}>
        Test Button
      </button>
    </div>
  );
}

// Main App component with routing
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Switch>
          <Route path="/" component={Landing} />
          <Route component={() => <div>Page not found</div>} />
        </Switch>
      </div>
    </QueryClientProvider>
  );
}

export default App;
