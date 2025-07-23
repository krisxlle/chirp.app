import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Shield } from "lucide-react";
import BrandIcon from "@/components/BrandIcon";

export default function Auth() {
  const handleSignIn = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo.jpg" 
              alt="Chirp Logo" 
              className="w-16 h-16 object-cover object-center rounded-2xl shadow-lg"
            />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">Welcome to Chirp</CardTitle>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Join the social network where personality matters more than looks
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Benefits Section */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <BrandIcon icon={User} variant="primary" size="sm" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Anonymous by Design</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Express yourself freely without judgment based on appearance
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <BrandIcon icon={Mail} variant="secondary" size="sm" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Instant Access</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Sign in with your Replit account - no additional passwords needed
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <BrandIcon icon={Shield} variant="accent" size="sm" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Secure & Private</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Your data is protected with enterprise-grade security
                </p>
              </div>
            </div>
          </div>

          {/* Sign In Button */}
          <div className="space-y-4">
            <Button 
              className="w-full gradient-bg hover:opacity-90 transition-opacity text-white font-semibold"
              onClick={handleSignIn}
            >
              Sign in with Replit
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                New to Chirp? Signing in will automatically create your account
              </p>
            </div>
          </div>

          {/* Legal Links */}
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center space-y-1">
            <p>By signing in, you agree to our</p>
            <div className="space-x-2">
              <a 
                href="/terms" 
                className="text-purple-500 hover:text-purple-600 underline"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('/terms', '_blank');
                }}
              >
                Terms of Service
              </a>
              <span>and</span>
              <a 
                href="/privacy" 
                className="text-purple-500 hover:text-purple-600 underline"
                onClick={(e) => {
                  e.preventDefault();
                  window.open('/privacy', '_blank');
                }}
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}