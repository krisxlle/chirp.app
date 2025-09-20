import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Copy, Check, Settings as SettingsIcon, User, Edit3, LogOut, Crown, Star, Badge, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "../lib/api.ts";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [customHandle, setCustomHandle] = useState("");
  const [vipCode, setVipCode] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioValue, setBioValue] = useState("");
  const [editingLink, setEditingLink] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [showSubscriptionManagement, setShowSubscriptionManagement] = useState(false);

  // Get link shares
  const { data: linkShares = [] } = useQuery({
    queryKey: ["/api/link-shares"],
    enabled: !!user,
  });

  // Get link share count
  const { data: linkShareData } = useQuery({
    queryKey: ["/api/link-shares/count"],
    enabled: !!user,
  });

  // Update bio mutation
  const updateBioMutation = useMutation({
    mutationFn: async (newBio: string) => {
      return await apiRequest("/api/users/bio", {
        method: "PATCH",
        body: JSON.stringify({ bio: newBio }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Bio updated!",
        description: "Your bio has been saved successfully.",
      });
      setEditingBio(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
        description: "Failed to update bio",
        variant: "destructive",
      });
    },
  });

  // Update link in bio mutation
  const updateLinkMutation = useMutation({
    mutationFn: async (newLink: string) => {
      return await apiRequest("/api/users/link-in-bio", {
        method: "PATCH",
        body: JSON.stringify({ linkInBio: newLink }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Link updated!",
        description: "Your link in bio has been saved successfully.",
      });
      setEditingLink(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
        description: "Failed to update link",
        variant: "destructive",
      });
    },
  });

  // Toggle Chirp+ badge visibility mutation
  const toggleBadgeMutation = useMutation({
    mutationFn: async (showBadge: boolean) => {
      return await apiRequest("/api/users/chirpplus/badge", {
        method: "PATCH",
        body: JSON.stringify({ showBadge }),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Badge visibility updated",
        description: "Your Chirp+ badge preference has been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
        description: "Failed to update badge visibility",
        variant: "destructive",
      });
    },
  });

  // Check handle availability mutation
  const checkHandleMutation = useMutation({
    mutationFn: async (handle: string) => {
      const response = await apiRequest(`/api/handles/check/${handle}`);
      return response;
    },
    onSuccess: (data) => {
      if (data.available) {
        toast({
          title: "Handle Available",
          description: "This handle is available to claim!",
        });
      } else {
        toast({
          title: "Handle Taken",
          description: "This handle is already taken. Try another one.",
          variant: "destructive",
        });
      }
    },
  });

  // Change handle mutation for Chirp+ users
  const changeHandleMutation = useMutation({
    mutationFn: async (newHandle: string) => {
      return await apiRequest("/api/users/handle", {
        method: "PATCH",
        body: JSON.stringify({ newHandle }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Handle changed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setCustomHandle("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change handle",
        variant: "destructive",
      });
    },
  });

  // Claim custom handle mutation
  const claimHandleMutation = useMutation({
    mutationFn: async (handle: string) => {
      return await apiRequest("/api/handles/claim", {
        method: "POST",
        body: JSON.stringify({ customHandle: handle }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Custom handle claimed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setCustomHandle("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to claim custom handle",
        variant: "destructive",
      });
    },
  });

  // Use VIP code mutation
  const useVipCodeMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest("/api/vip-codes/use", {
        method: "POST",
        body: JSON.stringify({ code }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "VIP code used successfully! You can now claim a custom handle.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setVipCode("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to use VIP code",
        variant: "destructive",
      });
    },
  });

  // Update profile name mutation
  const updateNameMutation = useMutation({
    mutationFn: async ({ firstName }: { firstName: string }) => {
      // Split the single name field into first and last name
      const nameParts = firstName.trim().split(' ');
      const first = nameParts[0] || '';
      const last = nameParts.slice(1).join(' ');
      
      return await apiRequest("/api/users/name", {
        method: "PATCH",
        body: JSON.stringify({ firstName: first, lastName: last }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile name updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setFirstName("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile name",
        variant: "destructive",
      });
    },
  });

  // Create share link mutation
  const createShareLinkMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/link-shares/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (data: any) => {
      console.log("Share link created:", data);
      console.log("Share URL:", data.shareUrl);
      setShareUrl(data.shareUrl);
      toast({
        title: "Share link created!",
        description: "Copy and send this link to 3 different people to unlock custom handles.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/link-shares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/link-shares/count"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create share link",
        variant: "destructive",
      });
    },
  });

  const handleCheckAvailability = () => {
    if (customHandle.trim() && /^[a-zA-Z0-9_]{3,20}$/.test(customHandle)) {
      checkHandleMutation.mutate(customHandle);
    } else {
      toast({
        title: "Invalid Handle",
        description: "Handle must be 3-20 characters, alphanumeric and underscores only",
        variant: "destructive",
      });
    }
  };

  const handleClaimHandle = () => {
    if (customHandle.trim()) {
      claimHandleMutation.mutate(customHandle);
    }
  };

  const handleChangeHandle = () => {
    if (customHandle.trim()) {
      changeHandleMutation.mutate(customHandle.trim());
    }
  };

  const handleUseVipCode = () => {
    if (vipCode.trim()) {
      useVipCodeMutation.mutate(vipCode);
    }
  };

  // Removed handleSendInvitation - no longer needed for link sharing

  const handleUpdateName = () => {
    if (firstName.trim()) {
      updateNameMutation.mutate({ firstName: firstName.trim() });
    }
  };

  const handleSaveBio = () => {
    updateBioMutation.mutate(bioValue);
  };

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/subscription/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Subscription cancelled",
        description: "Your subscription will end at the end of the current billing period.",
      });
      setShowSubscriptionManagement(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  const handleCancelSubscription = () => {
    cancelSubscriptionMutation.mutate();
  };

  const copyToClipboard = async (text: string) => {
    try {
      console.log("Copying to clipboard:", text);
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: "Copied",
        description: "Link copied to clipboard",
      });
    } catch (err) {
      console.error("Copy to clipboard error:", err);
      // Fallback method for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedCode(text);
        setTimeout(() => setCopiedCode(null), 2000);
        toast({
          title: "Copied",
          description: "Link copied to clipboard",
        });
      } catch (fallbackErr) {
        console.error("Fallback copy error:", fallbackErr);
        toast({
          title: "Error",
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const isEligibleForCustomHandle = user?.vipCodeUsed || (linkShareData?.linkShares && linkShareData.linkShares >= 3);

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/profile")}
            className="p-2 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto p-4 space-y-6">
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="handles">Handles</TabsTrigger>
              <TabsTrigger value="chirpplus">Chirp+</TabsTrigger>
              <TabsTrigger value="vip">VIP Codes</TabsTrigger>
              <TabsTrigger value="invites">Invites</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Profile Name</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Current name: <span className="font-medium">{user?.firstName || user?.lastName ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : user?.customHandle || user?.handle || 'Not set'}</span>
                    </p>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                        <Input
                          placeholder={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.customHandle || user?.handle || "Enter your name"}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <Button
                        onClick={handleUpdateName}
                        disabled={updateNameMutation.isPending || !firstName.trim()}
                        className="w-full"
                      >
                        {updateNameMutation.isPending ? "Updating..." : "Update Name"}
                      </Button>
                      <p className="text-xs text-gray-500">
                        This will update how your name appears throughout Chirp
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit3 className="h-5 w-5" />
                    <span>Bio</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Current bio: {user?.bio ? (
                        <span className="font-medium block mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-gray-900 dark:text-white">
                          {user.bio}
                        </span>
                      ) : (
                        <span className="italic">Not set</span>
                      )}
                    </p>
                    
                    {editingBio ? (
                      <div className="space-y-3">
                        <Textarea
                          value={bioValue}
                          onChange={(e) => setBioValue(e.target.value)}
                          placeholder="Tell the world about yourself..."
                          className="resize-none"
                          rows={3}
                        />
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSaveBio}
                            disabled={updateBioMutation.isPending}
                            className="flex-1"
                          >
                            {updateBioMutation.isPending ? "Saving..." : "Save Bio"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingBio(false);
                              setBioValue(user?.bio || "");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setEditingBio(true);
                          setBioValue(user?.bio || "");
                        }}
                        className="w-full"
                      >
                        {user?.bio ? "Edit Bio" : "Add Bio"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Badge className="h-5 w-5" />
                    <span>Link in Bio</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Current link: {user?.linkInBio ? (
                        <a 
                          href={user.linkInBio.startsWith('http') ? user.linkInBio : `https://${user.linkInBio}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium block mt-1 p-2 bg-gray-50 dark:bg-gray-800 rounded text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {user.linkInBio}
                        </a>
                      ) : (
                        <span className="italic">Not set</span>
                      )}
                    </p>
                    
                    {editingLink ? (
                      <div className="space-y-3">
                        <Input
                          value={linkValue}
                          onChange={(e) => setLinkValue(e.target.value)}
                          placeholder="https://example.com or example.com"
                          className="w-full"
                        />
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => {
                              updateLinkMutation.mutate(linkValue);
                            }}
                            disabled={updateLinkMutation.isPending}
                            className="flex-1"
                          >
                            {updateLinkMutation.isPending ? "Saving..." : "Save Link"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingLink(false);
                              setLinkValue(user?.linkInBio || "");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Add a link to your website, social media, or any page you want to share
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setEditingLink(true);
                          setLinkValue(user?.linkInBio || "");
                        }}
                        className="w-full"
                      >
                        {user?.linkInBio ? "Edit Link" : "Add Link"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="handles" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Custom Handle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Current handle: <span className="font-mono">@{user?.hasCustomHandle && user?.customHandle ? user.customHandle : user?.handle}</span>
                      {!user?.hasCustomHandle && <span className="text-xs text-gray-400 ml-1">(random)</span>}
                    </p>
                    
                    {user?.hasCustomHandle ? (
                      <p className="text-green-600 dark:text-green-400 text-sm">
                        ✓ You have a custom handle!
                      </p>
                    ) : isEligibleForCustomHandle ? (
                      <div className="space-y-3">
                        <p className="text-green-600 dark:text-green-400 text-sm">
                          ✓ You're eligible to claim a custom handle!
                        </p>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter custom handle"
                            value={customHandle}
                            onChange={(e) => setCustomHandle(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            onClick={handleCheckAvailability}
                            disabled={checkHandleMutation.isPending}
                            variant="outline"
                          >
                            Check
                          </Button>
                          <Button
                            onClick={handleClaimHandle}
                            disabled={claimHandleMutation.isPending || !customHandle}
                          >
                            Claim
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          3-20 characters, letters, numbers, and underscores only
                        </p>
                      </div>
                    ) : (
                      <p className="text-amber-600 dark:text-amber-400 text-sm">
                        Share links with {3 - (linkShareData?.linkShares || 0)} more different people or use a VIP code to claim a custom handle
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Handle Change for Chirp+ */}
              {user?.hasCustomHandle && user?.isChirpPlus && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-purple-500" />
                      <span>Change Handle (Chirp+ Feature)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      As a Chirp+ member, you can change your custom handle anytime.
                    </p>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter new handle"
                          value={customHandle}
                          onChange={(e) => setCustomHandle(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleCheckAvailability}
                          disabled={checkHandleMutation.isPending}
                          variant="outline"
                        >
                          Check
                        </Button>
                        <Button
                          onClick={handleChangeHandle}
                          disabled={changeHandleMutation.isPending || !customHandle}
                          className="bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          Change
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        3-20 characters, letters, numbers, and underscores only
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="chirpplus" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-purple-500" />
                    <span>Chirp+ Premium</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Status */}
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    {user?.isChirpPlus ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          <Crown className="h-6 w-6 text-purple-500" />
                          <span className="text-lg font-semibold text-purple-700 dark:text-purple-300">You have Chirp+!</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Active until: {user.chirpPlusExpiresAt ? new Date(user.chirpPlusExpiresAt).toLocaleDateString() : 'Never expires'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upgrade to Chirp+</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Unlock premium features for $4.99/month</p>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 dark:text-white">What you get with Chirp+:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Edit3 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">Change your handle anytime</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Switch handles as often as you like after claiming your first custom one</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Badge className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">Exclusive Chirp+ badge</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Show off your premium status with a beautiful badge</p>
                          <div className="mt-2 flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border">
                            <span className="text-sm font-medium">Example User</span>
                            <Crown className="h-4 w-4 text-purple-500" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Star className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">Premium AI models</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Access to better AI for generating profile images and content</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badge Toggle for Chirp+ users */}
                  {user?.isChirpPlus && (
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">Show Chirp+ badge</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Display the crown badge next to your name</p>
                        </div>
                        <Switch
                          checked={user.showChirpPlusBadge}
                          onCheckedChange={(checked) => {
                            // Toggle badge visibility mutation
                            toggleBadgeMutation.mutate(checked);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Purchase/Manage Button */}
                  <div className="text-center">
                    {user?.isChirpPlus ? (
                      <div className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            // Open subscription management
                            setShowSubscriptionManagement(true);
                          }}
                        >
                          Manage Subscription
                        </Button>
                        
                        {/* Subscription Management Modal */}
                        {showSubscriptionManagement && (
                          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                              <h3 className="text-lg font-semibold mb-4">Manage Your Subscription</h3>
                              
                              <div className="space-y-4">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <p>Status: <span className="font-medium text-green-600">Active</span></p>
                                  <p>Next billing: {user.chirpPlusExpiresAt ? new Date(user.chirpPlusExpiresAt).toLocaleDateString() : 'N/A'}</p>
                                </div>
                                
                                <Button
                                  variant="destructive"
                                  className="w-full"
                                  onClick={handleCancelSubscription}
                                  disabled={cancelSubscriptionMutation.isPending}
                                >
                                  {cancelSubscriptionMutation.isPending ? "Cancelling..." : "Cancel Subscription"}
                                </Button>
                                
                                <Button
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => setShowSubscriptionManagement(false)}
                                >
                                  Close
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        onClick={() => {
                          // Handle subscription purchase
                          window.location.href = "/subscribe";
                        }}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Subscribe to Chirp+ - $4.99/month
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vip" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>VIP Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Have a VIP code? Different codes provide different benefits - you can use multiple codes.
                    </p>
                    {user?.vipCodeUsed && (
                      <p className="text-green-600 dark:text-green-400 text-sm">
                        ✓ You've used VIP codes before. You can still use more codes for additional benefits!
                      </p>
                    )}
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter VIP code"
                        value={vipCode}
                        onChange={(e) => setVipCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleUseVipCode}
                        disabled={useVipCodeMutation.isPending || !vipCode}
                      >
                        Use Code
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      VIP codes are case-insensitive. Each code can only be used once per account.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="invites" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Share Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Links shared with unique people: {linkShareData?.linkShares || 0} / 3
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={() => createShareLinkMutation.mutate()}
                        disabled={createShareLinkMutation.isPending}
                        className="w-full"
                      >
                        {createShareLinkMutation.isPending ? "Creating Link..." : "Create Share Link"}
                      </Button>
                      
                      {shareUrl && (
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <Input
                              value={shareUrl}
                              readOnly
                              className="flex-1 font-mono text-xs"
                            />
                            <Button
                              onClick={() => copyToClipboard(shareUrl)}
                              variant="outline"
                              size="sm"
                              className="flex items-center space-x-1"
                            >
                              {copiedCode === shareUrl ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span>Copy</span>
                            </Button>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => window.open(`sms:?body=${encodeURIComponent(`Hey! Check out Chirp, a new social media platform: ${shareUrl}`)}`)}
                              variant="outline"
                              className="flex-1 flex items-center space-x-2"
                            >
                              <span>📱</span>
                              <span>Share via SMS</span>
                            </Button>
                            <Button
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({
                                    title: 'Join me on Chirp!',
                                    text: 'Check out this new social media platform',
                                    url: shareUrl
                                  });
                                } else {
                                  // Fallback: copy to clipboard
                                  copyToClipboard(shareUrl);
                                }
                              }}
                              variant="outline"
                              className="flex-1 flex items-center space-x-2"
                            >
                              <Share className="h-4 w-4" />
                              <span>Share</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Share with 3 different people to unlock custom handle privileges. Each person needs to click your unique link.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {linkShares.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Shared Links</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {linkShares.map((linkShare: any) => (
                        <div
                          key={linkShare.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium font-mono truncate">
                              {linkShare.shareCode}
                            </p>
                            <p className="text-xs text-gray-500">
                              {linkShare.clickedAt ? (
                                <span className="text-green-600">
                                  ✓ Clicked {linkShare.isValidClick ? '(Valid)' : '(Invalid - same IP)'}
                                </span>
                              ) : (
                                "Not clicked yet"
                              )}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(`${process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : window.location.origin}/invite/${linkShare.shareCode}`)}
                              className="flex items-center space-x-1 flex-shrink-0"
                            >
                              {copiedCode === linkShare.shareCode ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span className="hidden sm:inline">Copy</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Support & Account Section */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <SettingsIcon className="h-5 w-5" />
                <span>Support & Account</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/support')}
                  className="w-full flex items-center space-x-2 border-purple-300 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <SettingsIcon className="h-4 w-4" />
                  <span>Get Support</span>
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Sign out of your Chirp account. You'll need to sign in again to access your profile.
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/api/logout'}
                  className="w-full flex items-center space-x-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
