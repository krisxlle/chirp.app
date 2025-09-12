import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for Thorne bot service
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

// Thorne Bot configuration
const THORNE_BOT_CONFIG = {
  username: 'thorne',
  email: 'thorne.bot@chirp.app',
  firstName: 'Thorne',
  lastName: 'Justice',
  bio: 'A passionate green bird fighting for social justice, equality, and positive change! Standing up for what\'s right and inspiring others to make a difference.',
  profileImageUrl: 'https://qrzbtituxxilnbgocdge.supabase.co/storage/v1/object/public/assets/green-bird-pfp-1757364127842.png',
  postingSchedule: {
    morning: '08:30', // 8:30 AM - morning activism call
    afternoon: '14:30', // 2:30 PM - midday social justice insights
    evening: '19:30'  // 7:30 PM - evening community action
  }
};

export class ThorneBotService {
  private botUserId: string | null = null;
  private isInitialized = false;

  // Initialize the Thorne bot service
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('🌱 Initializing Thorne bot service...');
      
      // Check if bot user already exists
      this.botUserId = await this.findBotUser();
      
      if (!this.botUserId) {
        // Create bot user if it doesn't exist
        this.botUserId = await this.createBotUser();
        console.log('✅ Thorne bot user created:', this.botUserId);
      } else {
        console.log('✅ Thorne bot user found:', this.botUserId);
      }

