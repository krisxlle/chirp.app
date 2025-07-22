import cron from 'node-cron';
import { sendWeeklyAnalyticsToAllUsers } from './analyticsService';
import { storage } from './storage';
import { generateWeeklySummary } from './openai';

async function generateWeeklySummariesForAllUsers() {
  console.log('Starting automated weekly summary generation for all users');
  
  try {
    const users = await storage.getAllUsers();
    
    for (const user of users) {
      try {
        // Calculate week dates (Sunday to Saturday)
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - currentDay);
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        // Check if summary already exists for this week
        const existingSummary = await storage.getWeeklySummary(user.id, weekStart);
        if (existingSummary) {
          console.log(`Weekly summary already exists for user ${user.id}`);
          continue;
        }
        
        // Get weekly stats
        const weeklyStats = await storage.getWeeklyChirpStats(user.id, weekStart, weekEnd);
        
        // Only generate summary if user has activity
        if (weeklyStats.chirpCount > 0) {
          // Generate AI summary
          const aiSummary = await generateWeeklySummary(
            user.id,
            weeklyStats.chirpCount,
            weeklyStats.topChirp || "No chirps this week",
            weeklyStats.topReactions,
            weeklyStats.commonWords,
            "positive"
          );
          
          // Create weekly summary record
          const summaryData = {
            userId: user.id,
            weekStartDate: weekStart.toISOString().split('T')[0],
            weekEndDate: weekEnd.toISOString().split('T')[0],
            chirpCount: weeklyStats.chirpCount,
            tone: aiSummary.analysis.tone,
            topChirp: weeklyStats.topChirp,
            topReactions: weeklyStats.topReactions,
            commonWords: weeklyStats.commonWords,
            weeklyVibes: aiSummary.analysis.weeklyVibes,
            summaryText: aiSummary.summary,
          };
          
          await storage.createWeeklySummary(summaryData);
          console.log(`Generated weekly summary for user ${user.id}`);
        } else {
          console.log(`No activity found for user ${user.id}, skipping summary generation`);
        }
        
        // Small delay to avoid overwhelming OpenAI API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (userError) {
        console.error(`Error generating summary for user ${user.id}:`, userError);
        // Continue with next user instead of stopping
        continue;
      }
    }
    
    console.log('Weekly summary generation completed for all users');
  } catch (error) {
    console.error('Error in weekly summary generation:', error);
  }
}

export function initializeScheduler() {
  // Schedule weekly summaries and analytics to run every Saturday at 12:00 PM (noon)
  // Cron format: minute hour day-of-month month day-of-week
  // 0 12 * * 6 = At 12:00 on Saturday
  cron.schedule('0 12 * * 6', async () => {
    console.log('Starting weekly tasks at', new Date().toISOString());
    try {
      // Generate weekly summaries first
      await generateWeeklySummariesForAllUsers();
      
      // Then send email analytics
      await sendWeeklyAnalyticsToAllUsers();
      
      console.log('All weekly tasks completed successfully');
    } catch (error) {
      console.error('Error in weekly tasks:', error);
    }
  }, {
    timezone: "America/New_York" // Adjust timezone as needed
  });

  console.log('Weekly analytics scheduler initialized - will run every Saturday at 12:00 PM');

  // For testing purposes, you can manually trigger analytics with this endpoint
  return {
    triggerWeeklyAnalytics: sendWeeklyAnalyticsToAllUsers,
    triggerWeeklySummaries: generateWeeklySummariesForAllUsers
  };
}