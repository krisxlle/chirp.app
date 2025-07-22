var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chirps: () => chirps,
  chirpsRelations: () => chirpsRelations,
  follows: () => follows,
  followsRelations: () => followsRelations,
  insertChirpSchema: () => insertChirpSchema,
  insertFollowSchema: () => insertFollowSchema,
  insertInvitationSchema: () => insertInvitationSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertReactionSchema: () => insertReactionSchema,
  insertVipCodeSchema: () => insertVipCodeSchema,
  invitations: () => invitations,
  invitationsRelations: () => invitationsRelations,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  reactions: () => reactions,
  reactionsRelations: () => reactionsRelations,
  sessions: () => sessions,
  users: () => users,
  usersRelations: () => usersRelations,
  vipCodes: () => vipCodes,
  vipCodesRelations: () => vipCodesRelations,
  weeklySummaries: () => weeklySummaries,
  weeklySummariesRelations: () => weeklySummariesRelations
});
import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions, users, chirps, follows, reactions, notifications, vipCodes, invitations, weeklySummaries, usersRelations, chirpsRelations, followsRelations, reactionsRelations, notificationsRelations, vipCodesRelations, invitationsRelations, weeklySummariesRelations, insertChirpSchema, insertReactionSchema, insertFollowSchema, insertNotificationSchema, insertVipCodeSchema, insertInvitationSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().notNull(),
      email: varchar("email").unique(),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      profileImageUrl: varchar("profile_image_url"),
      avatarUrl: varchar("avatar_url"),
      // For AI-generated avatars
      bannerImageUrl: varchar("banner_image_url"),
      bio: text("bio"),
      linkInBio: varchar("link_in_bio"),
      interests: text("interests").array(),
      handle: varchar("handle").unique().notNull(),
      // Auto-generated random handle
      customHandle: varchar("custom_handle").unique(),
      // Custom handle after inviting 3 friends or VIP code
      hasCustomHandle: boolean("has_custom_handle").default(false),
      invitesSent: integer("invites_sent").default(0),
      vipCodeUsed: boolean("vip_code_used").default(false),
      // Chirp+ premium features
      isChirpPlus: boolean("is_chirp_plus").default(false),
      chirpPlusExpiresAt: timestamp("chirp_plus_expires_at"),
      showChirpPlusBadge: boolean("show_chirp_plus_badge").default(true),
      stripeCustomerId: varchar("stripe_customer_id"),
      stripeSubscriptionId: varchar("stripe_subscription_id"),
      // AI generation tracking
      lastAiGenerationDate: timestamp("last_ai_generation_date"),
      aiGenerationsToday: integer("ai_generations_today").default(0),
      // Legal agreement tracking
      agreedToTerms: boolean("agreed_to_terms").default(false),
      agreedToPrivacy: boolean("agreed_to_privacy").default(false),
      termsAgreedAt: timestamp("terms_agreed_at"),
      privacyAgreedAt: timestamp("privacy_agreed_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    chirps = pgTable("chirps", {
      id: serial("id").primaryKey(),
      authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      content: text("content").notNull(),
      isAiGenerated: boolean("is_ai_generated").default(false),
      replyToId: integer("reply_to_id").references(() => chirps.id, { onDelete: "cascade" }),
      repostOfId: integer("repost_of_id").references(() => chirps.id, { onDelete: "cascade" }),
      createdAt: timestamp("created_at").defaultNow()
    });
    follows = pgTable("follows", {
      id: serial("id").primaryKey(),
      followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      createdAt: timestamp("created_at").defaultNow()
    });
    reactions = pgTable("reactions", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      chirpId: integer("chirp_id").notNull().references(() => chirps.id, { onDelete: "cascade" }),
      emoji: varchar("emoji", { length: 10 }).notNull(),
      createdAt: timestamp("created_at").defaultNow()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      type: varchar("type").notNull(),
      // 'follow', 'reaction', 'mention', 'reply', 'mention_bio'
      fromUserId: varchar("from_user_id").references(() => users.id, { onDelete: "cascade" }),
      chirpId: integer("chirp_id").references(() => chirps.id, { onDelete: "cascade" }),
      read: boolean("read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    vipCodes = pgTable("vip_codes", {
      id: serial("id").primaryKey(),
      code: varchar("code").unique().notNull(),
      isUsed: boolean("is_used").default(false),
      usedByUserId: varchar("used_by_user_id").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("created_at").defaultNow(),
      usedAt: timestamp("used_at")
    });
    invitations = pgTable("invitations", {
      id: serial("id").primaryKey(),
      inviterUserId: varchar("inviter_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      inviteeEmail: varchar("invitee_email").notNull(),
      inviteCode: varchar("invite_code").unique().notNull(),
      isAccepted: boolean("is_accepted").default(false),
      acceptedByUserId: varchar("accepted_by_user_id").references(() => users.id, { onDelete: "set null" }),
      createdAt: timestamp("created_at").defaultNow(),
      acceptedAt: timestamp("accepted_at")
    });
    weeklySummaries = pgTable("weekly_summaries", {
      id: serial("id").primaryKey(),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      weekStartDate: varchar("week_start_date").notNull(),
      weekEndDate: varchar("week_end_date").notNull(),
      chirpCount: integer("chirp_count").notNull().default(0),
      tone: varchar("tone").notNull().default("positive"),
      topChirp: text("top_chirp"),
      topReactions: jsonb("top_reactions").notNull().default([]),
      commonWords: jsonb("common_words").notNull().default([]),
      weeklyVibes: varchar("weekly_vibes").notNull().default("positive energy"),
      summaryText: text("summary_text").notNull(),
      chirpId: integer("chirp_id").references(() => chirps.id, { onDelete: "set null" }),
      createdAt: timestamp("created_at").defaultNow()
    });
    usersRelations = relations(users, ({ many }) => ({
      chirps: many(chirps),
      following: many(follows, { relationName: "follower" }),
      followers: many(follows, { relationName: "following" }),
      reactions: many(reactions),
      notifications: many(notifications)
    }));
    chirpsRelations = relations(chirps, ({ one, many }) => ({
      author: one(users, {
        fields: [chirps.authorId],
        references: [users.id]
      }),
      reactions: many(reactions),
      replyTo: one(chirps, {
        fields: [chirps.replyToId],
        references: [chirps.id],
        relationName: "replyTo"
      }),
      repostOf: one(chirps, {
        fields: [chirps.repostOfId],
        references: [chirps.id],
        relationName: "repostOf"
      }),
      replies: many(chirps, { relationName: "replyTo" }),
      reposts: many(chirps, { relationName: "repostOf" })
    }));
    followsRelations = relations(follows, ({ one }) => ({
      follower: one(users, {
        fields: [follows.followerId],
        references: [users.id],
        relationName: "follower"
      }),
      following: one(users, {
        fields: [follows.followingId],
        references: [users.id],
        relationName: "following"
      })
    }));
    reactionsRelations = relations(reactions, ({ one }) => ({
      user: one(users, {
        fields: [reactions.userId],
        references: [users.id]
      }),
      chirp: one(chirps, {
        fields: [reactions.chirpId],
        references: [chirps.id]
      })
    }));
    notificationsRelations = relations(notifications, ({ one }) => ({
      user: one(users, {
        fields: [notifications.userId],
        references: [users.id]
      }),
      fromUser: one(users, {
        fields: [notifications.fromUserId],
        references: [users.id]
      }),
      chirp: one(chirps, {
        fields: [notifications.chirpId],
        references: [chirps.id]
      })
    }));
    vipCodesRelations = relations(vipCodes, ({ one }) => ({
      usedByUser: one(users, {
        fields: [vipCodes.usedByUserId],
        references: [users.id]
      })
    }));
    invitationsRelations = relations(invitations, ({ one }) => ({
      inviterUser: one(users, {
        fields: [invitations.inviterUserId],
        references: [users.id]
      }),
      acceptedByUser: one(users, {
        fields: [invitations.acceptedByUserId],
        references: [users.id]
      })
    }));
    weeklySummariesRelations = relations(weeklySummaries, ({ one }) => ({
      user: one(users, {
        fields: [weeklySummaries.userId],
        references: [users.id]
      }),
      chirp: one(chirps, {
        fields: [weeklySummaries.chirpId],
        references: [chirps.id]
      })
    }));
    insertChirpSchema = createInsertSchema(chirps).omit({
      id: true,
      createdAt: true
    });
    insertReactionSchema = createInsertSchema(reactions).omit({
      id: true,
      createdAt: true
    });
    insertFollowSchema = createInsertSchema(follows).omit({
      id: true,
      createdAt: true
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true
    });
    insertVipCodeSchema = createInsertSchema(vipCodes).omit({
      id: true,
      createdAt: true,
      usedAt: true
    });
    insertInvitationSchema = createInsertSchema(invitations).omit({
      id: true,
      createdAt: true,
      acceptedAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/storage.ts
import { eq, desc, and, or, sql, count, isNotNull, isNull, gte, lte } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      // User operations
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      }
      async upsertUser(userData) {
        const existingUser = await this.getUser(userData.id);
        if (existingUser) {
          const [user] = await db.update(users).set({
            ...userData,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(users.id, userData.id)).returning();
          return user;
        } else {
          const randomHandle = await this.generateRandomHandle();
          const [user] = await db.insert(users).values({
            ...userData,
            handle: randomHandle,
            // Auto-accept legal agreements on signup since user must agree to access
            agreedToTerms: true,
            agreedToPrivacy: true,
            termsAgreedAt: /* @__PURE__ */ new Date(),
            privacyAgreedAt: /* @__PURE__ */ new Date()
          }).returning();
          return user;
        }
      }
      async updateUserProfile(id, updates) {
        const [user] = await db.update(users).set({
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return user;
      }
      async updateUserChirpPlus(id, isChirpPlus2, expiresAt) {
        const [user] = await db.update(users).set({
          isChirpPlus: isChirpPlus2,
          chirpPlusExpiresAt: expiresAt,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return user;
      }
      async updateChirpPlusBadgeVisibility(id, showBadge) {
        const [user] = await db.update(users).set({
          showChirpPlusBadge: showBadge,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return user;
      }
      async updateUserStripeInfo(id, customerId, subscriptionId) {
        const [user] = await db.update(users).set({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return user;
      }
      async updateUserHandle(id, newHandle) {
        const [user] = await db.update(users).set({
          handle: newHandle,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, id)).returning();
        return user;
      }
      async getUserByHandle(handle) {
        const [user] = await db.select().from(users).where(or(eq(users.handle, handle), eq(users.customHandle, handle)));
        return user;
      }
      async getUserByStripeCustomerId(customerId) {
        const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, customerId));
        return user;
      }
      // Chirp operations
      async createChirp(chirp) {
        const [newChirp] = await db.insert(chirps).values(chirp).returning();
        return newChirp;
      }
      async createRepost(userId, chirpId) {
        const [repost] = await db.insert(chirps).values({
          authorId: userId,
          content: "",
          // Reposts have empty content
          repostOfId: chirpId
        }).returning();
        return repost;
      }
      async getTotalChirpCount(userId) {
        const [result] = await db.select({ count: count() }).from(chirps).where(eq(chirps.authorId, userId));
        return result.count;
      }
      async getUserReplies(userId) {
        const results = await db.select({
          chirp: chirps,
          author: users
        }).from(chirps).innerJoin(users, eq(chirps.authorId, users.id)).where(and(
          eq(chirps.authorId, userId),
          isNotNull(chirps.replyToId)
        )).orderBy(desc(chirps.createdAt));
        const chirpIds = results.map((r) => r.chirp.id);
        let reactionCounts = [];
        if (chirpIds.length > 0) {
          reactionCounts = await db.select({
            chirpId: reactions.chirpId,
            emoji: reactions.emoji,
            count: count()
          }).from(reactions).where(sql`${reactions.chirpId} IN (${chirpIds.join(",")})`).groupBy(reactions.chirpId, reactions.emoji);
        }
        return results.map(({ chirp, author }) => {
          const chirpReactions = reactionCounts.filter((r) => r.chirpId === chirp.id);
          const reactionCountsMap = {};
          chirpReactions.forEach((r) => {
            reactionCountsMap[r.emoji] = r.count;
          });
          return {
            ...chirp,
            author,
            reactionCounts: reactionCountsMap
          };
        });
      }
      async getUserReactedChirps(userId) {
        const reactedChirpIds = await db.select({ chirpId: reactions.chirpId }).from(reactions).where(eq(reactions.userId, userId));
        if (reactedChirpIds.length === 0) {
          return [];
        }
        const chirpIds = reactedChirpIds.map((r) => r.chirpId);
        const results = await db.select({
          chirp: chirps,
          author: users
        }).from(chirps).innerJoin(users, eq(chirps.authorId, users.id)).where(sql`${chirps.id} IN (${chirpIds.join(",")})`).orderBy(desc(chirps.createdAt));
        let reactionCounts = [];
        if (chirpIds.length > 0) {
          reactionCounts = await db.select({
            chirpId: reactions.chirpId,
            emoji: reactions.emoji,
            count: count()
          }).from(reactions).where(sql`${reactions.chirpId} IN (${chirpIds.join(",")})`).groupBy(reactions.chirpId, reactions.emoji);
        }
        const userReactions = await db.select({
          chirpId: reactions.chirpId,
          emoji: reactions.emoji
        }).from(reactions).where(and(
          eq(reactions.userId, userId),
          sql`${reactions.chirpId} IN (${chirpIds.join(",")})`
        ));
        return results.map(({ chirp, author }) => {
          const chirpReactions = reactionCounts.filter((r) => r.chirpId === chirp.id);
          const reactionCountsMap = {};
          chirpReactions.forEach((r) => {
            reactionCountsMap[r.emoji] = r.count;
          });
          const userReaction = userReactions.find((r) => r.chirpId === chirp.id)?.emoji;
          return {
            ...chirp,
            author,
            reactionCounts: reactionCountsMap,
            userReaction
          };
        });
      }
      async getChirps(userId, limit = 50) {
        let query = db.select({
          chirp: chirps,
          author: users
        }).from(chirps).innerJoin(users, eq(chirps.authorId, users.id)).where(isNull(chirps.replyToId)).orderBy(desc(chirps.createdAt)).limit(limit);
        if (userId) {
          const followingIds = await db.select({ id: follows.followingId }).from(follows).where(eq(follows.followerId, userId));
          const followingIdsList = followingIds.map((f) => f.id);
          if (followingIdsList.length > 0) {
            query = query.where(
              and(
                isNull(chirps.replyToId),
                // Only top-level chirps
                or(
                  eq(chirps.authorId, userId),
                  sql`${chirps.authorId} IN (${followingIdsList.map((id) => `'${id}'`).join(",")})`
                )
              )
            );
          } else {
            query = query.where(
              and(
                isNull(chirps.replyToId),
                // Only top-level chirps
                eq(chirps.authorId, userId)
              )
            );
          }
        }
        const results = await query;
        const chirpIds = results.map((r) => r.chirp.id);
        let reactionCounts = [];
        if (chirpIds.length > 0) {
          reactionCounts = await db.select({
            chirpId: reactions.chirpId,
            emoji: reactions.emoji,
            count: count()
          }).from(reactions).where(
            or(...chirpIds.map((id) => eq(reactions.chirpId, id)))
          ).groupBy(reactions.chirpId, reactions.emoji);
        }
        let userReactions = [];
        if (userId && chirpIds.length > 0) {
          userReactions = await db.select({
            chirpId: reactions.chirpId,
            emoji: reactions.emoji
          }).from(reactions).where(
            and(
              eq(reactions.userId, userId),
              or(...chirpIds.map((id) => eq(reactions.chirpId, id)))
            )
          );
        }
        const mappedResults = await Promise.all(results.map(async ({ chirp, author }) => {
          const chirpReactions = reactionCounts.filter((r) => r.chirpId === chirp.id);
          const reactionCountsMap = {};
          chirpReactions.forEach((r) => {
            reactionCountsMap[r.emoji] = r.count;
          });
          const userReaction = userReactions.find((r) => r.chirpId === chirp.id)?.emoji;
          let repostOf;
          if (chirp.repostOfId) {
            const [originalChirp] = await db.select({
              chirp: chirps,
              author: users
            }).from(chirps).innerJoin(users, eq(chirps.authorId, users.id)).where(eq(chirps.id, chirp.repostOfId));
            if (originalChirp) {
              repostOf = {
                ...originalChirp.chirp,
                author: originalChirp.author
              };
            }
          }
          return {
            ...chirp,
            author,
            reactionCounts: reactionCountsMap,
            userReaction,
            repostOf
          };
        }));
        return mappedResults;
      }
      async getChirpReplies(chirpId) {
        const directReplies = await db.select({
          chirp: chirps,
          author: users
        }).from(chirps).innerJoin(users, eq(chirps.authorId, users.id)).where(eq(chirps.replyToId, chirpId)).orderBy(chirps.createdAt);
        if (directReplies.length === 0) {
          return [];
        }
        const replyIds = directReplies.map((r) => r.chirp.id);
        let reactionCounts = [];
        if (replyIds.length > 0) {
          reactionCounts = await db.select({
            chirpId: reactions.chirpId,
            emoji: reactions.emoji,
            count: count()
          }).from(reactions).where(
            or(...replyIds.map((id) => eq(reactions.chirpId, id)))
          ).groupBy(reactions.chirpId, reactions.emoji);
        }
        const repliesWithNested = await Promise.all(
          directReplies.map(async ({ chirp: replyChirp, author: replyAuthor }) => {
            const nestedReplies = await this.getChirpReplies(replyChirp.id);
            const replyReactions = reactionCounts.filter((r) => r.chirpId === replyChirp.id);
            const reactionCountsMap = {};
            replyReactions.forEach((r) => {
              reactionCountsMap[r.emoji] = r.count;
            });
            return {
              ...replyChirp,
              author: replyAuthor,
              reactionCounts: reactionCountsMap,
              replies: nestedReplies
            };
          })
        );
        return repliesWithNested;
      }
      async getChirpById(chirpId) {
        const [result] = await db.select({
          chirp: chirps,
          author: users
        }).from(chirps).innerJoin(users, eq(chirps.authorId, users.id)).where(eq(chirps.id, chirpId)).limit(1);
        if (!result) {
          return void 0;
        }
        const reactionCounts = await db.select({
          emoji: reactions.emoji,
          count: count()
        }).from(reactions).where(eq(reactions.chirpId, chirpId)).groupBy(reactions.emoji);
        const reactionCountsMap = {};
        reactionCounts.forEach((r) => {
          reactionCountsMap[r.emoji] = r.count;
        });
        return {
          ...result.chirp,
          author: result.author,
          reactionCounts: reactionCountsMap
        };
      }
      async getChirpsByUser(userId) {
        const results = await db.select({
          chirp: chirps,
          author: users
        }).from(chirps).innerJoin(users, eq(chirps.authorId, users.id)).where(and(eq(chirps.authorId, userId), isNull(chirps.replyToId))).orderBy(desc(chirps.createdAt));
        const chirpIds = results.map((r) => r.chirp.id);
        let reactionCounts = [];
        if (chirpIds.length > 0) {
          reactionCounts = await db.select({
            chirpId: reactions.chirpId,
            emoji: reactions.emoji,
            count: count()
          }).from(reactions).where(
            or(...chirpIds.map((id) => eq(reactions.chirpId, id)))
          ).groupBy(reactions.chirpId, reactions.emoji);
        }
        return results.map(({ chirp, author }) => {
          const chirpReactions = reactionCounts.filter((r) => r.chirpId === chirp.id);
          const reactionCountsMap = {};
          chirpReactions.forEach((r) => {
            reactionCountsMap[r.emoji] = r.count;
          });
          return {
            ...chirp,
            author,
            reactionCounts: reactionCountsMap
          };
        });
      }
      // Follow operations
      async followUser(follow) {
        const [newFollow] = await db.insert(follows).values(follow).returning();
        return newFollow;
      }
      async unfollowUser(followerId, followingId) {
        await db.delete(follows).where(
          and(
            eq(follows.followerId, followerId),
            eq(follows.followingId, followingId)
          )
        );
      }
      async isFollowing(followerId, followingId) {
        const [result] = await db.select().from(follows).where(
          and(
            eq(follows.followerId, followerId),
            eq(follows.followingId, followingId)
          )
        ).limit(1);
        return !!result;
      }
      async getFollowers(userId) {
        const results = await db.select({ user: users }).from(follows).innerJoin(users, eq(follows.followerId, users.id)).where(eq(follows.followingId, userId));
        return results.map((r) => r.user);
      }
      async getFollowing(userId) {
        const results = await db.select({ user: users }).from(follows).innerJoin(users, eq(follows.followingId, users.id)).where(eq(follows.followerId, userId));
        return results.map((r) => r.user);
      }
      async getFollowCounts(userId) {
        const [followersCount] = await db.select({ count: count() }).from(follows).where(eq(follows.followingId, userId));
        const [followingCount] = await db.select({ count: count() }).from(follows).where(eq(follows.followerId, userId));
        return {
          followers: followersCount.count,
          following: followingCount.count
        };
      }
      // Reaction operations
      async addReaction(reaction) {
        await this.removeReaction(reaction.userId, reaction.chirpId);
        const [newReaction] = await db.insert(reactions).values(reaction).returning();
        const [chirp] = await db.select().from(chirps).where(eq(chirps.id, reaction.chirpId));
        if (chirp && chirp.authorId !== reaction.userId) {
          await this.createNotification({
            userId: chirp.authorId,
            type: "reaction",
            fromUserId: reaction.userId,
            chirpId: reaction.chirpId
          });
        }
        return newReaction;
      }
      async removeReaction(userId, chirpId) {
        await db.delete(reactions).where(
          and(
            eq(reactions.userId, userId),
            eq(reactions.chirpId, chirpId)
          )
        );
      }
      async getUserReactionForChirp(userId, chirpId) {
        const [result] = await db.select({ emoji: reactions.emoji }).from(reactions).where(
          and(
            eq(reactions.userId, userId),
            eq(reactions.chirpId, chirpId)
          )
        ).limit(1);
        return result?.emoji || null;
      }
      // Notification operations
      async createNotification(notification) {
        const [newNotification] = await db.insert(notifications).values(notification).returning();
        return newNotification;
      }
      async getNotifications(userId) {
        const results = await db.select({
          notification: notifications,
          fromUser: users,
          chirp: chirps
        }).from(notifications).leftJoin(users, eq(notifications.fromUserId, users.id)).leftJoin(chirps, eq(notifications.chirpId, chirps.id)).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
        return results.map(({ notification, fromUser, chirp }) => ({
          ...notification,
          fromUser: fromUser || void 0,
          chirp: chirp || void 0
        }));
      }
      async markNotificationAsRead(notificationId) {
        await db.update(notifications).set({ read: true }).where(eq(notifications.id, notificationId));
      }
      async getUnreadNotificationCount(userId) {
        const [result] = await db.select({ count: count() }).from(notifications).where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.read, false)
          )
        );
        return result.count;
      }
      // Get all users with email addresses for analytics
      async getAllUsers() {
        return await db.select().from(users).where(isNotNull(users.email));
      }
      async getFollowHistory(userId, startDate, endDate) {
        const [newFollowersResult] = await db.select({ count: count() }).from(follows).where(
          and(
            eq(follows.followingId, userId),
            gte(follows.createdAt, startDate),
            lte(follows.createdAt, endDate)
          )
        );
        const [newFollowingResult] = await db.select({ count: count() }).from(follows).where(
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
      async searchUsers(query) {
        return await db.select().from(users).where(
          or(
            sql`${users.firstName} ILIKE ${`%${query}%`}`,
            sql`${users.lastName} ILIKE ${`%${query}%`}`,
            sql`${users.email} ILIKE ${`%${query}%`}`
          )
        ).limit(20);
      }
      async searchChirps(query) {
        const results = await db.select({
          chirp: chirps,
          author: users
        }).from(chirps).innerJoin(users, eq(chirps.authorId, users.id)).where(sql`${chirps.content} ILIKE ${`%${query}%`}`).orderBy(desc(chirps.createdAt)).limit(20);
        return results.map(({ chirp, author }) => ({
          ...chirp,
          author
        }));
      }
      async getUserReplies(userId) {
        const results = await db.select({
          chirp: chirps,
          author: users
        }).from(chirps).innerJoin(users, eq(chirps.authorId, users.id)).where(and(eq(chirps.authorId, userId), isNotNull(chirps.replyToId))).orderBy(desc(chirps.createdAt));
        const chirpIds = results.map((r) => r.chirp.id);
        let reactionCounts = [];
        if (chirpIds.length > 0) {
          reactionCounts = await db.select({
            chirpId: reactions.chirpId,
            emoji: reactions.emoji,
            count: count()
          }).from(reactions).where(
            or(...chirpIds.map((id) => eq(reactions.chirpId, id)))
          ).groupBy(reactions.chirpId, reactions.emoji);
        }
        const repliesWithParents = await Promise.all(
          results.map(async ({ chirp, author }) => {
            const chirpReactions = reactionCounts.filter((r) => r.chirpId === chirp.id);
            const reactionCountsMap = {};
            chirpReactions.forEach((r) => {
              reactionCountsMap[r.emoji] = r.count;
            });
            let parentChirp = void 0;
            if (chirp.replyToId) {
              const [parentResult] = await db.select({
                chirp: chirps,
                author: users
              }).from(chirps).innerJoin(users, eq(chirps.authorId, users.id)).where(eq(chirps.id, chirp.replyToId)).limit(1);
              if (parentResult) {
                parentChirp = {
                  ...parentResult.chirp,
                  author: parentResult.author
                };
              }
            }
            return {
              ...chirp,
              author,
              reactionCounts: reactionCountsMap,
              parentChirp
            };
          })
        );
        return repliesWithParents;
      }
      async getUserReactedChirps(userId) {
        const results = await db.select({
          chirp: chirps,
          author: users,
          reaction: reactions
        }).from(reactions).innerJoin(chirps, eq(reactions.chirpId, chirps.id)).innerJoin(users, eq(chirps.authorId, users.id)).where(eq(reactions.userId, userId)).orderBy(desc(reactions.createdAt));
        const chirpsWithReactions = await Promise.all(
          results.map(async ({ chirp, author, reaction }) => {
            const reactionCounts = await this.getReactionCounts(chirp.id);
            return {
              ...chirp,
              author,
              reactionCounts,
              userReaction: reaction.emoji
            };
          })
        );
        return chirpsWithReactions;
      }
      // Handle operations
      async generateRandomHandle() {
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
          const letters = Math.random().toString(36).substring(2, 5).toLowerCase();
          const numbers = Math.floor(Math.random() * 9e5) + 1e5;
          const handle = letters + numbers;
          if (await this.isHandleAvailable(handle)) {
            return handle;
          }
          attempts++;
        }
        return "usr" + Date.now().toString().slice(-8);
      }
      async isHandleAvailable(handle) {
        const [existingByHandle] = await db.select().from(users).where(eq(users.handle, handle)).limit(1);
        const [existingByCustomHandle] = await db.select().from(users).where(eq(users.customHandle, handle)).limit(1);
        return !existingByHandle && !existingByCustomHandle;
      }
      async claimCustomHandle(userId, customHandle) {
        const user = await this.getUser(userId);
        if (!user) throw new Error("User not found");
        if (user.invitesSent < 3 && !user.vipCodeUsed) {
          throw new Error("Not eligible to claim custom handle. Need 3 invites or VIP code.");
        }
        if (!await this.isHandleAvailable(customHandle)) {
          throw new Error("Handle is not available");
        }
        try {
          await db.update(users).set({
            customHandle,
            hasCustomHandle: true,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq(users.id, userId));
        } catch (error) {
          if (error.message && error.message.includes("unique")) {
            throw new Error("Handle is already taken");
          }
          throw error;
        }
      }
      // Invitation operations
      async createInvitation(invitation) {
        const [newInvitation] = await db.insert(invitations).values(invitation).returning();
        await db.update(users).set({
          invitesSent: sql`${users.invitesSent} + 1`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, invitation.inviterUserId));
        return newInvitation;
      }
      async acceptInvitation(inviteCode, userId) {
        const [invitation] = await db.select().from(invitations).where(eq(invitations.inviteCode, inviteCode)).limit(1);
        if (!invitation) {
          throw new Error("Invalid invite code");
        }
        if (invitation.isAccepted) {
          throw new Error("Invite code already used");
        }
        await db.update(invitations).set({
          isAccepted: true,
          acceptedByUserId: userId,
          acceptedAt: /* @__PURE__ */ new Date()
        }).where(eq(invitations.id, invitation.id));
      }
      async getInvitationsByUser(userId) {
        return await db.select().from(invitations).where(eq(invitations.inviterUserId, userId)).orderBy(desc(invitations.createdAt));
      }
      // VIP code operations
      async useVipCode(code, userId) {
        const [vipCode] = await db.select().from(vipCodes).where(eq(vipCodes.code, code)).limit(1);
        if (!vipCode || vipCode.isUsed) {
          return null;
        }
        await db.update(vipCodes).set({
          isUsed: true,
          usedByUserId: userId,
          usedAt: /* @__PURE__ */ new Date()
        }).where(eq(vipCodes.id, vipCode.id));
        await db.update(users).set({
          vipCodeUsed: true,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, userId));
        return {
          grantsChirpPlus: vipCode.grantsChirpPlus || false,
          chirpPlusDurationMonths: vipCode.chirpPlusDurationMonths || 1,
          description: vipCode.description || "VIP access granted"
        };
      }
      async createVipCode(data) {
        const [vipCode] = await db.insert(vipCodes).values({
          code: data.code,
          codeType: data.codeType || "regular",
          grantsChirpPlus: data.grantsChirpPlus || false,
          chirpPlusDurationMonths: data.chirpPlusDurationMonths || 1,
          createdBy: data.createdBy,
          description: data.description
        }).returning();
        return vipCode;
      }
      async getUserReactionCounts(userId) {
        const userChirps = await db.select({ id: chirps.id }).from(chirps).where(eq(chirps.authorId, userId));
        if (userChirps.length === 0) {
          return { totalReactions: 0 };
        }
        const chirpIds = userChirps.map((c) => c.id);
        const [result] = await db.select({ count: count() }).from(reactions).where(
          or(...chirpIds.map((id) => eq(reactions.chirpId, id)))
        );
        return { totalReactions: result.count };
      }
      // Helper method for getting reaction counts for a single chirp
      async getReactionCounts(chirpId) {
        const reactionCounts = await db.select({
          emoji: reactions.emoji,
          count: count()
        }).from(reactions).where(eq(reactions.chirpId, chirpId)).groupBy(reactions.emoji);
        const reactionCountsMap = {};
        reactionCounts.forEach((r) => {
          reactionCountsMap[r.emoji] = r.count;
        });
        return reactionCountsMap;
      }
      // AI generation rate limiting
      async checkAiGenerationLimit(userId) {
        const user = await this.getUser(userId);
        if (!user) throw new Error("User not found");
        if (user.isChirpPlus && user.chirpPlusExpiresAt && /* @__PURE__ */ new Date() < user.chirpPlusExpiresAt) {
          return { canGenerate: true, isChirpPlus: true };
        }
        const today = /* @__PURE__ */ new Date();
        const lastGenDate = user.lastAiGenerationDate;
        if (!lastGenDate || lastGenDate.toDateString() !== today.toDateString()) {
          await this.updateUserProfile(userId, {
            lastAiGenerationDate: today,
            aiGenerationsToday: 0
          });
          return { canGenerate: true, isChirpPlus: false };
        }
        const generationsToday = user.aiGenerationsToday || 0;
        return { canGenerate: generationsToday < 1, isChirpPlus: false };
      }
      async incrementAiGeneration(userId) {
        const user = await this.getUser(userId);
        if (!user) throw new Error("User not found");
        const today = /* @__PURE__ */ new Date();
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
      async createWeeklySummary(summary) {
        const formattedSummary = {
          ...summary,
          topReactions: summary.topReactions || [],
          commonWords: summary.commonWords || []
        };
        const [result] = await db.insert(weeklySummaries).values(formattedSummary).returning();
        return result;
      }
      async getWeeklySummary(userId, weekStart) {
        const [result] = await db.select().from(weeklySummaries).where(
          and(
            eq(weeklySummaries.userId, userId),
            eq(weeklySummaries.weekStartDate, weekStart.toISOString().split("T")[0])
          )
        );
        return result;
      }
      async getLatestWeeklySummary(userId) {
        const [result] = await db.select().from(weeklySummaries).where(eq(weeklySummaries.userId, userId)).orderBy(desc(weeklySummaries.weekStartDate)).limit(1);
        return result;
      }
      async getWeeklyChirpStats(userId, weekStart, weekEnd) {
        const weekChirps = await db.select().from(chirps).where(
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
        const chirpIds = weekChirps.map((c) => c.id);
        const weekReactions = await db.select({
          chirpId: reactions.chirpId,
          emoji: reactions.emoji,
          count: count()
        }).from(reactions).where(or(...chirpIds.map((id) => eq(reactions.chirpId, id)))).groupBy(reactions.chirpId, reactions.emoji);
        const chirpReactionCounts = /* @__PURE__ */ new Map();
        weekReactions.forEach((r) => {
          const current = chirpReactionCounts.get(r.chirpId) || 0;
          chirpReactionCounts.set(r.chirpId, current + r.count);
        });
        const topChirpId = Array.from(chirpReactionCounts.entries()).sort(([, a], [, b]) => b - a)[0]?.[0];
        const topChirp = topChirpId ? weekChirps.find((c) => c.id === topChirpId)?.content || null : weekChirps[0]?.content || null;
        const reactionCounts = /* @__PURE__ */ new Map();
        weekReactions.forEach((r) => {
          const current = reactionCounts.get(r.emoji) || 0;
          reactionCounts.set(r.emoji, current + r.count);
        });
        const topReactions = Array.from(reactionCounts.entries()).sort(([, a], [, b]) => b - a).slice(0, 5).map(([emoji, count2]) => ({ emoji, count: count2 }));
        const allText = weekChirps.map((c) => c.content).join(" ");
        const words = allText.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter((word) => word.length > 3);
        const wordCounts = /* @__PURE__ */ new Map();
        words.forEach((word) => {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        });
        const commonWords = Array.from(wordCounts.entries()).sort(([, a], [, b]) => b - a).slice(0, 10).map(([word]) => word);
        return {
          chirpCount: weekChirps.length,
          topChirp,
          topReactions,
          commonWords
        };
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/openai.ts
import OpenAI from "openai";
async function generateWeeklySummary(userId, chirpCount, topChirp, topReactions, commonWords, weeklyTone) {
  try {
    const analysisPrompt = `Analyze this week's social media activity:
    - ${chirpCount} chirps posted
    - Top engaging post: "${topChirp}"
    - Most used reactions: ${topReactions?.map((r) => `${r.emoji} (${r.count})`).join(", ") || "none"}
    - Common words: ${commonWords?.join(", ") || "none"}
    - Overall tone: ${weeklyTone}
    
    Provide analysis in JSON format with:
    - tone: overall emotional tone (happy, thoughtful, energetic, etc.)
    - weeklyVibes: 2-3 word description of the week's energy
    - insights: brief encouraging insight about their posting patterns`;
    const analysisResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: analysisPrompt }],
      response_format: { type: "json_object" },
      max_tokens: 200
    });
    const analysis = JSON.parse(analysisResponse.choices[0].message.content || "{}");
    const summaryPrompt = `Create a friendly weekly summary chirp for a social media user. Include:
    - They posted ${chirpCount} chirps this week
    - Their most engaging post was: "${topChirp}"
    - Weekly vibe: ${analysis.weeklyVibes || weeklyTone}
    
    Make it encouraging, personal, and include relevant cute symbols (no emoji). Keep it under 280 characters.`;
    const summaryResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: summaryPrompt }],
      max_tokens: 150
    });
    return {
      summary: summaryResponse.choices[0].message.content || `\u25C6 Weekly summary: You've been active with ${chirpCount} chirps! Keep spreading those positive vibes! \u2605`,
      analysis: {
        tone: analysis.tone || weeklyTone,
        topChirps: [topChirp],
        topReactions,
        commonWords,
        weeklyVibes: analysis.weeklyVibes || "positive energy"
      }
    };
  } catch (error) {
    console.error("Error generating weekly summary:", error);
    return {
      summary: `\u25C6 Weekly summary: You've been active with ${chirpCount} chirps! Keep spreading those positive vibes! \u2605`,
      analysis: {
        tone: weeklyTone,
        topChirps: [topChirp],
        topReactions,
        commonWords,
        weeklyVibes: "positive energy"
      }
    };
  }
}
async function generatePersonalizedProfile(userId, name, personality, traits, interests, style, customPrompts, isChirpPlus2 = false) {
  try {
    const genZStyleMap = {
      vibrant: "Y2K vibes, neon colors, maximalist energy, main character aesthetic",
      artistic: "indie sleaze, creative chaos, artistic soul, trendsetter energy",
      minimalist: "clean girl aesthetic, soft minimalism, intellectual vibes, Pinterest-core",
      dynamic: "adventure-core, outdoorsy vibes, active lifestyle aesthetic",
      playful: "chaotic good energy, meme culture, unhinged but cute vibes",
      dreamy: "coquette aesthetic, soft girl era, dreamy pastels, ethereal vibes",
      modern: "That Girl aesthetic, balanced vibes, effortless cool"
    };
    const avatarStyles = [
      "cartoon character avatar with expressive features and unique personality",
      "illustrated portrait with stylized facial features and character expression",
      "digital character design with distinctive style and emotional depth",
      "animated-style avatar with creative artistic interpretation",
      "character illustration with unique visual identity and charm"
    ];
    const bannerStyles = [
      "iPhone wallpaper style with gradients and modern design elements",
      "abstract landscape with flowing shapes and atmospheric lighting",
      "geometric pattern design with dynamic colors and textures",
      "nature-inspired scene with artistic interpretation and depth",
      "futuristic cityscape with neon lights and modern architecture"
    ];
    const randomAvatar = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    const randomBanner = bannerStyles[Math.floor(Math.random() * bannerStyles.length)];
    const personalityAvatarMap = {
      "Main Character Energy": "adorable cartoon character surrounded by cute animals like foxes or cats, with pastel rainbow colors (lavender, mint, peach, rose), detailed flowering vines, and sparkling botanical elements",
      "Creative Icon": "sweet artistic character with baby animals like pandas or rabbits, soft pastel palette (lilac, sage green, butter yellow), intricate floral patterns, art supplies, and detailed plant illustrations",
      "Big Brain Energy": "cute intelligent character with wise animals like owls or elephants, calming pastels (powder blue, cream, soft purple), detailed succulents and academic botanicals, books surrounded by ivy",
      "Touch Grass Champion": "energetic character with adventurous animals like deer or bears, nature pastels (seafoam, coral, mint), detailed forest scenes with wildflowers, mushrooms, and mountain landscapes",
      "Chaotic Good Bestie": "playful character with fun animals like ferrets or parrots, bright pastels (cotton candy pink, sky blue, lemon), detailed garden chaos with mixed flowers, vines, and whimsical creatures",
      "Soft Girl Sage": "gentle character with peaceful animals like bunnies or doves, dreamy pastels (blush pink, lavender, cream), detailed rose gardens, cherry blossoms, and ethereal botanicals",
      "Balanced Bestie": "harmonious character with friendly animals like golden retrievers or birds, balanced pastels (sage, peach, soft blue), detailed herb gardens and peaceful nature scenes"
    };
    const personalityBannerMap = {
      "Main Character Energy": "enchanting pastel landscape with cute woodland creatures (foxes, deer, birds) in a magical forest setting, detailed flowering trees, mushroom villages, and rainbow gradients in soft pastels (lavender, mint, peach, rose)",
      "Creative Icon": "whimsical garden scene with artistic animals (cats with paint brushes, creative rabbits), detailed botanical illustrations, art supplies scattered among flowers, pastel color palette (lilac, sage, butter yellow, coral)",
      "Big Brain Energy": "serene library garden with wise animals (owls reading, elephants with glasses), detailed academic botanicals, books growing on trees, calming pastels (powder blue, cream, soft purple, mint)",
      "Touch Grass Champion": "adventure landscape with outdoor animals (bears hiking, birds flying), detailed mountain meadows full of wildflowers, camping elements, nature pastels (seafoam, coral, sage, sky blue)",
      "Chaotic Good Bestie": "playful meadow chaos with fun animals (ferrets playing, parrots singing), mixed flower garden explosion, whimsical creatures, bright pastels (cotton candy pink, lemon, periwinkle, mint)",
      "Soft Girl Sage": "dreamy cloud garden with gentle animals (bunnies in flower crowns, doves), detailed rose and cherry blossom landscapes, ethereal botanicals, soft pastels (blush pink, lavender, cream, sage)",
      "Balanced Bestie": "harmonious nature scene with friendly animals (golden retrievers, songbirds), detailed herb and flower gardens, peaceful countryside, balanced pastels (sage, peach, soft blue, cream)"
    };
    const basePrompts = {
      avatar: `Create a ${personalityAvatarMap[personality] || avatarStyles[0]} for someone with ${personality} personality. Include adorable details like cute items (teacups, books, musical instruments, cozy objects), botanical accuracy in plant illustrations, soft textures, and kawaii-style character design. Focus on ${traits.slice(0, 3).join(", ")} traits. NO TEXT, NO LETTERS, NO WORDS - only highly detailed visual character design with pastel colors and 100% opacity.`,
      banner: `Create a ${personalityBannerMap[personality] || bannerStyles[0]} reflecting ${personality} and interests in ${interests.slice(0, 3).join(", ")}. Include detailed nature scenes, cute animals in natural habitats, intricate botanical illustrations, and cozy environmental details. Use soft pastel color palette throughout. NO TEXT, NO LETTERS, NO WORDS - only visual design suitable as social media banner.`,
      bio: `Write a casual, authentic bio for someone with ${personality.toLowerCase()} personality. They're ${traits.slice(0, 3).join(", ")} and interested in ${interests.join(", ")}. Make it relatable and genuine with a friendly tone. Avoid excessive slang.`
    };
    if (customPrompts) {
      basePrompts.avatar += ` Additional requests: ${customPrompts}`;
      basePrompts.banner += ` Additional requests: ${customPrompts}`;
      basePrompts.bio += ` Additional requests: ${customPrompts}`;
    }
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const enhancedPrompts = {
      avatar: `${basePrompts.avatar} Unique ID: ${uniqueId}`,
      banner: `${basePrompts.banner} Unique ID: ${uniqueId}`,
      bio: basePrompts.bio
    };
    const [avatarUrl, bannerUrl, bio] = await Promise.all([
      generateUserAvatar(userId, name, enhancedPrompts.avatar, isChirpPlus2),
      generateUserBanner(userId, enhancedPrompts.banner, isChirpPlus2),
      generateUserBio(userId, name, interests, enhancedPrompts.bio, isChirpPlus2)
    ]);
    return {
      avatarUrl,
      bannerUrl,
      bio,
      interests
    };
  } catch (error) {
    console.error("Error generating personalized profile:", error);
    throw error;
  }
}
async function generateUserAvatar(userId, name, customPrompt, isChirpPlus2 = false) {
  try {
    const prompt = customPrompt || `Create a beautifully detailed, aesthetically pleasing avatar with soft maximalist design for ${name}. 
    Style: Elegant collage aesthetic with harmonious layered elements in a cohesive color palette.
    Elements: Include adorable creatures (butterflies, cats, foxes, bears, rabbits, unicorns), delicate flowers (cherry blossoms, roses, peonies), magical elements (crystals, stars, moons, sparkles), artistic items (paintbrushes, books, musical notes), and gentle geometric patterns.
    Color Palette: Soft pastels (lavender, blush pink, sky blue, mint green, warm cream), jewel tones (amethyst, rose quartz, aquamarine), and harmonious gradients. Avoid harsh neon or clashing colors.
    Patterns: Delicate mandalas, soft geometric shapes, flowing floral patterns, constellation designs, and organic forms that complement each other.
    Aesthetic: Pinterest-worthy, dreamy, cohesive design that feels curated and visually harmonious. Every element should work together in a beautiful, balanced composition.`;
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: isChirpPlus2 ? "hd" : "standard"
      // Premium users get HD quality
    });
    return response.data[0].url || "";
  } catch (error) {
    console.error("Error generating avatar:", error);
    const colors = ["#E8B4F0", "#B4A7F0", "#A7C7F0", "#A7F0E8", "#F0E8A7", "#F0B4A7", "#DDA0DD", "#87CEEB", "#F0E68C", "#FFB6C1", "#B19CD9", "#98D8C8", "#F7DC6F", "#F1948A"];
    const symbols = ["\u25CF", "\u25C6", "\u25B2", "\u2605", "\u25C7", "\u2665", "\u2600", "\u263E", "\u2726", "\u2727", "\u2729", "\u272A", "\u272B", "\u272C", "\u272D", "\u272E", "\u272F", "\u2730", "\u2740", "\u2741", "\u2742", "\u2743", "\u2744", "\u2745", "\u2746", "\u2747", "\u2748", "\u2749"];
    const creatures = ["\u{1F98B}", "\u{1F431}", "\u{1F98A}", "\u{1F43B}", "\u{1F43C}", "\u{1F428}", "\u{1F984}", "\u{1F41D}", "\u{1F41E}", "\u{1F989}", "\u{1F427}", "\u{1F430}", "\u{1F42D}", "\u{1F338}"];
    const objects = ["\u{1F3A8}", "\u{1F319}", "\u2B50", "\u{1F31F}", "\u{1F4AB}", "\u2728", "\u{1F48E}", "\u{1F52E}", "\u{1F4DA}", "\u{1F3AD}", "\u{1F3BB}", "\u{1F33A}", "\u{1F338}", "\u{1F33B}", "\u{1F339}", "\u{1F337}"];
    const patterns = ["dots", "waves", "stars", "mandala", "spiral"];
    const color1 = colors[parseInt(userId) % colors.length];
    const color2 = colors[(parseInt(userId) + 2) % colors.length];
    const color3 = colors[(parseInt(userId) + 4) % colors.length];
    const color4 = colors[(parseInt(userId) + 6) % colors.length];
    const mainSymbol = symbols[parseInt(userId) % symbols.length];
    const creature = creatures[parseInt(userId) % creatures.length];
    const object = objects[parseInt(userId) % objects.length];
    const pattern = patterns[parseInt(userId) % patterns.length];
    const gradId = `grad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let patternElement = "";
    if (pattern === "dots") {
      patternElement = `<pattern id="dots" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
        <circle cx="7.5" cy="7.5" r="2" fill="${color2}" opacity="0.4"/>
        <circle cx="3" cy="3" r="1" fill="${color3}" opacity="0.6"/>
        <circle cx="12" cy="12" r="1.5" fill="${color4}" opacity="0.5"/>
      </pattern>`;
    } else if (pattern === "waves") {
      patternElement = `<pattern id="waves" x="0" y="0" width="30" height="15" patternUnits="userSpaceOnUse">
        <path d="M0,7.5 Q7.5,2.5 15,7.5 T30,7.5" stroke="${color2}" stroke-width="1.5" fill="none" opacity="0.5"/>
        <path d="M0,11 Q7.5,6 15,11 T30,11" stroke="${color3}" stroke-width="1" fill="none" opacity="0.4"/>
      </pattern>`;
    } else if (pattern === "stars") {
      patternElement = `<pattern id="stars" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
        <polygon points="12.5,3 15,10 22,10 17,15 19,22 12.5,18 6,22 8,15 3,10 10,10" fill="${color2}" opacity="0.4"/>
        <circle cx="20" cy="5" r="1" fill="${color3}" opacity="0.7"/>
        <circle cx="5" cy="20" r="1.5" fill="${color4}" opacity="0.6"/>
      </pattern>`;
    } else if (pattern === "mandala") {
      patternElement = `<pattern id="mandala" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <g transform="translate(20,20)">
          <circle r="15" fill="none" stroke="${color2}" stroke-width="1" opacity="0.3"/>
          <circle r="10" fill="none" stroke="${color3}" stroke-width="1" opacity="0.4"/>
          <circle r="5" fill="${color4}" opacity="0.5"/>
        </g>
      </pattern>`;
    } else if (pattern === "tribal") {
      patternElement = `<pattern id="tribal" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M0,10 L10,0 L20,10 L10,20 Z" fill="${color2}" opacity="0.3"/>
        <path d="M5,10 L10,5 L15,10 L10,15 Z" fill="${color3}" opacity="0.4"/>
      </pattern>`;
    }
    const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${gradId}" cx="50%" cy="50%" r="70%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="30%" style="stop-color:${color2};stop-opacity:0.9" />
          <stop offset="60%" style="stop-color:${color3};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${color4};stop-opacity:1" />
        </radialGradient>
        ${patternElement}
      </defs>
      
      <!-- Base circle with gradient -->
      <circle cx="100" cy="100" r="100" fill="url(#${gradId})" />
      
      <!-- Pattern overlay -->
      ${patternElement ? `<circle cx="100" cy="100" r="95" fill="url(#${pattern})" />` : ""}
      
      <!-- Multiple decorative circles -->
      <circle cx="100" cy="100" r="85" fill="none" stroke="${color4}" stroke-width="2" opacity="0.6"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="${color3}" stroke-width="1.5" opacity="0.5"/>
      <circle cx="100" cy="100" r="55" fill="none" stroke="${color2}" stroke-width="1" opacity="0.4"/>
      
      <!-- Main focal emoji - larger and centered -->
      <text x="100" y="110" font-family="Arial, sans-serif" font-size="60" text-anchor="middle" fill="white">${creature}</text>
      
      <!-- Secondary accent emoji - smaller and positioned above -->
      <text x="100" y="65" font-family="Arial, sans-serif" font-size="25" text-anchor="middle" fill="white" opacity="0.8">${object}</text>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  }
}
async function generateUserBanner(userId, customPrompt, isChirpPlus2 = false) {
  try {
    const prompt = customPrompt || `Create a beautifully detailed, aesthetically cohesive banner with soft maximalist design and harmonious visual storytelling.
    Style: Elegant, dreamy landscape with carefully balanced elements in a cohesive color palette.
    Landscape Elements: Floating crystal formations, enchanted flower gardens, serene cloud kingdoms, magical forests with glowing elements, peaceful meadows with butterflies, dreamy celestial scenes.
    Characters & Creatures: Gentle magical beings, graceful butterflies, cute woodland animals, ethereal fairies, peaceful unicorns, and other adorable creatures integrated naturally into the scene.
    Natural Elements: Delicate cherry blossoms, flowing waterfalls, soft aurora skies, gentle moonlight, twinkling stars, floating flower petals, crystal streams.
    Architectural: Elegant crystal spires, organic flowing structures, flower-covered archways, dreamy cloud palaces, all with soft, rounded edges.
    Color Palette: Soft pastels (lavender, blush pink, sky blue, mint green, warm cream), jewel tones, and gentle gradients. Harmonious and Pinterest-worthy aesthetic.
    Composition: Beautifully balanced elements that flow together naturally, creating a cohesive, dreamy panoramic scene that's visually pleasing and harmonious.`;
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
      quality: isChirpPlus2 ? "hd" : "standard"
      // Premium users get HD quality
    });
    return response.data[0].url || "";
  } catch (error) {
    console.error("Error generating banner:", error);
    const colors = ["#E8B4F0", "#B4A7F0", "#A7C7F0", "#A7F0E8", "#F0E8A7", "#F0B4A7", "#DDA0DD", "#87CEEB", "#F0E68C", "#FFB6C1", "#B19CD9", "#98D8C8", "#F7DC6F", "#F1948A"];
    const symbols = ["\u25CF", "\u25C6", "\u25B2", "\u2605", "\u25C7", "\u2665", "\u2600", "\u263E", "\u2726", "\u2727", "\u2729", "\u272A", "\u272B", "\u272C", "\u272D", "\u272E", "\u272F", "\u2730", "\u2740", "\u2741", "\u2742", "\u2743", "\u2744", "\u2745", "\u2746", "\u2747", "\u2748", "\u2749"];
    const creatures = ["\u{1F98B}", "\u{1F431}", "\u{1F98A}", "\u{1F43B}", "\u{1F43C}", "\u{1F428}", "\u{1F984}", "\u{1F41D}", "\u{1F41E}", "\u{1F989}", "\u{1F427}", "\u{1F430}", "\u{1F42D}"];
    const objects = ["\u{1F3A8}", "\u{1F319}", "\u2B50", "\u{1F31F}", "\u{1F4AB}", "\u2728", "\u{1F48E}", "\u{1F52E}", "\u{1F4DA}", "\u{1F3AD}", "\u{1F3BB}", "\u{1F33A}", "\u{1F338}", "\u{1F33B}", "\u{1F339}", "\u{1F337}"];
    const nature = ["\u{1F338}", "\u{1F33A}", "\u{1F33B}", "\u{1F339}", "\u{1F337}", "\u{1F33F}", "\u{1F340}", "\u{1F331}", "\u{1F30A}", "\u{1F98B}", "\u2728", "\u{1F4AB}", "\u{1F319}", "\u2B50", "\u{1F31F}"];
    const color1 = colors[parseInt(userId) % colors.length];
    const color2 = colors[(parseInt(userId) + 2) % colors.length];
    const color3 = colors[(parseInt(userId) + 4) % colors.length];
    const color4 = colors[(parseInt(userId) + 6) % colors.length];
    const color5 = colors[(parseInt(userId) + 8) % colors.length];
    const gradId = `bannerGrad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const svg = `<svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${gradId}" cx="30%" cy="40%" r="80%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="25%" style="stop-color:${color2};stop-opacity:0.9" />
          <stop offset="50%" style="stop-color:${color3};stop-opacity:0.8" />
          <stop offset="75%" style="stop-color:${color4};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${color5};stop-opacity:1" />
        </radialGradient>
        <pattern id="complexPattern" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="2" fill="${color3}" opacity="0.4"/>
          <circle cx="5" cy="5" r="1" fill="${color4}" opacity="0.6"/>
          <circle cx="25" cy="25" r="1.5" fill="${color5}" opacity="0.5"/>
          <polygon points="15,8 18,12 15,16 12,12" fill="${color2}" opacity="0.3"/>
        </pattern>
      </defs>
      
      <!-- Multi-layered background -->
      <rect width="800" height="200" fill="url(#${gradId})" />
      <rect width="800" height="200" fill="url(#complexPattern)" />
      
      <!-- Geometric landscape elements -->
      <polygon points="0,120 150,80 300,100 450,70 600,90 800,110 800,200 0,200" fill="${color4}" opacity="0.3"/>
      <polygon points="0,140 200,100 400,120 600,95 800,125 800,200 0,200" fill="${color3}" opacity="0.2"/>
      
      <!-- Floating geometric structures -->
      <circle cx="120" cy="60" r="25" fill="${color2}" opacity="0.4"/>
      <polygon points="120,40 135,65 105,65" fill="${color5}" opacity="0.6"/>
      <rect x="110" y="70" width="20" height="15" fill="${color1}" opacity="0.5"/>
      
      <circle cx="680" cy="70" r="20" fill="${color3}" opacity="0.4"/>
      <polygon points="680,55 690,75 670,75" fill="${color4}" opacity="0.6"/>
      <rect x="675" y="80" width="10" height="10" fill="${color2}" opacity="0.5"/>
      
      <!-- Larger, more spaced out emojis across the landscape -->
      <text x="150" y="50" font-family="Arial, sans-serif" font-size="28" fill="white" opacity="0.8">${creatures[parseInt(userId) % creatures.length]}</text>
      <text x="400" y="45" font-family="Arial, sans-serif" font-size="32" fill="white" opacity="0.9">${objects[parseInt(userId) % objects.length]}</text>
      <text x="650" y="55" font-family="Arial, sans-serif" font-size="30" fill="${color5}" opacity="0.8">${nature[parseInt(userId) % nature.length]}</text>
      
      <!-- Middle layer - bigger emojis -->
      <text x="250" y="110" font-family="Arial, sans-serif" font-size="26" fill="white" opacity="0.7">${creatures[(parseInt(userId) + 1) % creatures.length]}</text>
      <text x="550" y="95" font-family="Arial, sans-serif" font-size="24" fill="${color3}" opacity="0.8">${objects[(parseInt(userId) + 1) % objects.length]}</text>
      
      <!-- Bottom layer - larger focal emojis -->
      <text x="100" y="155" font-family="Arial, sans-serif" font-size="35" fill="white" opacity="0.9">${nature[(parseInt(userId) + 2) % nature.length]}</text>
      <text x="350" y="150" font-family="Arial, sans-serif" font-size="32" fill="${color4}" opacity="0.8">${creatures[(parseInt(userId) + 2) % creatures.length]}</text>
      <text x="600" y="160" font-family="Arial, sans-serif" font-size="30" fill="white" opacity="0.9">${objects[(parseInt(userId) + 2) % objects.length]}</text>
      <text x="750" y="145" font-family="Arial, sans-serif" font-size="28" fill="${color5}" opacity="0.8">${nature[(parseInt(userId) + 3) % nature.length]}</text>
      
      <!-- Additional decorative geometric shapes -->
      <polygon points="40,80 60,90 40,100 20,90" fill="${color3}" opacity="0.5"/>
      <polygon points="760,90 780,100 760,110 740,100" fill="${color4}" opacity="0.5"/>
      <circle cx="350" cy="130" r="8" fill="${color2}" opacity="0.6"/>
      <circle cx="450" cy="125" r="6" fill="${color5}" opacity="0.6"/>
      
      <!-- Energy streams and connecting lines -->
      <path d="M0,100 Q200,80 400,90 T800,100" stroke="${color5}" stroke-width="2" fill="none" opacity="0.4"/>
      <path d="M0,130 Q300,110 600,120 T800,130" stroke="${color4}" stroke-width="1.5" fill="none" opacity="0.3"/>
    </svg>`;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  }
}
async function generateUserBio(userId, handle, interests, customPrompt) {
  try {
    const interestsText = interests && interests.length > 0 ? `with interests in ${interests.join(", ")}` : "";
    const prompt = customPrompt || `Generate a casual, friendly bio for @${handle} ${interestsText}. 
    Make it:
    - Under 160 characters
    - Casual but not overly trendy
    - Clean, minimal text without emojis
    - Relatable and authentic
    - Natural, conversational tone
    
    Bio examples:
    - "coffee enthusiast | making art and good vibes | always learning something new"
    - "plant lover | sharing thoughts and hot takes | exploring new places"
    - "creative type | bookworm | trying to make the world a little better"
    
    Generate just the bio text, no quotes.`;
    const response = await openai.chat.completions.create({
      model: isChirpPlus ? "gpt-4o" : "gpt-3.5-turbo",
      // Premium users get GPT-4o
      messages: [{ role: "user", content: prompt }],
      max_tokens: 60
    });
    return response.choices[0].message.content?.trim() || "Just living my best life";
  } catch (error) {
    console.error("Error generating bio:", error);
    const bios = [
      "creative soul | coffee enthusiast | always learning",
      "music lover | exploring new places | good vibes only",
      "bookworm | making art | trying to change the world",
      "outdoor enthusiast | digital creator | always curious",
      "creating content that matters | authentic vibes only"
    ];
    return bios[parseInt(userId) % bios.length];
  }
}
async function generateUserInterests(userId, recentChirps) {
  try {
    const chirpsText = recentChirps.join(" ");
    const prompt = `Based on these recent social media posts, suggest 3-5 interests/hobbies this person might have. 
    Posts: "${chirpsText}"
    
    Return only a JSON array of interests (single words or short phrases), for example:
    ["photography", "travel", "coffee", "technology", "music"]
    
    If no posts are provided, suggest general popular interests.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || '{"interests": []}');
    return result.interests || ["technology", "music", "travel", "coffee"];
  } catch (error) {
    console.error("Error generating interests:", error);
    const defaultInterests = [
      ["technology", "music", "travel"],
      ["photography", "coffee", "books"],
      ["fitness", "cooking", "art"],
      ["movies", "gaming", "nature"],
      ["writing", "design", "sports"]
    ];
    return defaultInterests[parseInt(userId) % defaultInterests.length];
  }
}
var openai;
var init_openai = __esm({
  "server/openai.ts"() {
    "use strict";
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
    });
  }
});

