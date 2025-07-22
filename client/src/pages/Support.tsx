import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, MessageCircle, Bug, HelpCircle, Shield, FileText } from "lucide-react";

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("/api/support", {
        method: "POST",
        body: JSON.stringify({
          subject,
          message,
          email,
          category: "general"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      toast({
        title: "Support Request Sent",
        description: "We'll get back to you within 24 hours.",
      });

      setSubject("");
      setMessage("");
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send support request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Chirp Support Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            We're here to help you get the most out of your Chirp experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Help Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-purple-600" />
                  Quick Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Getting Started</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Take the personality quiz to unlock AI profile generation and connect with like-minded users.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Custom Handles</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Share your invite link with 3 friends or use a VIP code to claim a custom handle.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Chirp+ Benefits</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get unlimited AI generations, premium models, and exclusive features for $4.99/month.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">joinchirp@gmail.com</p>
                </div>
                <div>
                  <p className="font-medium">Response Time</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Within 24 hours</p>
                </div>
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">24/7 Support Available</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Legal & Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/terms" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Terms of Service
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="/privacy" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy Policy
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  Send Support Request
                </CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Send us a message and we'll help you out.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Leave blank if you're signed in - we'll use your account email
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your issue in detail. Include any error messages or steps you've already tried."
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isSubmitting ? "Sending..." : "Send Support Request"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">How do I claim a custom handle?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You need to share your invite link with 3 different people who click it, or use a valid VIP code. 
                    Go to Settings to manage your handle and invitations.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Why isn't my AI profile generating?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Free users can generate AI profiles once per day. Chirp+ subscribers get unlimited generations. 
                    Make sure you've completed the personality quiz first.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">How do I cancel my Chirp+ subscription?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Go to Settings and scroll to the Chirp+ section. Click "Manage Subscription" to cancel 
                    or update your payment method through Stripe's secure portal.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Can I export my data?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Yes! Contact our support team to request a full export of your account data, 
                    including all your chirps, profile information, and generated content.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">How do I report inappropriate content?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Use the report button on any chirp or profile, or contact us directly. 
                    We review all reports within 24 hours and take appropriate action.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* App Info Footer */}
        <div className="mt-12 text-center py-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Chirp - AI-Powered Social Media Platform
          </p>
          <p className="text-xs text-gray-500">
            Version 1.0 • Contact: joinchirp@gmail.com • Made with ❤️ for meaningful connections
          </p>
        </div>
      </div>
    </div>
  );
}