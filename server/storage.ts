import {
    type Chirp,
    chirps,
    feedback,
    type Feedback,
    type Follow,
    follows,
    type InsertChirp,
    type InsertFeedback,
    type InsertFollow,
    type InsertNotification,
    type InsertReaction,
    type InsertWeeklySummary,
    type LinkShare,
    linkShares,
    type Notification,
    notifications,
    pushTokens,
    type Reaction,
    reactions,
    type UpsertUser,
    type User,
    type UserBlock,
    userBlocks,
    type UserNotificationSetting,
    userNotificationSettings,
    users,
    vipCodes,
    weeklySummaries,
    type WeeklySummary
} from "@shared/schema";
import { and, count, desc, eq, gt, gte, inArray, isNotNull, isNull, lte, not, or, sql } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // User operations (required for authentication)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: {
    profileImageUrl?: string;
    avatarUrl?: string;
    bannerImageUrl?: string;
    bio?: string;
    interests?: string[];
    firstName?: string;
    lastName?: string;
  }): Promise<User>;
  updateUserChirpPlus(id: string, isChirpPlus: boolean, expiresAt?: Date): Promise<User>;
  updateChirpPlusBadgeVisibility(id: string, showBadge: boolean): Promise<User>;
  updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User>;
  updateWeeklyAnalyticsPreference(email: string, enabled: boolean): Promise<boolean>;
  updateUserHandle(id: string, newHandle: string): Promise<User>;
  getUserByHandle(handle: string): Promise<User | undefined>;
  getUserByStripeCustomerId(customerId: string): Promise<User | undefined>;
  
  // Chirp operations
  createChirp(chirp: InsertChirp): Promise<Chirp>;
  createThread(userId: string, threadParts: Array<{ content: string }>): Promise<Chirp[]>;
  createRepost(userId: string, chirpId: number): Promise<Chirp>;
  getChirps(userId?: string, limit?: number): Promise<Array<Chirp & { author: User; reactionCount: number; userHasLiked?: boolean; repostOf?: Chirp & { author: User } }>>;
  getChirpsByUser(userId: string): Promise<Array<Chirp & { author: User; reactionCount: number; repostOf?: Chirp & { author: User } }>>;
  getChirpById(chirpId: number): Promise<(Chirp & { author: User; reactionCount: number }) | undefined>;
  getChirpReplies(chirpId: number): Promise<Array<Chirp & { author: User; reactionCount: number; replies?: Array<Chirp & { author: User; reactionCount: number }> }>>;
  getTotalChirpCount(userId: string): Promise<number>;
  
  // Follow operations
  followUser(follow: InsertFollow): Promise<Follow>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;
  getFollowers(userId: string): Promise<Array<User>>;
  getFollowing(userId: string): Promise<Array<User>>;
  getFollowCounts(userId: string): Promise<{ followers: number; following: number }>;
  getUserStats(userId: string): Promise<{ chirps: number; followers: number; following: number; reactions: number }>;

  // Push token operations
  addPushToken(userId: string, token: string, platform: string): Promise<void>;
  getUserPushTokens(userId: string): Promise<Array<{ token: string; platform: string }>>;
  removePushToken(token: string): Promise<void>;
  markPushNotificationSent(notificationId: number): Promise<void>;
  
  // Reaction operations
  addReaction(reaction: InsertReaction): Promise<Reaction>;
  removeReaction(userId: string, chirpId: number): Promise<void>;
  getUserReactionForChirp(userId: string, chirpId: number): Promise<string | null>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string): Promise<Array<Notification & { fromUser?: User; chirp?: Chirp }>>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  
  // Search operations
  searchUsers(query: string): Promise<Array<User>>;
  searchChirps(query: string): Promise<Array<Chirp & { author: User; reactionCount: number; userHasLiked?: boolean }>>;
  getUserReplies(userId: string): Promise<Array<Chirp & { author: User; reactionCount: number; parentChirp?: Chirp & { author: User } }>>;
  getUserReactedChirps(userId: string): Promise<Array<Chirp & { author: User; reactionCount: number; userHasLiked?: boolean }>>;
  
  // Handle operations
  generateRandomHandle(): Promise<string>;
  isHandleAvailable(handle: string): Promise<boolean>;
  claimCustomHandle(userId: string, customHandle: string): Promise<void>;
  
  // Link sharing operations
  createShareLink(userId: string): Promise<{ shareCode: string; shareUrl: string }>;
  processLinkClick(shareCode: string, clickerIp: string, userAgent: string): Promise<boolean>;
  getUserLinkShares(userId: string): Promise<Array<LinkShare>>;
  
  // VIP code operations
  useVipCode(code: string, userId: string): Promise<{ grantsChirpPlus: boolean; chirpPlusDurationMonths: number; description: string } | null>;
  createVipCode(data: { 
    code: string; 
    codeType?: string; 
    grantsChirpPlus?: boolean; 
    chirpPlusDurationMonths?: number; 
    createdBy?: string; 
    description?: string 
  }): Promise<any>;

  // AI generation rate limiting
  checkAiGenerationLimit(userId: string): Promise<{ canGenerate: boolean; isChirpPlus: boolean }>;
  incrementAiGeneration(userId: string): Promise<void>;

  
  // Reaction count operations
  getUserReactionCounts(userId: string): Promise<{ totalReactions: number }>;

  // Weekly summary operations
  createWeeklySummary(summary: InsertWeeklySummary): Promise<WeeklySummary>;
  getWeeklySummary(userId: string, weekStart: Date): Promise<WeeklySummary | undefined>;
  getLatestWeeklySummary(userId: string): Promise<WeeklySummary | undefined>;
  getWeeklyChirpStats(userId: string, weekStart: Date, weekEnd: Date): Promise<{
    chirpCount: number;
    topChirp: string | null;
    totalLikes: number;
    commonWords: string[];
  }>;

  // Feedback operations
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Array<Feedback & { user?: User }>>;
  markFeedbackResolved(feedbackId: number, adminNotes?: string): Promise<void>;

  // Repost operations
  deleteRepost(userId: string, chirpId: number): Promise<void>;
  checkUserReposted(userId: string, chirpId: number): Promise<boolean>;
  deleteChirp(userId: string, chirpId: number): Promise<void>;

  // User notification settings
  getUserNotificationSetting(userId: string, followedUserId: string): Promise<UserNotificationSetting | undefined>;

  // Push token operations
  addPushToken(userId: string, token: string, platform: string): Promise<void>;
  getUserPushTokens(userId: string): Promise<Array<{ token: string; platform: string }>>;
  removePushToken(token: string): Promise<void>;
  markPushNotificationSent(notificationId: number): Promise<void>;
  setUserNotificationSetting(userId: string, followedUserId: string, notifyOnPost: boolean): Promise<UserNotificationSetting>;
  deleteUserNotificationSetting(userId: string, followedUserId: string): Promise<void>;

  // Trending hashtags
  getTrendingHashtags(limit?: number): Promise<Array<{ hashtag: string; count: number }>>;
  getHashtagChirps(hashtag: string, limit?: number): Promise<Array<Chirp & { author: User; reactionCount: number }>>;

  // User blocking
  blockUser(userId: string, targetUserId: string): Promise<UserBlock>;
  unblockUser(userId: string, targetUserId: string): Promise<void>;
  hasUserBlocked(userId: string, targetUserId: string): Promise<boolean>;
  isUserBlocked(userId: string, targetUserId: string): Promise<boolean>;
  getBlockedUserIds(userId: string): Promise<string[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user exists first
    const existingUser = await this.getUser(userData.id);
    
    if (existingUser) {
      // Update existing user - but preserve custom names and AI-generated images
      const updateData: any = {
        email: userData.email,
        updatedAt: new Date(),
      };
      
      // Only update profile image from OAuth if user doesn't have an AI-generated avatar
      if (!existingUser.avatarUrl && userData.profileImageUrl) {
        updateData.profileImageUrl = userData.profileImageUrl;
      }
      
      // Only update names if user hasn't customized them
      // (i.e., if they're still using the default OAuth values or are empty)
      if (!existingUser.firstName || existingUser.firstName === userData.firstName) {
        updateData.firstName = userData.firstName;
      }
      if (!existingUser.lastName || existingUser.lastName === userData.lastName) {
        updateData.lastName = userData.lastName;
      }
      
      const [user] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userData.id))
        .returning();
      return user;
    } else {
      // Create new user with random handle and legal agreements
      const randomHandle = await this.generateRandomHandle();
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          handle: randomHandle,
          // Auto-accept legal agreements on signup since user must agree to access
          agreedToTerms: true,
          agreedToPrivacy: true,
          termsAgreedAt: new Date(),
          privacyAgreedAt: new Date(),
        })
        .returning();
      return user;
    }
  }

  async updateUserProfile(id: string, updates: {
    profileImageUrl?: string;
    avatarUrl?: string;
    bannerImageUrl?: string;
    bio?: string;
    linkInBio?: string;
    interests?: string[];
    firstName?: string;
    lastName?: string;
    lastAiGenerationDate?: Date;
    aiGenerationsToday?: number;
    agreedToTerms?: boolean;
    agreedToPrivacy?: boolean;
    termsAgreedAt?: Date;
    privacyAgreedAt?: Date;
  }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserChirpPlus(id: string, isChirpPlus: boolean, expiresAt?: Date): Promise<User> {
    const updateData: any = {
      isChirpPlus,
      chirpPlusExpiresAt: expiresAt,
      updatedAt: new Date(),
    };
    
    // When activating Chirp+, enable badge by default unless user has explicitly disabled it
    if (isChirpPlus) {
      const currentUser = await this.getUser(id);
      // Only set badge to true if this is first time subscribing (no previous subscription)
      if (currentUser && !currentUser.isChirpPlus) {
        updateData.showChirpPlusBadge = true;
      }
    } else {
      // When deactivating Chirp+, keep badge setting as-is (user preference preserved)
    }
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateChirpPlusBadgeVisibility(id: string, showBadge: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        showChirpPlusBadge: showBadge,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStripeInfo(id: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserHandle(id: string, newHandle: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        handle: newHandle,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserByHandle(handle: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(or(
        sql`LOWER(${users.handle}) = LOWER(${handle})`,
        sql`LOWER(${users.customHandle}) = LOWER(${handle})`
      ));
    return user;
  }

  async getUserByStripeCustomerId(customerId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.stripeCustomerId, customerId));
    return user;
  }

  // Chirp operations
  async createChirp(chirp: InsertChirp): Promise<Chirp> {
    const [newChirp] = await db.insert(chirps).values(chirp).returning();
    return newChirp;
  }

  async createThread(userId: string, threadParts: Array<{ content: string }>): Promise<Chirp[]> {
    const createdChirps: Chirp[] = [];
    
    // Create the first chirp as the thread starter
    const [threadStarter] = await db.insert(chirps).values({
      authorId: userId,
      content: threadParts[0].content,
      isThreadStarter: true,
      threadOrder: 0,
    }).returning();
    
    // Set the thread starter's threadId to reference itself
    await db.update(chirps).set({ threadId: threadStarter.id }).where(eq(chirps.id, threadStarter.id));
    createdChirps.push({ ...threadStarter, threadId: threadStarter.id });

    // Create the remaining parts as replies to the thread starter
    for (let i = 1; i < threadParts.length; i++) {
      const [chirp] = await db.insert(chirps).values({
        authorId: userId,
        content: threadParts[i].content,
        replyToId: threadStarter.id,
        threadId: threadStarter.id,
        threadOrder: i,
        isThreadStarter: false,
      }).returning();
      
      createdChirps.push(chirp);
    }

    return createdChirps;
  }

  async getTrendingChirps(userId?: string, limit = 50, blockedUserIds: string[] = []): Promise<Array<Chirp & { author: User; reactionCount: number; userHasLiked?: boolean; repostOf?: Chirp & { author: User }; parentChirp?: Chirp & { author: User } }>> {
    // Get chirps from the last 7 days sorted by reaction count (extended timeframe)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // First get chirps with their reaction counts
    let whereConditions = [
      gt(chirps.createdAt, sevenDaysAgo)
    ];
    
    // Exclude blocked users if any
    if (blockedUserIds.length > 0) {
      whereConditions.push(not(inArray(chirps.authorId, blockedUserIds)));
    }
    
    const trending = await db
      .select({
        chirpId: chirps.id,
        reactionCount: sql<number>`COUNT(${reactions.id})`.as('reaction_count')
      })
      .from(chirps)
      .leftJoin(reactions, eq(reactions.chirpId, chirps.id))
      .where(and(...whereConditions))
      .groupBy(chirps.id)
      .orderBy(desc(sql`COUNT(${reactions.id})`), desc(chirps.createdAt))
      .limit(limit);

    // If no trending chirps in 7 days, fall back to recent chirps with most reactions
    if (trending.length === 0) {
      const fallbackConditions: any[] = [];
      if (blockedUserIds.length > 0) {
        fallbackConditions.push(not(inArray(chirps.authorId, blockedUserIds)));
      }
      
      const fallback = await db
        .select({
          chirpId: chirps.id,
          reactionCount: sql<number>`COUNT(${reactions.id})`.as('reaction_count')
        })
        .from(chirps)
        .leftJoin(reactions, eq(reactions.chirpId, chirps.id))
        .where(fallbackConditions.length > 0 ? and(...fallbackConditions) : undefined)
        .groupBy(chirps.id)
        .orderBy(desc(sql`COUNT(${reactions.id})`), desc(chirps.createdAt))
        .limit(limit);
      
      if (fallback.length === 0) {
        return this.getChirps(userId, limit, blockedUserIds); // Final fallback
      }
      
      const fallbackIds = fallback.map(t => t.chirpId);
      
      const results = await db
        .select({
          chirp: chirps,
          author: users,
        })
        .from(chirps)
        .innerJoin(users, eq(chirps.authorId, users.id))
        .where(inArray(chirps.id, fallbackIds))
        .orderBy(desc(chirps.createdAt));
        
      return await this.addReactionDataToChirps(results, userId);
    }

    const trendingIds = trending.map(t => t.chirpId);

    // Get full chirp data
    const results = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(inArray(chirps.id, trendingIds))
      .orderBy(desc(chirps.createdAt));

    const chirpIds = results.map(r => r.chirp.id);
    
    // Get reaction counts for these chirps
    let reactionCounts: any[] = [];
    if (chirpIds.length > 0) {
      reactionCounts = await db
        .select({
          chirpId: reactions.chirpId,
          count: count(),
        })
        .from(reactions)
        .where(inArray(reactions.chirpId, chirpIds))
        .groupBy(reactions.chirpId);
    }

    // Get user's reactions if userId provided
    let userReactions: any[] = [];
    if (userId && chirpIds.length > 0) {
      userReactions = await db
        .select({
          chirpId: reactions.chirpId,
        })
        .from(reactions)
        .where(and(
          eq(reactions.userId, userId),
          inArray(reactions.chirpId, chirpIds)
        ));
    }

    // Get reposted chirps data
    const repostIds = results.map(r => r.chirp.repostOfId).filter(Boolean);
    let repostData: any[] = [];
    
    if (repostIds.length > 0) {
      repostData = await db
        .select({
          chirp: chirps,
          author: users,
        })
        .from(chirps)
        .innerJoin(users, eq(chirps.authorId, users.id))
        .where(inArray(chirps.id, repostIds));
    }

    // Sort by trending order
    const sortedResults = results.sort((a, b) => {
      const orderA = trending.findIndex(t => t.chirpId === a.chirp.id);
      const orderB = trending.findIndex(t => t.chirpId === b.chirp.id);
      return orderA - orderB;
    });

    return sortedResults.map(({ chirp, author }) => {
      const chirpReactions = reactionCounts.filter(r => r.chirpId === chirp.id);
      const totalReactions = chirpReactions.reduce((sum, r) => sum + r.count, 0);

      const userHasLiked = userReactions.some(r => r.chirpId === chirp.id);

      // Find repost data if this is a repost
      let repostOf: any = undefined;
      if (chirp.repostOfId) {
        const originalData = repostData.find(r => r.chirp.id === chirp.repostOfId);
        if (originalData) {
          repostOf = {
            ...originalData.chirp,
            author: originalData.author,
          };
        }
      }

      return {
        ...chirp,
        author,
        reactionCount: totalReactions,
        userHasLiked,
        repostOf,
      };
    });
  }

  async createRepost(userId: string, chirpId: number): Promise<Chirp> {
    const [repost] = await db.insert(chirps).values({
      authorId: userId,
      content: "", // Reposts have empty content
      repostOfId: chirpId,
    }).returning();

    // Create notification for the original chirp author
    const originalChirp = await this.getChirpById(chirpId);
    if (originalChirp && originalChirp.author.id !== userId) {
      await this.createNotification({
        userId: originalChirp.author.id,
        type: 'repost',
        fromUserId: userId,
        chirpId: originalChirp.id,
      });
    }

    return repost;
  }

  async deleteRepost(userId: string, chirpId: number): Promise<void> {
    await db.delete(chirps).where(
      and(
        eq(chirps.authorId, userId),
        eq(chirps.repostOfId, chirpId)
      )
    );
  }

  async deleteChirp(userId: string, chirpId: number): Promise<void> {
    // Delete the chirp and all its replies (cascade will handle reactions)
    await db.delete(chirps).where(
      and(
        eq(chirps.id, chirpId),
        eq(chirps.authorId, userId)
      )
    );
  }

  async checkUserReposted(userId: string, chirpId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(chirps)
      .where(
        and(
          eq(chirps.authorId, userId),
          eq(chirps.repostOfId, chirpId)
        )
      )
      .limit(1);
    return !!result;
  }

  // User notification settings
  async getUserNotificationSetting(userId: string, followedUserId: string): Promise<UserNotificationSetting | undefined> {
    const [setting] = await db
      .select()
      .from(userNotificationSettings)
      .where(
        and(
          eq(userNotificationSettings.userId, userId),
          eq(userNotificationSettings.followedUserId, followedUserId)
        )
      );
    return setting;
  }

  async setUserNotificationSetting(userId: string, followedUserId: string, notifyOnPost: boolean): Promise<UserNotificationSetting> {
    const [setting] = await db
      .insert(userNotificationSettings)
      .values({
        userId,
        followedUserId,
        notifyOnPost,
      })
      .onConflictDoUpdate({
        target: [userNotificationSettings.userId, userNotificationSettings.followedUserId],
        set: {
          notifyOnPost,
        },
      })
      .returning();
    return setting;
  }

  async deleteUserNotificationSetting(userId: string, followedUserId: string): Promise<void> {
    await db
      .delete(userNotificationSettings)
      .where(
        and(
          eq(userNotificationSettings.userId, userId),
          eq(userNotificationSettings.followedUserId, followedUserId)
        )
      );
  }

  async getTotalChirpCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(chirps)
      .where(eq(chirps.authorId, userId));
    return result.count;
  }

  async getUserReplies(userId: string): Promise<Array<Chirp & { author: User; reactionCount: number }>> {
    const results = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(and(
        eq(chirps.authorId, userId),
        isNotNull(chirps.replyToId)
      ))
      .orderBy(desc(chirps.createdAt));

    const chirpIds = results.map(r => r.chirp.id);
    let reactionCounts: any[] = [];
    
    if (chirpIds.length > 0) {
      reactionCounts = await db
        .select({
          chirpId: reactions.chirpId,
          count: count(),
        })
        .from(reactions)
        .where(inArray(reactions.chirpId, chirpIds))
        .groupBy(reactions.chirpId);
    }

    return results.map(({ chirp, author }) => {
      const chirpReactions = reactionCounts.filter(r => r.chirpId === chirp.id);
      const totalReactions = chirpReactions.reduce((sum, r) => sum + r.count, 0);

      return {
        ...chirp,
        author,
        reactionCount: totalReactions,
      };
    });
  }

  async getUserReactedChirps(userId: string): Promise<Array<Chirp & { author: User; reactionCount: number; userHasLiked?: boolean }>> {
    // Get chirp IDs that the user has reacted to
    const reactedChirpIds = await db
      .select({ chirpId: reactions.chirpId })
      .from(reactions)
      .where(eq(reactions.userId, userId));

    if (reactedChirpIds.length === 0) {
      return [];
    }

    const chirpIds = reactedChirpIds.map(r => r.chirpId);
    
    const results = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(inArray(chirps.id, chirpIds))
      .orderBy(desc(chirps.createdAt));

    // Get reaction counts
    let reactionCounts: any[] = [];
    if (chirpIds.length > 0) {
      reactionCounts = await db
        .select({
          chirpId: reactions.chirpId,
          count: count(),
        })
        .from(reactions)
        .where(inArray(reactions.chirpId, chirpIds))
        .groupBy(reactions.chirpId);
    }

    // Get user's specific reactions
    const userReactions = await db
      .select({
        chirpId: reactions.chirpId,
      })
      .from(reactions)
      .where(and(
        eq(reactions.userId, userId),
        inArray(reactions.chirpId, chirpIds)
      ));

    return results.map(({ chirp, author }) => {
      const chirpReactions = reactionCounts.filter(r => r.chirpId === chirp.id);
      const totalReactions = chirpReactions.reduce((sum, r) => sum + r.count, 0);

      const userHasLiked = userReactions.some(r => r.chirpId === chirp.id);

      return {
        ...chirp,
        author,
        reactionCount: totalReactions,
        userHasLiked,
      };
    });
  }

  async getChirps(userId?: string, limit = 50, blockedUserIds: string[] = []): Promise<Array<Chirp & { author: User; reactionCount: number; userHasLiked?: boolean; repostOf?: Chirp & { author: User }; parentChirp?: Chirp & { author: User } }>> {
    // For chronological feed, show ALL chirps including replies
    let whereConditions: any[] = [];
    
    // Exclude blocked users if any
    if (blockedUserIds.length > 0) {
      whereConditions.push(not(inArray(chirps.authorId, blockedUserIds)));
    }

    const results = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(chirps.createdAt))
      .limit(limit);

    return await this.addReactionDataToChirps(results, userId);
  }

  // Helper method to add reaction data to chirps
  async addReactionDataToChirps(results: any[], userId?: string): Promise<Array<Chirp & { author: User; reactionCount: number; userHasLiked?: boolean; repostOf?: Chirp & { author: User }; parentChirp?: Chirp & { author: User } }>> {
    if (results.length === 0) {
      return [];
    }

    const chirpIds = results.map(r => r.chirp.id);
    
    // Get reaction counts for these chirps
    let reactionCounts: any[] = [];
    if (chirpIds.length > 0) {
      reactionCounts = await db
        .select({
          chirpId: reactions.chirpId,
          count: count(),
        })
        .from(reactions)
        .where(inArray(reactions.chirpId, chirpIds))
        .groupBy(reactions.chirpId);
    }

    // Get user's reactions if userId provided
    let userReactions: any[] = [];
    if (userId && chirpIds.length > 0) {
      userReactions = await db
        .select({
          chirpId: reactions.chirpId,
        })
        .from(reactions)
        .where(and(
          eq(reactions.userId, userId),
          inArray(reactions.chirpId, chirpIds)
        ));
    }

    // Get reposted chirps data
    const repostIds = results.map(r => r.chirp.repostOfId).filter(Boolean);
    let repostData: any[] = [];
    
    if (repostIds.length > 0) {
      repostData = await db
        .select({
          chirp: chirps,
          author: users,
        })
        .from(chirps)
        .innerJoin(users, eq(chirps.authorId, users.id))
        .where(inArray(chirps.id, repostIds));
    }

    // Get parent chirps data for replies
    const parentChirpIds = results.map(r => r.chirp.replyToId).filter(Boolean);
    let parentChirpData: any[] = [];
    
    if (parentChirpIds.length > 0) {
      parentChirpData = await db
        .select({
          chirp: chirps,
          author: users,
        })
        .from(chirps)
        .innerJoin(users, eq(chirps.authorId, users.id))
        .where(inArray(chirps.id, parentChirpIds));
    }

    return results.map(({ chirp, author }) => {
      const chirpReactions = reactionCounts.filter(r => r.chirpId === chirp.id);
      const totalReactions = chirpReactions.reduce((sum, r) => sum + r.count, 0);

      const userHasLiked = userReactions.some(r => r.chirpId === chirp.id);

      // Find repost data if this is a repost
      let repostOf = undefined;
      if (chirp.repostOfId) {
        const repostedChirp = repostData.find(r => r.chirp.id === chirp.repostOfId);
        if (repostedChirp) {
          repostOf = { ...repostedChirp.chirp, author: repostedChirp.author };
        }
      }

      // Find parent chirp data if this is a reply
      let parentChirp = undefined;
      if (chirp.replyToId) {
        const parentChirpResult = parentChirpData.find(p => p.chirp.id === chirp.replyToId);
        if (parentChirpResult) {
          parentChirp = { ...parentChirpResult.chirp, author: parentChirpResult.author };
        }
      }

      return {
        ...chirp,
        author,
        reactionCount: totalReactions,
        userHasLiked,
        repostOf,
        parentChirp,
      };
    });
  }

  async getChirpReplies(chirpId: number): Promise<Array<Chirp & { author: User; reactionCount: number; replies?: Array<Chirp & { author: User; reactionCount: number }> }>> {
    // Get direct replies to this chirp
    const directReplies = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(eq(chirps.replyToId, chirpId))
      .orderBy(chirps.createdAt);

    return await this.addReactionDataToChirps(directReplies);
  }

  async getChirpById(chirpId: number): Promise<(Chirp & { author: User; reactionCount: number }) | undefined> {
    const [result] = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(eq(chirps.id, chirpId))
      .limit(1);

    if (!result) {
      return undefined;
    }

    // Get reaction counts for this chirp
    const reactionCounts = await db
      .select({
        count: count(),
      })
      .from(reactions)
      .where(eq(reactions.chirpId, chirpId))
      .groupBy();

    const totalReactions = reactionCounts[0]?.count || 0;

    return {
      ...result.chirp,
      author: result.author,
      reactionCount: totalReactions,
    };
  }

  async getChirpsByUser(userId: string): Promise<Array<Chirp & { author: User; reactionCount: number; repostOf?: Chirp & { author: User } }>> {
    const results = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(and(eq(chirps.authorId, userId), isNull(chirps.replyToId))) // Exclude replies
      .orderBy(desc(chirps.createdAt));

    const chirpIds = results.map(r => r.chirp.id);
    let reactionCounts: any[] = [];
    
    if (chirpIds.length > 0) {
      reactionCounts = await db
        .select({
          chirpId: reactions.chirpId,
          count: count(),
        })
        .from(reactions)
        .where(
          or(...chirpIds.map(id => eq(reactions.chirpId, id)))
        )
        .groupBy(reactions.chirpId);
    }

    // Get reposted chirps data
    const repostIds = results.map(r => r.chirp.repostOfId).filter(Boolean);
    let repostData: any[] = [];
    
    if (repostIds.length > 0) {
      repostData = await db
        .select({
          chirp: chirps,
          author: users,
        })
        .from(chirps)
        .innerJoin(users, eq(chirps.authorId, users.id))
        .where(inArray(chirps.id, repostIds));
    }

    return results.map(({ chirp, author }) => {
      const chirpReactions = reactionCounts.filter(r => r.chirpId === chirp.id);
      const totalReactions = chirpReactions.reduce((sum, r) => sum + r.count, 0);

      // Find repost data if this is a repost
      let repostOf: any = undefined;
      if (chirp.repostOfId) {
        const originalData = repostData.find(r => r.chirp.id === chirp.repostOfId);
        if (originalData) {
          repostOf = {
            ...originalData.chirp,
            author: originalData.author,
          };
        }
      }

      return {
        ...chirp,
        author,
        reactionCount: totalReactions,
        repostOf,
      };
    });
  }

  // Follow operations
  async followUser(follow: InsertFollow): Promise<Follow> {
    const [newFollow] = await db.insert(follows).values(follow).returning();
    return newFollow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const [result] = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      )
      .limit(1);
    return !!result;
  }

  async getFollowers(userId: string): Promise<Array<User>> {
    const results = await db
      .select({ user: users })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));
    
    return results.map(r => r.user);
  }

  async getFollowing(userId: string): Promise<Array<User>> {
    const results = await db
      .select({ user: users })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));
    
    return results.map(r => r.user);
  }

  async getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
    const [followersCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, userId));

    const [followingCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followerId, userId));

    return {
      followers: followersCount.count,
      following: followingCount.count,
    };
  }

  async getUserStats(userId: string): Promise<{ chirps: number; followers: number; following: number; reactions: number }> {
    const [chirpsCount] = await db
      .select({ count: count() })
      .from(chirps)
      .where(eq(chirps.authorId, userId));

    const [followersCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followingId, userId));

    const [followingCount] = await db
      .select({ count: count() })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const [reactionsCount] = await db
      .select({ count: count() })
      .from(reactions)
      .where(eq(reactions.userId, userId));

    return {
      chirps: chirpsCount.count,
      followers: followersCount.count,
      following: followingCount.count,
      reactions: reactionsCount.count,
    };
  }

  // Reaction operations
  async addReaction(reaction: InsertReaction): Promise<Reaction> {
    // Remove existing reaction first
    await this.removeReaction(reaction.userId, reaction.chirpId);
    
    const [newReaction] = await db.insert(reactions).values(reaction).returning();
    
    // Create notification for the chirp author with push notification
    const [chirp] = await db.select().from(chirps).where(eq(chirps.id, reaction.chirpId));
    if (chirp && chirp.authorId !== reaction.userId) {
      try {
        const { notificationService } = await import('./notificationService');
        await notificationService.createAndSendNotification(
          chirp.authorId,
          'reaction',
          reaction.userId,
          reaction.chirpId
        );
      } catch (error) {
        console.error('Error creating reaction notification:', error);
        // Fallback to basic notification
        await this.createNotification({
          userId: chirp.authorId,
          type: 'reaction',
          fromUserId: reaction.userId,
          chirpId: reaction.chirpId,
        });
      }
    }
    
    return newReaction;
  }

  async removeReaction(userId: string, chirpId: number): Promise<void> {
    await db
      .delete(reactions)
      .where(
        and(
          eq(reactions.userId, userId),
          eq(reactions.chirpId, chirpId)
        )
      );
  }

  async getUserReactionForChirp(userId: string, chirpId: number): Promise<boolean> {
    const [result] = await db
      .select({ id: reactions.id })
      .from(reactions)
      .where(
        and(
          eq(reactions.userId, userId),
          eq(reactions.chirpId, chirpId)
        )
      )
      .limit(1);
    
    return !!result;
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    // Check if a similar notification already exists to prevent duplicates
    const existingNotification = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, notification.userId),
          eq(notifications.type, notification.type),
          eq(notifications.fromUserId, notification.fromUserId || ''),
          notification.chirpId ? eq(notifications.chirpId, notification.chirpId) : isNull(notifications.chirpId)
        )
      )
      .limit(1);

    if (existingNotification.length > 0) {
      console.log('Duplicate notification prevented:', notification);
      return existingNotification[0];
    }

    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotifications(userId: string): Promise<Array<Notification & { fromUser?: User; chirp?: Chirp }>> {
    const results = await db
      .select({
        notification: notifications,
        fromUser: users,
        chirp: chirps,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.fromUserId, users.id))
      .leftJoin(chirps, eq(notifications.chirpId, chirps.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    return results.map(({ notification, fromUser, chirp }) => ({
      ...notification,
      fromUser: fromUser || undefined,
      chirp: chirp || undefined,
    }));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );
    
    return result.count;
  }

  async markPushNotificationSent(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ pushSent: true })
      .where(eq(notifications.id, notificationId));
  }

  async getUserPushTokens(userId: string): Promise<Array<{ token: string; platform: string }>> {
    const results = await db
      .select({ token: pushTokens.token, platform: pushTokens.platform })
      .from(pushTokens)
      .where(eq(pushTokens.userId, userId));
    
    return results;
  }

  async addPushToken(userId: string, token: string, platform: string): Promise<void> {
    await db
      .insert(pushTokens)
      .values({ userId, token, platform })
      .onConflictDoUpdate({
        target: [pushTokens.userId, pushTokens.token],
        set: { lastUsed: new Date() }
      });
  }

  async removePushToken(userId: string, token: string): Promise<void> {
    await db
      .delete(pushTokens)
      .where(
        and(
          eq(pushTokens.userId, userId),
          eq(pushTokens.token, token)
        )
      );
  }

  // Get all users with email addresses for analytics
  async getAllUsers(): Promise<Array<User>> {
    return await db.select().from(users).where(isNotNull(users.email));
  }

  async getFollowHistory(userId: string, startDate: Date, endDate: Date): Promise<{ newFollowers: number; newFollowing: number }> {
    const [newFollowersResult] = await db
      .select({ count: count() })
      .from(follows)
      .where(
        and(
          eq(follows.followingId, userId),
          gte(follows.createdAt, startDate),
          lte(follows.createdAt, endDate)
        )
      );

    const [newFollowingResult] = await db
      .select({ count: count() })
      .from(follows)
      .where(
        and(
          eq(follows.followerId, userId),
          gte(follows.createdAt, startDate),
          lte(follows.createdAt, endDate)
        )
      );

    return {
      newFollowers: newFollowersResult.count,
      newFollowing: newFollowingResult.count
    };
  }

  // Search operations
  async searchUsers(query: string): Promise<Array<User>> {
    return await db
      .select()
      .from(users)
      .where(
        or(
          sql`${users.firstName} ILIKE ${`%${query}%`}`,
          sql`${users.lastName} ILIKE ${`%${query}%`}`,
          sql`${users.email} ILIKE ${`%${query}%`}`,
          sql`${users.handle} ILIKE ${`%${query}%`}`,
          sql`${users.customHandle} ILIKE ${`%${query}%`}`
        )
      )
      .limit(20);
  }

  async searchChirps(query: string): Promise<Array<Chirp & { author: User; reactionCount: number; userHasLiked?: boolean }>> {
    const results = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(sql`${chirps.content} ILIKE ${`%${query}%`}`)
      .orderBy(desc(chirps.createdAt))
      .limit(20);

    return await this.addReactionDataToChirps(results);
  }

  async getUserReplies(userId: string): Promise<Array<Chirp & { author: User; reactionCount: number; parentChirp?: Chirp & { author: User } }>> {
    const results = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(and(eq(chirps.authorId, userId), isNotNull(chirps.replyToId)))
      .orderBy(desc(chirps.createdAt));

    // Get reaction counts for all chirps
    const chirpIds = results.map(r => r.chirp.id);
    let reactionCounts: any[] = [];
    
    if (chirpIds.length > 0) {
      reactionCounts = await db
        .select({
          chirpId: reactions.chirpId,
          count: count(),
        })
        .from(reactions)
        .where(
          or(...chirpIds.map(id => eq(reactions.chirpId, id)))
        )
        .groupBy(reactions.chirpId);
    }

    // Get parent chirps for context
    const repliesWithParents = await Promise.all(
      results.map(async ({ chirp, author }) => {
        const chirpReactions = reactionCounts.filter(r => r.chirpId === chirp.id);
        const totalReactions = chirpReactions.reduce((sum, r) => sum + r.count, 0);

        let parentChirp = undefined;
        if (chirp.replyToId) {
          const [parentResult] = await db
            .select({
              chirp: chirps,
              author: users,
            })
            .from(chirps)
            .innerJoin(users, eq(chirps.authorId, users.id))
            .where(eq(chirps.id, chirp.replyToId))
            .limit(1);
          
          if (parentResult) {
            parentChirp = {
              ...parentResult.chirp,
              author: parentResult.author,
            };
          }
        }

        return {
          ...chirp,
          author,
          reactionCount: totalReactions,
          parentChirp,
        };
      })
    );

    return repliesWithParents;
  }

  async getUserReactedChirps(userId: string): Promise<Array<Chirp & { author: User; reactionCount: number; userHasLiked?: boolean }>> {
    const results = await db
      .select({
        chirp: chirps,
        author: users,
        reaction: reactions,
      })
      .from(reactions)
      .innerJoin(chirps, eq(reactions.chirpId, chirps.id))
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(eq(reactions.userId, userId))
      .orderBy(desc(reactions.createdAt));

    const chirpsWithReactions = await Promise.all(
      results.map(async ({ chirp, author, reaction }) => {
        const reactionCount = await this.getReactionCounts(chirp.id);
        return {
          ...chirp,
          author,
          reactionCount,
          userHasLiked: true,
        };
      })
    );

    return chirpsWithReactions;
  }

  // Handle operations
  async generateRandomHandle(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      // Generate random handle: 2-3 letters + 4-6 numbers
      const letters = Math.random().toString(36).substring(2, 5).toLowerCase();
      const numbers = Math.floor(Math.random() * 900000) + 100000; // 6-digit number
      const handle = letters + numbers;
      
      if (await this.isHandleAvailable(handle)) {
        return handle;
      }
      attempts++;
    }
    
    // Fallback to timestamp-based handle if all attempts fail
    return 'usr' + Date.now().toString().slice(-8);
  }

  async isHandleAvailable(handle: string): Promise<boolean> {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(or(
        sql`LOWER(${users.handle}) = LOWER(${handle})`,
        sql`LOWER(${users.customHandle}) = LOWER(${handle})`
      ))
      .limit(1);
    
    return !existingUser;
  }

  async claimCustomHandle(userId: string, customHandle: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error('User not found');
    
    // Check if user is eligible (3 invites or VIP code used)
    if (user.invitesSent < 3 && !user.vipCodeUsed) {
      throw new Error('Not eligible to claim custom handle. Need 3 invites or VIP code.');
    }
    
    // Double-check if handle is available (race condition protection)
    if (!(await this.isHandleAvailable(customHandle))) {
      throw new Error('Handle is not available');
    }
    
    try {
      await db
        .update(users)
        .set({
          customHandle,
          hasCustomHandle: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      // Handle database constraint violations (duplicate handle)
      if (error.message && error.message.includes('unique')) {
        throw new Error('Handle is already taken');
      }
      throw error;
    }
  }

  // Link sharing operations
  async createShareLink(userId: string): Promise<{ shareCode: string; shareUrl: string }> {
    // Generate unique share code
    const shareCode = Math.random().toString(36).substr(2, 8) + Date.now().toString(36);
    
    const [newShare] = await db.insert(linkShares).values({
      userId,
      shareCode,
    }).returning();
    
    const shareUrl = `${process.env.NODE_ENV === 'production' ? 'https://chirp.app' : 'http://localhost:5000'}/invite/${shareCode}`;
    
    return { shareCode, shareUrl };
  }

  // Contact integration operations
  async getUsersByEmailOrPhone(emails: string[], phones: string[]): Promise<User[]> {
    if (emails.length === 0 && phones.length === 0) {
      return [];
    }

    let conditions = [];
    
    if (emails.length > 0) {
      conditions.push(inArray(users.email, emails));
    }
    
    // Note: phone field is not yet available in database until schema migration
    // if (phones.length > 0) {
    //   conditions.push(inArray(users.phone, phones));
    // }

    const registeredUsers = await db
      .select()
      .from(users)
      .where(or(...conditions));

    return registeredUsers;
  }

  async processLinkClick(shareCode: string, clickerIp: string, userAgent: string): Promise<boolean> {
    const [linkShare] = await db
      .select()
      .from(linkShares)
      .where(eq(linkShares.shareCode, shareCode))
      .limit(1);
    
    if (!linkShare) {
      throw new Error('Invalid share code');
    }
    
    if (linkShare.clickedAt) {
      return false; // Already clicked
    }
    
    // Check if click is from same IP (to prevent cheating)
    const existingClicks = await db
      .select()
      .from(linkShares)
      .where(and(
        eq(linkShares.userId, linkShare.userId),
        eq(linkShares.clickerIp, clickerIp)
      ));
    
    const isValidClick = existingClicks.length === 0;
    
    // Mark as clicked
    await db
      .update(linkShares)
      .set({
        clickedAt: new Date(),
        clickerIp,
        clickerUserAgent: userAgent,
        isValidClick,
      })
      .where(eq(linkShares.id, linkShare.id));
    
    // Update user's link share count if valid
    if (isValidClick) {
      await db
        .update(users)
        .set({
          linkShares: sql`${users.linkShares} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, linkShare.userId));
    }
    
    return isValidClick;
  }

  async getUserLinkShares(userId: string): Promise<Array<LinkShare>> {
    return await db
      .select()
      .from(linkShares)
      .where(eq(linkShares.userId, userId))
      .orderBy(desc(linkShares.createdAt));
  }

  // VIP code operations
  async useVipCode(code: string, userId: string): Promise<{ grantsChirpPlus: boolean; chirpPlusDurationMonths: number; description: string } | null> {
    const [vipCode] = await db
      .select()
      .from(vipCodes)
      .where(sql`LOWER(${vipCodes.code}) = LOWER(${code})`)
      .limit(1);
    
    if (!vipCode) {
      return null;
    }
    
    // Check if this user has already used this specific code by checking description or other method
    // For now, we'll allow re-use but could implement tracking later
    
    // Mark user as VIP code user (if not already)
    await db
      .update(users)
      .set({
        vipCodeUsed: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    return {
      grantsChirpPlus: vipCode.grantsChirpPlus || false,
      chirpPlusDurationMonths: vipCode.chirpPlusDurationMonths || 1,
      description: vipCode.description || 'VIP access granted'
    };
  }

  async createVipCode(data: { 
    code: string; 
    codeType?: string; 
    grantsChirpPlus?: boolean; 
    chirpPlusDurationMonths?: number; 
    createdBy?: string; 
    description?: string 
  }): Promise<any> {
    const [vipCode] = await db
      .insert(vipCodes)
      .values({
        code: data.code,
        codeType: data.codeType || 'regular',
        grantsChirpPlus: data.grantsChirpPlus || false,
        chirpPlusDurationMonths: data.chirpPlusDurationMonths || 1,
        createdBy: data.createdBy,
        description: data.description,
      })
      .returning();
    return vipCode;
  }

  async getUserReactionCounts(userId: string): Promise<{ totalReactions: number }> {
    // Get all chirps by this user
    const userChirps = await db
      .select({ id: chirps.id })
      .from(chirps)
      .where(eq(chirps.authorId, userId));

    if (userChirps.length === 0) {
      return { totalReactions: 0 };
    }

    const chirpIds = userChirps.map(c => c.id);
    
    // Count all reactions to this user's chirps
    const [result] = await db
      .select({ count: count() })
      .from(reactions)
      .where(
        or(...chirpIds.map(id => eq(reactions.chirpId, id)))
      );

    return { totalReactions: result.count };
  }

  // Helper method for getting reaction counts for a single chirp
  private async getReactionCounts(chirpId: number): Promise<number> {
    const [result] = await db
      .select({
        count: count(),
      })
      .from(reactions)
      .where(eq(reactions.chirpId, chirpId));

    return result?.count || 0;
  }

  // AI generation rate limiting
  async checkAiGenerationLimit(userId: string): Promise<{ canGenerate: boolean; isChirpPlus: boolean }> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    // Chirp+ users have unlimited generations
    if (user.isChirpPlus && user.chirpPlusExpiresAt && new Date() < user.chirpPlusExpiresAt) {
      return { canGenerate: true, isChirpPlus: true };
    }

    // Check if it's a new day
    const today = new Date();
    const lastGenDate = user.lastAiGenerationDate;
    
    if (!lastGenDate || lastGenDate.toDateString() !== today.toDateString()) {
      // Reset count for new day
      await this.updateUserProfile(userId, {
        lastAiGenerationDate: today,
        aiGenerationsToday: 0
      });
      return { canGenerate: true, isChirpPlus: false };
    }

    // Check daily limit for free users
    const generationsToday = user.aiGenerationsToday || 0;
    return { canGenerate: generationsToday < 1, isChirpPlus: false };
  }

  async incrementAiGeneration(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    const today = new Date();
    const lastGenDate = user.lastAiGenerationDate;
    
    let newCount = 1;
    if (lastGenDate && lastGenDate.toDateString() === today.toDateString()) {
      newCount = (user.aiGenerationsToday || 0) + 1;
    }

    await this.updateUserProfile(userId, {
      lastAiGenerationDate: today,
      aiGenerationsToday: newCount
    });
  }

  // Weekly summary operations
  async createWeeklySummary(summary: InsertWeeklySummary): Promise<WeeklySummary> {
    // Ensure arrays are properly formatted for PostgreSQL JSONB
    const formattedSummary = {
      ...summary,
      topReactions: summary.topReactions || [],
      commonWords: summary.commonWords || [],
    };
    
    const [result] = await db.insert(weeklySummaries).values(formattedSummary).returning();
    return result;
  }

  async getWeeklySummary(userId: string, weekStart: Date): Promise<WeeklySummary | undefined> {
    const [result] = await db
      .select()
      .from(weeklySummaries)
      .where(
        and(
          eq(weeklySummaries.userId, userId),
          eq(weeklySummaries.weekStartDate, weekStart.toISOString().split('T')[0])
        )
      );
    return result;
  }

  async getLatestWeeklySummary(userId: string): Promise<WeeklySummary | undefined> {
    const [result] = await db
      .select()
      .from(weeklySummaries)
      .where(eq(weeklySummaries.userId, userId))
      .orderBy(desc(weeklySummaries.weekStartDate))
      .limit(1);
    return result;
  }

  async postWeeklySummaryAsChirp(userId: string, summaryId: number): Promise<{ chirp: Chirp; summary: WeeklySummary }> {
    // Get the weekly summary
    const [summary] = await db
      .select()
      .from(weeklySummaries)
      .where(
        and(
          eq(weeklySummaries.id, summaryId),
          eq(weeklySummaries.userId, userId)
        )
      );

    if (!summary) {
      throw new Error("Weekly summary not found");
    }

    if (summary.chirpId) {
      throw new Error("Weekly summary already posted");
    }

    // Create the chirp
    const [chirp] = await db
      .insert(chirps)
      .values({
        authorId: userId,
        content: `📊 Weekly Summary (${summary.weekStartDate} - ${summary.weekEndDate})\n\n${summary.summaryText}`,
        isAiGenerated: true,
        isWeeklySummary: true,
      })
      .returning();

    // Update summary with chirp ID
    const [updatedSummary] = await db
      .update(weeklySummaries)
      .set({ chirpId: chirp.id })
      .where(eq(weeklySummaries.id, summaryId))
      .returning();

    return { chirp, summary: updatedSummary };
  }

  async getWeeklyChirpStats(userId: string, weekStart: Date, weekEnd: Date): Promise<{
    chirpCount: number;
    topChirp: string | null;
    totalLikes: number;
    commonWords: string[];
  }> {
    // Get chirps from the week
    const weekChirps = await db
      .select()
      .from(chirps)
      .where(
        and(
          eq(chirps.authorId, userId),
          sql`${chirps.createdAt} >= ${weekStart}`,
          sql`${chirps.createdAt} < ${weekEnd}`
        )
      );

    if (weekChirps.length === 0) {
      return {
        chirpCount: 0,
        topChirp: null,
        topReactions: [],
        commonWords: []
      };
    }

    // Get total likes for these chirps
    const chirpIds = weekChirps.map(c => c.id);
    const weekReactions = await db
      .select({
        chirpId: reactions.chirpId,
        count: count()
      })
      .from(reactions)
      .where(or(...chirpIds.map(id => eq(reactions.chirpId, id))))
      .groupBy(reactions.chirpId);

    // Find top chirp by like count
    const chirpReactionCounts = new Map<number, number>();
    weekReactions.forEach(r => {
      chirpReactionCounts.set(r.chirpId, r.count);
    });

    const topChirpId = Array.from(chirpReactionCounts.entries())
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    const topChirp = topChirpId 
      ? weekChirps.find(c => c.id === topChirpId)?.content || null
      : weekChirps[0]?.content || null;

    // Get total likes across all chirps
    const totalLikes = weekReactions.reduce((sum, r) => sum + r.count, 0);

    // Extract common words
    const allText = weekChirps.map(c => c.content).join(' ');
    const words = allText.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    });

    const commonWords = Array.from(wordCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return {
      chirpCount: weekChirps.length,
      topChirp,
      totalLikes,
      commonWords
    };
  }

  // Feedback operations
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
    return newFeedback;
  }

  async getAllFeedback(): Promise<Array<Feedback & { user?: User }>> {
    const result = await db
      .select({
        feedback,
        user: users,
      })
      .from(feedback)
      .leftJoin(users, eq(feedback.userId, users.id))
      .orderBy(desc(feedback.createdAt));

    return result.map(row => ({
      ...row.feedback,
      user: row.user || undefined,
    }));
  }

  async markFeedbackResolved(feedbackId: number, adminNotes?: string): Promise<void> {
    await db
      .update(feedback)
      .set({
        resolved: true,
        adminNotes,
      })
      .where(eq(feedback.id, feedbackId));
  }

  // Notification settings for user posts
  async getNotificationSetting(userId: string, followedUserId: string): Promise<{ notifyOnPost: boolean } | null> {
    try {
      const result = await db
        .select({ notifyOnPost: userNotificationSettings.notifyOnPost })
        .from(userNotificationSettings)
        .where(
          and(
            eq(userNotificationSettings.userId, userId),
            eq(userNotificationSettings.followedUserId, followedUserId)
          )
        )
        .limit(1);
      
      return result.length > 0 ? { notifyOnPost: result[0].notifyOnPost } : null;
    } catch (error) {
      console.error("Error getting notification setting:", error);
      return null;
    }
  }

  async updateNotificationSetting(userId: string, followedUserId: string, notifyOnPost: boolean): Promise<{ notifyOnPost: boolean }> {
    try {
      await db
        .insert(userNotificationSettings)
        .values({
          userId,
          followedUserId,
          notifyOnPost,
        })
        .onConflictDoUpdate({
          target: [userNotificationSettings.userId, userNotificationSettings.followedUserId],
          set: { notifyOnPost },
        });
      
      return { notifyOnPost };
    } catch (error) {
      console.error("Error updating notification setting:", error);
      throw error;
    }
  }

  // User blocking functionality
  async blockUser(blockerId: string, blockedId: string): Promise<UserBlock> {
    // Remove any existing follow relationships
    await db.delete(follows).where(
      or(
        and(eq(follows.followerId, blockerId), eq(follows.followingId, blockedId)),
        and(eq(follows.followerId, blockedId), eq(follows.followingId, blockerId))
      )
    );

    const [block] = await db
      .insert(userBlocks)
      .values({ blockerId, blockedId })
      .returning();
    
    return block;
  }

  async unblockUser(blockerId: string, blockedId: string): Promise<void> {
    await db
      .delete(userBlocks)
      .where(
        and(
          eq(userBlocks.blockerId, blockerId),
          eq(userBlocks.blockedId, blockedId)
        )
      );
  }

  // Check if userId has blocked targetUserId (one-way check)
  async hasUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const [block] = await db
      .select()
      .from(userBlocks)
      .where(
        and(
          eq(userBlocks.blockerId, userId),
          eq(userBlocks.blockedId, targetUserId)
        )
      )
      .limit(1);
    
    return !!block;
  }

  // Check if either user has blocked the other (for content filtering)
  async isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
    const [block] = await db
      .select()
      .from(userBlocks)
      .where(
        or(
          and(eq(userBlocks.blockerId, userId), eq(userBlocks.blockedId, targetUserId)),
          and(eq(userBlocks.blockerId, targetUserId), eq(userBlocks.blockedId, userId))
        )
      )
      .limit(1);
    
    return !!block;
  }

  async getBlockedUserIds(userId: string): Promise<string[]> {
    const blocks = await db
      .select()
      .from(userBlocks)
      .where(
        or(
          eq(userBlocks.blockerId, userId),
          eq(userBlocks.blockedId, userId)
        )
      );
    
    return blocks.map(block => 
      block.blockerId === userId ? block.blockedId : block.blockerId
    );
  }

  // Trending hashtags operations
  async getTrendingHashtags(limit = 10): Promise<Array<{ hashtag: string; count: number }>> {
    // Get chirps from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentChirps = await db
      .select({
        content: chirps.content,
      })
      .from(chirps)
      .where(gt(chirps.createdAt, sevenDaysAgo));

    // Extract hashtags from chirp content
    const hashtagCounts: Record<string, number> = {};
    const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi;

    recentChirps.forEach(chirp => {
      const hashtags = chirp.content.match(hashtagRegex);
      if (hashtags) {
        hashtags.forEach(hashtag => {
          const normalizedHashtag = hashtag.toLowerCase();
          hashtagCounts[normalizedHashtag] = (hashtagCounts[normalizedHashtag] || 0) + 1;
        });
      }
    });

    // Convert to array and sort by count
    const trendingHashtags = Object.entries(hashtagCounts)
      .map(([hashtag, count]) => ({ hashtag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return trendingHashtags;
  }

  async getHashtagChirps(hashtag: string, limit = 50): Promise<Array<Chirp & { author: User; reactionCount: number }>> {
    // Normalize the hashtag (add # if not present and make lowercase for search)
    const normalizedHashtag = hashtag.startsWith('#') ? hashtag.toLowerCase() : `#${hashtag.toLowerCase()}`;
    
    const results = await db
      .select({
        chirp: chirps,
        author: users,
      })
      .from(chirps)
      .innerJoin(users, eq(chirps.authorId, users.id))
      .where(sql`LOWER(${chirps.content}) LIKE ${`%${normalizedHashtag}%`}`)
      .orderBy(desc(chirps.createdAt))
      .limit(limit);

    const chirpIds = results.map(r => r.chirp.id);
    
    // Get reaction counts
    let reactionCounts: any[] = [];
    if (chirpIds.length > 0) {
      reactionCounts = await db
        .select({
          chirpId: reactions.chirpId,
          count: count(),
        })
        .from(reactions)
        .where(inArray(reactions.chirpId, chirpIds))
        .groupBy(reactions.chirpId);
    }

    return results.map(({ chirp, author }) => {
      const chirpReactions = reactionCounts.filter(r => r.chirpId === chirp.id);
      const totalReactions = chirpReactions.reduce((sum, r) => sum + r.count, 0);

      return {
        ...chirp,
        author,
        reactionCount: totalReactions,
      };
    });
  }

  async updateWeeklyAnalyticsPreference(email: string, enabled: boolean): Promise<boolean> {
    try {
      const result = await db
        .update(users)
        .set({ weeklyAnalyticsEnabled: enabled })
        .where(eq(users.email, email))
        .returning({ id: users.id });
      
      return result.length > 0;
    } catch (error) {
      console.error("Error updating weekly analytics preference:", error);
      return false;
    }
  }

  // Push token operations
  async addPushToken(userId: string, token: string, platform: string): Promise<void> {
    try {
      // Remove existing token if it exists
      await db.delete(pushTokens).where(eq(pushTokens.token, token));
      
      // Add new token
      await db.insert(pushTokens).values({
        userId,
        token,
        platform,
        lastUsed: new Date(),
      });
    } catch (error) {
      console.error("Error adding push token:", error);
      throw error;
    }
  }

  async getUserPushTokens(userId: string): Promise<Array<{ token: string; platform: string }>> {
    try {
      const tokens = await db
        .select({
          token: pushTokens.token,
          platform: pushTokens.platform,
        })
        .from(pushTokens)
        .where(eq(pushTokens.userId, userId));

      return tokens;
    } catch (error) {
      console.error("Error getting user push tokens:", error);
      return [];
    }
  }

  async removePushToken(token: string): Promise<void> {
    try {
      await db.delete(pushTokens).where(eq(pushTokens.token, token));
    } catch (error) {
      console.error("Error removing push token:", error);
    }
  }

  async markPushNotificationSent(notificationId: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ pushSent: true })
        .where(eq(notifications.id, notificationId));
    } catch (error) {
      console.error("Error marking push notification as sent:", error);
    }
  }
}

export const storage = new DatabaseStorage();
