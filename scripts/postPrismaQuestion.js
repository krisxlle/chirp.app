#!/usr/bin/env node

/**
 * Manual Prisma Bot Post Script
 * 
 * This script allows you to manually trigger Prisma bot posts for testing.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
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

async function postPrismaQuestion() {
  try {
    console.log('💜 Posting reflective question as Prisma...');
    
    // Find Prisma bot user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('custom_handle', PRISMA_BOT_CONFIG.username)
      .single();

    if (userError) {
      console.error('❌ Error finding Prisma bot user:', userError);
      return false;
    }

    if (!user) {
      console.error('❌ Prisma bot user not found');
      return false;
    }

    // Generate thought-provoking questions to encourage self-expression
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
    
    console.log('📝 Generated question:');
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

    console.log('✅ Prisma question posted successfully!');
    console.log(`📊 Chirp ID: ${chirp.id}`);
    console.log(`👤 Author: ${PRISMA_BOT_CONFIG.username}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error posting Prisma question:', error);
    return false;
  }
}

// Run the post
if (require.main === module) {
  postPrismaQuestion();
}

module.exports = { postPrismaQuestion };
