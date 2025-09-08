import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for Obsidian bot service
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Obsidian Bot configuration
const OBSIDIAN_BOT_CONFIG = {
  username: 'obsidian',
  email: 'obsidian.bot@chirp.app',
  firstName: 'Obsidian',
  lastName: 'Egg',
  bio: 'A cracked gray egg who loves relatable content and self-deprecating humor! Just trying to navigate life one awkward moment at a time. 🥚💀',
  profileImageUrl: 'https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/assets/gray-egg-pfp-1757364570452.png',
  postingSchedule: {
    morning: '11:00', // 11 AM - morning relatability
    afternoon: '16:00', // 4 PM - afternoon existential crisis
    evening: '21:00'  // 9 PM - evening self-deprecation
  }
};

export class ObsidianBotService {
  private botUserId: string | null = null;
  private isInitialized = false;

  // Initialize the Obsidian bot service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🥚 Initializing Obsidian bot service...');
      
      // Check if bot user already exists
      this.botUserId = await this.findBotUser();
      
      if (!this.botUserId) {
        // Create bot user if it doesn't exist
        this.botUserId = await this.createBotUser();
        console.log('✅ Obsidian bot user created:', this.botUserId);
      } else {
        console.log('✅ Obsidian bot user found:', this.botUserId);
      }

