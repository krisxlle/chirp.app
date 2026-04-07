console.log('🔍 App.tsx: Starting to load...');

// Step 0: Import React
console.log('🔍 App.tsx: Importing React...');
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from 'react';
import { useLocation } from "wouter";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Toaster } from "./components/ui/toaster";
console.log('✅ App.tsx: React imported successfully');

// Step 1: Import React Query
console.log('🔍 App.tsx: Importing React Query...');
console.log('✅ App.tsx: React Query imported successfully');

// Step 2: Import wouter
console.log('🔍 App.tsx: Importing wouter...');
console.log('✅ App.tsx: wouter imported successfully');

// Step 3: Import AuthContext
console.log('🔍 App.tsx: Importing AuthContext...');
console.log('✅ App.tsx: AuthContext imported successfully');

// Step 4: Import UI components
console.log('🔍 App.tsx: Importing UI components...');
console.log('✅ App.tsx: Toaster imported successfully');

import { TooltipProvider } from "./components/ui/tooltip";
console.log('✅ App.tsx: TooltipProvider imported successfully');

console.log('🔍 App.tsx: All imports completed, creating components...');

// Create queryClient with debug logging
console.log('🔍 App.tsx: Creating QueryClient...');
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
    mutations: {
      retry: false,
    },
  },
});
console.log('✅ App.tsx: QueryClient created successfully');

// Create Router component with debug logging
function Router() {
  console.log('🔍 Router: Component starting to render...');
  
  console.log('🔍 Router: Calling useAuth hook...');
  const { isAuthenticated, isLoading } = useAuth();
  console.log('✅ Router: useAuth hook called successfully', { isAuthenticated, isLoading });
  
  console.log('🔍 Router: Calling useLocation hook...');
  const [location, setLocation] = useLocation();
  console.log('✅ Router: useLocation hook called successfully', { location });

  if (isLoading) {
    console.log('🔍 Router: Rendering loading state...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log('🔍 Router: Rendering main content...');
  return (
    <div className="max-w-md mx-auto min-h-screen relative bg-[#E2DAFF] dark:bg-gray-900">
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug App</h1>
          <p className="text-gray-600">Testing with debug logging</p>
          <p className="text-sm text-gray-500 mt-2">Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
          <p className="text-sm text-gray-500 mt-1">Location: {location}</p>
        </div>
      </div>
    </div>
  );
}

// Create App component with debug logging
function App() {
  console.log('🔍 App: Component starting to render...');
  
  // Add global error handler to suppress Chrome extension errors
  React.useEffect(() => {
    console.log('🔍 App: Setting up error handlers...');
    
    const handleError = (event: ErrorEvent) => {
      // Suppress Chrome extension listener errors
      if (event.message && (
        event.message.includes('listener indicated an asynchronous response') ||
        event.message.includes('Cannot read properties of undefined') ||
        event.message.includes('chrome-extension://') ||
        event.filename?.includes('chrome-extension://') ||
        event.message.includes('Cannot access') ||
        event.message.includes('before initialization')
      )) {
        console.log('🚫 Suppressed Chrome extension error:', event.message);
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress Chrome extension promise rejection errors
      if (event.reason && typeof event.reason === 'string' && 
          (event.reason.includes('listener indicated an asynchronous response') ||
           event.reason.includes('Cannot read properties of undefined') ||
           event.reason.includes('chrome-extension://') ||
           event.reason.includes('Cannot access') ||
           event.reason.includes('before initialization'))) {
        console.log('🚫 Suppressed Chrome extension promise rejection:', event.reason);
        event.preventDefault();
        return false;
      }
    };

    // Also suppress console errors from Chrome extensions
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('chrome-extension://') || 
          message.includes('listener indicated an asynchronous response') ||
          message.includes('Cannot read properties of undefined') ||
          message.includes('Cannot access') ||
          message.includes('before initialization')) {
        console.log('🚫 Suppressed console error:', message);
        return; // Suppress Chrome extension errors
      }
      originalConsoleError.apply(console, args);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    console.log('✅ App: Error handlers set up successfully');

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError; // Restore original console.error
    };
  }, []);
  
  console.log('🔍 App: Rendering AuthProvider...');
  return (
    <AuthProvider>
      {console.log('✅ App: AuthProvider rendered successfully')}
      <QueryClientProvider client={queryClient}>
        {console.log('✅ App: QueryClientProvider rendered successfully')}
        <TooltipProvider>
          {console.log('✅ App: TooltipProvider rendered successfully')}
          <Toaster />
          {console.log('✅ App: Toaster rendered successfully')}
          <Router />
          {console.log('✅ App: Router rendered successfully')}
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
