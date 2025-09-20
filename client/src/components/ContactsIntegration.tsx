import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Users, UserPlus, Mail, Search, X, MessageSquare } from "lucide-react";
import { useToast } from "./hooks/use-toast";
import { apiRequest } from "./queryClient";
import UserAvatar from "./UserAvatar";
import { isUnauthorizedError } from "./authUtils.ts";

interface Contact {
  name: string;
  phone?: string;
  email?: string;
  isRegistered?: boolean;
  user?: any;
}

interface ContactsIntegrationProps {
  isOpen: boolean;
  onClose: () => void;
  isSignup?: boolean;
}

// Helper function to open SMS with fallback methods
function openSMSFallback(phone: string, message: string, contactName: string, toastFn: any) {
  const encodedMessage = encodeURIComponent(message);
  
  // Try different SMS URL formats for different platforms
  const smsUrls = [
    `sms:${phone}?body=${encodedMessage}`, // iOS/Android
    `sms:${phone}&body=${encodedMessage}`, // Some Android versions
    `sms://${phone}?body=${encodedMessage}`, // Alternative format
    `messaging://compose?addresses=${phone}&body=${encodedMessage}`, // Windows Phone
  ];
  
  let urlOpened = false;
  
  // Try each SMS URL format with different methods
  for (const smsUrl of smsUrls) {
    try {
      // Method 1: Try with window.location first (most reliable on mobile)
      window.location.href = smsUrl;
      urlOpened = true;
      break;
    } catch (error) {
      console.log(`SMS URL with location.href failed: ${smsUrl}`, error);
      
      // Method 2: Try with programmatic link click
      try {
        const link = document.createElement('a');
        link.href = smsUrl;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        urlOpened = true;
        break;
      } catch (linkError) {
        console.log(`SMS URL with link click failed: ${smsUrl}`, linkError);
        
        // Method 3: Try with window.open as final fallback for this URL
        try {
          window.open(smsUrl, '_blank');
          urlOpened = true;
          break;
        } catch (openError) {
          console.log(`SMS URL with window.open failed: ${smsUrl}`, openError);
        }
      }
    }
  }
  
  if (urlOpened) {
    toastFn({
      title: "✓ Link Created & SMS Opened",
      description: `Share link created for ${contactName}. SMS app should open - send it to count towards custom handle (need 3 total clicks).`,
    });
  } else {
    // Show manual copy message as final fallback
    navigator.clipboard?.writeText(message).then(() => {
      toastFn({
        title: "✓ Link Created - Message Copied",
        description: `Share link created for ${contactName}. Message copied to clipboard - paste it in your SMS app to send.`,
      });
    }).catch(() => {
      toastFn({
        title: "✓ Link Created",
        description: `Share link created for ${contactName}. Please manually copy the link and send it via SMS.`,
      });
    });
  }
}

