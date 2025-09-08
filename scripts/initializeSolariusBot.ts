#!/usr/bin/env ts-node

/**
 * Solarius Bot Initialization Script
 * 
 * This script initializes the Solarius bot account and starts posting uplifting content.
 * Run this script to set up the Solarius bot for the first time.
 */

import { solariusBotService } from '../services/solariusBotService';

async function initializeSolariusBot() {
  try {
    console.log('🌅 Starting Solarius bot initialization...');
    console.log('=====================================');

    // Initialize the bot service
    console.log('📝 Step 1: Initializing Solarius bot service...');
    await solariusBotService.initialize();
    console.log('✅ Solarius bot service initialized successfully');

    // Get bot information
    const botUserId = solariusBotService.getBotUserId();
    const botConfig = solariusBotService.getBotConfig();
    
    console.log('📊 Solarius Bot Information:');
    console.log(`   Username: ${botConfig.username}`);
    console.log(`   User ID: ${botUserId}`);
    console.log(`   Bio: ${botConfig.bio}`);
    console.log(`   Profile Image: ${botConfig.profileImageUrl}`);
    console.log(`   Posting Schedule: ${botConfig.postingSchedule.morning}, ${botConfig.postingSchedule.afternoon}, ${botConfig.postingSchedule.evening}`);

    // Test posting a chirp
    console.log('\n📝 Step 2: Testing Solarius bot posting...');
    const testPostSuccess = await solariusBotService.postUpliftingChirp();
    
    if (testPostSuccess) {
      console.log('✅ Test chirp posted successfully');
    } else {
      console.log('❌ Test chirp failed to post');
    }

    console.log('\n🎉 Solarius bot setup complete!');
    console.log('=====================================');
    console.log('The Solarius bot will spread uplifting quotes and positive energy!');
    console.log('You can manually trigger posts by calling:');
    console.log('  await solariusBotService.postUpliftingChirp()');

  } catch (error) {
    console.error('❌ Error during Solarius bot initialization:', error);
    process.exit(1);
  }
}

// Run the initialization
if (require.main === module) {
  initializeSolariusBot();
}

export { initializeSolariusBot };