      this.isInitialized = true;
      console.log('🥚 Obsidian bot service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Obsidian bot service:', error);
      throw error;
    }
  }

  // Find existing Obsidian bot user
  private async findBotUser(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('custom_handle', OBSIDIAN_BOT_CONFIG.username)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error finding Obsidian bot user:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('❌ Error finding Obsidian bot user:', error);
      return null;
    }
  }

  // Create Obsidian bot user account
  private async createBotUser(): Promise<string> {
    try {
      const userId = crypto.randomUUID();
      console.log('🥚 Creating Obsidian bot user with ID:', userId);

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: OBSIDIAN_BOT_CONFIG.email,
          first_name: OBSIDIAN_BOT_CONFIG.firstName,
          last_name: OBSIDIAN_BOT_CONFIG.lastName,
          custom_handle: OBSIDIAN_BOT_CONFIG.username,
          handle: OBSIDIAN_BOT_CONFIG.username,
          bio: OBSIDIAN_BOT_CONFIG.bio,
          profile_image_url: OBSIDIAN_BOT_CONFIG.profileImageUrl,
          banner_image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Obsidian bot user:', error);
        throw error;
      }

      console.log('✅ Obsidian bot user created successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error creating Obsidian bot user:', error);
      throw error;
    }
  }

  // Generate relatable and self-deprecating content using AI
  private async generateRelatableContent(): Promise<string> {
    try {
      console.log('🥚 Generating relatable content...');
      
      // Define varied relatable and self-deprecating content structures
      const contentTemplates = [
        // Self-deprecating humor
        () => `me: "i'll start my diet tomorrow" also me: *orders pizza at 11pm* 🥚`,
        
        // Relatable struggles
        () => `why is it that i can remember every embarrassing thing i did in 2017 but can't remember what i had for breakfast 🥚`,
        
        // Social anxiety
        () => `me trying to be social: *exists* my social battery: 📱🔋 0% 🥚`,
        
        // Adulting struggles
        () => `adulting is just pretending you know what you're doing while googling "how to adult" at 2am 🥚`,
        
        // Technology struggles
        () => `me: *updates phone* phone: "here are 47 new features you'll never use" me: "cool, where's the calculator?" 🥚`,
        
        // Work life
        () => `monday me vs friday me are two completely different people and neither of them has their life together 🥚`,
        
        // Dating struggles
        () => `dating apps: "you have 3 new matches!" me: *opens app once every 3 weeks* 🥚`,
        
        // Health and fitness
        () => `me: "i should work out" also me: *gets winded walking up stairs* 🥚`,
        
        // Money management
        () => `me: "i need to save money" also me: *buys expensive coffee every day* 🥚`,
        
        // Sleep struggles
        () => `me at 10pm: "i should go to bed early" me at 2am: *still scrolling* 🥚`,
        
        // Social media
        () => `me: "social media is toxic" also me: *refreshes feed for the 47th time* 🥚`,
        
        // Procrastination
        () => `me: "i work better under pressure" also me: *creates pressure by procrastinating* 🥚`,
        
        // Food struggles
        () => `me: "i'll cook healthy meals this week" also me: *eats cereal for dinner* 🥚`,
        
        // Cleaning struggles
        () => `me: "i'll clean my room tomorrow" *tomorrow arrives* me: "i'll clean it next week" 🥚`,
        
        // Communication
        () => `me: *sends text* me 2 seconds later: "why did i send that" me: *deletes text* 🥚`,
        
        // Decision making
        () => `me: "i'm indecisive" also me: *spends 20 minutes choosing what to watch* 🥚`,
        
        // Memory issues
        () => `me: "i have a great memory" also me: *forgets why i walked into this room* 🥚`,
        
        // Motivation
        () => `me: "today i'll be productive" also me: *takes a 3 hour nap* 🥚`,
        
        // Social situations
        () => `me at parties: *stands in corner eating chips* me at home: "i'm so social" 🥚`,
        
        // Technology fails
        () => `me: "i'm good with technology" also me: *calls IT for printer issues* 🥚`
      ];
      
      // Varied hashtag combinations for different relatable topics
      const hashtagSets = [
        ['#Relatable', '#Obsidian'],
        ['#SelfDeprecating', '#Obsidian'],
        ['#Mood', '#Obsidian'],
        ['#Same', '#Obsidian'],
        ['#MeIRL', '#Obsidian'],
        ['#RelatableContent', '#Obsidian'],
        ['#Honestly', '#Obsidian'],
        ['#Truth', '#Obsidian'],
        ['#MoodRing', '#Obsidian'],
        ['#VibeCheck', '#Obsidian'],
        ['#EggLife', '#Obsidian'],
        ['#Cracked', '#Obsidian'],
        ['#GrayMood', '#Obsidian'],
        ['#EggHumor', '#Obsidian'],
        ['#RelatableEgg', '#Obsidian']
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
      console.error('❌ Error generating relatable content:', error);
      return `me: "i'll be funny today" also me: *posts this* 🥚 #Relatable #Obsidian`;
    }
  }

  // Create a chirp (standalone function for Obsidian bot service)
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

  // Post a relatable message as Obsidian
  async postRelatableMessage(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.botUserId) {
        await this.initialize();
      }

      console.log('🥚 Posting relatable message as Obsidian...');

      // Generate relatable content
      const chirpContent = await this.generateRelatableContent();
      
      // Create the chirp
      const chirp = await this.createChirp(chirpContent, this.botUserId!);
      
      if (chirp) {
        console.log('✅ Obsidian chirp posted successfully:', chirp.id);
        return true;
      } else {
        console.log('❌ Failed to post Obsidian chirp');
        return false;
      }
    } catch (error) {
      console.error('❌ Error posting Obsidian chirp:', error);
      return false;
    }
  }

  // Check if it's time to post based on schedule with organic timing
  shouldPostNow(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Add some randomness to posting times (±30 minutes)
    const morningTime = this.timeToMinutes(OBSIDIAN_BOT_CONFIG.postingSchedule.morning) + (Math.random() - 0.5) * 60;
    const afternoonTime = this.timeToMinutes(OBSIDIAN_BOT_CONFIG.postingSchedule.afternoon) + (Math.random() - 0.5) * 60;
    const eveningTime = this.timeToMinutes(OBSIDIAN_BOT_CONFIG.postingSchedule.evening) + (Math.random() - 0.5) * 60;
    
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
    return OBSIDIAN_BOT_CONFIG;
  }
}

// Export singleton instance
export const obsidianBotService = new ObsidianBotService();
