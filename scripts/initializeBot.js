#!/usr/bin/env node

/**
 * Bot Initialization Script
 * 
 * This script initializes the CrimsonTalon bot account and starts the scheduler.
 * Run this script to set up the bot for the first time.
 */

import { botScheduler } from './services/botScheduler';
import { botService } from './services/botService';

async function initializeBot() {
  try {
    console.log('🤖 Starting CrimsonTalon bot initialization...');
    console.log('=====================================');

    // Initialize the bot service
    console.log('📝 Step 1: Initializing bot service...');
    await botService.initialize();
    console.log('✅ Bot service initialized successfully');

    // Get bot information
    const botUserId = botService.getBotUserId();
    const botConfig = botService.getBotConfig();
    
    console.log('📊 Bot Information:');
    console.log(`   Username: ${botConfig.username}`);
    console.log(`   User ID: ${botUserId}`);
    console.log(`   Bio: ${botConfig.bio}`);
    console.log(`   Profile Image: ${botConfig.profileImageUrl}`);
    console.log(`   Posting Schedule: ${botConfig.postingSchedule.morning} & ${botConfig.postingSchedule.evening}`);

    // Test posting a chirp
    console.log('\n📝 Step 2: Testing bot posting...');
    const testPostSuccess = await botService.postNewsChirp();
    
    if (testPostSuccess) {
      console.log('✅ Test chirp posted successfully');
    } else {
      console.log('❌ Test chirp failed to post');
    }

    // Start the scheduler
    console.log('\n⏰ Step 3: Starting bot scheduler...');
    botScheduler.start();
    console.log('✅ Bot scheduler started successfully');

    // Display scheduler status
    const status = botScheduler.getStatus();
    const nextPostingTimes = botScheduler.getNextPostingTimes();
    
    console.log('\n📊 Scheduler Status:');
    console.log(`   Running: ${status.isRunning}`);
    console.log(`   Check Interval: ${status.config.checkInterval / 1000} seconds`);
    console.log(`   Next Morning Post: ${nextPostingTimes.morning}`);
    console.log(`   Next Evening Post: ${nextPostingTimes.evening}`);

    console.log('\n🎉 CrimsonTalon bot setup complete!');
    console.log('=====================================');
    console.log('The bot will now automatically post trending news twice daily.');
    console.log('You can monitor the bot status via the API endpoints:');
    console.log('  GET /api/bot/status - Check bot status');
    console.log('  POST /api/bot/force-post - Force a post (for testing)');
    console.log('  POST /api/bot/stop-scheduler - Stop the scheduler');
    console.log('  POST /api/bot/start-scheduler - Start the scheduler');

  } catch (error) {
    console.error('❌ Error during bot initialization:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down bot scheduler...');
  botScheduler.stop();
  console.log('✅ Bot scheduler stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down bot scheduler...');
  botScheduler.stop();
  console.log('✅ Bot scheduler stopped');
  process.exit(0);
});

// Run the initialization
if (require.main === module) {
  initializeBot();
}

export { initializeBot };
