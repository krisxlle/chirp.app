CREATE TABLE "chirps" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_id" varchar NOT NULL,
	"content" text NOT NULL,
	"is_ai_generated" boolean DEFAULT false,
	"is_weekly_summary" boolean DEFAULT false,
	"reply_to_id" integer,
	"repost_of_id" integer,
	"thread_id" integer,
	"thread_order" integer DEFAULT 0,
	"is_thread_starter" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar,
	"email" varchar,
	"category" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"message" text NOT NULL,
	"location" varchar,
	"user_agent" text,
	"resolved" boolean DEFAULT false,
	"admin_notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" serial PRIMARY KEY NOT NULL,
	"follower_id" varchar NOT NULL,
	"following_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "link_shares" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"share_code" varchar NOT NULL,
	"clicker_ip" varchar,
	"clicker_user_agent" varchar,
	"is_valid_click" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"clicked_at" timestamp,
	CONSTRAINT "link_shares_share_code_unique" UNIQUE("share_code")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"from_user_id" varchar,
	"chirp_id" integer,
	"read" boolean DEFAULT false,
	"push_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "push_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"platform" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"last_used" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"chirp_id" integer NOT NULL,
	"emoji" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reposts" (
	"id" serial PRIMARY KEY NOT NULL,
	"chirp_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "reposts_chirp_id_user_id_unique" UNIQUE("chirp_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"blocker_id" varchar NOT NULL,
	"blocked_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_blocks_blocker_id_blocked_id_unique" UNIQUE("blocker_id","blocked_id")
);
--> statement-breakpoint
CREATE TABLE "user_notification_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"followed_user_id" varchar NOT NULL,
	"notify_on_post" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"phone" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"avatar_url" varchar,
	"banner_image_url" varchar,
	"bio" text,
	"link_in_bio" varchar,
	"interests" text[],
	"handle" varchar NOT NULL,
	"custom_handle" varchar,
	"has_custom_handle" boolean DEFAULT false,
	"link_shares" integer DEFAULT 0,
	"vip_code_used" boolean DEFAULT false,
	"last_ai_generation_date" timestamp,
	"ai_generations_today" integer DEFAULT 0,
	"agreed_to_terms" boolean DEFAULT false,
	"agreed_to_privacy" boolean DEFAULT false,
	"terms_agreed_at" timestamp,
	"privacy_agreed_at" timestamp,
	"weekly_analytics_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"crystal_balance" integer DEFAULT 500000,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone"),
	CONSTRAINT "users_handle_unique" UNIQUE("handle"),
	CONSTRAINT "users_custom_handle_unique" UNIQUE("custom_handle")
);
--> statement-breakpoint
CREATE TABLE "vip_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar NOT NULL,
	"is_used" boolean DEFAULT false,
	"used_by_user_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"used_at" timestamp,
	CONSTRAINT "vip_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "weekly_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"week_start_date" varchar NOT NULL,
	"week_end_date" varchar NOT NULL,
	"chirp_count" integer DEFAULT 0 NOT NULL,
	"tone" varchar DEFAULT 'positive' NOT NULL,
	"top_chirp" text,
	"top_reactions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"common_words" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"weekly_vibes" varchar DEFAULT 'positive energy' NOT NULL,
	"summary_text" text NOT NULL,
	"chirp_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chirps" ADD CONSTRAINT "chirps_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chirps" ADD CONSTRAINT "chirps_reply_to_id_chirps_id_fk" FOREIGN KEY ("reply_to_id") REFERENCES "public"."chirps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chirps" ADD CONSTRAINT "chirps_repost_of_id_chirps_id_fk" FOREIGN KEY ("repost_of_id") REFERENCES "public"."chirps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chirps" ADD CONSTRAINT "chirps_thread_id_chirps_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."chirps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_shares" ADD CONSTRAINT "link_shares_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_chirp_id_chirps_id_fk" FOREIGN KEY ("chirp_id") REFERENCES "public"."chirps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reactions" ADD CONSTRAINT "reactions_chirp_id_chirps_id_fk" FOREIGN KEY ("chirp_id") REFERENCES "public"."chirps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reposts" ADD CONSTRAINT "reposts_chirp_id_chirps_id_fk" FOREIGN KEY ("chirp_id") REFERENCES "public"."chirps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reposts" ADD CONSTRAINT "reposts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocker_id_users_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_blocked_id_users_id_fk" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_followed_user_id_users_id_fk" FOREIGN KEY ("followed_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vip_codes" ADD CONSTRAINT "vip_codes_used_by_user_id_users_id_fk" FOREIGN KEY ("used_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_summaries" ADD CONSTRAINT "weekly_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "weekly_summaries" ADD CONSTRAINT "weekly_summaries_chirp_id_chirps_id_fk" FOREIGN KEY ("chirp_id") REFERENCES "public"."chirps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");