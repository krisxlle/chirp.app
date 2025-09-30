import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { AuthProvider, useAuth } from "./components/AuthContext";
import BottomNavigation from "./components/BottomNavigation";
import SignupContactsPrompt from "./components/SignupContactsPrompt";
import { FloatingFeedback } from "./components/ui/floating-feedback";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import AdminFeedback from "./pages/AdminFeedback";
import AdminInfluencerCodes from "./pages/AdminInfluencerCodes";
import Auth from "./pages/Auth";
import ChirpDetail from "./pages/ChirpDetail";
import CollectionPage from "./pages/CollectionPage";
import Gacha from "./pages/Gacha";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/not-found";
import Notifications from "./pages/Notifications";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import SettingsPage from "./pages/Settings";
import Subscribe from "./pages/Subscribe";
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";

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

// Wrapper component for Settings to handle routing props
const Settings = () => <SettingsPage />;

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect unauthenticated users to /auth only if they're on the root path
  useEffect(() => {
    if (!isLoading && !isAuthenticated && location === '/') {
      setLocation('/auth');
    }
  }, [isAuthenticated, isLoading, setLocation, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 min-h-screen relative">
      <Switch>
        {isAuthenticated ? (
          <>
            <Route path="/" component={HomePage} />
            <Route path="/search" component={Search} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/profile/:userId?" component={Profile} />
            <Route path="/collection" component={CollectionPage} />
            <Route path="/settings" component={Settings} />
            <Route path="/subscribe" component={Subscribe} />
            <Route path="/gacha" component={Gacha} />
            <Route path="/admin/influencer-codes" component={AdminInfluencerCodes} />
            <Route path="/admin/feedback" component={AdminFeedback} />
            <Route path="/chirp/:id" component={ChirpDetail} />
          </>
        ) : (
          <>
            <Route path="/auth" component={Auth} />
            <Route path="/" component={Auth} />
          </>
        )}
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/support" component={Support} />
        <Route component={NotFound} />
      </Switch>
      
      {isAuthenticated && <BottomNavigation />}
      {isAuthenticated && <SignupContactsPrompt />}
      <FloatingFeedback />
    </div>
  );
}

function App() {
  // Add global error handler to suppress Chrome extension errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Suppress Chrome extension listener errors
      if (event.message && (
        event.message.includes('listener indicated an asynchronous response') ||
        event.message.includes('Cannot read properties of undefined') ||
        event.message.includes('chrome-extension://') ||
        event.filename?.includes('chrome-extension://')
      )) {
        event.preventDefault();
        return false;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress Chrome extension promise rejection errors
      if (event.reason && typeof event.reason === 'string' && 
          (event.reason.includes('listener indicated an asynchronous response') ||
           event.reason.includes('Cannot read properties of undefined') ||
           event.reason.includes('chrome-extension://'))) {
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
          message.includes('Cannot read properties of undefined')) {
        return; // Suppress Chrome extension errors
      }
      originalConsoleError.apply(console, args);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError; // Restore original console.error
    };
  }, []);

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
