import React from 'react';
import { Switch, Route } from 'wouter';
import { TooltipProvider } from '../client/src/components/ui/tooltip';
import { useAuth } from '../client/src/hooks/useAuth';

// Import all the web client pages with React Native compatibility
import NotFound from '../client/src/pages/not-found';
import Landing from '../client/src/pages/Landing';
import Home from '../client/src/pages/Home';
import Search from '../client/src/pages/Search';
import Notifications from '../client/src/pages/Notifications';
import Profile from '../client/src/pages/Profile';
import Settings from '../client/src/pages/Settings';
import Subscribe from '../client/src/pages/Subscribe';
import AdminInfluencerCodes from '../client/src/pages/AdminInfluencerCodes';
import AdminFeedback from '../client/src/pages/AdminFeedback';
import ChirpDetail from '../client/src/pages/ChirpDetail';
import TermsOfService from '../client/src/pages/TermsOfService';
import PrivacyPolicy from '../client/src/pages/PrivacyPolicy';
import Support from '../client/src/pages/Support';
import BottomNavigation from '../client/src/components/BottomNavigation';
import { FloatingFeedback } from '../client/src/components/ui/floating-feedback';
import SignupContactsPrompt from '../client/src/components/SignupContactsPrompt';
import { Toaster } from '../client/src/components/ui/toaster';
import { View, Text } from 'react-native';

export default function ChirpApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ minHeight: '100%', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          width: 128,
          height: 128,
          borderWidth: 2,
          borderBottomColor: '#9333ea',
          borderTopColor: 'transparent',
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderRadius: 64,
        }} />
      </View>
    );
  }

  return (
    <TooltipProvider>
      <View style={{ maxWidth: 448, marginHorizontal: 'auto', backgroundColor: 'white', minHeight: '100%', position: 'relative', flex: 1 }}>
        <Switch>
          {!isAuthenticated ? (
            <Route path="/" component={Landing} />
          ) : (
            <>
              <Route path="/" component={Home} />
              <Route path="/search" component={Search} />
              <Route path="/notifications" component={Notifications} />
              <Route path="/profile/:userId?" component={Profile} />
              <Route path="/settings" component={Settings} />
              <Route path="/subscribe" component={Subscribe} />
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
        <Toaster />
      </View>
    </TooltipProvider>
  );
}