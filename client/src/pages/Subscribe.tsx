import { useEffect, useState } from 'react';
import { useLocation } from "wouter";
import { ArrowLeft, Crown, Check } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";

const SubscribeForm = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    
    // Simulate subscription process
    setTimeout(() => {
      toast({
        title: "Welcome to Chirp+!",
        description: "Your subscription is now active. Enjoy your premium features!",
      });
      setLocation("/settings?tab=chirpplus");
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Upgrade to Chirp+</CardTitle>
          <p className="text-gray-600 mt-2">
            Unlock premium features and support Chirp development
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Unlimited chirps per day</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Priority support</span>
            </div>
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-500" />
              <span>Exclusive themes</span>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-purple-600">$4.99</div>
            <div className="text-gray-600">per month</div>
          </div>
          
          <Button 
            onClick={handleSubscribe}
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isLoading ? "Processing..." : "Subscribe to Chirp+"}
          </Button>
          
          <p className="text-xs text-gray-500 text-center mt-4">
            Payment processing will be available soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Subscribe() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          onClick={() => setLocation("/settings")}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Settings</span>
        </Button>
      </div>
      
      <SubscribeForm />
    </div>
  );
}
