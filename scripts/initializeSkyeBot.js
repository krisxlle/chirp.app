#!/usr/bin/env node

/**
 * Skye Bot Initialization Script
 * 
 * This script initializes the Skye bot account and starts posting business insights.
 * Run this script to set up the Skye bot for the first time.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for Skye bot service
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Skye Bot configuration
const SKYE_BOT_CONFIG = {
  username: 'skye',
  email: 'skye.bot@chirp.app',
  firstName: 'Skye',
  lastName: 'Enterprise',
  bio: 'A sharp blue bird with a passion for business, entrepreneurship, and professional growth! Always sharing insights on success, strategy, and innovation. 💼🪶',
  profileImageUrl: 'https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/assets/blue-bird-pfp-1757363898631.png',
  postingSchedule: {
    morning: '09:00', // 9 AM - morning business insights
    afternoon: '13:00', // 1 PM - midday strategy tips
    evening: '17:00'  // 5 PM - evening success stories
  }
};

class SkyeBotService {
  constructor() {
    this.botUserId = null;
    this.isInitialized = false;
  }

  // Initialize the Skye bot service
  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('💼 Initializing Skye bot service...');
      
      // Check if bot user already exists
      this.botUserId = await this.findBotUser();
      
      if (!this.botUserId) {
        // Create bot user if it doesn't exist
        this.botUserId = await this.createBotUser();
        console.log('✅ Skye bot user created:', this.botUserId);
      } else {
        console.log('✅ Skye bot user found:', this.botUserId);
      }

      this.isInitialized = true;
      console.log('💼 Skye bot service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Skye bot service:', error);
      throw error;
    }
  }

  // Find existing Skye bot user
  async findBotUser() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('custom_handle', SKYE_BOT_CONFIG.username)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error finding Skye bot user:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('❌ Error finding Skye bot user:', error);
      return null;
    }
  }

  // Create Skye bot user account
  async createBotUser() {
    try {
      const userId = crypto.randomUUID();
      console.log('💼 Creating Skye bot user with ID:', userId);

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: SKYE_BOT_CONFIG.email,
          first_name: SKYE_BOT_CONFIG.firstName,
          last_name: SKYE_BOT_CONFIG.lastName,
          custom_handle: SKYE_BOT_CONFIG.username,
          handle: SKYE_BOT_CONFIG.username,
          bio: SKYE_BOT_CONFIG.bio,
          profile_image_url: SKYE_BOT_CONFIG.profileImageUrl,
          banner_image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Skye bot user:', error);
        throw error;
      }

      console.log('✅ Skye bot user created successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error creating Skye bot user:', error);
      throw error;
    }
  }

  // Generate business-focused content using AI
  async generateBusinessContent() {
    try {
      console.log('💼 Generating business content...');
      
      // Define varied business content structures
      const contentTemplates = [
        // Entrepreneurship insights
        () => `the best entrepreneurs i know all have one thing in common: they're not afraid to fail fast and learn faster 💼`,
        
        // Leadership wisdom
        () => `leadership isn't about being the smartest person in the room. it's about making everyone else smarter 🪶`,
        
        // Strategy and planning
        () => `your business plan is just a starting point. the real magic happens when you adapt and pivot ✨`,
        
        // Networking and relationships
        () => `your network is your net worth. but remember, it's not about collecting contacts - it's about building relationships 💪`,
        
        // Innovation and creativity
        () => `innovation isn't about inventing something completely new. it's about solving old problems in new ways 🌟`,
        
        // Productivity and efficiency
        () => `busy ≠ productive. focus on what moves the needle, not what fills your calendar 📈`,
        
        // Customer focus
        () => `your customers don't care about your features. they care about their problems getting solved 💡`,
        
        // Risk and opportunity
        () => `the biggest risk is not taking any risk. in a world that's changing quickly, the only strategy that is guaranteed to fail is not taking risks 🚀`,
        
        // Team building
        () => `hire for attitude, train for skill. skills can be taught, but passion and drive are priceless 🎯`,
        
        // Market insights
        () => `the market doesn't care about your feelings. it only cares about value delivered 📊`,
        
        // Personal branding
        () => `your personal brand is what people say about you when you're not in the room. make it count 💎`,
        
        // Financial wisdom
        () => `revenue is vanity, profit is sanity, but cash flow is reality 💰`,
        
        // Growth mindset
        () => `success is not final, failure is not fatal: it is the courage to continue that counts 🌱`,
        
        // Technology and digital
        () => `in the digital age, if you're not online, you're invisible. but being online without strategy is just noise 📱`,
        
        // Sales and marketing
        () => `people don't buy products, they buy solutions to their problems. focus on the problem, not the product 🎪`,
        
        // Time management
        () => `time is the only resource you can't get more of. spend it on what matters most ⏰`,
        
        // Competition and differentiation
        () => `don't compete on price. compete on value, experience, and relationships 🏆`,
        
        // Scaling and growth
        () => `scaling isn't just about getting bigger. it's about getting better while you get bigger 📏`,
        
        // Decision making
        () => `perfect is the enemy of good. sometimes good enough and shipped beats perfect and never released 🎯`,
        
        // Mentorship and learning
        () => `the day you stop learning is the day you stop growing. invest in yourself like you would any other asset 📚`
      ];
      
      // Varied hashtag combinations for different business topics
      const hashtagSets = [
        ['#Business', '#Skye'],
        ['#Entrepreneurship', '#Skye'],
        ['#Leadership', '#Skye'],
        ['#Strategy', '#Skye'],
        ['#Innovation', '#Skye'],
        ['#Productivity', '#Skye'],
        ['#Networking', '#Skye'],
        ['#Marketing', '#Skye'],
        ['#Sales', '#Skye'],
        ['#Finance', '#Skye'],
        ['#Growth', '#Skye'],
        ['#Success', '#Skye'],
        ['#Startup', '#Skye'],
        ['#Management', '#Skye'],
        ['#Career', '#Skye']
      ];
      
      // Randomly select a template and hashtag set
      const selectedTemplate = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
      const selectedHashtags = hashtagSets[Math.floor(Math.random() * hashtagSets.length)];
      
      // Generate content
      let chirpContent = selectedTemplate();
      
      // Sometimes add hashtags, sometimes don't (more natural)
      const shouldAddHashtags = Math.random() > 0.3; // 70% chance of adding hashtags
      
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
      console.error('❌ Error generating business content:', error);
      return `success is not about being perfect, it's about being persistent 💼 #Business #Skye`;
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

  // Post a business insight as Skye
  async postBusinessInsight() {
    try {
      if (!this.isInitialized || !this.botUserId) {
        await this.initialize();
      }

      console.log('💼 Posting business insight as Skye...');

      // Generate business content
      const chirpContent = await this.generateBusinessContent();
      
      // Create the chirp
      const chirp = await this.createChirp(chirpContent, this.botUserId);
      
      if (chirp) {
        console.log('✅ Skye chirp posted successfully:', chirp.id);
        return true;
      } else {
        console.log('❌ Failed to post Skye chirp');
        return false;
      }
    } catch (error) {
      console.error('❌ Error posting Skye chirp:', error);
      return false;
    }
  }

  // Get bot user ID
  getBotUserId() {
    return this.botUserId;
  }

  // Get bot configuration
  getBotConfig() {
    return SKYE_BOT_CONFIG;
  }
}

async function initializeSkyeBot() {
  try {
    console.log('💼 Starting Skye bot initialization...');
    console.log('=====================================');

    // Initialize the bot service
    console.log('📝 Step 1: Initializing Skye bot service...');
    const skyeBotService = new SkyeBotService();
    await skyeBotService.initialize();
    console.log('✅ Skye bot service initialized successfully');

    // Get bot information
    const botUserId = skyeBotService.getBotUserId();
    const botConfig = skyeBotService.getBotConfig();
    
    console.log('📊 Skye Bot Information:');
    console.log(`   Username: ${botConfig.username}`);
    console.log(`   User ID: ${botUserId}`);
    console.log(`   Bio: ${botConfig.bio}`);
    console.log(`   Profile Image: ${botConfig.profileImageUrl.substring(0, 50)}...`);
    console.log(`   Posting Schedule: ${botConfig.postingSchedule.morning}, ${botConfig.postingSchedule.afternoon}, ${botConfig.postingSchedule.evening}`);

    // Test posting a chirp
    console.log('\n📝 Step 2: Testing Skye bot posting...');
    const testPostSuccess = await skyeBotService.postBusinessInsight();
    
    if (testPostSuccess) {
      console.log('✅ Test chirp posted successfully');
    } else {
      console.log('❌ Test chirp failed to post');
    }

    console.log('\n🎉 Skye bot setup complete!');
    console.log('=====================================');
    console.log('The Skye bot will share business insights, entrepreneurship tips, and professional wisdom!');
    console.log('You can manually trigger posts by calling:');
    console.log('  await skyeBotService.postBusinessInsight()');

  } catch (error) {
    console.error('❌ Error during Skye bot initialization:', error);
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initializeSkyeBot();
}

module.exports = { initializeSkyeBot };
