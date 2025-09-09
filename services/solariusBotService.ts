import { createClient } from '@supabase/supabase-js';

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
  profileImageUrl: 'https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/assets/yellow-bird-pfp-1757363205598.png',
  postingSchedule: {
    morning: '08:00', // 8 AM - morning inspiration
    afternoon: '14:00', // 2 PM - midday motivation
    evening: '19:00'  // 7 PM - evening encouragement
  }
};

// AI API configuration for generating uplifting content
const AI_API_CONFIG = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo'
};

export class SolariusBotService {
  private botUserId: string | null = null;
  private isInitialized = false;

  // Initialize the Solarius bot service
  async initialize(): Promise<void> {
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
  private async findBotUser(): Promise<string | null> {
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
  private async createBotUser(): Promise<string> {
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

  // Generate casual, conversational uplifting content using AI
  private async generateUpliftingContent(): Promise<string> {
    try {
      console.log('🌅 Generating casual uplifting content...');
      
      // Define varied conversational content structures
      const contentTemplates = [
        // Casual morning vibes
        () => `morning! ☀️ just wanted to remind you that you're doing amazing things today. seriously, you've got this! ✨`,
        
        // Conversational wisdom
        () => `okay but like... why do we always doubt ourselves? you're literally capable of so much more than you think 🪶`,
        
        // Friendly encouragement
        () => `hey friend! 👋 having a rough day? that's totally okay. tomorrow's a fresh start and you're stronger than you know 💪`,
        
        // Bird perspective
        () => `from up here in my little nest, i can see how beautiful everything looks 🌟 remember to look up sometimes - the sky's pretty amazing`,
        
        // Personal touch
        () => `you know what i love about this community? everyone's just trying their best and that's honestly beautiful ✨ keep being you!`,
        
        // Casual motivation
        () => `not gonna lie, some days are harder than others. but you? you're still here, still trying. that's pretty incredible 🌈`,
        
        // Conversational gratitude
        () => `random thought: what's one thing that made you smile today? even the small stuff counts! 😊`,
        
        // Friendly reminder
        () => `psst... you don't have to be perfect. you just have to be you. and that's already pretty amazing 🪶`,
        
        // Casual inspiration
        () => `sometimes i think we forget how resilient we are. you've survived 100% of your bad days so far! 🌟`,
        
        // Community vibes
        () => `love seeing everyone supporting each other here 💕 this is what community looks like and it's beautiful`,
        
        // Gentle encouragement
        () => `hey, if you're reading this, you're exactly where you need to be right now. trust the process ✨`,
        
        // Casual wisdom
        () => `pro tip from a bird who's seen a lot: kindness costs nothing but means everything. spread it around! 🪶`,
        
        // Personal reflection
        () => `you know what? i'm grateful for this little corner of the internet where we can all be real with each other 🙏`,
        
        // Friendly nudge
        () => `don't forget to be kind to yourself today. you deserve the same compassion you give others 💕`,
        
        // Casual hope
        () => `even on cloudy days, the sun's still there behind the clouds. same goes for your light - it's always shining 🌤️`
      ];
      
      // Varied hashtag combinations for different vibes
      const hashtagSets = [
        ['#GoodVibes', '#Solarius'],
        ['#YouGotThis', '#Solarius'],
        ['#Community', '#Solarius'],
        ['#BeKind', '#Solarius'],
        ['#StayStrong', '#Solarius'],
        ['#Grateful', '#Solarius'],
        ['#Believe', '#Solarius'],
        ['#Hope', '#Solarius'],
        ['#Motivation', '#Solarius'],
        ['#Inspiration', '#Solarius'],
        ['#Positive', '#Solarius'],
        ['#Encouragement', '#Solarius'],
        ['#SelfCare', '#Solarius'],
        ['#Mindfulness', '#Solarius'],
        ['#Growth', '#Solarius']
      ];
      
      // Randomly select a template and hashtag set
      const selectedTemplate = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
      const selectedHashtags = hashtagSets[Math.floor(Math.random() * hashtagSets.length)];
      
      // Generate content
      let chirpContent = selectedTemplate();
      
      // Sometimes add hashtags, sometimes don't (more natural)
      const shouldAddHashtags = Math.random() > 0.8; // 20% chance of adding hashtags
      
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
      console.error('❌ Error generating uplifting content:', error);
      return `hey friend! just wanted to remind you that you're doing great ✨ #GoodVibes #Solarius`;
    }
  }

  // Create a chirp (standalone function for Solarius bot service)
  private async createChirp(content: string, authorId: string): Promise<any> {
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
  async postUpliftingChirp(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.botUserId) {
        await this.initialize();
      }

      console.log('🌅 Posting uplifting chirp as Solarius...');

      // Generate uplifting content
      const chirpContent = await this.generateUpliftingContent();
      
      // Create the chirp
      const chirp = await this.createChirp(chirpContent, this.botUserId!);
      
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

  // Check if it's time to post based on schedule with organic timing
  shouldPostNow(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Add some randomness to posting times (±30 minutes)
    const morningTime = this.timeToMinutes(SOLARIUS_BOT_CONFIG.postingSchedule.morning) + (Math.random() - 0.5) * 60;
    const afternoonTime = this.timeToMinutes(SOLARIUS_BOT_CONFIG.postingSchedule.afternoon) + (Math.random() - 0.5) * 60;
    const eveningTime = this.timeToMinutes(SOLARIUS_BOT_CONFIG.postingSchedule.evening) + (Math.random() - 0.5) * 60;
    
    // Check if current time is within 10 minutes of scheduled time (more organic)
    const tolerance = 10;
    
    return (
      Math.abs(currentTime - morningTime) <= tolerance ||
      Math.abs(currentTime - afternoonTime) <= tolerance ||
      Math.abs(currentTime - eveningTime) <= tolerance
    );
  }

  // Helper method to convert time string to minutes
  private timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Get bot user ID
  getBotUserId(): string | null {
    return this.botUserId;
  }

  // Get bot configuration
  getBotConfig() {
    return SOLARIUS_BOT_CONFIG;
  }
}

// Export singleton instance
export const solariusBotService = new SolariusBotService();
