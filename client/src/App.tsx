import BottomNavigation from "@/components/BottomNavigation";
import SignupContactsPrompt from "@/components/SignupContactsPrompt";
import { FloatingFeedback } from "@/components/ui/floating-feedback";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import AdminFeedback from "@/pages/AdminFeedback";
import AdminInfluencerCodes from "@/pages/AdminInfluencerCodes";
import Auth from "@/pages/Auth";
import ChirpDetail from "@/pages/ChirpDetail";
import Gacha from "@/pages/Gacha";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";
import Notifications from "@/pages/Notifications";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Profile from "@/pages/Profile";
import Search from "@/pages/Search";
import Settings from "@/pages/Settings";
import Subscribe from "@/pages/Subscribe";
import Support from "@/pages/Support";
import TermsOfService from "@/pages/TermsOfService";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { queryClient } from "@/lib/queryClient";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

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
        {!isAuthenticated ? (
          <>
            <Route path="/" component={Landing} />
            <Route path="/auth" component={Auth} />
          </>
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/search" component={Search} />
            <Route path="/notifications" component={Notifications} />
            <Route path="/profile/:userId?" component={Profile} />
            <Route path="/settings" component={Settings} />
            <Route path="/subscribe" component={Subscribe} />
            <Route path="/gacha" component={Gacha} />
            <Route path="/admin/influencer-codes" component={AdminInfluencerCodes} />
            <Route path="/admin/feedback" component={AdminFeedback} />
            <Route path="/chirp/:id" component={ChirpDetail} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
