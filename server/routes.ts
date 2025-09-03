import { insertChirpSchema, insertFeedbackSchema, insertFollowSchema, insertNotificationSchema, insertPushTokenSchema, insertReactionSchema } from "@shared/schema";
import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { processMentions } from "./mentionUtils";
import { generatePersonalizedProfile, generateUserAvatar, generateUserBanner, generateUserBio, generateUserInterests, generateWeeklySummary } from "./openai";
import { isAuthenticated, setupAuth } from "./replitAuth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve generated images from public/generated-images
  app.use('/generated-images', express.static("public/generated-images"));
  
  // Auth middleware
  await setupAuth(app);

  // Manual trigger for weekly analytics (for testing)
  app.post('/api/admin/trigger-weekly-analytics', isAuthenticated, async (req: any, res) => {
    try {
      const { sendWeeklyAnalyticsToAllUsers } = await import('./analyticsService');
      await sendWeeklyAnalyticsToAllUsers();
      res.json({ message: "Weekly analytics triggered successfully" });
    } catch (error) {
      console.error("Error triggering weekly analytics:", error);
      res.status(500).json({ message: "Failed to trigger weekly analytics" });
    }
  });

  // Push token management (for mobile push notifications)
  app.post('/api/push-tokens', async (req, res) => {
    try {
      const userId = 'chirp-preview-001'; // Default to @chirp account for demo
      
      const validatedData = insertPushTokenSchema.parse({
        userId,
        token: req.body.token,
        platform: req.body.platform,
      });

      await storage.addPushToken(validatedData.userId, validatedData.token, validatedData.platform);
      
      console.log('Push token registered successfully:', validatedData.token);
      res.json({ success: true, message: 'Push token registered' });
    } catch (error) {
      console.error('Error registering push token:', error);
      res.status(500).json({ error: 'Failed to register push token' });
    }
  });

  // Create notification and trigger push notification
  app.post('/api/notifications', async (req, res) => {
    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      
      // Create notification and send push notification
      const { notificationService } = await import('./notificationService');
      await notificationService.createAndSendNotification(
        validatedData.userId,
        validatedData.type,
        validatedData.fromUserId,
        validatedData.chirpId
      );
      
      console.log('Notification created and push notification sent');
      res.json({ success: true, message: 'Notification created' });
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(500).json({ error: 'Failed to create notification' });
    }
  });

  // Test endpoint for email functionality (no auth required for testing)
  app.post('/api/test/weekly-analytics', async (req, res) => {
    try {
      console.log("Testing weekly analytics email functionality...");
      const { sendWeeklyAnalyticsToAllUsers } = await import('./analyticsService');
      await sendWeeklyAnalyticsToAllUsers();
      res.json({ message: "Weekly analytics test completed - check console and email" });
    } catch (error) {
      console.error("Error in weekly analytics test:", error);
      res.status(500).json({ message: "Failed to test weekly analytics", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Unsubscribe from weekly analytics
  app.get('/api/unsubscribe/weekly-analytics', async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
              <h2 style="color: #dc2626;">Invalid Request</h2>
              <p>Email address is required to unsubscribe.</p>
            </body>
          </html>
        `);
      }

      // Find user by email and update their preferences
      const updated = await storage.updateWeeklyAnalyticsPreference(email, false);
      
      if (updated) {
        res.send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #ec4899 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 20px;">
                <h1 style="margin: 0; font-size: 24px;">🐤 Unsubscribed Successfully</h1>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                <p style="font-size: 16px; margin-bottom: 16px;">
                  You've been unsubscribed from weekly analytics emails.
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                  You'll still receive important account-related emails, but no more weekly reports.
                </p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                  You can re-enable these emails anytime in your Chirp account settings.
                </p>
              </div>
            </body>
          </html>
        `);
      } else {
        res.status(404).send(`
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
              <h2 style="color: #dc2626;">Email Not Found</h2>
              <p>We couldn't find an account with that email address.</p>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error("Error unsubscribing from weekly analytics:", error);
      res.status(500).send(`
        <html>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
            <h2 style="color: #dc2626;">Error</h2>
            <p>Something went wrong. Please try again later.</p>
          </body>
        </html>
      `);
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Ensure avatarUrl is set for backwards compatibility
      if (user && !user.avatarUrl && user.profileImageUrl) {
        user.avatarUrl = user.profileImageUrl;
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chirp routes
  app.post('/api/chirps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Filter out hyperlinks from chirp content
      let content = req.body.content;
      if (content && typeof content === 'string') {
        // Remove HTTP/HTTPS URLs
        content = content.replace(/https?:\/\/[^\s]+/gi, '[link removed]');
        // Remove www. links
        content = content.replace(/www\.[^\s]+/gi, '[link removed]');
        // Remove domain-like patterns (but preserve @mentions)
        content = content.replace(/(?<!@)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi, '[link removed]');
      }
      
      const chirpData = insertChirpSchema.parse({
        ...req.body,
        content,
        authorId: userId,
      });

      if (chirpData.content.length > 280) {
        return res.status(400).json({ message: "Chirp content too long" });
      }

      const chirp = await storage.createChirp(chirpData);

      // Process mentions in the chirp content
      if (chirp.content) {
        await processMentions(chirp.content, userId, 'mention', chirp.id);
      }
      
      // If this is a reply, create a notification for the original author
      if (chirp.replyToId) {
        const originalChirp = await storage.getChirpById(chirp.replyToId);
        if (originalChirp && originalChirp.author.id !== userId) {
          const { notificationService } = await import('./notificationService');
          await notificationService.createAndSendNotification(
            originalChirp.author.id,
            'reply',
            userId,
            chirp.id
          );
        }
      }
      
      res.json(chirp);
    } catch (error) {
      console.error("Error creating chirp:", error);
      res.status(400).json({ message: "Failed to create chirp" });
    }
  });

  // Create thread endpoint
  app.post('/api/chirps/thread', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { threadParts } = req.body;

      if (!Array.isArray(threadParts) || threadParts.length === 0) {
        return res.status(400).json({ message: "Thread parts are required" });
      }

      if (threadParts.length > 10) {
        return res.status(400).json({ message: "Thread cannot exceed 10 parts" });
      }

      // Validate each part
      for (const part of threadParts) {
        if (!part.content || typeof part.content !== 'string') {
          return res.status(400).json({ message: "Each thread part must have content" });
        }
        if (part.content.length > 280) {
          return res.status(400).json({ message: "Each thread part cannot exceed 280 characters" });
        }
      }

      // Filter out hyperlinks from all thread parts
      const filteredParts = threadParts.map(part => {
        let content = part.content;
        if (content && typeof content === 'string') {
          content = content.replace(/https?:\/\/[^\s]+/gi, '[link removed]');
          content = content.replace(/www\.[^\s]+/gi, '[link removed]');
          content = content.replace(/(?<!@)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi, '[link removed]');
        }
        return { ...part, content };
      });

      const createdChirps = await storage.createThread(userId, filteredParts);
      
      // Process mentions for each thread part
      for (const chirp of createdChirps) {
        if (chirp.content) {
          await processMentions(chirp.content, userId, 'mention', chirp.id);
        }
      }
      
      res.status(201).json({ 
        message: "Thread created successfully",
        thread: createdChirps 
      });
    } catch (error) {
      console.error("Error creating thread:", error);
      res.status(500).json({ message: "Failed to create thread" });
    }
  });

  app.get('/api/chirps', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const usePersonalized = req.query.personalized === 'true';
      const useTrending = req.query.trending === 'true';
      
      // Get list of blocked users to filter out
      const blockedUserIds = await storage.getBlockedUserIds(userId);
      
      let chirps;
      if (usePersonalized) {
        // Use the recommendation engine for personalized feed
        const { recommendationEngine } = await import('./recommendationEngine');
        chirps = await recommendationEngine.getPersonalizedFeed(userId, limit);
      } else if (useTrending) {
        // Get trending chirps (most reactions in last 24 hours)
        chirps = await storage.getTrendingChirps(userId, limit, blockedUserIds);
      } else {
        // Chronological feed
        chirps = await storage.getChirps(userId, limit, blockedUserIds);
      }
      
      res.json(chirps);
    } catch (error) {
      console.error("Error fetching chirps:", error);
      res.status(500).json({ message: "Failed to fetch chirps" });
    }
  });

  app.get('/api/users/:userId/chirps', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      
      // Check if either user has blocked the other
      const isBlockedByUser = await storage.isUserBlocked(userId, currentUserId);
      const hasBlockedUser = await storage.isUserBlocked(currentUserId, userId);
      
      if (isBlockedByUser || hasBlockedUser) {
        return res.json([]); // Return empty array if there's any blocking relationship
      }
      
      const chirps = await storage.getChirpsByUser(userId);
      res.json(chirps);
    } catch (error) {
      console.error("Error fetching user chirps:", error);
      res.status(500).json({ message: "Failed to fetch user chirps" });
    }
  });

  app.get('/api/users/:userId/replies', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      
      // Check if either user has blocked the other
      const isBlockedByUser = await storage.isUserBlocked(userId, currentUserId);
      const hasBlockedUser = await storage.isUserBlocked(currentUserId, userId);
      
      if (isBlockedByUser || hasBlockedUser) {
        return res.json([]); // Return empty array if there's any blocking relationship
      }
      
      const replies = await storage.getUserReplies(userId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching user replies:", error);
      res.status(500).json({ message: "Failed to fetch user replies" });
    }
  });

  // Delete chirp endpoint
  app.delete('/api/chirps/:chirpId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { chirpId } = req.params;
      
      // Delete the chirp (this method will check permissions internally)
      await storage.deleteChirp(userId, parseInt(chirpId));
      
      res.json({ message: "Chirp deleted successfully" });
    } catch (error) {
      console.error("Error deleting chirp:", error);
      res.status(500).json({ message: "Failed to delete chirp" });
    }
  });

  // Get a single chirp by ID
  app.get('/api/chirps/:id', isAuthenticated, async (req: any, res) => {
    try {
      const chirpId = parseInt(req.params.id);
      if (isNaN(chirpId)) {
        return res.status(400).json({ message: "Invalid chirp ID" });
      }

      const chirp = await storage.getChirpById(chirpId);
      if (!chirp) {
        return res.status(404).json({ message: "Chirp not found" });
      }

      res.json(chirp);
    } catch (error) {
      console.error("Error fetching chirp:", error);
      res.status(500).json({ message: "Failed to fetch chirp" });
    }
  });

  // Get replies for a specific chirp
  app.get('/api/chirps/:id/replies', isAuthenticated, async (req: any, res) => {
    try {
      const chirpId = parseInt(req.params.id);
      if (isNaN(chirpId)) {
        return res.status(400).json({ message: "Invalid chirp ID" });
      }

      const replies = await storage.getChirpReplies(chirpId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching chirp replies:", error);
      res.status(500).json({ message: "Failed to fetch replies" });
    }
  });

  // Create a repost
  app.post('/api/chirps/:id/repost', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chirpId = parseInt(req.params.id);
      
      if (isNaN(chirpId)) {
        return res.status(400).json({ message: "Invalid chirp ID" });
      }

      const repost = await storage.createRepost(userId, chirpId);
      res.json(repost);
    } catch (error) {
      console.error("Error creating repost:", error);
      res.status(400).json({ message: "Failed to create repost" });
    }
  });

  // Undo repost
  app.delete('/api/chirps/:id/repost', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chirpId = parseInt(req.params.id);
      
      if (isNaN(chirpId)) {
        return res.status(400).json({ message: "Invalid chirp ID" });
      }

      await storage.deleteRepost(userId, chirpId);
      res.json({ message: "Repost deleted successfully" });
    } catch (error) {
      console.error("Error deleting repost:", error);
      res.status(400).json({ message: "Failed to delete repost" });
    }
  });

  // Check if user reposted a chirp
  app.get('/api/chirps/:id/reposted', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chirpId = parseInt(req.params.id);
      
      if (isNaN(chirpId)) {
        return res.status(400).json({ message: "Invalid chirp ID" });
      }

      const reposted = await storage.checkUserReposted(userId, chirpId);
      res.json({ reposted });
    } catch (error) {
      console.error("Error checking repost status:", error);
      res.status(400).json({ message: "Failed to check repost status" });
    }
  });

  // Delete a chirp
  app.delete('/api/chirps/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chirpId = parseInt(req.params.id);
      
      if (isNaN(chirpId)) {
        return res.status(400).json({ message: "Invalid chirp ID" });
      }

      await storage.deleteChirp(userId, chirpId);
      res.json({ message: "Chirp deleted successfully" });
    } catch (error) {
      console.error("Error deleting chirp:", error);
      res.status(400).json({ message: "Failed to delete chirp" });
    }
  });

  // Get total chirp count for user (including replies)
  app.get('/api/users/:userId/chirp-count', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const count = await storage.getTotalChirpCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching chirp count:", error);
      res.status(500).json({ message: "Failed to fetch chirp count" });
    }
  });

  app.get('/api/users/:userId/reacted', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      
      // Check if either user has blocked the other
      const isBlockedByUser = await storage.isUserBlocked(userId, currentUserId);
      const hasBlockedUser = await storage.isUserBlocked(currentUserId, userId);
      
      if (isBlockedByUser || hasBlockedUser) {
        return res.json([]); // Return empty array if there's any blocking relationship
      }
      
      const reactedChirps = await storage.getUserReactedChirps(userId);
      res.json(reactedChirps);
    } catch (error) {
      console.error("Error fetching user reacted chirps:", error);
      res.status(500).json({ message: "Failed to fetch user reacted chirps" });
    }
  });

  app.get('/api/users/:userId/reaction-counts', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const reactionCounts = await storage.getUserReactionCounts(userId);
      res.json(reactionCounts);
    } catch (error) {
      console.error("Error fetching user reaction counts:", error);
      res.status(500).json({ message: "Failed to fetch user reaction counts" });
    }
  });

  // Follow routes
  app.post('/api/follows', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followData = insertFollowSchema.parse({
        ...req.body,
        followerId,
      });

      if (followData.followerId === followData.followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }

      const isAlreadyFollowing = await storage.isFollowing(followData.followerId, followData.followingId);
      if (isAlreadyFollowing) {
        return res.status(400).json({ message: "Already following this user" });
      }

      const follow = await storage.followUser(followData);
      
      // Create notification with push notification
      const { notificationService } = await import('./notificationService');
      await notificationService.createAndSendNotification(
        followData.followingId,
        'follow',
        followerId
      );

      res.json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      res.status(400).json({ message: "Failed to follow user" });
    }
  });

  app.delete('/api/follows/:followingId', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const { followingId } = req.params;

      await storage.unfollowUser(followerId, followingId);
      res.json({ message: "Unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  app.get('/api/users/:userId/followers', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });

  app.get('/api/users/:userId/following', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });

  app.get('/api/users/:userId/follow-counts', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const counts = await storage.getFollowCounts(userId);
      res.json(counts);
    } catch (error) {
      console.error("Error fetching follow counts:", error);
      res.status(500).json({ message: "Failed to fetch follow counts" });
    }
  });

  app.get('/api/users/:userId/is-following', isAuthenticated, async (req: any, res) => {
    try {
      const followerId = req.user.claims.sub;
      const { userId } = req.params;
      const isFollowing = await storage.isFollowing(followerId, userId);
      res.json({ isFollowing });
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ message: "Failed to check follow status" });
    }
  });

  // Reaction routes
  app.post('/api/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reactionData = insertReactionSchema.parse({
        ...req.body,
        userId,
      });

      const reaction = await storage.addReaction(reactionData);
      
      // Note: Notification is already created in storage.addReaction()

      res.json(reaction);
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(400).json({ message: "Failed to add reaction" });
    }
  });

  app.delete('/api/reactions/:chirpId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const chirpId = parseInt(req.params.chirpId);

      await storage.removeReaction(userId, chirpId);
      res.json({ message: "Reaction removed successfully" });
    } catch (error) {
      console.error("Error removing reaction:", error);
      res.status(500).json({ message: "Failed to remove reaction" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:notificationId/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.get('/api/notifications/unread-count', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });

  // Get notification settings for a user
  app.get('/api/notifications/settings/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      
      const setting = await storage.getNotificationSetting(currentUserId, userId);
      res.json(setting || { notifyOnPost: false });
    } catch (error) {
      console.error("Error getting notification setting:", error);
      res.status(500).json({ message: "Failed to get notification setting" });
    }
  });

  // Push notification token management
  app.post('/api/push-tokens', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { token, platform } = req.body;
      
      if (!token || !platform) {
        return res.status(400).json({ message: "Token and platform are required" });
      }

      await storage.addPushToken(userId, token, platform);
      res.json({ message: "Push token registered successfully" });
    } catch (error) {
      console.error("Error registering push token:", error);
      res.status(500).json({ message: "Failed to register push token" });
    }
  });

  app.delete('/api/push-tokens/:token', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { token } = req.params;
      
      await storage.removePushToken(userId, token);
      res.json({ message: "Push token removed successfully" });
    } catch (error) {
      console.error("Error removing push token:", error);
      res.status(500).json({ message: "Failed to remove push token" });
    }
  });

  // Manual weekly summary notification trigger (for testing)
  app.post('/api/admin/trigger-weekly-summary', isAuthenticated, async (req: any, res) => {
    try {
      const { notificationService } = await import('./notificationService');
      await notificationService.sendWeeklySummaryNotifications();
      res.json({ message: "Weekly summary notifications sent successfully" });
    } catch (error) {
      console.error("Error triggering weekly summary notifications:", error);
      res.status(500).json({ message: "Failed to trigger weekly summary notifications" });
    }
  });

  // Update notification settings for a user
  app.post('/api/notifications/settings/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      const { notifyOnPost } = req.body;
      
      const setting = await storage.updateNotificationSetting(currentUserId, userId, notifyOnPost);
      res.json(setting);
    } catch (error) {
      console.error("Error updating notification setting:", error);
      res.status(500).json({ message: "Failed to update notification setting" });
    }
  });

  // Frontend-compatible notification endpoints
  app.get('/api/users/:userId/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      
      const setting = await storage.getNotificationSetting(currentUserId, userId);
      res.json({ enabled: setting?.notifyOnPost || false });
    } catch (error) {
      console.error("Error getting notification setting:", error);
      res.status(500).json({ message: "Failed to get notification setting" });
    }
  });

  app.post('/api/users/:userId/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId } = req.params;
      const { enabled } = req.body;
      
      const setting = await storage.updateNotificationSetting(currentUserId, userId, enabled);
      res.json({ enabled: setting.notifyOnPost });
    } catch (error) {
      console.error("Error updating notification setting:", error);
      res.status(500).json({ message: "Failed to update notification setting" });
    }
  });

  // User profile route - by handle
  app.get('/api/users/:identifier', isAuthenticated, async (req: any, res) => {
    try {
      const { identifier } = req.params;
      let user;
      
      // Check if identifier is a numeric ID
      if (/^\d+$/.test(identifier)) {
        user = await storage.getUser(identifier);
      } else {
        // Look up by handle (custom handle or default handle)
        user = await storage.getUserByHandle(identifier);
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Ensure avatarUrl is set for backwards compatibility
      if (!user.avatarUrl && user.profileImageUrl) {
        user.avatarUrl = user.profileImageUrl;
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user by ID or handle:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile route - by ID for internal use
  app.get('/api/users/:userId/profile', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Ensure avatarUrl is set for backwards compatibility
      if (!user.avatarUrl && user.profileImageUrl) {
        user.avatarUrl = user.profileImageUrl;
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Search routes
  app.get('/api/search/users', isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string;
      console.log("Received user search request - query:", query, "full query params:", req.query);
      
      if (!query || query.trim().length === 0) {
        console.log("No query provided, returning empty array");
        return res.json([]);
      }
      
      console.log("Searching users for query:", query);
      const users = await storage.searchUsers(query.trim());
      console.log("Found users:", users.length);
      res.json(users);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get('/api/search/chirps', isAuthenticated, async (req: any, res) => {
    try {
      const query = req.query.q as string;
      console.log("Received chirp search request - query:", query, "full query params:", req.query);
      
      if (!query || query.trim().length === 0) {
        console.log("No query provided, returning empty array");
        return res.json([]);
      }
      
      console.log("Searching chirps for query:", query);
      const chirps = await storage.searchChirps(query.trim());
      console.log("Found chirps:", chirps.length);
      res.json(chirps);
    } catch (error) {
      console.error("Error searching chirps:", error);
      res.status(500).json({ message: "Failed to search chirps", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Trending hashtags routes
  app.get('/api/trending/hashtags', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const trendingHashtags = await storage.getTrendingHashtags(limit);
      res.json(trendingHashtags);
    } catch (error) {
      console.error("Error fetching trending hashtags:", error);
      res.status(500).json({ message: "Failed to fetch trending hashtags" });
    }
  });

  app.get('/api/hashtags/:hashtag/chirps', isAuthenticated, async (req: any, res) => {
    try {
      const { hashtag } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const chirps = await storage.getHashtagChirps(hashtag, limit);
      res.json(chirps);
    } catch (error) {
      console.error("Error fetching hashtag chirps:", error);
      res.status(500).json({ message: "Failed to fetch hashtag chirps" });
    }
  });

  // AI routes
  // Combined image generation endpoint for mobile app
  app.post('/api/ai/generate-images', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { prompt, type } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      console.log(`Generating ${type} images for user ${userId} with prompt:`, prompt);

      // Get user details for personalized generation
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const name = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.handle || 'User';
      const isChirpPlus = user.isChirpPlus || false;

      // Generate both avatar and banner with the custom prompt
      const [avatarUrl, bannerUrl] = await Promise.all([
        generateUserAvatar(userId, name, prompt, isChirpPlus),
        generateUserBanner(userId, prompt, isChirpPlus)
      ]);

      console.log('Generated images:', { avatarUrl, bannerUrl });

      res.json({ 
        success: true, 
        avatarUrl, 
        bannerUrl,
        message: "Profile images generated successfully" 
      });
    } catch (error) {
      console.error("Error generating profile images:", error);
      res.status(500).json({ message: "Failed to generate profile images", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post('/api/ai/weekly-summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userChirps = await storage.getChirpsByUser(userId);
      
      // Calculate summary data
      const chirpCount = userChirps.length;
      const topChirp = userChirps.length > 0 ? userChirps.reduce((top, current) => {
        const topTotal = Object.values(top.reactionCounts || {}).reduce((sum: number, count: unknown) => sum + (typeof count === 'number' ? count : 0), 0);
        const currentTotal = Object.values(current.reactionCounts || {}).reduce((sum: number, count: unknown) => sum + (typeof count === 'number' ? count : 0), 0);
        return currentTotal > topTotal ? current : top;
      })?.content || "No chirps this week" : "No chirps this week";

      const allReactions: Record<string, number> = {};
      userChirps.forEach(chirp => {
        Object.entries(chirp.reactionCounts).forEach(([emoji, count]) => {
          allReactions[emoji] = (allReactions[emoji] || 0) + (count as number);
        });
      });

      const topReactions = Object.entries(allReactions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([emoji, count]) => ({ emoji, count }));

      const summaryData = {
        chirpCount,
        topChirp,
        topReactions,
        totalReactions: Object.values(allReactions).reduce((sum: number, count: number) => sum + count, 0),
        weeklyVibes: "positive",
        commonWords: ["chirp", "awesome", "great"]
      };
      const summary = await generateWeeklySummary(
        userId,
        summaryData.chirpCount,
        summaryData.topChirp,
        summaryData.topReactions,
        summaryData.commonWords,
        summaryData.weeklyVibes
      );
      
      // Create AI chirp
      const aiChirp = await storage.createChirp({
        authorId: userId, // This will be replaced with AI user in production
        content: summary,
        isAiGenerated: true
      });

      res.json(aiChirp);
    } catch (error) {
      console.error("Error generating weekly summary:", error);
      res.status(500).json({ message: "Failed to generate weekly summary" });
    }
  });

  app.post('/api/ai/generate-avatar', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
      
      const avatarUrl = await generateUserAvatar(userId, name);
      res.json({ avatarUrl });
    } catch (error) {
      console.error("Error generating avatar:", error);
      res.status(500).json({ message: "Failed to generate avatar" });
    }
  });

  app.post('/api/ai/generate-banner', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bannerUrl = await generateUserBanner(userId);
      res.json({ bannerUrl });
    } catch (error) {
      console.error("Error generating banner:", error);
      res.status(500).json({ message: "Failed to generate banner" });
    }
  });

  app.post('/api/ai/generate-bio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const handle = user?.hasCustomHandle && user?.customHandle ? user.customHandle : user?.handle;
      const { interests } = req.body;
      
      const bio = await generateUserBio(userId, handle || 'user', interests);
      res.json({ bio });
    } catch (error) {
      console.error("Error generating bio:", error);
      res.status(500).json({ message: "Failed to generate bio" });
    }
  });

  app.post('/api/ai/generate-interests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userChirps = await storage.getChirpsByUser(userId);
      const recentChirps = userChirps.slice(0, 10).map(chirp => chirp.content);
      
      const interests = await generateUserInterests(userId, recentChirps);
      res.json({ interests });
    } catch (error) {
      console.error("Error generating interests:", error);
      res.status(500).json({ message: "Failed to generate interests" });
    }
  });

  // Check AI generation limit
  app.get('/api/ai/generation-limit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limitInfo = await storage.checkAiGenerationLimit(userId);
      res.json(limitInfo);
    } catch (error) {
      console.error("Error checking AI generation limit:", error);
      res.status(500).json({ message: "Failed to check generation limit" });
    }
  });

  app.post('/api/ai/generate-personalized-profile', isAuthenticated, async (req: any, res) => {
    try {
      console.log('AI Profile generation started for user:', req.user?.claims?.sub);
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
      
      console.log('User found:', { id: userId, name, isChirpPlus: user?.isChirpPlus });
      
      // Check rate limits
      const limitInfo = await storage.checkAiGenerationLimit(userId);
      console.log('Rate limit check:', limitInfo);
      
      if (!limitInfo.canGenerate) {
        console.log('Rate limit exceeded for user:', userId);
        return res.status(429).json({ 
          message: "Daily AI generation limit reached. Upgrade to Chirp+ for unlimited generations with premium AI models!",
          needsUpgrade: true 
        });
      }
      
      const { personality, traits, interests, style, customPrompts } = req.body;
      console.log('Generation request:', { personality, traits: traits?.length, interests: interests?.length, customPrompts: customPrompts?.length });
      
      // Handle custom prompt-only generation
      if (!personality && !traits && !interests && !style && customPrompts) {
        // Generate with custom prompt only
        const [avatarUrl, bannerUrl, bio, generatedInterests] = await Promise.all([
          generateUserAvatar(userId, name, user?.isChirpPlus ? customPrompts : undefined),
          generateUserBanner(userId, user?.isChirpPlus ? customPrompts : undefined), 
          generateUserBio(userId, name, []),
          generateUserInterests(userId, [])
        ]);
        
        // Increment usage for non-Chirp+ users
        if (!limitInfo.isChirpPlus) {
          await storage.incrementAiGeneration(userId);
        }
        
        // Preserve existing bio for custom prompt generation too
        const customUpdateData: any = {
          profileImageUrl: avatarUrl,
          bannerImageUrl: bannerUrl,
          interests: generatedInterests
        };
        
        // Only update bio if user doesn't have one or it's empty
        if (!user?.bio || user.bio.trim() === '') {
          customUpdateData.bio = bio;
        }
        
        await storage.updateUserProfile(userId, customUpdateData);
        
        return res.json({
          avatarUrl,
          bannerUrl,
          bio,
          interests: generatedInterests,
          message: "AI profile generated with custom prompt!"
        });
      }
      
      console.log('Calling generatePersonalizedProfile...');
      const result = await generatePersonalizedProfile(
        userId,
        name,
        personality,
        traits,
        interests,
        style,
        customPrompts || "",
        limitInfo.isChirpPlus
      );
      console.log('Profile generation completed:', { 
        avatarUrl: !!result.avatarUrl, 
        bannerUrl: !!result.bannerUrl, 
        bio: !!result.bio, 
        interests: result.interests?.length,
        avatarUrlStart: result.avatarUrl?.substring(0, 60),
        bannerUrlStart: result.bannerUrl?.substring(0, 60),
        isSvgAvatar: result.avatarUrl?.startsWith('data:image/svg'),
        isSvgBanner: result.bannerUrl?.startsWith('data:image/svg')
      });
      
      console.log('Updating user profile with:', {
        avatarUrl: result.avatarUrl?.substring(0, 100),
        profileImageUrl: result.avatarUrl?.substring(0, 100),
        bannerImageUrl: result.bannerUrl?.substring(0, 100)
      });

      // Increment usage for non-Chirp+ users
      if (!limitInfo.isChirpPlus) {
        await storage.incrementAiGeneration(userId);
      }

      // Update user profile in the database - preserve existing bio if user has one
      const updateData: any = {
        avatarUrl: result.avatarUrl,
        profileImageUrl: result.avatarUrl, // Keep both for compatibility
        bannerImageUrl: result.bannerUrl,
        interests: result.interests
      };
      
      // Only update bio if user doesn't have one or it's empty
      if (!user?.bio || user.bio.trim() === '') {
        updateData.bio = result.bio;
      }
      
      await storage.updateUserProfile(userId, updateData);
      console.log('Profile updated in database successfully');
      
      // Verify the update worked
      const updatedUser = await storage.getUser(userId);
      console.log('Verification - user profile after update:', {
        avatarUrl: updatedUser?.avatarUrl?.substring(0, 100),
        profileImageUrl: updatedUser?.profileImageUrl?.substring(0, 100),
        bannerImageUrl: updatedUser?.bannerImageUrl?.substring(0, 100)
      });
      
      res.json({
        ...result,
        message: "Personalized AI profile generated successfully!"
      });
    } catch (error: any) {
      console.error("Error generating personalized profile:", error);
      
      // Provide more specific error messages
      let errorMessage = "Failed to generate personalized profile";
      if (error.message?.includes("rate limit")) {
        errorMessage = "OpenAI rate limit exceeded. Please try again in a few minutes.";
      } else if (error.message?.includes("quota")) {
        errorMessage = "OpenAI quota exceeded. Please try again later.";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network error. Please check your connection and try again.";
      }
      
      res.status(500).json({ message: errorMessage });
    }
  });

  app.patch('/api/users/bio', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bio } = req.body;
      
      await storage.updateUserProfile(userId, { bio });
      
      // Process mentions in the bio
      if (bio) {
        await processMentions(bio, userId, 'mention_bio');
      }
      
      res.json({ message: "Bio updated successfully" });
    } catch (error) {
      console.error("Error updating bio:", error);
      res.status(500).json({ message: "Failed to update bio" });
    }
  });

  // Update profile name route
  app.patch('/api/users/name', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;
      
      if (typeof firstName !== 'string' || typeof lastName !== 'string') {
        return res.status(400).json({ message: "First name and last name must be strings" });
      }
      
      if (firstName.length > 50 || lastName.length > 50) {
        return res.status(400).json({ message: "Names too long (max 50 characters each)" });
      }
      
      await storage.updateUserProfile(userId, { firstName, lastName });
      
      res.json({ message: "Name updated successfully" });
    } catch (error) {
      console.error("Error updating name:", error);
      res.status(500).json({ message: "Failed to update name" });
    }
  });

  app.post('/api/ai/generate-complete-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const handle = user?.hasCustomHandle && user?.customHandle ? user.customHandle : user?.handle;
      const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
      
      // Get user's recent chirps for context
      const userChirps = await storage.getChirpsByUser(userId);
      const recentChirps = userChirps.slice(0, 10).map(chirp => chirp.content);
      
      // Generate all profile elements with premium status
      const [avatarUrl, bannerUrl, interests, bio] = await Promise.all([
        generateUserAvatar(userId, name, user?.isChirpPlus?.toString()),
        generateUserBanner(userId, user?.isChirpPlus?.toString()),
        generateUserInterests(userId, recentChirps),
        generateUserInterests(userId, recentChirps).then(interests => 
          generateUserBio(userId, handle || 'user', interests)
        )
      ]);
      
      res.json({
        avatarUrl,
        bannerUrl,
        bio,
        interests,
        message: "Complete AI profile generated successfully!"
      });
    } catch (error) {
      console.error("Error generating complete profile:", error);
      res.status(500).json({ message: "Failed to generate complete profile" });
    }
  });

  // Handle routes
  app.post("/api/handles/claim", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { customHandle } = req.body;
      
      if (!customHandle || typeof customHandle !== "string") {
        return res.status(400).json({ message: "Custom handle is required" });
      }
      
      // Validate handle format (alphanumeric, 3-20 characters)
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(customHandle)) {
        return res.status(400).json({ message: "Handle must be 3-20 characters, alphanumeric and underscores only" });
      }
      
      await storage.claimCustomHandle(userId, customHandle);
      res.json({ message: "Custom handle claimed successfully" });
    } catch (error) {
      console.error("Error claiming custom handle:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to claim custom handle" });
    }
  });

  app.get("/api/handles/check/:handle", async (req, res) => {
    try {
      const { handle } = req.params;
      const isAvailable = await storage.isHandleAvailable(handle);
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking handle availability:", error);
      res.status(500).json({ message: "Failed to check handle availability" });
    }
  });

  // VIP code routes
  app.post("/api/vip-codes/use", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { code } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "VIP code is required" });
      }
      
      const vipCodeResult = await storage.useVipCode(code, userId);
      if (vipCodeResult) {
        const { grantsChirpPlus, chirpPlusDurationMonths, description } = vipCodeResult;
        
        // Handle Chirp+ grants
        if (grantsChirpPlus) {
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + (chirpPlusDurationMonths || 1));
          await storage.updateUserChirpPlus(userId, true, expiresAt);
          
          res.json({ 
            message: `VIP code used! You now have ${chirpPlusDurationMonths} month${chirpPlusDurationMonths !== 1 ? 's' : ''} of Chirp+ access and can claim a custom handle.`,
            canClaimHandle: true,
            chirpPlusGranted: true,
            description
          });
        } else {
          res.json({ 
            message: "VIP code used successfully! You can now claim a custom handle.",
            canClaimHandle: true,
            description
          });
        }
      } else {
        res.status(400).json({ message: "Invalid or already used VIP code" });
      }
    } catch (error) {
      console.error("Error using VIP code:", error);
      res.status(500).json({ message: "Failed to use VIP code" });
    }
  });

  // Update user link in bio
  app.patch("/api/users/link-in-bio", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { linkInBio } = req.body;

      if (linkInBio && typeof linkInBio !== "string") {
        return res.status(400).json({ message: "Link in bio must be a string" });
      }

      // Validate URL format if provided
      if (linkInBio && linkInBio.trim()) {
        try {
          const url = linkInBio.startsWith('http') ? linkInBio : `https://${linkInBio}`;
          new URL(url);
        } catch {
          return res.status(400).json({ message: "Please enter a valid URL" });
        }
      }

      const user = await storage.updateUserProfile(userId, { linkInBio: linkInBio?.trim() || null });
      res.json(user);
    } catch (error) {
      console.error("Error updating link in bio:", error);
      res.status(500).json({ message: "Failed to update link in bio" });
    }
  });

  // Legal agreement tracking route
  app.post('/api/users/agree-to-terms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { agreedToTerms, agreedToPrivacy } = req.body;
      
      const updates: any = {};
      if (agreedToTerms) {
        updates.agreedToTerms = true;
        updates.termsAgreedAt = new Date();
      }
      if (agreedToPrivacy) {
        updates.agreedToPrivacy = true;
        updates.privacyAgreedAt = new Date();
      }

      if (Object.keys(updates).length > 0) {
        await storage.updateUserProfile(userId, updates);
      }

      res.json({ message: "Legal agreements updated successfully" });
    } catch (error) {
      console.error("Error updating legal agreements:", error);
      res.status(500).json({ message: "Failed to update legal agreements" });
    }
  });

  // Feedback routes
  app.post("/api/feedback", async (req, res) => {
    try {
      let userId = null;
      if (req.isAuthenticated?.()) {
        userId = (req.user as any)?.claims?.sub;
      }
      
      // Clean up empty email field to pass validation
      const requestData = {
        ...req.body,
        email: req.body.email?.trim() || undefined,
        userId,
        userAgent: req.get('User-Agent') || null,
      };
      
      // Validate using the schema
      const feedbackData = insertFeedbackSchema.parse(requestData);
      
      const newFeedback = await storage.createFeedback(feedbackData);
      
      // Send email notification to you
      try {
        const { sendFeedbackNotification } = await import('./emailService');
        await sendFeedbackNotification(newFeedback, (req.user as any)?.claims || null);
      } catch (emailError) {
        console.error("Failed to send feedback email:", emailError);
        // Don't fail the request if email fails
      }
      
      res.status(201).json({ message: "Feedback submitted successfully" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Admin route to view all feedback
  app.get("/api/admin/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.email !== "kriselle.t@gmail.com") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const allFeedback = await storage.getAllFeedback();
      res.json(allFeedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Admin endpoint to create influencer codes
  app.post("/api/admin/create-influencer-code", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      // Simple admin check - in production you'd want proper role-based access
      if (!user?.email?.includes('kriselle.t@gmail.com')) {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { 
        influencerName, 
        codePrefix = 'INF',
        grantsChirpPlus = true, 
        durationMonths = 3,
        quantity = 1
      } = req.body;
      
      if (!influencerName) {
        return res.status(400).json({ message: "Influencer name is required" });
      }
      
      const codes = [];
      for (let i = 0; i < quantity; i++) {
        // Generate unique code
        const timestamp = Date.now().toString().slice(-6);
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `${codePrefix}${timestamp}${randomSuffix}`;
        
        const codeData = await storage.createVipCode({
          code,
          codeType: 'influencer',
          grantsChirpPlus,
          chirpPlusDurationMonths: durationMonths,
          createdBy: userId,
          description: `Influencer code for ${influencerName} - ${durationMonths} month${durationMonths !== 1 ? 's' : ''} Chirp+`
        });
        
        codes.push(codeData);
      }
      
      res.json({
        message: `Created ${quantity} influencer code${quantity !== 1 ? 's' : ''} for ${influencerName}`,
        codes: codes.map(c => ({
          code: c.code,
          description: c.description,
          grantsChirpPlus: c.grantsChirpPlus,
          durationMonths: c.chirpPlusDurationMonths
        }))
      });
    } catch (error) {
      console.error("Error creating influencer codes:", error);
      res.status(500).json({ message: "Failed to create influencer codes" });
    }
  });

  // User blocking endpoints
  app.post("/api/users/:userId/block", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const targetUserId = req.params.userId;

      if (currentUserId === targetUserId) {
        return res.status(400).json({ message: "Cannot block yourself" });
      }

      // Check if target user exists
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const block = await storage.blockUser(currentUserId, targetUserId);
      res.json({ message: "User blocked successfully", block });
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).json({ message: "Failed to block user" });
    }
  });

  app.delete("/api/users/:userId/block", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const targetUserId = req.params.userId;

      await storage.unblockUser(currentUserId, targetUserId);
      res.json({ message: "User unblocked successfully" });
    } catch (error) {
      console.error("Error unblocking user:", error);
      res.status(500).json({ message: "Failed to unblock user" });
    }
  });

  app.get("/api/users/:userId/blocked", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const targetUserId = req.params.userId;

      // Only check if current user has blocked target user (one-way)
      const hasBlocked = await storage.hasUserBlocked(currentUserId, targetUserId);
      res.json({ blocked: hasBlocked });
    } catch (error) {
      console.error("Error checking block status:", error);
      res.status(500).json({ message: "Failed to check block status" });
    }
  });

  // Check if current user is blocked BY the target user (reverse check)
  app.get("/api/users/:userId/blocked-by", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const targetUserId = req.params.userId;

      // Check if target user has blocked current user
      const isBlockedBy = await storage.hasUserBlocked(targetUserId, currentUserId);
      res.json({ blockedBy: isBlockedBy });
    } catch (error) {
      console.error("Error checking blocked by status:", error);
      res.status(500).json({ message: "Failed to check blocked by status" });
    }
  });

  // Link sharing routes
  app.post("/api/link-shares/create", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      console.log("Creating share link for user:", userId);
      
      if (!userId) {
        console.error("No user ID found in request");
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const shareData = await storage.createShareLink(userId);
      console.log("Share link created successfully:", shareData.shareCode);
      
      res.json({ 
        message: "Share link created successfully",
        shareCode: shareData.shareCode,
        shareUrl: shareData.shareUrl
      });
    } catch (error) {
      console.error("Error creating share link:", error);
      res.status(500).json({ message: "Failed to create share link", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/link-shares", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const linkShares = await storage.getUserLinkShares(userId);
      res.json(linkShares);
    } catch (error) {
      console.error("Error fetching link shares:", error);
      res.status(500).json({ message: "Failed to fetch link shares" });
    }
  });

  // Handle shared link clicks (public route)
  app.get("/invite/:shareCode", async (req, res) => {
    try {
      const { shareCode } = req.params;
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      const isValidClick = await storage.processLinkClick(shareCode, clientIp, userAgent);
      
      // Redirect to the main app with a success/failure message
      const message = isValidClick 
        ? "Thanks for clicking! This counts towards unlocking custom handles." 
        : "Link already used or invalid.";
      
      // Redirect to app with message in query params
      res.redirect(`/?message=${encodeURIComponent(message)}&validClick=${isValidClick}`);
    } catch (error) {
      console.error("Error processing link click:", error);
      res.redirect("/?message=" + encodeURIComponent("Invalid share link"));
    }
  });

  // Contact integration endpoints
  app.get("/api/contacts/registered", isAuthenticated, async (req: any, res) => {
    try {
      const { emails, phones } = req.query;
      
      if (!emails && !phones) {
        return res.json([]);
      }
      
      const emailList = emails ? emails.split(',').filter(Boolean) : [];
      const phoneList = phones ? phones.split(',').filter(Boolean) : [];
      
      const registeredUsers = await storage.getUsersByEmailOrPhone(emailList, phoneList);
      res.json(registeredUsers);
    } catch (error) {
      console.error("Error fetching registered contacts:", error);
      res.status(500).json({ message: "Failed to fetch registered contacts" });
    }
  });

  // Send contact invitation (counts towards link sharing for custom handle)
  app.post("/api/invitations/contact", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { name, email, phone, shareCode } = req.body;
      
      console.log("Processing contact invitation:", { name, email, phone, shareCode, userId });

      if (!name || (!email && !phone)) {
        console.error("Missing required fields - name:", name, "email:", email, "phone:", phone);
        return res.status(400).json({ message: "Name and either email or phone are required" });
      }
      
      if (!shareCode) {
        console.error("Missing share code");
        return res.status(400).json({ message: "Share code is required" });
      }

      // Generate the invite link - always use production URL for invitations
      const baseUrl = 'https://cc097ec5-adc9-4cf9-b6df-c4d57a132b5d-00-25ezwedp5eajv.spock.replit.dev';
      const inviteLink = `${baseUrl}/invite/${shareCode}`;
      
      // For SMS invitations, we'll simulate sending an SMS with the link
      // In a real implementation, you'd use a service like Twilio
      console.log(`SMS invitation would be sent to ${phone || email}:`);
      console.log(`Hey ${name}! Join me on Chirp, a fun social app: ${inviteLink}`);
      
      res.json({ 
        message: "Contact invitation sent successfully",
        name,
        email,
        phone,
        shareCode,
        inviteLink
      });
    } catch (error) {
      console.error("Error sending contact invitation:", error);
      res.status(500).json({ message: "Failed to send contact invitation", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get user's link share count
  app.get("/api/link-shares/count", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      
      res.json({ 
        linkShares: user?.linkShares || 0,
        canClaimHandle: (user?.linkShares || 0) >= 3 || user?.vipCodeUsed
      });
    } catch (error) {
      console.error("Error fetching link share count:", error);
      res.status(500).json({ message: "Failed to fetch link share count" });
    }
  });

  // Generate weekly summary
  app.post('/api/weekly-summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Calculate week dates (Sunday to Saturday)
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - currentDay);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Check if summary already exists for this week
      const existingSummary = await storage.getWeeklySummary(userId, weekStart);
      if (existingSummary) {
        return res.json(existingSummary);
      }
      
      // Get weekly stats
      const weeklyStats = await storage.getWeeklyChirpStats(userId, weekStart, weekEnd);
      
      // Create smart fallback summary (no AI needed for basic stats)
      let summaryText = "";
      let tone = "positive";
      let weeklyVibes = "good vibes";
      
      if (weeklyStats.chirpCount === 0) {
        summaryText = "◆ This week you've been exploring and discovering. Sometimes the best insights come from listening! ★";
        tone = "observant";
        weeklyVibes = "contemplative";
      } else if (weeklyStats.chirpCount === 1) {
        summaryText = "◆ Quality over quantity this week! Your single chirp made its mark in the community. ★";
        tone = "thoughtful";
        weeklyVibes = "focused energy";
      } else if (weeklyStats.chirpCount <= 3) {
        summaryText = `◆ Steady vibes this week with ${weeklyStats.chirpCount} chirps! You're sharing thoughtful content. ★`;
        tone = "contemplative";
        weeklyVibes = "steady vibes";
      } else {
        summaryText = `◆ Super active week with ${weeklyStats.chirpCount} chirps! Your energy is contagious in the community. ★`;
        tone = "energetic";
        weeklyVibes = "super active";
      }
      
      // Create weekly summary record with proper formatting
      const summaryData = {
        userId,
        weekStartDate: weekStart.toISOString().split('T')[0],
        weekEndDate: weekEnd.toISOString().split('T')[0],
        chirpCount: weeklyStats.chirpCount,
        tone,
        topChirp: weeklyStats.topChirp || "",
        topReactions: weeklyStats.topReactions && Array.isArray(weeklyStats.topReactions) ? weeklyStats.topReactions : [],
        commonWords: weeklyStats.commonWords && Array.isArray(weeklyStats.commonWords) ? weeklyStats.commonWords : [],
        weeklyVibes,
        summaryText,
      };
      
      const weeklySummary = await storage.createWeeklySummary(summaryData);
      res.json(weeklySummary);
    } catch (error) {
      console.error("Error generating weekly summary:", error);
      res.status(500).json({ message: "Failed to generate weekly summary" });
    }
  });

  // Get user's latest weekly summary
  app.get('/api/weekly-summary/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      // Only allow users to access their own summaries
      if (userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const summary = await storage.getLatestWeeklySummary(userId);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching weekly summary:", error);
      res.status(500).json({ message: "Failed to fetch weekly summary" });
    }
  });

  // Post weekly summary as chirp
  app.post('/api/weekly-summary/:summaryId/post', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { summaryId } = req.params;
      
      const result = await storage.postWeeklySummaryAsChirp(userId, parseInt(summaryId));
      res.json(result);
    } catch (error) {
      console.error("Error posting weekly summary:", error);
      res.status(500).json({ message: "Failed to post weekly summary" });
    }
  });

  app.post('/api/weekly-summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Calculate week dates (Sunday to Saturday)
      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - currentDay);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Check if summary already exists for this week
      const existingSummary = await storage.getWeeklySummary(userId, weekStart);
      if (existingSummary) {
        return res.json(existingSummary);
      }
      
      // Get weekly stats
      const weeklyStats = await storage.getWeeklyChirpStats(userId, weekStart, weekEnd);
      
      // Generate AI summary
      const aiSummary = await generateWeeklySummary(
        userId,
        weeklyStats.chirpCount,
        weeklyStats.topChirp || "No chirps this week",
        weeklyStats.topReactions,
        weeklyStats.commonWords,
        "positive"
      );
      
      // Create weekly summary record
      const summaryData = {
        userId,
        weekStartDate: weekStart.toISOString().split('T')[0],
        weekEndDate: weekEnd.toISOString().split('T')[0],
        chirpCount: weeklyStats.chirpCount,
        tone: aiSummary.analysis.tone,
        topChirp: weeklyStats.topChirp,
        topReactions: weeklyStats.topReactions,
        commonWords: weeklyStats.commonWords,
        weeklyVibes: aiSummary.analysis.weeklyVibes,
        summaryText: aiSummary.summary,
      };
      
      const weeklySummary = await storage.createWeeklySummary(summaryData);
      res.json(weeklySummary);
    } catch (error) {
      console.error("Error generating weekly summary:", error);
      res.status(500).json({ message: "Failed to generate weekly summary" });
    }
  });

  // Chirp+ routes
  app.patch('/api/users/chirpplus/badge', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { showBadge } = req.body;

      if (typeof showBadge !== 'boolean') {
        return res.status(400).json({ message: "showBadge must be a boolean" });
      }

      const user = await storage.updateChirpPlusBadgeVisibility(userId, showBadge);
      res.json(user);
    } catch (error) {
      console.error("Error updating badge visibility:", error);
      res.status(500).json({ message: "Failed to update badge visibility" });
    }
  });

  // Handle changing for Chirp+ users
  app.patch('/api/users/handle', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { newHandle } = req.body;

      // Check if user has Chirp+
      const user = await storage.getUser(userId);
      if (!user?.isChirpPlus) {
        return res.status(403).json({ message: "Chirp+ subscription required to change handles" });
      }

      // Validate handle format
      if (!newHandle || typeof newHandle !== 'string') {
        return res.status(400).json({ message: "Handle is required" });
      }

      if (!/^[a-zA-Z0-9_]{3,20}$/.test(newHandle)) {
        return res.status(400).json({ message: "Handle must be 3-20 characters, letters, numbers, and underscores only" });
      }

      // Check if handle is available
      const existingUser = await storage.getUserByHandle(newHandle);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Handle is already taken" });
      }

      const updatedUser = await storage.updateUserHandle(userId, newHandle);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating handle:", error);
      res.status(500).json({ message: "Failed to update handle" });
    }
  });

  // Support request endpoint
  app.post('/api/support', async (req, res) => {
    try {
      const { subject, message, email, category } = req.body;
      
      // Validate required fields
      if (!subject || !message) {
        return res.status(400).json({ message: "Subject and message are required" });
      }
      
      // Create feedback entry
      const feedbackData = {
        email: email || 'anonymous@chirp.app',
        category: category || 'general',
        subject,
        message,
        isRead: false
      };
      
      const feedback = await storage.createFeedback(feedbackData);
      
      // Send email notification to support team
      try {
        const { sendSupportNotificationEmail } = await import('./emailService');
        await sendSupportNotificationEmail(feedbackData);
        console.log('Support notification email sent successfully');
      } catch (emailError) {
        console.error('Failed to send support notification email:', emailError);
        // Don't fail the request if email fails
      }
      
      res.json({ 
        message: "Support request submitted successfully",
        id: feedback.id 
      });
    } catch (error) {
      console.error("Error creating support request:", error);
      res.status(500).json({ message: "Failed to submit support request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
