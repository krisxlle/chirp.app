import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { AuthProvider } from "./components/AuthContext";
import BottomNavigation from "./components/BottomNavigation";
import SignupContactsPrompt from "./components/SignupContactsPrompt";
import { FloatingFeedback } from "./components/ui/floating-feedback";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";
import AdminFeedback from "./pages/AdminFeedback";
import AdminInfluencerCodes from "./pages/AdminInfluencerCodes";
import Auth from "./pages/Auth";
import ChirpDetail from "./pages/ChirpDetail";
import Gacha from "./pages/Gacha";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/not-found";
import Notifications from "./pages/Notifications";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Subscribe from "./pages/Subscribe";
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";

const Profile = lazy(() => import("./pages/Profile"));

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
            <Route path="/profile/:userId?" component={() => (
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>}>
                <Profile />
              </Suspense>
            )} />
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
