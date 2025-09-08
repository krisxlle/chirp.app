#!/usr/bin/env node

/**
 * Manual Solarius Bot Post Script
 * 
 * This script allows you to manually trigger Solarius bot posts for testing.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
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

async function postSolariusChirp() {
  try {
    console.log('🌅 Posting uplifting chirp as Solarius...');
    
    // Find Solarius bot user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('custom_handle', SOLARIUS_BOT_CONFIG.username)
      .single();

    if (userError) {
      console.error('❌ Error finding Solarius bot user:', userError);
      return false;
    }

    if (!user) {
      console.error('❌ Solarius bot user not found');
      return false;
    }

    // Generate casual, conversational uplifting content
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
    
    console.log('📝 Generated content:');
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

    console.log('✅ Solarius chirp posted successfully!');
    console.log(`📊 Chirp ID: ${chirp.id}`);
    console.log(`👤 Author: ${SOLARIUS_BOT_CONFIG.username}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error posting Solarius chirp:', error);
    return false;
  }
}

// Run the post
if (require.main === module) {
  postSolariusChirp();
}

module.exports = { postSolariusChirp };