export default function ContactsIntegration({ isOpen, onClose, isSignup = false }: ContactsIntegrationProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for registered users among contacts
  const { data: registeredContacts } = useQuery({
    queryKey: ["/api/contacts/registered"],
    enabled: contacts.length > 0,
  });

  // Filter contacts based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone?.includes(searchQuery)
      );
      setFilteredContacts(filtered);
    }
  }, [contacts, searchQuery]);

  // Merge registered users with contacts
  useEffect(() => {
    if (registeredContacts && contacts.length > 0) {
      const updatedContacts = contacts.map(contact => {
        const registeredUser = registeredContacts.find((user: any) => 
          user.email === contact.email || user.phone === contact.phone
        );
        return {
          ...contact,
          isRegistered: !!registeredUser,
          user: registeredUser
        };
      });
      setContacts(updatedContacts);
    }
  }, [registeredContacts]);

  const requestContactsAccess = async () => {
    setIsLoadingContacts(true);
    try {
      // Check if we're in a supported browser environment
      if (!navigator.contacts || typeof navigator.contacts.select !== 'function') {
        // Fallback for Safari and other browsers without Contact API
        // Instead of showing error, let users add contacts manually
        setHasPermission(true);
        toast({
          title: "Manual Contact Entry",
          description: "Add friends manually below to invite them to Chirp.",
        });
        setIsLoadingContacts(false);
        return;
      }

      const contactsData = await navigator.contacts.select([
        'name', 'email', 'tel'
      ], { multiple: true });

      const formattedContacts: Contact[] = contactsData.map((contact: any) => ({
        name: contact.name?.[0] || 'Unknown Contact',
        email: contact.email?.[0],
        phone: contact.tel?.[0],
        isRegistered: false
      }));

      setContacts(formattedContacts);
      setHasPermission(true);
      
      toast({
        title: "Contacts Loaded",
        description: `Found ${formattedContacts.length} contacts`,
      });
    } catch (error) {
      console.error("Error accessing contacts:", error);
      // Fallback to manual entry instead of showing error
      setHasPermission(true);
      toast({
        title: "Manual Contact Entry",
        description: "Add friends manually below to invite them to Chirp.",
      });
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const followMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("POST", `/api/users/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chirps"] });
      toast({
        title: "Following User",
        description: "You're now following this user",
      });
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
        description: "Failed to follow user",
        variant: "destructive",
      });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (contact: Contact) => {
      console.log("Starting invitation process for contact:", contact);
      
      try {
        // Create a share link for this contact invitation
        console.log("Creating share link...");
        const shareData = await apiRequest("/api/link-shares/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        console.log("Share link created successfully:", shareData);
        
        // Send invitation with the share link
        console.log("Sending contact invitation...");
        const inviteResponse = await apiRequest("/api/invitations/contact", {
          method: "POST",
          body: JSON.stringify({
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            shareCode: shareData.shareCode
          }),
          headers: { "Content-Type": "application/json" }
        });

        
        console.log("Contact invitation sent successfully");
        return shareData;
      } catch (error) {
        console.error("Invitation mutation error:", error);
        throw error;
      }
    },
    onSuccess: (shareData, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/link-shares"] });
      queryClient.invalidateQueries({ queryKey: ["/api/link-shares/count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Create the invite message with the contact's name - always use production URL
      const baseUrl = 'https://cc097ec5-adc9-4cf9-b6df-c4d57a132b5d-00-25ezwedp5eajv.spock.replit.dev';
      const inviteLink = `${baseUrl}/invite/${shareData.shareCode}`;
      const shareText = `Hey ${variables.name}! Join me on Chirp, a fun social app: ${inviteLink}`;
      
      // Try multiple methods to open SMS app
      if (variables.phone) {
        
        // Method 1: Try Web Share API first (works well on mobile)
        if (navigator.share) {
          navigator.share({
            text: shareText
          }).then(() => {
            toast({
              title: "✓ Link Created & Share Opened",
              description: `Share link created for ${variables.name}. Share menu opened - send it to count towards custom handle (need 3 total clicks).`,
            });
          }).catch((shareError) => {
            console.log("Web Share API cancelled or failed, trying SMS URL");
            // Fallback to SMS URL if Web Share is cancelled
            openSMSFallback(variables.phone, shareText, variables.name, toast);
          });
        } else {
          // Method 2: Direct SMS URL schemes
          openSMSFallback(variables.phone, shareText, variables.name, toast);
        }
        
        // Close the dialog after a short delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        // Fallback for email (shouldn't happen with manual entry, but just in case)
        if (navigator.share) {
          navigator.share({
            text: shareText,
          }).catch(() => {
            navigator.clipboard.writeText(inviteLink).then(() => {
              toast({
                title: "Link Copied",
                description: "Invite link copied to clipboard. Share it to count towards your custom handle unlock!",
              });
            });
          });
        } else {
          navigator.clipboard.writeText(inviteLink).then(() => {
            toast({
              title: "Link Copied", 
              description: "Invite link copied to clipboard. Share it to count towards your custom handle unlock!",
            });
          });
        }
      }
    },
    onError: (error) => {
      console.error("Invitation error details:", error);
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
      
      // Show more specific error message if available
      const errorMessage = error instanceof Error ? error.message : "Failed to send invitation";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Connect Your Contacts</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!hasPermission ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
              <Users className="h-16 w-16 text-purple-500" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Find Friends on Chirp</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  {isSignup 
                    ? "Connect your contacts to find friends who are already on Chirp and invite others to join."
                    : "Discover which of your contacts are on Chirp and invite friends to join the conversation."
                  }
                </p>
              </div>
              <Button
                onClick={requestContactsAccess}
                disabled={isLoadingContacts}
                className="gradient-bg text-white hover:opacity-90"
              >
                {isLoadingContacts ? "Loading Contacts..." : "Access Contacts"}
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-gray-500"
              >
                {isSignup ? "Skip for now" : "Cancel"}
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Search Bar */}
              <div className="relative mb-4 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Manual Contact Entry for Safari/unsupported browsers */}
              <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Add Friends Manually</h3>
                <div className="space-y-2">
                  <Input
                    placeholder="Friend's name"
                    value={manualName} 
                    onChange={(e) => setManualName(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Friend's phone number (e.g. +1234567890)"
                    type="tel"
                    value={manualPhone} 
                    onChange={(e) => {
                      // Allow only digits, spaces, dashes, parentheses, and + sign
                      const cleaned = e.target.value.replace(/[^\d\s\-\(\)\+]/g, '');
                      setManualPhone(cleaned);
                    }}
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => {
                      if (manualName.trim() && manualPhone.trim()) {
                        inviteMutation.mutate({ name: manualName.trim(), phone: manualPhone.trim() });
                        setManualName("");
                        setManualPhone("");
                      } else {
                        toast({
                          title: "Missing Information",
                          description: "Please enter both name and phone number",
                          variant: "destructive",
                        });
                      }
                    }}
                    disabled={inviteMutation.isPending || !manualName.trim() || !manualPhone.trim()}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Send SMS Link
                  </Button>
                </div>
              </div>

              {/* Contacts List */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {isLoadingContacts ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : filteredContacts.length === 0 && searchQuery === "" ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📱</div>
                    <p className="text-gray-500">
                      Use the manual entry form above to invite friends to Chirp
                    </p>
                  </div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📱</div>
                    <p className="text-gray-500">
                      No contacts found matching your search
                    </p>
                  </div>
                ) : (
                  filteredContacts.map((contact, index) => (
                    <Card key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          {contact.isRegistered && contact.user ? (
                            <UserAvatar user={contact.user} size="md" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                {contact.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {contact.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {contact.email || contact.phone || "No contact info"}
                            </p>
                            {contact.isRegistered && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 mt-1">
                                On Chirp
                              </span>
                            )}
                          </div>

                          {contact.isRegistered ? (
                            <Button
                              size="sm"
                              onClick={() => followMutation.mutate(contact.user.id)}
                              disabled={followMutation.isPending}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Follow
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => inviteMutation.mutate(contact)}
                              disabled={inviteMutation.isPending || (!contact.email && !contact.phone)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              SMS
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {filteredContacts.filter(c => c.isRegistered).length} friends on Chirp
                  </p>
                  <Button onClick={onClose} variant="ghost">
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
