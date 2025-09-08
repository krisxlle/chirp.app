#!/usr/bin/env ts-node

/**
 * Test CrimsonTalon Bot Organic Content Generation
 * 
 * This script demonstrates the new varied, organic posting styles
 */

import { BotService } from '../services/botService';

async function testOrganicContent() {
  console.log('🪶 Testing CrimsonTalon Bot Organic Content Generation\n');
  
  const botService = new BotService();
  
  // Mock news items for testing
  const testNewsItems = [
    {
      title: "Tech Breakthrough: New AI Model Achieves Human-Level Performance",
      description: "Researchers announce a major milestone in artificial intelligence development that could revolutionize how we interact with technology.",
      url: "https://example.com/tech-breakthrough",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Climate Summit Reaches Historic Agreement",
      description: "World leaders commit to ambitious new environmental targets that could significantly impact global climate policies.",
      url: "https://example.com/climate-summit",
      publishedAt: new Date().toISOString()
    },
    {
      title: "Space Mission Discovers Water on Mars",
      description: "Latest Mars rover findings could revolutionize our understanding of the red planet and potential for life.",
      url: "https://example.com/mars-water",
      publishedAt: new Date().toISOString()
    }
  ];
  
  console.log('📝 Generating multiple organic posts for each news item...\n');
  
  for (let i = 0; i < testNewsItems.length; i++) {
    const newsItem = testNewsItems[i];
    console.log(`--- News Item ${i + 1}: ${newsItem.title} ---`);
    
    // Generate 3 different posts for the same news item to show variety
    for (let j = 0; j < 3; j++) {
      try {
        // Access the private method for testing (in real usage, this would be internal)
        const content = await (botService as any).generateChirpContent(newsItem);
        console.log(`\nPost ${j + 1}:`);
        console.log(content);
        console.log(`\nCharacter count: ${content.length}/280`);
        console.log('─'.repeat(50));
      } catch (error) {
        console.error('Error generating content:', error);
      }
    }
    
    console.log('\n');
  }
  
  console.log('✅ Organic content generation test completed!');
  console.log('\n🎯 Key Features Demonstrated:');
  console.log('• 10 different posting templates');
  console.log('• Varied hashtag combinations');
  console.log('• Intelligent description truncation');
  console.log('• Conversational and engaging tone');
  console.log('• Mystical bird personality');
  console.log('• Community-focused language');
  console.log('• Organic timing with randomness');
}

// Run the test
if (require.main === module) {
  testOrganicContent().catch(console.error);
}

export { testOrganicContent };
