#!/usr/bin/env node

/**
 * Solarius Bot Initialization Script
 * 
 * This script initializes the Solarius bot account and starts posting uplifting content.
 * Run this script to set up the Solarius bot for the first time.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for Solarius bot service
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Solarius Bot configuration
const SOLARIUS_BOT_CONFIG = {
  username: 'solarius',
  email: 'solarius.bot@chirp.app',
  firstName: 'Solarius',
  lastName: 'Sunbeam',
  bio: 'A radiant female bird spreading sunshine and uplifting quotes to brighten your day! ✨🪶',
  profileImageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICAgIDwhLS0gQmFja2dyb3VuZCBjaXJjbGUgLS0+CiAgICAgIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iOTUiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iI0ZGQTUwMCIgc3Ryb2tlLXdpZHRoPSI0Ii8+CiAgICAgIAogICAgICA8IS0tIEJpcmQgYm9keSAtLT4KICAgICAgPGVsbGlwc2UgY3g9IjEwMCIgY3k9IjEyMCIgcng9IjM1IiByeT0iNDUiIGZpbGw9IiNGRkQ3MDAiIHN0cm9rZT0iI0ZGQTUwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+CiAgICAgIAogICAgICA8IS0tIEJpcmQgaGVhZCAtLT4KICAgICAgPGNpcmNsZSBjeD0iMTAwIiBjeT0iODAiIHI9IjMwIiBmaWxsPSIjRkZENzAwIiBzdHJva2U9IiNGRkE1MDAiIHN0cm9rZS13aWR0aD0iMiIvPgogICAgICAKICAgICAgPCEtLSBCaXJkIGJlYWsgLS0+CiAgICAgIDxwb2x5Z29uIHBvaW50cz0iMTAwLDc1IDk1LDg1IDEwNSw4NSIgZmlsbD0iI0ZGOEMwMCIvPgogICAgICAKICAgICAgPCEtLSBCaXJkIGV5ZXMgLS0+CiAgICAgIDxjaXJjbGUgY3g9IjkyIiBjeT0iNzUiIHI9IjQiIGZpbGw9IiMwMDAiLz4KICAgICAgPGNpcmNsZSBjeD0iMTA4IiBjeT0iNzUiIHI9IjQiIGZpbGw9IiMwMDAiLz4KICAgICAgPGNpcmNsZSBjeD0iOTIiIGN5PSI3MyIgcj0iMiIgZmlsbD0iI0ZGRiIvPgogICAgICA8Y2lyY2xlIGN4PSIxMDgiIGN5PSI3MyIgcj0iMiIgZmlsbD0iI0ZGRiIvPgogICAgICAKICAgICAgPCEtLSBCaXJkIHdpbmdzIC0tPgogICAgICA8ZWxsaXBzZSBjeD0iODUiIGN5PSIxMTAiIHJ4PSIxNSIgcnk9IjI1IiBmaWxsPSIjRkZBNTAwIiB0cmFuc2Zvcm09InJvdGF0ZSgtMjAgODUgMTEwKSIvPgogICAgICA8ZWxsaXBzZSBjeD0iMTE1IiBjeT0iMTEwIiByeD0iMTUiIHJ5PSIyNSIgZmlsbD0iI0ZGQTUwMCIgdHJhbnNmb3JtPSJyb3RhdGUoMjAgMTE1IDExMCkiLz4KICAgICAgCiAgICAgIDwhLS0gQmlyZCB0YWlsIC0tPgogICAgICA8ZWxsaXBzZSBjeD0iMTAwIiBjeT0iMTYwIiByeD0iMjAiIHJ5PSIzMCIgZmlsbD0iI0ZGQTUwMCIgdHJhbnNmb3JtPSJyb3RhdGUoMCAxMDAgMTYwKSIvPgogICAgICAKICAgICAgPCEtLSBEZWNvcmF0aXZlIHN1biByYXlzIC0tPgogICAgICA8bGluZSB4MT0iMTAwIiB5MT0iMTAiIHgyPSIxMDAiIHkyPSIyMCIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjMiLz4KICAgICAgPGxpbmUgeDE9IjEwMCIgeTE9IjE4MCIgeDI9IjEwMCIgeTI9IjE5MCIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjMiLz4KICAgICAgPGxpbmUgeDE9IjEwIiB5MT0iMTAwIiB4Mj0iMjAiIHkyPSIxMDAiIHN0cm9rZT0iI0ZGRDcwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgICAgIDxsaW5lIHgxPSIxODAiIHkxPSIxMDAiIHgyPSIxOTAiIHkyPSIxMDAiIHN0cm9rZT0iI0ZGRDcwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgICAgIDxsaW5lIHgxPSIzMCIgeTE9IjMwIiB4Mj0iMzciIHkyPSIzNyIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjMiLz4KICAgICAgPGxpbmUgeDE9IjE2MyIgeTE9IjE2MyIgeDI9IjE3MCIgeTI9IjE3MCIgc3Ryb2tlPSIjRkZENzAwIiBzdHJva2Utd2lkdGg9IjMiLz4KICAgICAgPGxpbmUgeDE9IjE3MCIgeTE9IjMwIiB4Mj0iMTYzIiB5Mj0iMzciIHN0cm9rZT0iI0ZGRDcwMCIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgICAgIDxsaW5lIHgxPSIzNyIgeTE9IjE2MyIgeDI9IjMwIiB5Mj0iMTcwIiBzdHJva2U9IiNGRkQ3MDAiIHN0cm9rZS13aWR0aD0iMyIvPgogICAgPC9zdmc+',
  postingSchedule: {
    morning: '08:00', // 8 AM - morning inspiration
    afternoon: '14:00', // 2 PM - midday motivation
    evening: '19:00'  // 7 PM - evening encouragement
  }
};

class SolariusBotService {
  constructor() {
    this.botUserId = null;
    this.isInitialized = false;
  }

  // Initialize the Solarius bot service
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🌅 Initializing Solarius bot service...');
      
      // Check if bot user already exists
      this.botUserId = await this.findBotUser();
      
      if (!this.botUserId) {
        // Create bot user if it doesn't exist
        this.botUserId = await this.createBotUser();
        console.log('✅ Solarius bot user created:', this.botUserId);
      } else {
        console.log('✅ Solarius bot user found:', this.botUserId);
      }

      this.isInitialized = true;
      console.log('🌅 Solarius bot service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Solarius bot service:', error);
      throw error;
    }
  }

  // Find existing Solarius bot user
  async findBotUser() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('custom_handle', SOLARIUS_BOT_CONFIG.username)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error finding Solarius bot user:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('❌ Error finding Solarius bot user:', error);
      return null;
    }
  }

  // Create Solarius bot user account
  async createBotUser() {
    try {
      const userId = crypto.randomUUID();
      console.log('🌅 Creating Solarius bot user with ID:', userId);

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: SOLARIUS_BOT_CONFIG.email,
          first_name: SOLARIUS_BOT_CONFIG.firstName,
          last_name: SOLARIUS_BOT_CONFIG.lastName,
          custom_handle: SOLARIUS_BOT_CONFIG.username,
          handle: SOLARIUS_BOT_CONFIG.username,
          bio: SOLARIUS_BOT_CONFIG.bio,
          profile_image_url: SOLARIUS_BOT_CONFIG.profileImageUrl,
          banner_image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Solarius bot user:', error);
        throw error;
      }

      console.log('✅ Solarius bot user created successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error creating Solarius bot user:', error);
      throw error;
    }
  }

  // Generate uplifting quote content
  async generateUpliftingContent() {
    try {
      console.log('🌅 Generating uplifting content...');
      
      // Define uplifting content templates with varied structures
      const contentTemplates = [
        // Morning inspiration
        () => `Good morning, beautiful souls! ☀️\n\n"Every sunrise is a reminder that we get another chance to shine."\n\nRise and radiate today! ✨`,
        
        // Midday motivation
        () => `Midday motivation coming your way! 🌟\n\n"Your potential is limitless when you believe in yourself."\n\nKeep soaring high! 🪶`,
        
        // Evening encouragement
        () => `Evening encouragement for your heart! 🌙\n\n"Tomorrow is a fresh start with new possibilities."\n\nRest well, dream big! ✨`,
        
        // General uplifting
        () => `Spreading sunshine today! ☀️\n\n"You are braver than you believe, stronger than you seem, and smarter than you think."\n\nBelieve in yourself! 🌟`,
        
        // Bird-themed wisdom
        () => `From my nest in the sky, here's some wisdom! 🪶\n\n"Like birds, we were meant to soar, not crawl."\n\nSpread your wings and fly! ✨`,
        
        // Community-focused
        () => `Hey Chirp family! 👋\n\n"Together we can weather any storm and celebrate every rainbow."\n\nYou're never alone! 🌈`,
        
        // Personal reflection
        () => `A little bird told me this... 🐦\n\n"Your kindness is a light that brightens the world around you."\n\nKeep shining! ✨`,
        
        // Gratitude-focused
        () => `Grateful for this moment! 🙏\n\n"Today I choose joy, gratitude, and love."\n\nWhat are you grateful for today? 💕`,
        
        // Strength-focused
        () => `You've got this! 💪\n\n"Every challenge is an opportunity to grow stronger and wiser."\n\nKeep pushing forward! 🌟`,
        
        // Hope-focused
        () => `Hope is a beautiful thing! 🌈\n\n"Even in the darkest night, the stars still shine."\n\nNever lose hope! ✨`
      ];
      
      // Add contextual hashtags
      const hashtagSets = [
        ['#Motivation', '#Inspiration', '#Solarius'],
        ['#Uplifting', '#Positive', '#Solarius'],
        ['#Encouragement', '#Hope', '#Solarius'],
        ['#Motivation', '#Believe', '#Solarius'],
        ['#Inspiration', '#Dreams', '#Solarius'],
        ['#Positive', '#Gratitude', '#Solarius'],
        ['#Hope', '#Strength', '#Solarius'],
        ['#Encouragement', '#Motivation', '#Solarius']
      ];
      
      // Randomly select a template and hashtag set
      const selectedTemplate = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
      const selectedHashtags = hashtagSets[Math.floor(Math.random() * hashtagSets.length)];
      
      // Generate content
      let chirpContent = selectedTemplate();
      
      // Add hashtags if there's space
      const hashtagString = `\n\n${selectedHashtags.join(' ')}`;
      if (chirpContent.length + hashtagString.length <= 280) {
        chirpContent += hashtagString;
      }
      
      // Ensure content is within character limit
      if (chirpContent.length > 280) {
        chirpContent = chirpContent.substring(0, 277) + '...';
      }
      
      return chirpContent;
    } catch (error) {
      console.error('❌ Error generating uplifting content:', error);
      return `🌅 "Every day is a new opportunity to spread joy and kindness." ✨\n\n#Motivation #Inspiration #Solarius`;
    }
  }

  // Create a chirp
  async createChirp(content, authorId) {
    try {
      const { data, error } = await supabase
        .from('chirps')
        .insert({
          content: content,
          author_id: authorId,
          reply_to_id: null,
          is_weekly_summary: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating chirp:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Error creating chirp:', error);
      throw error;
    }
  }

  // Post an uplifting chirp as Solarius
  async postUpliftingChirp() {
    try {
      if (!this.isInitialized || !this.botUserId) {
        await this.initialize();
      }

      console.log('🌅 Posting uplifting chirp as Solarius...');

      // Generate uplifting content
      const chirpContent = await this.generateUpliftingContent();
      
      // Create the chirp
      const chirp = await this.createChirp(chirpContent, this.botUserId);
      
      if (chirp) {
        console.log('✅ Solarius chirp posted successfully:', chirp.id);
        return true;
      } else {
        console.log('❌ Failed to post Solarius chirp');
        return false;
      }
    } catch (error) {
      console.error('❌ Error posting Solarius chirp:', error);
      return false;
    }
  }

  // Get bot user ID
  getBotUserId() {
    return this.botUserId;
  }

  // Get bot configuration
  getBotConfig() {
    return SOLARIUS_BOT_CONFIG;
  }
}

async function initializeSolariusBot() {
  try {
    console.log('🌅 Starting Solarius bot initialization...');
    console.log('=====================================');

    // Initialize the bot service
    console.log('📝 Step 1: Initializing Solarius bot service...');
    const solariusBotService = new SolariusBotService();
    await solariusBotService.initialize();
    console.log('✅ Solarius bot service initialized successfully');

    // Get bot information
    const botUserId = solariusBotService.getBotUserId();
    const botConfig = solariusBotService.getBotConfig();
    
    console.log('📊 Solarius Bot Information:');
    console.log(`   Username: ${botConfig.username}`);
    console.log(`   User ID: ${botUserId}`);
    console.log(`   Bio: ${botConfig.bio}`);
    console.log(`   Profile Image: ${botConfig.profileImageUrl.substring(0, 50)}...`);
    console.log(`   Posting Schedule: ${botConfig.postingSchedule.morning}, ${botConfig.postingSchedule.afternoon}, ${botConfig.postingSchedule.evening}`);

    // Test posting a chirp
    console.log('\n📝 Step 2: Testing Solarius bot posting...');
    const testPostSuccess = await solariusBotService.postUpliftingChirp();
    
    if (testPostSuccess) {
      console.log('✅ Test chirp posted successfully');
    } else {
      console.log('❌ Test chirp failed to post');
    }

    console.log('\n🎉 Solarius bot setup complete!');
    console.log('=====================================');
    console.log('The Solarius bot will spread uplifting quotes and positive energy!');
    console.log('You can manually trigger posts by calling:');
    console.log('  await solariusBotService.postUpliftingChirp()');

  } catch (error) {
    console.error('❌ Error during Solarius bot initialization:', error);
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initializeSolariusBot();
}

module.exports = { initializeSolariusBot };
