#!/usr/bin/env node

/**
 * Prisma Bot Initialization Script
 * 
 * This script initializes the Prisma bot account and starts posting reflective questions.
 * Run this script to set up the Prisma bot for the first time.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for Prisma bot service
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Prisma Bot configuration
const PRISMA_BOT_CONFIG = {
  username: 'prisma',
  email: 'prisma.bot@chirp.app',
  firstName: 'Prisma',
  lastName: 'Reflect',
  bio: 'A curious purple bird who loves asking questions to spark meaningful conversations and self-reflection! 💜🪶',
  profileImageUrl: 'https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/assets/purple-bird-pfp-1757363636857.png',
  postingSchedule: {
    morning: '10:00', // 10 AM - morning reflection
    afternoon: '15:00', // 3 PM - midday introspection
    evening: '20:00'  // 8 PM - evening contemplation
  }
};

class PrismaBotService {
  constructor() {
    this.botUserId = null;
    this.isInitialized = false;
  }

  // Initialize the Prisma bot service
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('💜 Initializing Prisma bot service...');
      
      // Check if bot user already exists
      this.botUserId = await this.findBotUser();
      
      if (!this.botUserId) {
        // Create bot user if it doesn't exist
        this.botUserId = await this.createBotUser();
        console.log('✅ Prisma bot user created:', this.botUserId);
      } else {
        console.log('✅ Prisma bot user found:', this.botUserId);
      }

      this.isInitialized = true;
      console.log('💜 Prisma bot service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Prisma bot service:', error);
      throw error;
    }
  }

  // Find existing Prisma bot user
  async findBotUser() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('custom_handle', PRISMA_BOT_CONFIG.username)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error finding Prisma bot user:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('❌ Error finding Prisma bot user:', error);
      return null;
    }
  }

  // Create Prisma bot user account
  async createBotUser() {
    try {
      const userId = crypto.randomUUID();
      console.log('💜 Creating Prisma bot user with ID:', userId);

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: PRISMA_BOT_CONFIG.email,
          first_name: PRISMA_BOT_CONFIG.firstName,
          last_name: PRISMA_BOT_CONFIG.lastName,
          custom_handle: PRISMA_BOT_CONFIG.username,
          handle: PRISMA_BOT_CONFIG.username,
          bio: PRISMA_BOT_CONFIG.bio,
          profile_image_url: PRISMA_BOT_CONFIG.profileImageUrl,
          banner_image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Prisma bot user:', error);
        throw error;
      }

      console.log('✅ Prisma bot user created successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error creating Prisma bot user:', error);
      throw error;
    }
  }

  // Generate thought-provoking questions to encourage self-expression
  async generateReflectiveContent() {
    try {
      console.log('💜 Generating reflective question content...');
      
      // Define varied question-based content structures
      const contentTemplates = [
        // Self-discovery questions
        () => `what's something you've learned about yourself recently that surprised you? 💜`,
        
        // Growth and change
        () => `if you could tell your past self one thing, what would it be? 🪶`,
        
        // Dreams and aspirations
        () => `what's a dream you've been putting off? what's holding you back? ✨`,
        
        // Gratitude and appreciation
        () => `what's one small thing that happened today that you're grateful for? 🌟`,
        
        // Challenges and resilience
        () => `what's a challenge you've overcome that made you stronger? 💪`,
        
        // Relationships and connections
        () => `who in your life makes you feel most like yourself? why? 💕`,
        
        // Values and priorities
        () => `what's something you value more now than you did a year ago? 🤔`,
        
        // Creativity and expression
        () => `what's a creative way you like to express yourself? 🎨`,
        
        // Mindfulness and presence
        () => `what's something beautiful you noticed today that others might have missed? 🌸`,
        
        // Future and possibilities
        () => `if you could have a conversation with your future self, what would you ask? 🔮`,
        
        // Community and belonging
        () => `what makes you feel most connected to others? 🌈`,
        
        // Personal growth
        () => `what's a habit you've been working on changing? how's it going? 🌱`,
        
        // Joy and happiness
        () => `what's something that always makes you smile, no matter what? 😊`,
        
        // Wisdom and experience
        () => `what's a piece of advice you'd give to someone starting their journey? 💎`,
        
        // Reflection and introspection
        () => `what's something you're curious about learning more about? 🧠`,
        
        // Authenticity and identity
        () => `what's something about you that people might not know but you wish they did? 💜`,
        
        // Purpose and meaning
        () => `what gives your life the most meaning right now? ✨`,
        
        // Emotions and feelings
        () => `what's an emotion you've been feeling a lot lately? what do you think it's trying to tell you? 🌊`,
        
        // Change and transformation
        () => `what's something you've changed your mind about recently? what changed it? 🔄`,
        
        // Connection and empathy
        () => `what's something you wish more people understood about you? 💭`
      ];
      
      // Varied hashtag combinations for different question types
      const hashtagSets = [
        ['#SelfReflection', '#Prisma'],
        ['#QuestionTime', '#Prisma'],
        ['#SelfDiscovery', '#Prisma'],
        ['#Growth', '#Prisma'],
        ['#Reflection', '#Prisma'],
        ['#Curiosity', '#Prisma'],
        ['#Mindfulness', '#Prisma'],
        ['#SelfExpression', '#Prisma'],
        ['#PersonalGrowth', '#Prisma'],
        ['#Introspection', '#Prisma'],
        ['#Wisdom', '#Prisma'],
        ['#Authenticity', '#Prisma'],
        ['#Purpose', '#Prisma'],
        ['#Connection', '#Prisma'],
        ['#Empathy', '#Prisma']
      ];
      
      // Randomly select a template and hashtag set
      const selectedTemplate = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
      const selectedHashtags = hashtagSets[Math.floor(Math.random() * hashtagSets.length)];
      
      // Generate content
      let chirpContent = selectedTemplate();
      
      // Sometimes add hashtags, sometimes don't (more natural)
      const shouldAddHashtags = Math.random() > 0.4; // 60% chance of adding hashtags
      
      if (shouldAddHashtags) {
        const hashtagString = `\n\n${selectedHashtags.join(' ')}`;
        if (chirpContent.length + hashtagString.length <= 280) {
          chirpContent += hashtagString;
        }
      }
      
      // Ensure content is within character limit
      if (chirpContent.length > 280) {
        chirpContent = chirpContent.substring(0, 277) + '...';
      }
      
      return chirpContent;
    } catch (error) {
      console.error('❌ Error generating reflective content:', error);
      return `what's something you're grateful for today? 💜 #Reflection #Prisma`;
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

  // Post a reflective question as Prisma
  async postReflectiveQuestion() {
    try {
      if (!this.isInitialized || !this.botUserId) {
        await this.initialize();
      }

      console.log('💜 Posting reflective question as Prisma...');

      // Generate reflective content
      const chirpContent = await this.generateReflectiveContent();
      
      // Create the chirp
      const chirp = await this.createChirp(chirpContent, this.botUserId);
      
      if (chirp) {
        console.log('✅ Prisma chirp posted successfully:', chirp.id);
        return true;
      } else {
        console.log('❌ Failed to post Prisma chirp');
        return false;
      }
    } catch (error) {
      console.error('❌ Error posting Prisma chirp:', error);
      return false;
    }
  }

  // Get bot user ID
  getBotUserId() {
    return this.botUserId;
  }

  // Get bot configuration
  getBotConfig() {
    return PRISMA_BOT_CONFIG;
  }
}

async function initializePrismaBot() {
  try {
    console.log('💜 Starting Prisma bot initialization...');
    console.log('=====================================');

    // Initialize the bot service
    console.log('📝 Step 1: Initializing Prisma bot service...');
    const prismaBotService = new PrismaBotService();
    await prismaBotService.initialize();
    console.log('✅ Prisma bot service initialized successfully');

    // Get bot information
    const botUserId = prismaBotService.getBotUserId();
    const botConfig = prismaBotService.getBotConfig();
    
    console.log('📊 Prisma Bot Information:');
    console.log(`   Username: ${botConfig.username}`);
    console.log(`   User ID: ${botUserId}`);
    console.log(`   Bio: ${botConfig.bio}`);
    console.log(`   Profile Image: ${botConfig.profileImageUrl.substring(0, 50)}...`);
    console.log(`   Posting Schedule: ${botConfig.postingSchedule.morning}, ${botConfig.postingSchedule.afternoon}, ${botConfig.postingSchedule.evening}`);

    // Test posting a chirp
    console.log('\n📝 Step 2: Testing Prisma bot posting...');
    const testPostSuccess = await prismaBotService.postReflectiveQuestion();
    
    if (testPostSuccess) {
      console.log('✅ Test chirp posted successfully');
    } else {
      console.log('❌ Test chirp failed to post');
    }

    console.log('\n🎉 Prisma bot setup complete!');
    console.log('=====================================');
    console.log('The Prisma bot will ask thought-provoking questions to encourage self-expression!');
    console.log('You can manually trigger posts by calling:');
    console.log('  await prismaBotService.postReflectiveQuestion()');

  } catch (error) {
    console.error('❌ Error during Prisma bot initialization:', error);
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initializePrismaBot();
}

module.exports = { initializePrismaBot };
