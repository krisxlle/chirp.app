import { relations } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    jsonb,
    pgTable,
    serial,
    text,
    timestamp,
    unique,
    varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  phone: varchar("phone").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  avatarUrl: varchar("avatar_url"), // For AI-generated avatars
  bannerImageUrl: varchar("banner_image_url"),
  bio: text("bio"),
  linkInBio: varchar("link_in_bio"),
  interests: text("interests").array(),
  handle: varchar("handle").unique().notNull(), // Auto-generated random handle
  customHandle: varchar("custom_handle").unique(), // Custom handle after sharing to 3 people or VIP code
  hasCustomHandle: boolean("has_custom_handle").default(false),
  linkShares: integer("link_shares").default(0), // Number of people who clicked their shared link
  vipCodeUsed: boolean("vip_code_used").default(false),
  // AI generation tracking
  lastAiGenerationDate: timestamp("last_ai_generation_date"),
  aiGenerationsToday: integer("ai_generations_today").default(0),
  // Legal agreement tracking
  agreedToTerms: boolean("agreed_to_terms").default(false),
  agreedToPrivacy: boolean("agreed_to_privacy").default(false),
  termsAgreedAt: timestamp("terms_agreed_at"),
  privacyAgreedAt: timestamp("privacy_agreed_at"),
  // Email preferences
  weeklyAnalyticsEnabled: boolean("weekly_analytics_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  crystalBalance: integer("crystal_balance").default(100),
});

export const chirps = pgTable("chirps", {
  id: serial("id").primaryKey(),
  authorId: varchar("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false),
  isWeeklySummary: boolean("is_weekly_summary").default(false),
  replyToId: integer("reply_to_id").references(() => chirps.id, { onDelete: "cascade" }),
  repostOfId: integer("repost_of_id").references(() => chirps.id, { onDelete: "cascade" }),
  threadId: integer("thread_id").references(() => chirps.id, { onDelete: "cascade" }),
  threadOrder: integer("thread_order").default(0),
  isThreadStarter: boolean("is_thread_starter").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reactions = pgTable("reactions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  chirpId: integer("chirp_id").notNull().references(() => chirps.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // Ensure one like per user per chirp
  uniqueUserChirp: unique("unique_user_chirp").on(table.userId, table.chirpId),
}));

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(), // 'follow', 'reaction', 'mention', 'reply', 'mention_bio', 'repost', 'weekly_summary'
  fromUserId: varchar("from_user_id").references(() => users.id, { onDelete: "cascade" }),
  chirpId: integer("chirp_id").references(() => chirps.id, { onDelete: "cascade" }),
  read: boolean("read").default(false),
  pushSent: boolean("push_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Push notification tokens for mobile devices
export const pushTokens = pgTable("push_tokens", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token").notNull(),
  platform: varchar("platform").notNull(), // 'ios', 'android', 'web'
  createdAt: timestamp("created_at").defaultNow(),
  lastUsed: timestamp("last_used").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  email: varchar("email"),
  category: varchar("category").notNull(), // 'feature_request', 'bug_report', 'general', 'contact'
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  location: varchar("location"), // Which page/section they submitted from
  userAgent: text("user_agent"),
  resolved: boolean("resolved").default(false),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invite codes table for VIP access
export const vipCodes = pgTable("vip_codes", {
  id: serial("id").primaryKey(),
  code: varchar("code").unique().notNull(),
  isUsed: boolean("is_used").default(false),
  usedByUserId: varchar("used_by_user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
});

// Link shares tracking table
export const linkShares = pgTable("link_shares", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  shareCode: varchar("share_code").unique().notNull(),
  clickerIp: varchar("clicker_ip"),
  clickerUserAgent: varchar("clicker_user_agent"),
  isValidClick: boolean("is_valid_click").default(true), // false if from same IP/device
  createdAt: timestamp("created_at").defaultNow(),
  clickedAt: timestamp("clicked_at"),
});

// Weekly summaries table
export const weeklySummaries = pgTable("weekly_summaries", {
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
  createdAt: timestamp("created_at").defaultNow(),
});

// User blocks table
export const userBlocks = pgTable("user_blocks", {
  id: serial("id").primaryKey(),
  blockerId: varchar("blocker_id").notNull().references(() => users.id),
  blockedId: varchar("blocked_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueBlock: unique().on(table.blockerId, table.blockedId),
}));

export type InsertUserBlock = typeof userBlocks.$inferInsert;
export type UserBlock = typeof userBlocks.$inferSelect;

// Reposts table for chirp reposts
export const reposts = pgTable("reposts", {
  id: serial("id").primaryKey(),
  chirpId: integer("chirp_id").notNull().references(() => chirps.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  uniqueRepost: unique().on(table.chirpId, table.userId),
}));

export type InsertRepost = typeof reposts.$inferInsert;
export type Repost = typeof reposts.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  chirps: many(chirps),
  following: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
  reactions: many(reactions),
  notifications: many(notifications),
  blocking: many(userBlocks, { relationName: "blocker" }),
  blockedBy: many(userBlocks, { relationName: "blocked" }),
}));

