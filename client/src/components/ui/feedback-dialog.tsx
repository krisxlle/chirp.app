import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../api";
import { useToast } from "../hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { MessageSquare, Send } from "lucide-react";

interface FeedbackDialogProps {
  trigger?: React.ReactNode;
  category?: string;
  location?: string;
}

export function FeedbackDialog({ trigger, category = "general", location }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: category,
    subject: "",
    message: "",
    email: "",
  });
  const { toast } = useToast();

  const feedbackMutation = useMutation({
    mutationFn: async (data: typeof formData & { location?: string }) => {
      return await apiRequest("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Feedback Sent!",
        description: "Thank you for your feedback. We'll review it and get back to you soon.",
      });
      setOpen(false);
      setFormData({
        category: "general",
        subject: "",
        message: "",
        email: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Feedback",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message fields.",
        variant: "destructive",
      });
      return;
    }
    feedbackMutation.mutate({ ...formData, location });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve Chirp! Share your thoughts, report bugs, or suggest new features.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select feedback type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="feature_request">Feature Request</SelectItem>
                <SelectItem value="bug_report">Bug Report</SelectItem>
                <SelectItem value="general">General Feedback</SelectItem>
                <SelectItem value="contact">Contact Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your feedback"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Describe your feedback in detail..."
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.message.length}/1000 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Your Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com (for follow-up)"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              We'll only use this to respond to your feedback
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={feedbackMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {feedbackMutation.isPending ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