      this.isInitialized = true;
      console.log('🌱 Thorne bot service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Thorne bot service:', error);
      throw error;
    }
  }

  // Find existing Thorne bot user
  private async findBotUser(): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('custom_handle', THORNE_BOT_CONFIG.username)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error finding Thorne bot user:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('❌ Error finding Thorne bot user:', error);
      return null;
    }
  }

  // Create Thorne bot user account
  private async createBotUser(): Promise<string> {
    try {
      const userId = crypto.randomUUID();
      console.log('🌱 Creating Thorne bot user with ID:', userId);

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: THORNE_BOT_CONFIG.email,
          first_name: THORNE_BOT_CONFIG.firstName,
          last_name: THORNE_BOT_CONFIG.lastName,
          custom_handle: THORNE_BOT_CONFIG.username,
          handle: THORNE_BOT_CONFIG.username,
          bio: THORNE_BOT_CONFIG.bio,
          profile_image_url: THORNE_BOT_CONFIG.profileImageUrl,
          banner_image_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating Thorne bot user:', error);
        throw error;
      }

      console.log('✅ Thorne bot user created successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error('❌ Error creating Thorne bot user:', error);
      throw error;
    }
  }

  // Generate activism-focused content using AI
  private async generateActivismContent(): Promise<string> {
    try {
      console.log('🌱 Generating activism content...');
      
      // 30% chance to include current activism news/requests
      const shouldIncludeNews = Math.random() < 0.3;
      
      if (shouldIncludeNews) {
        return await this.generateActivismNewsContent();
      }
      
      // Define varied activism content structures
      const contentTemplates = [
        // Social justice awareness
        () => `silence in the face of injustice is complicity. your voice matters, use it 🌱`,
        
        // Community action
        () => `change doesn't happen overnight, but it starts with one person deciding to act 🪶`,
        
        // Equality and inclusion
        () => `diversity isn't just about checking boxes - it's about creating spaces where everyone truly belongs ✨`,
        
        // Environmental activism
        () => `we don't inherit the earth from our ancestors, we borrow it from our children 🌍`,
        
        // Human rights
        () => `human rights aren't privileges to be earned, they're rights to be protected 💪`,
        
        // Grassroots movements
        () => `the most powerful movements start with ordinary people doing extraordinary things 🌟`,
        
        // Education and awareness
        () => `knowledge is power, but only when we use it to lift others up 📚`,
        
        // Solidarity and support
        () => `standing together isn't just about strength in numbers - it's about strength in unity 🤝`,
        
        // Systemic change
        () => `we can't just treat symptoms, we need to address the root causes of injustice 🔧`,
        
        // Youth activism
        () => `young people aren't just the future - they're the present, and they're changing the world right now 👥`,
        
        // Intersectionality
        () => `justice isn't justice if it's not intersectional. we must fight for all marginalized communities 🌈`,
        
        // Local action
        () => `global change starts with local action. what can you do in your community today? 🏘️`,
        
        // Voting and civic engagement
        () => `democracy isn't a spectator sport. your vote is your voice, use it 🗳️`,
        
        // Economic justice
        () => `poverty isn't a personal failing, it's a systemic issue that requires systemic solutions 💰`,
        
        // Mental health advocacy
        () => `mental health is health. we need to break the stigma and ensure access for all 🧠`,
        
        // Disability rights
        () => `accessibility isn't optional, it's a right. everyone deserves to participate fully in society ♿`,
        
        // LGBTQ+ rights
        () => `love is love, and everyone deserves to live authentically and safely 🏳️‍🌈`,
        
        // Racial justice
        () => `anti-racism isn't a destination, it's a journey of continuous learning and action ✊`,
        
        // Climate action
        () => `there's no planet b. we need climate action now, not later 🌿`,
        
        // Peace and nonviolence
        () => `peace isn't the absence of conflict, it's the presence of justice ☮️`
      ];
      
      // Varied hashtag combinations for different activism topics
      const hashtagSets = [
        ['#Activism', '#Thorne'],
        ['#SocialJustice', '#Thorne'],
        ['#Equality', '#Thorne'],
        ['#Community', '#Thorne'],
        ['#Change', '#Thorne'],
        ['#HumanRights', '#Thorne'],
        ['#Environment', '#Thorne'],
        ['#Solidarity', '#Thorne'],
        ['#Education', '#Thorne'],
        ['#Youth', '#Thorne'],
        ['#Intersectionality', '#Thorne'],
        ['#LocalAction', '#Thorne'],
        ['#Voting', '#Thorne'],
        ['#EconomicJustice', '#Thorne'],
        ['#MentalHealth', '#Thorne']
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
      console.error('❌ Error generating activism content:', error);
      return `standing up for what's right isn't always easy, but it's always necessary 🌱 #Activism #Thorne`;
    }
  }

  // Generate activism news and current requests content
  private async generateActivismNewsContent(): Promise<string> {
    try {
      console.log('📰 Generating activism news content...');
      
      // Define current activism news and action requests
      const activismNewsTemplates = [
        // Environmental action
        () => `🌍 ACTION ALERT: local climate groups are organizing tree planting events this weekend. check your city's environmental coalition for details!`,
        
        // Voting and civic engagement
        () => `🗳️ REMINDER: voter registration deadlines are approaching in many states. make sure you and your friends are registered to vote!`,
        
        // Community support
        () => `🤝 COMMUNITY NEED: local food banks are seeing increased demand. consider organizing a neighborhood food drive or donating directly`,
        
        // Social justice campaigns
        () => `✊ URGENT: there's a petition circulating for police accountability reform in several cities. signatures needed by end of month`,
        
        // Mental health advocacy
        () => `🧠 AWARENESS: mental health awareness month is coming up. local organizations need volunteers for outreach programs`,
        
        // Disability rights
        () => `♿ ACCESSIBILITY: city council is reviewing accessibility improvements for public spaces. public comments needed at next meeting`,
        
        // LGBTQ+ support
        () => `🏳️‍🌈 SUPPORT NEEDED: pride month events are being planned. volunteers needed for organizing committees in major cities`,
        
        // Economic justice
        () => `💰 HOUSING CRISIS: tenant rights organizations are hosting workshops on eviction prevention. free legal aid available`,
        
        // Education equity
        () => `📚 EDUCATION: school board elections are coming up. candidates need support for equitable funding initiatives`,
        
        // Racial justice
        () => `✊ JUSTICE: community forums on racial equity are happening nationwide. your voice matters in these discussions`,
        
        // Youth activism
        () => `👥 YOUTH POWER: student climate strikes are being organized globally. check with local youth groups for participation`,
        
        // Worker rights
        () => `👷 WORKER RIGHTS: several companies are facing unionization efforts. solidarity actions needed to support workers`,
        
        // Immigration advocacy
        () => `🌐 IMMIGRATION: local immigrant support groups need volunteers for language classes and legal aid programs`,
        
        // Healthcare access
        () => `🏥 HEALTHCARE: community health clinics are seeking volunteers for outreach and patient support programs`,
        
        // Digital rights
        () => `💻 DIGITAL RIGHTS: net neutrality and privacy legislation needs public support. contact your representatives today`
      ];
      
      // News-specific hashtag combinations
      const newsHashtagSets = [
        ['#ActionAlert', '#Thorne'],
        ['#CommunityAction', '#Thorne'],
        ['#Urgent', '#Thorne'],
        ['#Volunteer', '#Thorne'],
        ['#Petition', '#Thorne'],
        ['#LocalAction', '#Thorne'],
        ['#GetInvolved', '#Thorne'],
        ['#Support', '#Thorne'],
        ['#Advocacy', '#Thorne'],
        ['#Solidarity', '#Thorne']
      ];
      
      // Randomly select a news template and hashtag set
      const selectedTemplate = activismNewsTemplates[Math.floor(Math.random() * activismNewsTemplates.length)];
      const selectedHashtags = newsHashtagSets[Math.floor(Math.random() * newsHashtagSets.length)];
      
      // Generate content
      let chirpContent = selectedTemplate();
      
      // Always add hashtags for news posts (they're action-oriented)
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
      console.error('❌ Error generating activism news content:', error);
      return `stay informed about local activism opportunities in your community 🌱 #ActionAlert #Thorne`;
    }
  }

  // Create a chirp (standalone function for Thorne bot service)
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

  // Post an activism message as Thorne
  async postActivismMessage(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.botUserId) {
        await this.initialize();
      }

      console.log('🌱 Posting activism message as Thorne...');

      // Generate activism content
      const chirpContent = await this.generateActivismContent();
      
      // Create the chirp
      const chirp = await this.createChirp(chirpContent, this.botUserId!);
      
      if (chirp) {
        console.log('✅ Thorne chirp posted successfully:', chirp.id);
        return true;
      } else {
        console.log('❌ Failed to post Thorne chirp');
        return false;
      }
    } catch (error) {
      console.error('❌ Error posting Thorne chirp:', error);
      return false;
    }
  }

  // Check if it's time to post based on schedule with organic timing
  shouldPostNow(): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Add some randomness to posting times (±30 minutes)
    const morningTime = this.timeToMinutes(THORNE_BOT_CONFIG.postingSchedule.morning) + (Math.random() - 0.5) * 60;
    const afternoonTime = this.timeToMinutes(THORNE_BOT_CONFIG.postingSchedule.afternoon) + (Math.random() - 0.5) * 60;
    const eveningTime = this.timeToMinutes(THORNE_BOT_CONFIG.postingSchedule.evening) + (Math.random() - 0.5) * 60;
    
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
    return THORNE_BOT_CONFIG;
  }
}

// Export singleton instance
export const thorneBotService = new ThorneBotService();
