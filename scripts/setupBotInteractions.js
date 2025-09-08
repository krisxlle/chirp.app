#!/usr/bin/env node

/**
 * Bot Interaction Service
 * 
 * This script sets up comprehensive bot interactions:
 * - All bots follow each other and the Chirp account
 * - Bots like each other's recent chirps
 * - Bots occasionally comment on each other's posts
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

const supabase = createClient(supabaseUrl, supabaseKey);

// Bot configuration
const BOT_ACCOUNTS = [
  'crimsontalon',
  'solarius', 
  'prisma',
  'skye',
  'thorne',
  'obsidian'
];

const MAIN_CHIRP_ACCOUNT = 'chirp'; // Assuming this is the main account

// Bot interaction templates
const COMMENT_TEMPLATES = {
  solarius: [
    "this is so uplifting! ✨",
    "love the positive vibes! ☀️",
    "this made my day brighter! 🌟",
    "such good energy! 💫",
    "you're spreading joy! 🪶"
  ],
  prisma: [
    "this really makes me think... 🤔",
    "interesting perspective! 💭",
    "what do others think about this? 💜",
    "this sparks curiosity! 🪶",
    "makes me reflect on my own views ✨"
  ],
  skye: [
    "solid business insight! 💼",
    "great point about the market 📈",
    "this is valuable information! 💰",
    "excellent analysis! 📊",
    "very informative post! 🪶"
  ],
  thorne: [
    "this is important! 🌱",
    "love seeing activism content! ✊",
    "this matters for change! 🌍",
    "powerful message! 💚",
    "standing with you on this! 🪶"
  ],
  obsidian: [
    "relatable! 😅",
    "this is too real 💀",
    "why is this so accurate? 🥚",
    "felt this in my soul 😂",
    "mood! 🪶"
  ],
  crimsontalon: [
    "excellent content! 🔥",
    "great post! ⚡",
    "love this! 🪶",
    "amazing! ✨",
    "fantastic! 💫"
  ]
};

class BotInteractionService {
  constructor() {
    this.botUserIds = new Map();
  }

  async initializeBotUserIds() {
    console.log('🔍 Getting bot user IDs...');
    
    for (const botUsername of BOT_ACCOUNTS) {
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('id')
          .eq('handle', botUsername)
          .single();

        if (error || !user) {
          console.error(`❌ Could not find user ID for ${botUsername}:`, error);
          continue;
        }

        this.botUserIds.set(botUsername, user.id);
        console.log(`✅ Found ${botUsername}: ${user.id}`);
      } catch (error) {
        console.error(`❌ Error getting user ID for ${botUsername}:`, error);
      }
    }

    // Also get the main Chirp account
    try {
      const { data: chirpUser, error } = await supabase
        .from('users')
        .select('id')
        .eq('handle', MAIN_CHIRP_ACCOUNT)
        .single();

      if (chirpUser) {
        this.botUserIds.set(MAIN_CHIRP_ACCOUNT, chirpUser.id);
        console.log(`✅ Found ${MAIN_CHIRP_ACCOUNT}: ${chirpUser.id}`);
      }
    } catch (error) {
      console.error(`❌ Error getting Chirp account ID:`, error);
    }
  }

  async setupBotFollowing() {
    console.log('🤝 Setting up bot following relationships...');
    
    const allAccounts = [...BOT_ACCOUNTS, MAIN_CHIRP_ACCOUNT];
    
    for (const followerUsername of allAccounts) {
      const followerId = this.botUserIds.get(followerUsername);
      if (!followerId) {
        console.log(`⚠️ Skipping ${followerUsername} - no user ID found`);
        continue;
      }

      for (const followingUsername of allAccounts) {
        if (followerUsername === followingUsername) continue;
        
        const followingId = this.botUserIds.get(followingUsername);
        if (!followingId) continue;

        try {
          // Check if already following
          const { data: existingFollow } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', followerId)
            .eq('following_id', followingId)
            .single();

          if (existingFollow) {
            console.log(`✅ ${followerUsername} already follows ${followingUsername}`);
            continue;
          }

          // Create follow relationship
          const { error } = await supabase
            .from('follows')
            .insert({
              follower_id: followerId,
              following_id: followingId,
              created_at: new Date().toISOString()
            });

          if (error) {
            console.error(`❌ Error creating follow from ${followerUsername} to ${followingUsername}:`, error);
          } else {
            console.log(`✅ ${followerUsername} now follows ${followingUsername}`);
          }
        } catch (error) {
          console.error(`❌ Error setting up follow from ${followerUsername} to ${followingUsername}:`, error);
        }
      }
    }
  }

  async likeRecentChirps() {
    console.log('❤️ Setting up bot likes on recent chirps...');
    
    // Get recent chirps from all bots (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    for (const botUsername of BOT_ACCOUNTS) {
      const botId = this.botUserIds.get(botUsername);
      if (!botId) continue;

      try {
        // Get recent chirps from this bot
        const { data: chirps, error: chirpsError } = await supabase
          .from('chirps')
          .select('id, author_id')
          .eq('author_id', botId)
          .gte('created_at', oneDayAgo)
          .order('created_at', { ascending: false })
          .limit(5);

        if (chirpsError || !chirps) {
          console.log(`⚠️ No recent chirps found for ${botUsername}`);
          continue;
        }

        // Have other bots like these chirps
        for (const chirp of chirps) {
          for (const likerUsername of BOT_ACCOUNTS) {
            if (likerUsername === botUsername) continue; // Don't like own chirps
            
            const likerId = this.botUserIds.get(likerUsername);
            if (!likerId) continue;

            try {
              // Check if already liked
              const { data: existingLike } = await supabase
                .from('reactions')
                .select('id')
                .eq('user_id', likerId)
                .eq('chirp_id', chirp.id)
                .eq('type', 'like')
                .single();

              if (existingLike) {
                console.log(`✅ ${likerUsername} already liked ${botUsername}'s chirp`);
                continue;
              }

              // Create like
              const { error } = await supabase
                .from('reactions')
                .insert({
                  user_id: likerId,
                  chirp_id: chirp.id,
                  type: 'like',
                  created_at: new Date().toISOString()
                });

              if (error) {
                console.error(`❌ Error creating like from ${likerUsername} on ${botUsername}'s chirp:`, error);
              } else {
                console.log(`✅ ${likerUsername} liked ${botUsername}'s chirp`);
              }
            } catch (error) {
              console.error(`❌ Error setting up like from ${likerUsername} on ${botUsername}'s chirp:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing chirps for ${botUsername}:`, error);
      }
    }
  }

  async addOccasionalComments() {
    console.log('💬 Adding occasional bot comments...');
    
    // Get recent chirps from all bots (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    for (const botUsername of BOT_ACCOUNTS) {
      const botId = this.botUserIds.get(botUsername);
      if (!botId) continue;

      try {
        // Get recent chirps from this bot
        const { data: chirps, error: chirpsError } = await supabase
          .from('chirps')
          .select('id, author_id')
          .eq('author_id', botId)
          .gte('created_at', oneDayAgo)
          .order('created_at', { ascending: false })
          .limit(3);

        if (chirpsError || !chirps) {
          console.log(`⚠️ No recent chirps found for ${botUsername}`);
          continue;
        }

        // Have other bots occasionally comment (20% chance per chirp)
        for (const chirp of chirps) {
          for (const commenterUsername of BOT_ACCOUNTS) {
            if (commenterUsername === botUsername) continue; // Don't comment on own chirps
            
            // 20% chance to comment
            if (Math.random() > 0.2) continue;
            
            const commenterId = this.botUserIds.get(commenterUsername);
            if (!commenterId) continue;

            try {
              // Check if already commented
              const { data: existingComment } = await supabase
                .from('chirps')
                .select('id')
                .eq('author_id', commenterId)
                .eq('reply_to_id', chirp.id)
                .single();

              if (existingComment) {
                console.log(`✅ ${commenterUsername} already commented on ${botUsername}'s chirp`);
                continue;
              }

              // Get a random comment template
              const templates = COMMENT_TEMPLATES[commenterUsername] || COMMENT_TEMPLATES.crimsontalon;
              const randomComment = templates[Math.floor(Math.random() * templates.length)];

              // Create comment
              const { error } = await supabase
                .from('chirps')
                .insert({
                  author_id: commenterId,
                  content: randomComment,
                  reply_to_id: chirp.id,
                  created_at: new Date().toISOString()
                });

              if (error) {
                console.error(`❌ Error creating comment from ${commenterUsername} on ${botUsername}'s chirp:`, error);
              } else {
                console.log(`✅ ${commenterUsername} commented "${randomComment}" on ${botUsername}'s chirp`);
              }
            } catch (error) {
              console.error(`❌ Error setting up comment from ${commenterUsername} on ${botUsername}'s chirp:`, error);
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing chirps for comments from ${botUsername}:`, error);
      }
    }
  }

  async runFullBotInteraction() {
    console.log('🤖 Starting full bot interaction setup...');
    
    try {
      await this.initializeBotUserIds();
      await this.setupBotFollowing();
      await this.likeRecentChirps();
      await this.addOccasionalComments();
      
      console.log('✅ Bot interaction setup complete!');
    } catch (error) {
      console.error('❌ Error in bot interaction setup:', error);
    }
  }
}

// Run the bot interaction service
const botService = new BotInteractionService();
botService.runFullBotInteraction();
