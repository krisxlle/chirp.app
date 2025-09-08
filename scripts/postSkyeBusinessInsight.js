#!/usr/bin/env node

/**
 * Manual Skye Bot Post Script
 * 
 * This script allows you to manually trigger Skye bot posts for testing.
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
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

// Generate business news and current industry insights content
async function generateBusinessNewsContent() {
  try {
    console.log('📈 Generating business news content...');
    
    // Define current business news and industry insights
    const businessNewsTemplates = [
      // Market trends
      () => `📊 MARKET UPDATE: remote work is reshaping commercial real estate. companies are rethinking office space strategies and hybrid models`,
      
      // Startup funding
      () => `🚀 FUNDING ALERT: AI startups are seeing record investment rounds. the focus is shifting from hype to practical business applications`,
      
      // Economic indicators
      () => `💰 ECONOMIC INSIGHT: inflation is changing consumer spending patterns. businesses need to adapt pricing strategies and value propositions`,
      
      // Technology trends
      () => `💻 TECH TREND: cybersecurity spending is surging as remote work expands attack surfaces. every business needs a security strategy`,
      
      // Supply chain
      () => `📦 SUPPLY CHAIN: global logistics are still recovering from disruptions. diversification and local sourcing are becoming critical`,
      
      // Sustainability
      () => `🌱 ESG FOCUS: investors are prioritizing environmental, social, and governance factors. sustainable business practices drive valuations`,
      
      // Consumer behavior
      () => `🛒 CONSUMER TREND: younger demographics prefer experiences over products. businesses are shifting to service-based models`,
      
      // Workforce changes
      () => `👥 TALENT MARKET: the great resignation continues. companies are focusing on retention through culture and flexibility`,
      
      // Digital transformation
      () => `📱 DIGITAL TRANSFORMATION: businesses that invested in digital infrastructure during the pandemic are outperforming competitors`,
      
      // E-commerce growth
      () => `🛍️ E-COMMERCE: online retail is stabilizing at higher levels. omnichannel strategies are essential for retail success`,
      
      // Cryptocurrency
      () => `₿ CRYPTO UPDATE: institutional adoption of digital assets is accelerating. businesses are exploring blockchain applications`,
      
      // Healthcare innovation
      () => `🏥 HEALTHCARE TECH: telemedicine and health tech startups are transforming patient care delivery models`,
      
      // Energy transition
      () => `⚡ ENERGY SHIFT: renewable energy investments are creating new business opportunities in clean tech sectors`,
      
      // Financial services
      () => `🏦 FINTECH: digital banking and payment solutions are disrupting traditional financial services`,
      
      // Manufacturing
      () => `🏭 INDUSTRY 4.0: smart manufacturing and automation are revolutionizing production processes and efficiency`
    ];
    
    // News-specific hashtag combinations
    const newsHashtagSets = [
      ['#BusinessNews', '#Skye'],
      ['#MarketUpdate', '#Skye'],
      ['#IndustryInsight', '#Skye'],
      ['#Trending', '#Skye'],
      ['#MarketAnalysis', '#Skye'],
      ['#BusinessTrend', '#Skye'],
      ['#IndustryNews', '#Skye'],
      ['#MarketWatch', '#Skye'],
      ['#BusinessIntel', '#Skye'],
      ['#MarketInsight', '#Skye']
    ];
    
    // Randomly select a news template and hashtag set
    const selectedTemplate = businessNewsTemplates[Math.floor(Math.random() * businessNewsTemplates.length)];
    const selectedHashtags = newsHashtagSets[Math.floor(Math.random() * newsHashtagSets.length)];
    
    // Generate content
    let chirpContent = selectedTemplate();
    
    // Always add hashtags for news posts (they're informative)
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
    console.error('❌ Error generating business news content:', error);
    return `stay informed about market trends and business opportunities 💼 #BusinessNews #Skye`;
  }
}

async function postSkyeBusinessInsight() {
  try {
    console.log('💼 Posting business insight as Skye...');
    
    // Find Skye bot user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('custom_handle', SKYE_BOT_CONFIG.username)
      .single();

    if (userError) {
      console.error('❌ Error finding Skye bot user:', userError);
      return false;
    }

    if (!user) {
      console.error('❌ Skye bot user not found');
      return false;
    }

    // 30% chance to include current business news/insights
    const shouldIncludeNews = Math.random() < 0.3;
    
    if (shouldIncludeNews) {
      const newsContent = await generateBusinessNewsContent();
      console.log('📝 Generated business news:');
      console.log(newsContent);
      
      // Create the chirp with news content
      const { data: chirp, error: chirpError } = await supabase
        .from('chirps')
        .insert({
          content: newsContent,
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

      console.log('✅ Skye business news posted successfully!');
      console.log(`📊 Chirp ID: ${chirp.id}`);
      console.log(`👤 Author: ${SKYE_BOT_CONFIG.username}`);
      
      return true;
    }
    
    // Generate business-focused content using AI
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
    
    console.log('📝 Generated business insight:');
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

    console.log('✅ Skye business insight posted successfully!');
    console.log(`📊 Chirp ID: ${chirp.id}`);
    console.log(`👤 Author: ${SKYE_BOT_CONFIG.username}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error posting Skye business insight:', error);
    return false;
  }
}

// Run the post
if (require.main === module) {
  postSkyeBusinessInsight();
}

module.exports = { postSkyeBusinessInsight };
