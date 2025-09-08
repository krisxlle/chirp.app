#!/usr/bin/env node

/**
 * Manual Obsidian Bot Post Script
 * 
 * This script allows you to manually trigger Obsidian bot posts for testing.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
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

async function postObsidianRelatableMessage() {
  try {
    console.log('🥚 Posting relatable message as Obsidian...');
    
    // Find Obsidian bot user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('custom_handle', OBSIDIAN_BOT_CONFIG.username)
      .single();

    if (userError) {
      console.error('❌ Error finding Obsidian bot user:', userError);
      return false;
    }

    if (!user) {
      console.error('❌ Obsidian bot user not found');
      return false;
    }

    // Generate relatable and self-deprecating content using AI
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
    
    console.log('📝 Generated relatable content:');
    console.log(chirpContent);
    
    // Create the chirp
    const { data: chirp, error: chirpError } = await supabase
      .from('chirps')
      .insert({
        content: chirpContent,
        author_id: user.id,
        reply_to_id: null,
        is_weekly_summary: false
      })
      .select()
      .single();

    if (chirpError) {
      console.error('❌ Error creating chirp:', chirpError);
      return false;
    }

    console.log('✅ Obsidian relatable message posted successfully!');
    console.log(`📊 Chirp ID: ${chirp.id}`);
    console.log(`👤 Author: ${OBSIDIAN_BOT_CONFIG.username}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error posting Obsidian relatable message:', error);
    return false;
  }
}

// Run the post
if (require.main === module) {
  postObsidianRelatableMessage();
}

module.exports = { postObsidianRelatableMessage };
