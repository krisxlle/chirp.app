console.log('🔍 App.tsx: Starting to load...');

// Step 1: Import React Query
console.log('🔍 App.tsx: Importing React Query...');
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Toaster } from "./components/ui/toaster";
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
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen relative">
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