// server/emailService.ts
import mailchimp from "@mailchimp/mailchimp_transactional";
async function sendWeeklyAnalyticsEmail(stats) {
  try {
    const htmlContent = generateEmailHTML(stats);
    const textContent = generateEmailText(stats);
    const message = {
      html: htmlContent,
      text: textContent,
      subject: `\u{1F4CA} Your Weekly Chirp Analytics - ${stats.weekStartDate} to ${stats.weekEndDate}`,
      from_email: "analytics@chirp.app",
      from_name: "Chirp Analytics",
      to: [
        {
          email: stats.userEmail,
          name: stats.userName,
          type: "to"
        }
      ],
      headers: {
        "Reply-To": "noreply@chirp.app"
      },
      track_opens: true,
      track_clicks: true,
      auto_text: false,
      auto_html: false
    };
    const response = await mailchimpClient.messages.send({
      message,
      async: false
    });
    console.log("Weekly email sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Error sending weekly email:", error);
    return false;
  }
}
function generateEmailHTML(stats) {
  const growthTrend = stats.followersGrowthPercent > 0 ? "\u{1F4C8}" : stats.followersGrowthPercent < 0 ? "\u{1F4C9}" : "\u27A1\uFE0F";
  const viralIcon = stats.viralPotential >= 8 ? "\u{1F525}" : stats.viralPotential >= 6 ? "\u2B50" : stats.viralPotential >= 4 ? "\u2728" : "\u{1F4AB}";
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Weekly Chirp Analytics</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e1e5e9; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
        .metric-card { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
        .metric-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .metric-label { font-weight: 600; color: #495057; }
        .metric-value { font-weight: bold; color: #667eea; }
        .growth-positive { color: #28a745; }
        .growth-negative { color: #dc3545; }
        .viral-score { font-size: 24px; font-weight: bold; color: #e83e8c; }
        .recommendations { background: #e7f3ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .top-chirp { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>\u{1F4CA} Your Weekly Analytics</h1>
          <p>@${stats.userHandle} \u2022 ${stats.weekStartDate} - ${stats.weekEndDate}</p>
        </div>
        
        <div class="content">
          <div class="metric-card">
            <h2>${growthTrend} Growth & Reach</h2>
            <div class="metric-row">
              <span class="metric-label">New Followers:</span>
              <span class="metric-value ${stats.newFollowers > 0 ? "growth-positive" : ""}">${stats.newFollowers > 0 ? "+" : ""}${stats.newFollowers}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Total Followers:</span>
              <span class="metric-value">${stats.totalFollowers}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Growth Rate:</span>
              <span class="metric-value ${stats.followersGrowthPercent > 0 ? "growth-positive" : stats.followersGrowthPercent < 0 ? "growth-negative" : ""}">${stats.followersGrowthPercent > 0 ? "+" : ""}${stats.followersGrowthPercent.toFixed(1)}%</span>
            </div>
          </div>

          <div class="metric-card">
            <h2>\u{1F4DD} Content Performance</h2>
            <div class="metric-row">
              <span class="metric-label">Chirps Posted:</span>
              <span class="metric-value">${stats.chirpsPosted}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Total Reactions:</span>
              <span class="metric-value">${stats.totalReactions}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Replies Received:</span>
              <span class="metric-value">${stats.repliesReceived}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Avg Reactions per Chirp:</span>
              <span class="metric-value">${stats.avgReactionsPerChirp.toFixed(1)}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Engagement Rate:</span>
              <span class="metric-value">${stats.engagementRate.toFixed(1)}%</span>
            </div>
          </div>

          ${stats.topChirp ? `
          <div class="top-chirp">
            <h3>\u{1F3C6} Your Top Performing Chirp</h3>
            <p><em>"${stats.topChirp.content}"</em></p>
            <div class="metric-row">
              <span class="metric-label">Reactions:</span>
              <span class="metric-value">${stats.topChirp.reactions}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Replies:</span>
              <span class="metric-value">${stats.topChirp.replies}</span>
            </div>
          </div>
          ` : ""}

          <div class="metric-card">
            <h2>${viralIcon} Viral Potential Score</h2>
            <div style="text-align: center; margin: 20px 0;">
              <div class="viral-score">${stats.viralPotential}/10</div>
              <p>${getViralPotentialText(stats.viralPotential)}</p>
            </div>
          </div>

          <div class="metric-card">
            <h2>\u{1F3AD} Top Reactions</h2>
            ${stats.topReactions.map((reaction) => `
              <div class="metric-row">
                <span class="metric-label">${reaction.emoji}</span>
                <span class="metric-value">${reaction.count}</span>
              </div>
            `).join("")}
          </div>

          <div class="recommendations">
            <h2>\u{1F680} AI Recommendations</h2>
            <p><strong>Weekly Summary:</strong></p>
            <p>${stats.aiSummary}</p>
            
            <p><strong>Growth Tips:</strong></p>
            <ul>
              ${stats.recommendations.map((rec) => `<li>${rec}</li>`).join("")}
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Keep chirping and growing! \u{1F426}</p>
          <p style="font-size: 12px; color: #6c757d;">
            You're receiving this because you're a Chirp user. 
            <a href="#" style="color: #667eea;">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
function generateEmailText(stats) {
  return `
CHIRP WEEKLY ANALYTICS
@${stats.userHandle} \u2022 ${stats.weekStartDate} - ${stats.weekEndDate}

GROWTH & REACH
\u2022 New Followers: ${stats.newFollowers > 0 ? "+" : ""}${stats.newFollowers}
\u2022 Total Followers: ${stats.totalFollowers}
\u2022 Growth Rate: ${stats.followersGrowthPercent > 0 ? "+" : ""}${stats.followersGrowthPercent.toFixed(1)}%

CONTENT PERFORMANCE
\u2022 Chirps Posted: ${stats.chirpsPosted}
\u2022 Total Reactions: ${stats.totalReactions}
\u2022 Replies Received: ${stats.repliesReceived}
\u2022 Avg Reactions per Chirp: ${stats.avgReactionsPerChirp.toFixed(1)}
\u2022 Engagement Rate: ${stats.engagementRate.toFixed(1)}%

${stats.topChirp ? `
TOP PERFORMING CHIRP
"${stats.topChirp.content}"
Reactions: ${stats.topChirp.reactions} | Replies: ${stats.topChirp.replies}
` : ""}

VIRAL POTENTIAL SCORE: ${stats.viralPotential}/10
${getViralPotentialText(stats.viralPotential)}

AI SUMMARY
${stats.aiSummary}

GROWTH RECOMMENDATIONS
${stats.recommendations.map((rec) => `\u2022 ${rec}`).join("\n")}

Keep chirping and growing!
  `;
}
function getViralPotentialText(score) {
  if (score >= 8) return "You're on fire! Your content has excellent viral potential.";
  if (score >= 6) return "Great momentum! You're building strong engagement.";
  if (score >= 4) return "Good progress! Focus on consistency and engagement.";
  return "Room to grow! Try posting more consistently and engaging with others.";
}
var mailchimpClient;
var init_emailService = __esm({
  "server/emailService.ts"() {
    "use strict";
    if (!process.env.MAILCHIMP_API_KEY) {
      throw new Error("MAILCHIMP_API_KEY environment variable must be set");
    }
    mailchimpClient = mailchimp(process.env.MAILCHIMP_API_KEY);
  }
});

// server/analyticsService.ts
var analyticsService_exports = {};
__export(analyticsService_exports, {
  generateWeeklyAnalytics: () => generateWeeklyAnalytics,
  sendWeeklyAnalyticsToAllUsers: () => sendWeeklyAnalyticsToAllUsers
});
async function generateWeeklyAnalytics(userId, weekStartDate, weekEndDate) {
  try {
    const user = await storage.getUser(userId);
    if (!user || !user.email) {
      console.log(`No email found for user ${userId}, skipping analytics`);
      return null;
    }
    const handle = user.hasCustomHandle && user.customHandle ? user.customHandle : user.handle;
    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email.split("@")[0];
    const allUserChirps = await storage.getChirpsByUser(userId);
    const weekChirps = allUserChirps.filter((chirp) => {
      const chirpDate = new Date(chirp.createdAt);
      return chirpDate >= weekStartDate && chirpDate <= weekEndDate;
    });
    const currentFollowers = await storage.getFollowers(userId);
    const followHistory = await storage.getFollowHistory(userId, weekStartDate, weekEndDate);
    const newFollowersCount = followHistory.newFollowers;
    const totalFollowers = currentFollowers.length;
    const previousFollowers = totalFollowers - newFollowersCount;
    const followersGrowthPercent = previousFollowers > 0 ? newFollowersCount / previousFollowers * 100 : 0;
    let totalReactions = 0;
    let totalReplies = 0;
    let topChirp = null;
    let maxEngagement = 0;
    for (const chirp of weekChirps) {
      const reactions2 = Object.values(chirp.reactionCounts || {}).reduce((sum, count2) => sum + count2, 0);
      const replies = chirp.replies?.length || 0;
      const engagement = reactions2 + replies;
      totalReactions += reactions2;
      totalReplies += replies;
      if (engagement > maxEngagement) {
        maxEngagement = engagement;
        topChirp = {
          content: chirp.content,
          reactions: reactions2,
          replies
        };
      }
    }
    const avgReactionsPerChirp = weekChirps.length > 0 ? totalReactions / weekChirps.length : 0;
    const avgRepliesPerChirp = weekChirps.length > 0 ? totalReplies / weekChirps.length : 0;
    const engagementRate = totalFollowers > 0 ? (totalReactions + totalReplies) / totalFollowers * 100 : 0;
    const reactionCounts = {};
    weekChirps.forEach((chirp) => {
      if (chirp.reactionCounts) {
        Object.entries(chirp.reactionCounts).forEach(([emoji, count2]) => {
          reactionCounts[emoji] = (reactionCounts[emoji] || 0) + count2;
        });
      }
    });
    const topReactions = Object.entries(reactionCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([emoji, count2]) => ({ emoji, count: count2 }));
    let viralPotential = 1;
    if (weekChirps.length > 0) {
      viralPotential += Math.min(2, weekChirps.length / 5);
    }
    if (avgReactionsPerChirp > 5) viralPotential += 2;
    if (avgReactionsPerChirp > 10) viralPotential += 1;
    if (newFollowersCount > 5) viralPotential += 2;
    if (newFollowersCount > 20) viralPotential += 1;
    if (engagementRate > 10) viralPotential += 1;
    viralPotential = Math.min(10, Math.round(viralPotential));
    const recentChirps = weekChirps.slice(0, 10).map((chirp) => chirp.content);
    const aiSummary = await generateAdvancedWeeklySummary(
      userId,
      weekChirps.length,
      topChirp?.content,
      topReactions,
      newFollowersCount,
      engagementRate,
      recentChirps
    );
    const recommendations = generateRecommendations(
      weekChirps.length,
      avgReactionsPerChirp,
      newFollowersCount,
      engagementRate,
      viralPotential
    );
    const stats = {
      userId,
      userEmail: user.email,
      userName,
      userHandle: handle || "user",
      weekStartDate: weekStartDate.toISOString().split("T")[0],
      weekEndDate: weekEndDate.toISOString().split("T")[0],
      chirpsPosted: weekChirps.length,
      repliesReceived: totalReplies,
      totalReactions,
      topChirp,
      newFollowers: newFollowersCount,
      totalFollowers,
      followersGrowthPercent,
      newFollowing: followHistory.newFollowing,
      avgReactionsPerChirp,
      avgRepliesPerChirp,
      topReactions,
      engagementRate,
      aiSummary,
      viralPotential,
      recommendations
    };
    return stats;
  } catch (error) {
    console.error("Error generating weekly analytics:", error);
    return null;
  }
}
async function generateAdvancedWeeklySummary(userId, chirpCount, topChirp, topReactions, newFollowers, engagementRate, recentChirps) {
  try {
    const prompt = `Generate a detailed weekly social media performance summary for a user with the following metrics:

Content Activity:
- Posted ${chirpCount} chirps this week
- Top performing chirp: "${topChirp || "No posts this week"}"
- Recent content themes: ${recentChirps.join(", ") || "No recent content"}

Engagement & Growth:
- Gained ${newFollowers} new followers
- Engagement rate: ${engagementRate.toFixed(1)}%
- Top reactions: ${topReactions.map((r) => `${r.emoji} (${r.count})`).join(", ") || "No reactions"}

Please provide:
1. A 2-3 sentence performance overview
2. Key insights about content performance and audience engagement
3. Specific observations about growth trends
4. Brief analysis of what content resonated most

Keep the tone encouraging but data-driven, like a professional social media analyst.`;
    return await generateWeeklySummary(userId, chirpCount, topChirp, topReactions, prompt);
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return `This week you posted ${chirpCount} chirps and gained ${newFollowers} new followers. Your engagement rate was ${engagementRate.toFixed(1)}%. Keep building momentum with consistent, engaging content!`;
  }
}
function generateRecommendations(chirpCount, avgReactions, newFollowers, engagementRate, viralPotential) {
  const recommendations = [];
  if (chirpCount < 3) {
    recommendations.push("Post more consistently - aim for 1-2 chirps per day to increase visibility");
  } else if (chirpCount > 15) {
    recommendations.push("Consider quality over quantity - fewer high-quality posts often perform better");
  }
  if (avgReactions < 2) {
    recommendations.push("Try asking questions or using trending topics to boost engagement");
    recommendations.push("Engage with others' content to build community and reciprocal interactions");
  }
  if (newFollowers < 5) {
    recommendations.push("Use relevant hashtags and mention other users to expand your reach");
    recommendations.push("Post during peak hours when your audience is most active");
  }
  if (viralPotential < 5) {
    recommendations.push("Share more relatable, shareable content that sparks conversations");
    recommendations.push("Try different content formats - questions, polls, or trending topics");
  } else if (viralPotential >= 7) {
    recommendations.push("You're building great momentum! Keep your current content strategy");
    recommendations.push("Consider collaborating with other users to amplify your reach");
  }
  if (engagementRate < 5) {
    recommendations.push("Focus on building genuine connections with your audience through replies and comments");
  }
  if (recommendations.length < 3) {
    recommendations.push("Stay authentic to your voice while experimenting with new content ideas");
    recommendations.push("Analyze your top-performing content and create similar posts");
    recommendations.push("Engage with trending topics relevant to your interests");
  }
  return recommendations.slice(0, 5);
}
async function sendWeeklyAnalyticsToAllUsers() {
  try {
    const now = /* @__PURE__ */ new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - now.getDay());
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 7);
    console.log(`Generating weekly analytics for week: ${weekStart.toISOString().split("T")[0]} to ${weekEnd.toISOString().split("T")[0]}`);
    const allUsers = await storage.getAllUsers();
    const usersWithEmail = allUsers.filter((user) => user.email);
    console.log(`Found ${usersWithEmail.length} users with email addresses`);
    for (const user of usersWithEmail) {
      try {
        console.log(`Generating analytics for user ${user.id} (${user.email})`);
        const stats = await generateWeeklyAnalytics(user.id, weekStart, weekEnd);
        if (stats) {
          const emailSent = await sendWeeklyAnalyticsEmail(stats);
          if (emailSent) {
            console.log(`Weekly analytics email sent successfully to ${user.email}`);
          } else {
            console.error(`Failed to send weekly analytics email to ${user.email}`);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 1e3));
      } catch (error) {
        console.error(`Error processing weekly analytics for user ${user.id}:`, error);
      }
    }
    console.log("Weekly analytics generation completed");
  } catch (error) {
    console.error("Error in sendWeeklyAnalyticsToAllUsers:", error);
  }
}
var init_analyticsService = __esm({
  "server/analyticsService.ts"() {
    "use strict";
    init_storage();
    init_openai();
    init_emailService();
  }
});

// server/index.ts
import express3 from "express";

// server/routes.ts
init_storage();
import express from "express";
import { createServer } from "http";

// server/replitAuth.ts
init_storage();
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/mentionUtils.ts
init_storage();
function extractMentions(text2) {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text2)) !== null) {
    mentions.push(match[1]);
  }
  return [...new Set(mentions)];
}
async function processMentions(text2, fromUserId, type, chirpId) {
  const handles = extractMentions(text2);
  for (const handle of handles) {
    try {
      const mentionedUser = await storage.getUserByHandle(handle);
      if (mentionedUser && mentionedUser.id !== fromUserId) {
        await storage.createNotification({
          userId: mentionedUser.id,
          type,
          fromUserId,
          chirpId
        });
      }
    } catch (error) {
      console.error(`Error processing mention for handle ${handle}:`, error);
    }
  }
}

// server/routes.ts
init_schema();
init_openai();
import Stripe from "stripe";
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20"
});
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.post("/api/admin/trigger-weekly-analytics", isAuthenticated, async (req, res) => {
    try {
      const { sendWeeklyAnalyticsToAllUsers: sendWeeklyAnalyticsToAllUsers2 } = await Promise.resolve().then(() => (init_analyticsService(), analyticsService_exports));
      await sendWeeklyAnalyticsToAllUsers2();
      res.json({ message: "Weekly analytics triggered successfully" });
    } catch (error) {
      console.error("Error triggering weekly analytics:", error);
      res.status(500).json({ message: "Failed to trigger weekly analytics" });
    }
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (user && !user.avatarUrl && user.profileImageUrl) {
        user.avatarUrl = user.profileImageUrl;
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/chirps", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      let content = req.body.content;
      if (content && typeof content === "string") {
        content = content.replace(/https?:\/\/[^\s]+/gi, "[link removed]");
        content = content.replace(/www\.[^\s]+/gi, "[link removed]");
        content = content.replace(/(?<!@)[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/gi, "[link removed]");
      }
      const chirpData = insertChirpSchema.parse({
        ...req.body,
        content,
        authorId: userId
      });
      if (chirpData.content.length > 280) {
        return res.status(400).json({ message: "Chirp content too long" });
      }
      const chirp = await storage.createChirp(chirpData);
      if (chirp.content) {
        await processMentions(chirp.content, userId, "mention", chirp.id);
      }
      if (chirp.replyToId) {
        const originalChirp = await storage.getChirpById(chirp.replyToId);
        if (originalChirp && originalChirp.author.id !== userId) {
          await storage.createNotification({
            userId: originalChirp.author.id,
            type: "reply",
            fromUserId: userId,
            chirpId: chirp.id
          });
        }
      }
      res.json(chirp);
    } catch (error) {
      console.error("Error creating chirp:", error);
      res.status(400).json({ message: "Failed to create chirp" });
    }
  });
  app2.get("/api/chirps", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit) || 50;
      const chirps2 = await storage.getChirps(userId, limit);
      res.json(chirps2);
    } catch (error) {
      console.error("Error fetching chirps:", error);
      res.status(500).json({ message: "Failed to fetch chirps" });
    }
  });
  app2.get("/api/users/:userId/chirps", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const chirps2 = await storage.getChirpsByUser(userId);
      res.json(chirps2);
    } catch (error) {
      console.error("Error fetching user chirps:", error);
      res.status(500).json({ message: "Failed to fetch user chirps" });
    }
  });
  app2.get("/api/users/:userId/replies", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const replies = await storage.getUserReplies(userId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching user replies:", error);
      res.status(500).json({ message: "Failed to fetch user replies" });
    }
  });
  app2.get("/api/chirps/:id", isAuthenticated, async (req, res) => {
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
  app2.get("/api/chirps/:id/replies", isAuthenticated, async (req, res) => {
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
  app2.post("/api/chirps/:id/repost", isAuthenticated, async (req, res) => {
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
  app2.get("/api/users/:userId/chirp-count", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const count2 = await storage.getTotalChirpCount(userId);
      res.json({ count: count2 });
    } catch (error) {
      console.error("Error fetching chirp count:", error);
      res.status(500).json({ message: "Failed to fetch chirp count" });
    }
  });
  app2.get("/api/users/:userId/reacted", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const reactedChirps = await storage.getUserReactedChirps(userId);
      res.json(reactedChirps);
    } catch (error) {
      console.error("Error fetching user reacted chirps:", error);
      res.status(500).json({ message: "Failed to fetch user reacted chirps" });
    }
  });
  app2.get("/api/users/:userId/reaction-counts", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const reactionCounts = await storage.getUserReactionCounts(userId);
      res.json(reactionCounts);
    } catch (error) {
      console.error("Error fetching user reaction counts:", error);
      res.status(500).json({ message: "Failed to fetch user reaction counts" });
    }
  });
  app2.post("/api/follows", isAuthenticated, async (req, res) => {
    try {
      const followerId = req.user.claims.sub;
      const followData = insertFollowSchema.parse({
        ...req.body,
        followerId
      });
      if (followData.followerId === followData.followingId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      const isAlreadyFollowing = await storage.isFollowing(followData.followerId, followData.followingId);
      if (isAlreadyFollowing) {
        return res.status(400).json({ message: "Already following this user" });
      }
      const follow = await storage.followUser(followData);
      await storage.createNotification({
        userId: followData.followingId,
        type: "follow",
        fromUserId: followerId
      });
      res.json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      res.status(400).json({ message: "Failed to follow user" });
    }
  });
  app2.delete("/api/follows/:followingId", isAuthenticated, async (req, res) => {
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
  app2.get("/api/users/:userId/followers", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const followers = await storage.getFollowers(userId);
      res.json(followers);
    } catch (error) {
      console.error("Error fetching followers:", error);
      res.status(500).json({ message: "Failed to fetch followers" });
    }
  });
  app2.get("/api/users/:userId/following", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const following = await storage.getFollowing(userId);
      res.json(following);
    } catch (error) {
      console.error("Error fetching following:", error);
      res.status(500).json({ message: "Failed to fetch following" });
    }
  });
  app2.get("/api/users/:userId/follow-counts", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const counts = await storage.getFollowCounts(userId);
      res.json(counts);
    } catch (error) {
      console.error("Error fetching follow counts:", error);
      res.status(500).json({ message: "Failed to fetch follow counts" });
    }
  });
  app2.get("/api/users/:userId/is-following", isAuthenticated, async (req, res) => {
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
  app2.post("/api/reactions", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const reactionData = insertReactionSchema.parse({
        ...req.body,
        userId
      });
      const reaction = await storage.addReaction(reactionData);
      const chirp = await storage.getChirps().then(
        (chirps2) => chirps2.find((c) => c.id === reactionData.chirpId)
      );
      if (chirp && chirp.author.id !== userId) {
        await storage.createNotification({
          userId: chirp.author.id,
          type: "reaction",
          fromUserId: userId,
          chirpId: reactionData.chirpId
        });
      }
      res.json(reaction);
    } catch (error) {
      console.error("Error adding reaction:", error);
      res.status(400).json({ message: "Failed to add reaction" });
    }
  });
  app2.delete("/api/reactions/:chirpId", isAuthenticated, async (req, res) => {
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
  app2.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications2 = await storage.getNotifications(userId);
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.patch("/api/notifications/:notificationId/read", isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.notificationId);
      await storage.markNotificationAsRead(notificationId);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.get("/api/notifications/unread-count", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const count2 = await storage.getUnreadNotificationCount(userId);
      res.json({ count: count2 });
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  });
  app2.get("/api/users/:identifier", isAuthenticated, async (req, res) => {
    try {
      const { identifier } = req.params;
      let user;
      if (/^\d+$/.test(identifier)) {
        user = await storage.getUser(identifier);
      } else {
        user = await storage.getUserByHandle(identifier);
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!user.avatarUrl && user.profileImageUrl) {
        user.avatarUrl = user.profileImageUrl;
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user by ID or handle:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/search/users", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.json([]);
      }
      const users2 = await storage.searchUsers(query);
      res.json(users2);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Failed to search users" });
    }
  });
  app2.get("/api/search/chirps", isAuthenticated, async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.json([]);
      }
      const chirps2 = await storage.searchChirps(query);
      res.json(chirps2);
    } catch (error) {
      console.error("Error searching chirps:", error);
      res.status(500).json({ message: "Failed to search chirps" });
    }
  });
  app2.post("/api/ai/weekly-summary", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const userChirps = await storage.getChirpsByUser(userId);
      const chirpCount = userChirps.length;
      const topChirp = userChirps.reduce((top, current) => {
        const topTotal = Object.values(top.reactionCounts).reduce((sum, count2) => sum + count2, 0);
        const currentTotal = Object.values(current.reactionCounts).reduce((sum, count2) => sum + count2, 0);
        return currentTotal > topTotal ? current : top;
      }, userChirps[0])?.content || "No chirps this week";
      const allReactions = {};
      userChirps.forEach((chirp) => {
        Object.entries(chirp.reactionCounts).forEach(([emoji, count2]) => {
          allReactions[emoji] = (allReactions[emoji] || 0) + count2;
        });
      });
      const topReactions = Object.entries(allReactions).sort(([, a], [, b]) => b - a).slice(0, 3).map(([emoji, count2]) => ({ emoji, count: count2 }));
      const summary = await generateWeeklySummary(userId, chirpCount, topChirp, topReactions);
      const aiChirp = await storage.createChirp({
        authorId: userId,
        // This will be replaced with AI user in production
        content: summary,
        isAiGenerated: true
      });
      res.json(aiChirp);
    } catch (error) {
      console.error("Error generating weekly summary:", error);
      res.status(500).json({ message: "Failed to generate weekly summary" });
    }
  });
  app2.post("/api/ai/generate-avatar", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
      const avatarUrl = await generateUserAvatar(userId, name);
      res.json({ avatarUrl });
    } catch (error) {
      console.error("Error generating avatar:", error);
      res.status(500).json({ message: "Failed to generate avatar" });
    }
  });
  app2.post("/api/ai/generate-banner", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const bannerUrl = await generateUserBanner(userId);
      res.json({ bannerUrl });
    } catch (error) {
      console.error("Error generating banner:", error);
      res.status(500).json({ message: "Failed to generate banner" });
    }
  });
  app2.post("/api/ai/generate-bio", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const handle = user?.hasCustomHandle && user?.customHandle ? user.customHandle : user?.handle;
      const { interests } = req.body;
      const bio = await generateUserBio(userId, handle || "user", interests);
      res.json({ bio });
    } catch (error) {
      console.error("Error generating bio:", error);
      res.status(500).json({ message: "Failed to generate bio" });
    }
  });
  app2.post("/api/ai/generate-interests", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const userChirps = await storage.getChirpsByUser(userId);
      const recentChirps = userChirps.slice(0, 10).map((chirp) => chirp.content);
      const interests = await generateUserInterests(userId, recentChirps);
      res.json({ interests });
    } catch (error) {
      console.error("Error generating interests:", error);
      res.status(500).json({ message: "Failed to generate interests" });
    }
  });
  app2.get("/api/ai/generation-limit", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const limitInfo = await storage.checkAiGenerationLimit(userId);
      res.json(limitInfo);
    } catch (error) {
      console.error("Error checking AI generation limit:", error);
      res.status(500).json({ message: "Failed to check generation limit" });
    }
  });
  app2.post("/api/ai/generate-personalized-profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
      const limitInfo = await storage.checkAiGenerationLimit(userId);
      if (!limitInfo.canGenerate) {
        return res.status(429).json({
          message: "Daily AI generation limit reached. Upgrade to Chirp+ for unlimited generations with premium AI models!",
          needsUpgrade: true
        });
      }
      const { personality, traits, interests, style, customPrompts } = req.body;
      const result = await generatePersonalizedProfile(
        userId,
        name,
        personality,
        traits,
        interests,
        style,
        customPrompts,
        limitInfo.isChirpPlus
      );
      if (!limitInfo.isChirpPlus) {
        await storage.incrementAiGeneration(userId);
      }
      await storage.updateUserProfile(userId, {
        avatarUrl: result.avatarUrl,
        profileImageUrl: result.avatarUrl,
        // Keep both for compatibility
        bannerImageUrl: result.bannerUrl,
        bio: result.bio,
        interests: result.interests
      });
      res.json({
        ...result,
        message: "Personalized AI profile generated successfully!"
      });
    } catch (error) {
      console.error("Error generating personalized profile:", error);
      res.status(500).json({ message: "Failed to generate personalized profile" });
    }
  });
  app2.patch("/api/users/bio", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bio } = req.body;
      await storage.updateUserProfile(userId, { bio });
      if (bio) {
        await processMentions(bio, userId, "mention_bio");
      }
      res.json({ message: "Bio updated successfully" });
    } catch (error) {
      console.error("Error updating bio:", error);
      res.status(500).json({ message: "Failed to update bio" });
    }
  });
  app2.patch("/api/users/name", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { firstName, lastName } = req.body;
      if (typeof firstName !== "string" || typeof lastName !== "string") {
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
  app2.post("/api/ai/generate-complete-profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const handle = user?.hasCustomHandle && user?.customHandle ? user.customHandle : user?.handle;
      const name = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User";
      const userChirps = await storage.getChirpsByUser(userId);
      const recentChirps = userChirps.slice(0, 10).map((chirp) => chirp.content);
      const [avatarUrl, bannerUrl, interests, bio] = await Promise.all([
        generateUserAvatar(userId, name, user?.isChirpPlus),
        generateUserBanner(userId, user?.isChirpPlus),
        generateUserInterests(userId, recentChirps),
        generateUserInterests(userId, recentChirps).then(
          (interests2) => generateUserBio(userId, handle || "user", interests2)
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
  app2.post("/api/handles/claim", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { customHandle } = req.body;
      if (!customHandle || typeof customHandle !== "string") {
        return res.status(400).json({ message: "Custom handle is required" });
      }
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(customHandle)) {
        return res.status(400).json({ message: "Handle must be 3-20 characters, alphanumeric and underscores only" });
      }
      await storage.claimCustomHandle(userId, customHandle);
      res.json({ message: "Custom handle claimed successfully" });
    } catch (error) {
      console.error("Error claiming custom handle:", error);
      res.status(400).json({ message: error.message || "Failed to claim custom handle" });
    }
  });
  app2.get("/api/handles/check/:handle", async (req, res) => {
    try {
      const { handle } = req.params;
      const isAvailable = await storage.isHandleAvailable(handle);
      res.json({ available: isAvailable });
    } catch (error) {
      console.error("Error checking handle availability:", error);
      res.status(500).json({ message: "Failed to check handle availability" });
    }
  });
  app2.post("/api/vip-codes/use", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { code } = req.body;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ message: "VIP code is required" });
      }
      const vipCodeResult = await storage.useVipCode(code, userId);
      if (vipCodeResult) {
        const { grantsChirpPlus, chirpPlusDurationMonths, description } = vipCodeResult;
        if (grantsChirpPlus) {
          const expiresAt = /* @__PURE__ */ new Date();
          expiresAt.setMonth(expiresAt.getMonth() + (chirpPlusDurationMonths || 1));
          await storage.updateUserChirpPlus(userId, true, expiresAt);
          res.json({
            message: `VIP code used! You now have ${chirpPlusDurationMonths} month${chirpPlusDurationMonths !== 1 ? "s" : ""} of Chirp+ access and can claim a custom handle.`,
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
  app2.patch("/api/users/link-in-bio", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { linkInBio } = req.body;
      if (linkInBio && typeof linkInBio !== "string") {
        return res.status(400).json({ message: "Link in bio must be a string" });
      }
      if (linkInBio && linkInBio.trim()) {
        try {
          const url = linkInBio.startsWith("http") ? linkInBio : `https://${linkInBio}`;
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
  app2.post("/api/users/agree-to-terms", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { agreedToTerms, agreedToPrivacy } = req.body;
      const updates = {};
      if (agreedToTerms) {
        updates.agreedToTerms = true;
        updates.termsAgreedAt = /* @__PURE__ */ new Date();
      }
      if (agreedToPrivacy) {
        updates.agreedToPrivacy = true;
        updates.privacyAgreedAt = /* @__PURE__ */ new Date();
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
  app2.post("/api/admin/create-influencer-code", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);
      if (!user?.email?.includes("kriselle.t@gmail.com")) {
        return res.status(403).json({ message: "Admin access required" });
      }
      const {
        influencerName,
        codePrefix = "INF",
        grantsChirpPlus = true,
        durationMonths = 3,
        quantity = 1
      } = req.body;
      if (!influencerName) {
        return res.status(400).json({ message: "Influencer name is required" });
      }
      const codes = [];
      for (let i = 0; i < quantity; i++) {
        const timestamp2 = Date.now().toString().slice(-6);
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `${codePrefix}${timestamp2}${randomSuffix}`;
        const codeData = await storage.createVipCode({
          code,
          codeType: "influencer",
          grantsChirpPlus,
          chirpPlusDurationMonths: durationMonths,
          createdBy: userId,
          description: `Influencer code for ${influencerName} - ${durationMonths} month${durationMonths !== 1 ? "s" : ""} Chirp+`
        });
        codes.push(codeData);
      }
      res.json({
        message: `Created ${quantity} influencer code${quantity !== 1 ? "s" : ""} for ${influencerName}`,
        codes: codes.map((c) => ({
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
  app2.post("/api/invitations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { inviteeEmail } = req.body;
      if (!inviteeEmail || typeof inviteeEmail !== "string") {
        return res.status(400).json({ message: "Invitee email is required" });
      }
      const inviteCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const invitation = await storage.createInvitation({
        inviterUserId: userId,
        inviteeEmail,
        inviteCode
      });
      res.json({
        message: "Invitation created successfully",
        inviteCode,
        invitation
      });
    } catch (error) {
      console.error("Error creating invitation:", error);
      res.status(500).json({ message: "Failed to create invitation" });
    }
  });
  app2.get("/api/invitations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const invitations2 = await storage.getInvitationsByUser(userId);
      res.json(invitations2);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      res.status(500).json({ message: "Failed to fetch invitations" });
    }
  });
  app2.post("/api/invitations/accept", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { inviteCode } = req.body;
      if (!inviteCode || typeof inviteCode !== "string") {
        return res.status(400).json({ message: "Invite code is required" });
      }
      await storage.acceptInvitation(inviteCode, userId);
      res.json({ message: "Invitation accepted successfully" });
    } catch (error) {
      console.error("Error accepting invitation:", error);
      res.status(400).json({ message: error.message || "Failed to accept invitation" });
    }
  });
  app2.post("/api/weekly-summary", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const now = /* @__PURE__ */ new Date();
      const currentDay = now.getDay();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - currentDay);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const existingSummary = await storage.getWeeklySummary(userId, weekStart);
      if (existingSummary) {
        return res.json(existingSummary);
      }
      const weeklyStats = await storage.getWeeklyChirpStats(userId, weekStart, weekEnd);
      let summaryText = "";
      let tone = "positive";
      let weeklyVibes = "good vibes";
      if (weeklyStats.chirpCount === 0) {
        summaryText = "\u25C6 This week you've been exploring and discovering. Sometimes the best insights come from listening! \u2605";
        tone = "observant";
        weeklyVibes = "contemplative";
      } else if (weeklyStats.chirpCount === 1) {
        summaryText = "\u25C6 Quality over quantity this week! Your single chirp made its mark in the community. \u2605";
        tone = "thoughtful";
        weeklyVibes = "focused energy";
      } else if (weeklyStats.chirpCount <= 3) {
        summaryText = `\u25C6 Steady vibes this week with ${weeklyStats.chirpCount} chirps! You're sharing thoughtful content. \u2605`;
        tone = "contemplative";
        weeklyVibes = "steady vibes";
      } else {
        summaryText = `\u25C6 Super active week with ${weeklyStats.chirpCount} chirps! Your energy is contagious in the community. \u2605`;
        tone = "energetic";
        weeklyVibes = "super active";
      }
      const summaryData = {
        userId,
        weekStartDate: weekStart.toISOString().split("T")[0],
        weekEndDate: weekEnd.toISOString().split("T")[0],
        chirpCount: weeklyStats.chirpCount,
        tone,
        topChirp: weeklyStats.topChirp || "",
        topReactions: weeklyStats.topReactions && Array.isArray(weeklyStats.topReactions) ? weeklyStats.topReactions : [],
        commonWords: weeklyStats.commonWords && Array.isArray(weeklyStats.commonWords) ? weeklyStats.commonWords : [],
        weeklyVibes,
        summaryText
      };
      const weeklySummary = await storage.createWeeklySummary(summaryData);
      res.json(weeklySummary);
    } catch (error) {
      console.error("Error generating weekly summary:", error);
      res.status(500).json({ message: "Failed to generate weekly summary" });
    }
  });
  app2.get("/api/weekly-summary/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
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
  app2.get("/api/weekly-summary/:userId", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user.claims.sub;
      if (userId !== requestingUserId) {
        return res.status(403).json({ message: "Cannot view other users' weekly summaries" });
      }
      const weeklySummary = await storage.getLatestWeeklySummary(userId);
      res.json(weeklySummary);
    } catch (error) {
      console.error("Error fetching weekly summary:", error);
      res.status(500).json({ message: "Failed to fetch weekly summary" });
    }
  });
  app2.post("/api/weekly-summary", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const now = /* @__PURE__ */ new Date();
      const currentDay = now.getDay();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - currentDay);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      const existingSummary = await storage.getWeeklySummary(userId, weekStart);
      if (existingSummary) {
        return res.json(existingSummary);
      }
      const weeklyStats = await storage.getWeeklyChirpStats(userId, weekStart, weekEnd);
      const aiSummary = await generateWeeklySummary(
        userId,
        weeklyStats.chirpCount,
        weeklyStats.topChirp || "No chirps this week",
        weeklyStats.topReactions,
        weeklyStats.commonWords,
        "positive"
      );
      const summaryData = {
        userId,
        weekStartDate: weekStart.toISOString().split("T")[0],
        weekEndDate: weekEnd.toISOString().split("T")[0],
        chirpCount: weeklyStats.chirpCount,
        tone: aiSummary.analysis.tone,
        topChirp: weeklyStats.topChirp,
        topReactions: weeklyStats.topReactions,
        commonWords: weeklyStats.commonWords,
        weeklyVibes: aiSummary.analysis.weeklyVibes,
        summaryText: aiSummary.summary
      };
      const weeklySummary = await storage.createWeeklySummary(summaryData);
      res.json(weeklySummary);
    } catch (error) {
      console.error("Error generating weekly summary:", error);
      res.status(500).json({ message: "Failed to generate weekly summary" });
    }
  });
  app2.patch("/api/users/chirpplus/badge", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { showBadge } = req.body;
      if (typeof showBadge !== "boolean") {
        return res.status(400).json({ message: "showBadge must be a boolean" });
      }
      const user = await storage.updateChirpPlusBadgeVisibility(userId, showBadge);
      res.json(user);
    } catch (error) {
      console.error("Error updating badge visibility:", error);
      res.status(500).json({ message: "Failed to update badge visibility" });
    }
  });
  app2.post("/api/create-subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.isChirpPlus) {
        return res.status(400).json({ message: "User already has Chirp+ subscription" });
      }
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || void 0,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || void 0,
          metadata: {
            userId
          }
        });
        customerId = customer.id;
        await storage.updateUserStripeInfo(userId, customerId);
      }
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: "Chirp+ Premium Subscription",
              description: "Premium features including handle changes, exclusive badge, and premium AI models"
            },
            unit_amount: 499,
            // $4.99 in cents
            recurring: {
              interval: "month"
            }
          }
        }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"]
      });
      await storage.updateUserStripeInfo(userId, customerId, subscription.id);
      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });
  app2.get("/api/subscription", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.stripeSubscriptionId) {
        return res.status(404).json({ message: "No subscription found" });
      }
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      res.json({
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });
    } catch (error) {
      console.error("Error fetching subscription:", error);
      res.status(500).json({ message: "Failed to fetch subscription details" });
    }
  });
  app2.post("/api/subscription/cancel", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user?.stripeSubscriptionId) {
        return res.status(404).json({ message: "No subscription found" });
      }
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
      res.json({
        message: "Subscription will be cancelled at the end of the billing period",
        subscription: {
          id: subscription.id,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: subscription.current_period_end
        }
      });
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });
  app2.patch("/api/users/handle", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { newHandle } = req.body;
      const user = await storage.getUser(userId);
      if (!user?.isChirpPlus) {
        return res.status(403).json({ message: "Chirp+ subscription required to change handles" });
      }
      if (!newHandle || typeof newHandle !== "string") {
        return res.status(400).json({ message: "Handle is required" });
      }
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(newHandle)) {
        return res.status(400).json({ message: "Handle must be 3-20 characters, letters, numbers, and underscores only" });
      }
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
  app2.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
    } catch (err) {
      console.log(`Webhook signature verification failed.`, err);
      return res.status(400).send(`Webhook Error: ${err}`);
    }
    try {
      switch (event.type) {
        case "invoice.payment_succeeded":
          const invoice = event.data.object;
          if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            const customerId = subscription.customer;
            const user = await storage.getUserByStripeCustomerId(customerId);
            if (user) {
              const expiresAt = new Date(subscription.current_period_end * 1e3);
              await storage.updateUserChirpPlus(user.id, true, expiresAt);
            }
          }
          break;
        case "invoice.payment_failed":
          const failedInvoice = event.data.object;
          console.log("Payment failed for invoice:", failedInvoice.id);
          break;
        case "customer.subscription.deleted":
          const deletedSub = event.data.object;
          const cancelCustomerId = deletedSub.customer;
          const cancelUser = await storage.getUserByStripeCustomerId(cancelCustomerId);
          if (cancelUser) {
            await storage.updateUserChirpPlus(cancelUser.id, false);
          }
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({ error: "Webhook handler failed" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/scheduler.ts
init_analyticsService();
import cron from "node-cron";
function initializeScheduler() {
  cron.schedule("0 12 * * 6", async () => {
    console.log("Starting weekly analytics generation at", (/* @__PURE__ */ new Date()).toISOString());
    try {
      await sendWeeklyAnalyticsToAllUsers();
      console.log("Weekly analytics generation completed successfully");
    } catch (error) {
      console.error("Error in weekly analytics generation:", error);
    }
  }, {
    scheduled: true,
    timezone: "America/New_York"
    // Adjust timezone as needed
  });
  console.log("Weekly analytics scheduler initialized - will run every Saturday at 12:00 PM");
  return {
    triggerWeeklyAnalytics: sendWeeklyAnalyticsToAllUsers
  };
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
    initializeScheduler();
  });
})();
