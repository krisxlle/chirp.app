import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from "wouter";
import { ArrowLeft, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
  : null;

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/settings?tab=chirpplus",
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to Chirp+!",
        description: "Your subscription is now active. Enjoy your premium features!",
      });
      setLocation("/settings?tab=chirpplus");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
        <Crown className="h-4 w-4 mr-2" />
        Subscribe to Chirp+ - $4.99/month
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Only try to create subscription if Stripe is configured
    if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      apiRequest("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          console.error("Error creating subscription:", error);
          setClientSecret(""); // Set empty to show error message
        });
    } else {
      setClientSecret(""); // Set empty to show configuration message
    }
  }, []);

  // Show configuration message if Stripe is not configured
  if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/settings")}
              className="p-2 flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-purple-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Subscribe to Chirp+</h1>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto p-6">
          <Card className="border-purple-200 dark:border-purple-700">
            <CardContent className="space-y-6 p-6">
              <div className="text-center">
                <Crown className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Stripe Configuration Required</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  To enable Chirp+ subscriptions, Stripe API keys need to be configured. 
                  Contact the developer to set up payment processing.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/settings")}
            className="p-2 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-purple-500" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Subscribe to Chirp+</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-6">
        <Card className="border-purple-200 dark:border-purple-700">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Crown className="h-6 w-6 text-purple-500" />
              <span>Chirp+ Premium</span>
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400">Unlock exclusive features and premium AI models</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features summary */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Change your handle anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Exclusive Chirp+ badge</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Unlimited AI profile generations (vs once daily for free)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Premium AI models (GPT-4o & HD image quality)</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-center mb-4">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">$4.99/month</p>
                <p className="text-sm text-gray-500">Cancel anytime</p>
              </div>
            </div>

            {/* Payment form */}
            {stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm />
              </Elements>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}