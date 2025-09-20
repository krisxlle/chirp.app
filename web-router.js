// Web-specific Router component
import React from 'react';
import { Route, Switch } from 'wouter';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Search from './pages/Search';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Subscribe from './pages/Subscribe';
import Gacha from './pages/Gacha';
import AdminInfluencerCodes from './pages/AdminInfluencerCodes';
import AdminFeedback from './pages/AdminFeedback';
import ChirpDetail from './pages/ChirpDetail';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Support from './pages/Support';
import NotFound from './pages/not-found';
import BottomNavigation from './components/BottomNavigation';
import SignupContactsPrompt from './components/SignupContactsPrompt';
import { FloatingFeedback } from './components/ui/floating-feedback';

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

export default Router;
