import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";

// Create a completely isolated Profile component to avoid circular dependencies
const Profile = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Page</h1>
        <p className="text-gray-600">Profile page is working!</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">This is an isolated component to avoid circular dependencies.</p>
        </div>
      </div>
    </div>
  );
};

// Create queryClient directly here to avoid import issues
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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Temporarily disabled redirect logic to isolate circular dependency
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated && location === '/') {
  //     setLocation('/auth');
  //   }
  // }, [isAuthenticated, isLoading, setLocation, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen relative">
      {/* Temporarily disabled all routes to isolate circular dependency */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">App Loading</h1>
          <p className="text-gray-600">Routes temporarily disabled for debugging</p>
          <p className="text-sm text-gray-500 mt-2">Auth Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        </div>
      </div>
      
      {/* Temporarily disabled components to isolate circular dependency */}
      {/* {isAuthenticated && <BottomNavigation />} */}
      {/* {isAuthenticated && <SignupContactsPrompt />} */}
      {/* <FloatingFeedback /> */}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
