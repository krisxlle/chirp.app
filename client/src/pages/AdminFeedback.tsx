import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Mail, CheckCircle, Clock, AlertTriangle, MessageSquare, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api.ts";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";

interface Feedback {
  id: number;
  userId?: string;
  email?: string;
  category: string;
  subject: string;
  message: string;
  location?: string;
  userAgent?: string;
  resolved: boolean;
  adminNotes?: string;
  createdAt: string;
  user?: {
    id: string;
    email?: string;
    handle?: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function AdminFeedback() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  // Fetch all feedback
  const { data: feedbackList = [], isLoading: feedbackLoading } = useQuery({
    queryKey: ["/api/admin/feedback"],
    enabled: !!user,
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return false;
      }
      return failureCount < 3;
    },
  });

  // Mark feedback as resolved
  const markResolvedMutation = useMutation({
    mutationFn: async ({ feedbackId, notes }: { feedbackId: number; notes?: string }) => {
      await apiRequest("PATCH", `/api/admin/feedback/${feedbackId}/resolve`, { adminNotes: notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      toast({
        title: "Success",
        description: "Feedback marked as resolved",
      });
      setSelectedFeedback(null);
      setAdminNotes("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to mark feedback as resolved",
        variant: "destructive",
      });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug_report':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'feature_request':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'contact':
        return <Mail className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug_report':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'feature_request':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'contact':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const resolvedCount = feedbackList.filter((f: Feedback) => f.resolved).length;
  const unresolvedCount = feedbackList.filter((f: Feedback) => !f.resolved).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-gray-600 dark:text-gray-400"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Review and manage user feedback submissions</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{feedbackList.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unresolved</p>
                  <p className="text-2xl font-bold text-orange-600">{unresolvedCount}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedbackLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Loading feedback...</p>
              </CardContent>
            </Card>
          ) : feedbackList.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No feedback yet</h3>
                <p className="text-gray-600 dark:text-gray-400">Feedback submissions will appear here</p>
              </CardContent>
            </Card>
          ) : (
            feedbackList.map((feedback: Feedback) => (
              <Card key={feedback.id} className={feedback.resolved ? "opacity-75" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getCategoryIcon(feedback.category)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {feedback.subject}
                          </h3>
                          <Badge className={getCategoryColor(feedback.category)}>
                            {feedback.category.replace('_', ' ')}
                          </Badge>
                          {feedback.resolved && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>
                              {feedback.user?.customHandle || feedback.user?.handle || `User ${feedback.user?.id}` || 'Anonymous'}
                            </span>
                          </div>
                          <span>{new Date(feedback.createdAt).toLocaleString()}</span>
                          {feedback.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{feedback.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-4">
                    {feedback.message}
                  </p>
                  
                  {feedback.adminNotes && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Admin Notes:</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">{feedback.adminNotes}</p>
                    </div>
                  )}

                  {!feedback.resolved && (
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setAdminNotes(feedback.adminNotes || "");
                        }}
                      >
                        Add Notes & Resolve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => markResolvedMutation.mutate({ feedbackId: feedback.id })}
                        disabled={markResolvedMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Resolved
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Resolve Modal */}
        {selectedFeedback && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Resolve Feedback: {selectedFeedback.subject}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Notes (optional)
                  </label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about how this feedback was addressed..."
                    rows={4}
                  />
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFeedback(null);
                      setAdminNotes("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => markResolvedMutation.mutate({
                      feedbackId: selectedFeedback.id,
                      notes: adminNotes.trim() || undefined
                    })}
                    disabled={markResolvedMutation.isPending}
                  >
                    {markResolvedMutation.isPending ? "Resolving..." : "Mark as Resolved"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}