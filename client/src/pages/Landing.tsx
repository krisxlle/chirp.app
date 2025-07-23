import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, Bot } from "lucide-react";
import BrandIcon from "@/components/BrandIcon";


export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/logo.jpg" 
              alt="Chirp Logo" 
              className="w-16 h-16 object-cover object-center rounded-2xl shadow-lg"
            />
          </div>
          
          <h1 className="text-3xl font-bold gradient-text mb-4">Welcome to Chirp</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed break-words">
            The social network where looks don't matter. Go viral based on your personality. Connect with your people, express yourself with AI profiles, and share your unfiltered thoughts.
          </p>
          
          <div className="space-y-4">
            <Button 
              className="w-full gradient-bg hover:opacity-90 transition-opacity text-white font-semibold"
              onClick={() => window.location.href = '/api/login'}
            >
              Enter Chirp
            </Button>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 break-words">
              <button 
                onClick={() => window.location.href = '/api/login'}
                className="text-purple-500 hover:text-purple-600 underline hover:no-underline transition-colors"
              >
                Sign in
              </button> to claim your handle
            </p>
            
            <div className="text-xs text-gray-400 dark:text-gray-500 text-center space-y-1 mt-4">
              <p>By signing up, you agree to our</p>
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
          </div>
          
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="min-w-0">
              <div className="flex justify-center mb-2">
                <BrandIcon icon={Sparkles} variant="primary" size="lg" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Share your unfiltered thoughts</div>
            </div>
            <div className="min-w-0">
              <div className="flex justify-center mb-2">
                <BrandIcon icon={Heart} variant="secondary" size="lg" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">React to any post in any way</div>
            </div>
            <div className="min-w-0">
              <div className="flex justify-center mb-2">
                <BrandIcon icon={Bot} variant="accent" size="lg" />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Customize your anonymous profile</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