export const chirpsRelations = relations(chirps, ({ one, many }) => ({
  author: one(users, {
    fields: [chirps.authorId],
    references: [users.id],
  }),
  reactions: many(reactions),
  replyTo: one(chirps, {
    fields: [chirps.replyToId],
    references: [chirps.id],
    relationName: "replyTo",
  }),
  repostOf: one(chirps, {
    fields: [chirps.repostOfId],
    references: [chirps.id],
    relationName: "repostOf",
  }),
  replies: many(chirps, { relationName: "replyTo" }),
  reposts: many(chirps, { relationName: "repostOf" }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
  chirp: one(chirps, {
    fields: [reactions.chirpId],
    references: [chirps.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  fromUser: one(users, {
    fields: [notifications.fromUserId],
    references: [users.id],
  }),
  chirp: one(chirps, {
    fields: [notifications.chirpId],
    references: [chirps.id],
  }),
}));

export const vipCodesRelations = relations(vipCodes, ({ one }) => ({
  usedByUser: one(users, {
    fields: [vipCodes.usedByUserId],
    references: [users.id],
  }),
}));

export const linkSharesRelations = relations(linkShares, ({ one }) => ({
  user: one(users, {
    fields: [linkShares.userId],
    references: [users.id],
  }),
}));

export const weeklySummariesRelations = relations(weeklySummaries, ({ one }) => ({
  user: one(users, {
    fields: [weeklySummaries.userId],
    references: [users.id],
  }),
  chirp: one(chirps, {
    fields: [weeklySummaries.chirpId],
    references: [chirps.id],
  }),
}));

export const userBlocksRelations = relations(userBlocks, ({ one }) => ({
  blocker: one(users, {
    fields: [userBlocks.blockerId],
    references: [users.id],
    relationName: "blocker",
  }),
  blocked: one(users, {
    fields: [userBlocks.blockedId],
    references: [users.id],
    relationName: "blocked",
  }),
}));

// Schemas
export const insertChirpSchema = createInsertSchema(chirps).omit({
  id: true,
  createdAt: true,
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true,
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  pushSent: true,
});

export const insertPushTokenSchema = createInsertSchema(pushTokens, {
  userId: z.string(),
  token: z.string(),
  platform: z.string(),
}).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

// Push token relations  
export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
  user: one(users, {
    fields: [pushTokens.userId],
    references: [users.id],
  }),
}));

// Types
export type PushToken = typeof pushTokens.$inferSelect;
export type InsertPushToken = z.infer<typeof insertPushTokenSchema>;



export const insertVipCodeSchema = createInsertSchema(vipCodes).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export const insertLinkShareSchema = createInsertSchema(linkShares).omit({
  id: true,
  createdAt: true,
  clickedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback, {
  email: z.string().optional().refine((val) => {
    if (!val || val === '') return true; // Allow empty/undefined
    return z.string().email().safeParse(val).success; // Validate email format if provided
  }, {
    message: "Please enter a valid email address or leave empty"
  }),
}).omit({
  id: true,
  createdAt: true,
  resolved: true,
  adminNotes: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const userNotificationSettings = pgTable("user_notification_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followedUserId: varchar("followed_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  notifyOnPost: boolean("notify_on_post").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;
export type UserNotificationSetting = typeof userNotificationSettings.$inferSelect;
export type InsertUserNotificationSetting = typeof userNotificationSettings.$inferInsert;
export type WeeklySummary = typeof weeklySummaries.$inferSelect;
export type InsertWeeklySummary = typeof weeklySummaries.$inferInsert;
export type Chirp = typeof chirps.$inferSelect;
export type InsertChirp = z.infer<typeof insertChirpSchema>;
export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type VipCode = typeof vipCodes.$inferSelect;
export type InsertVipCode = z.infer<typeof insertVipCodeSchema>;
export type LinkShare = typeof linkShares.$inferSelect;
export type InsertLinkShare = z.infer<typeof insertLinkShareSchema>;
export type InsertFeedbackType = z.infer<typeof insertFeedbackSchema>;
