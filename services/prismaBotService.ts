import { createClient } from '@supabase/supabase-js';

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

export class PrismaBotService {
  private botUserId: string | null = null;
  private isInitialized = false;

  // Initialize the Prisma bot service
  async initialize(): Promise<void> {
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
  private async findBotUser(): Promise<string | null> {
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
  private async createBotUser(): Promise<string> {
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
  private async generateReflectiveContent(): Promise<string> {
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
      console.error('❌ Error generating reflective content:', error);
      return `what's something you're grateful for today? 💜 #Reflection #Prisma`;
    }
  }

  // Create a chirp (standalone function for Prisma bot service)
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

  // Post a reflective question as Prisma
  async postReflectiveQuestion(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.botUserId) {
        await this.initialize();
      }

      console.log('💜 Posting reflective question as Prisma...');

      // Generate reflective content
      const chirpContent = await this.generateReflectiveContent();
      
      // Create the chirp
      const chirp = await this.createChirp(chirpContent, this.botUserId!);
      
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

  // Check if it's time to post based on schedule with organic timing
  shouldPostNow(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Add some randomness to posting times (±30 minutes)
    const morningTime = this.timeToMinutes(PRISMA_BOT_CONFIG.postingSchedule.morning) + (Math.random() - 0.5) * 60;
    const afternoonTime = this.timeToMinutes(PRISMA_BOT_CONFIG.postingSchedule.afternoon) + (Math.random() - 0.5) * 60;
    const eveningTime = this.timeToMinutes(PRISMA_BOT_CONFIG.postingSchedule.evening) + (Math.random() - 0.5) * 60;
    
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
    return PRISMA_BOT_CONFIG;
  }
}

// Export singleton instance
export const prismaBotService = new PrismaBotService();
