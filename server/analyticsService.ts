import { storage } from "./storage";
import { generateWeeklySummary } from "./openai";
// Import interface separately to avoid circular dependency
interface WeeklyStats {
  userId: string;
  userEmail: string;
  userName: string;
  userHandle: string;
  weekStartDate: string;
  weekEndDate: string;
  
  // Content metrics
  chirpsPosted: number;
  repliesReceived: number;
  totalReactions: number;
  topChirp: {
    content: string;
    reactions: number;
    replies: number;
  } | null;
  
  // Growth metrics
  newFollowers: number;
  totalFollowers: number;
  followersGrowthPercent: number;
  newFollowing: number;
  
  // Engagement metrics
  avgReactionsPerChirp: number;
  avgRepliesPerChirp: number;
  topReactions: Array<{ emoji: string; count: number }>;
  engagementRate: number;
  
  // AI insights
  aiSummary: string;
  viralPotential: number; // 1-10 score
  recommendations: string[];
}
import { sendWeeklyAnalyticsEmail } from "./emailService";

export async function generateWeeklyAnalytics(userId: string, weekStartDate: Date, weekEndDate: Date): Promise<WeeklyStats | null> {
  try {
    const user = await storage.getUser(userId);
    if (!user || !user.email) {
      console.log(`No email found for user ${userId}, skipping analytics`);
      return null;
    }

    const handle = user.hasCustomHandle && user.customHandle ? user.customHandle : user.handle;
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0];

    // Get user's chirps from the week
    const allUserChirps = await storage.getChirpsByUser(userId);
    const weekChirps = allUserChirps.filter(chirp => {
      const chirpDate = new Date(chirp.createdAt);
      return chirpDate >= weekStartDate && chirpDate <= weekEndDate;
    });

    // Get follower statistics
    const currentFollowers = await storage.getFollowers(userId);
    const followHistory = await storage.getFollowHistory(userId, weekStartDate, weekEndDate);
    const newFollowersCount = followHistory.newFollowers;
    const totalFollowers = currentFollowers.length;
    const previousFollowers = totalFollowers - newFollowersCount;
    const followersGrowthPercent = previousFollowers > 0 ? (newFollowersCount / previousFollowers) * 100 : 0;

    // Calculate engagement metrics
    let totalReactions = 0;
    let totalReplies = 0;
    let topChirp = null;
    let maxEngagement = 0;

    for (const chirp of weekChirps) {
      const reactions = Object.values(chirp.reactionCounts || {}).reduce((sum, count) => sum + count, 0);
      const replies = chirp.replies?.length || 0;
      const engagement = reactions + replies;
      
      totalReactions += reactions;
      totalReplies += replies;

      if (engagement > maxEngagement) {
        maxEngagement = engagement;
        topChirp = {
          content: chirp.content,
          reactions,
          replies
        };
      }
    }

    const avgReactionsPerChirp = weekChirps.length > 0 ? totalReactions / weekChirps.length : 0;
    const avgRepliesPerChirp = weekChirps.length > 0 ? totalReplies / weekChirps.length : 0;
    const engagementRate = totalFollowers > 0 ? ((totalReactions + totalReplies) / totalFollowers) * 100 : 0;

    // Get top reactions
    const reactionCounts: Record<string, number> = {};
    weekChirps.forEach(chirp => {
      if (chirp.reactionCounts) {
        Object.entries(chirp.reactionCounts).forEach(([emoji, count]) => {
          reactionCounts[emoji] = (reactionCounts[emoji] || 0) + count;
        });
      }
    });

    const topReactions = Object.entries(reactionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([emoji, count]) => ({ emoji, count }));

    // Calculate viral potential score (1-10)
    let viralPotential = 1;
    if (weekChirps.length > 0) {
      viralPotential += Math.min(2, weekChirps.length / 5); // More posts = higher potential
    }
    if (avgReactionsPerChirp > 5) viralPotential += 2;
    if (avgReactionsPerChirp > 10) viralPotential += 1;
    if (newFollowersCount > 5) viralPotential += 2;
    if (newFollowersCount > 20) viralPotential += 1;
    if (engagementRate > 10) viralPotential += 1;
    viralPotential = Math.min(10, Math.round(viralPotential));

    // Generate AI insights and recommendations
    const recentChirps = weekChirps.slice(0, 10).map(chirp => chirp.content);
    const aiSummary = await generateAdvancedWeeklySummary(
      userId,
      weekChirps.length,
      topChirp?.content,
      topReactions,
      newFollowersCount,
      engagementRate,
      recentChirps
    );

    const recommendations = generateRecommendations(
      weekChirps.length,
      avgReactionsPerChirp,
      newFollowersCount,
      engagementRate,
      viralPotential
    );

    const stats: WeeklyStats = {
      userId,
      userEmail: user.email,
      userName,
      userHandle: handle || 'user',
      weekStartDate: weekStartDate.toISOString().split('T')[0],
      weekEndDate: weekEndDate.toISOString().split('T')[0],
      
      chirpsPosted: weekChirps.length,
      repliesReceived: totalReplies,
      totalReactions,
      topChirp,
      
      newFollowers: newFollowersCount,
      totalFollowers,
      followersGrowthPercent,
      newFollowing: followHistory.newFollowing,
      
      avgReactionsPerChirp,
      avgRepliesPerChirp,
      topReactions,
      engagementRate,
      
      aiSummary,
      viralPotential,
      recommendations
    };

    return stats;
  } catch (error) {
    console.error('Error generating weekly analytics:', error);
    return null;
  }
}

async function generateAdvancedWeeklySummary(
  userId: string,
  chirpCount: number,
  topChirp: string | undefined,
  topReactions: Array<{ emoji: string; count: number }>,
  newFollowers: number,
  engagementRate: number,
  recentChirps: string[]
): Promise<string> {
  try {
    // Use OpenAI directly for analytics summaries
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
    });

    const prompt = `Create a concise weekly social media summary using bullet points and symbols:

📊 This week: ${chirpCount} chirps posted, gained ${newFollowers} followers
🎯 Engagement: ${engagementRate.toFixed(1)}% rate
${topReactions.length > 0 ? `🔥 Top reactions: ${topReactions.map(r => `${r.emoji}(${r.count})`).join(' ')}` : ''}

Generate 2-3 bullet points with symbols (✨📈💡🚀⚡) focusing on:
• Key performance highlight
• Growth insight or engagement win
• One actionable tip for next week

Keep each bullet under 15 words. Be encouraging and data-focused. Use symbols to make it visually appealing.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    return response.choices[0].message.content || getFallbackSummary(chirpCount, newFollowers, engagementRate);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return getFallbackSummary(chirpCount, newFollowers, engagementRate);
  }
}

function getFallbackSummary(chirpCount: number, newFollowers: number, engagementRate: number): string {
  return `📊 Posted ${chirpCount} chirps this week with ${engagementRate.toFixed(1)}% engagement
✨ Gained ${newFollowers} new followers - nice momentum!
🚀 Keep posting consistently to build your community`;
}

function generateRecommendations(
  chirpCount: number,
  avgReactions: number,
  newFollowers: number,
  engagementRate: number,
  viralPotential: number
): string[] {
  const recommendations: string[] = [];

  // Content frequency recommendations
  if (chirpCount < 3) {
    recommendations.push("Post more consistently - aim for 1-2 chirps per day to increase visibility");
  } else if (chirpCount > 15) {
    recommendations.push("Consider quality over quantity - fewer high-quality posts often perform better");
  }

  // Engagement recommendations
  if (avgReactions < 2) {
    recommendations.push("Try asking questions or using trending topics to boost engagement");
    recommendations.push("Engage with others' content to build community and reciprocal interactions");
  }

  // Growth recommendations
  if (newFollowers < 5) {
    recommendations.push("Use relevant hashtags and mention other users to expand your reach");
    recommendations.push("Post during peak hours when your audience is most active");
  }

  // Viral potential recommendations
  if (viralPotential < 5) {
    recommendations.push("Share more relatable, shareable content that sparks conversations");
    recommendations.push("Try different content formats - questions, polls, or trending topics");
  } else if (viralPotential >= 7) {
    recommendations.push("You're building great momentum! Keep your current content strategy");
    recommendations.push("Consider collaborating with other users to amplify your reach");
  }

  // Engagement rate specific
  if (engagementRate < 5) {
    recommendations.push("Focus on building genuine connections with your audience through replies and comments");
  }

  // Fallback recommendations
  if (recommendations.length < 3) {
    recommendations.push("Stay authentic to your voice while experimenting with new content ideas");
    recommendations.push("Analyze your top-performing content and create similar posts");
    recommendations.push("Engage with trending topics relevant to your interests");
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

export async function sendWeeklyAnalyticsToAllUsers(): Promise<void> {
  try {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - now.getDay()); // Last Saturday
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 7);

    console.log(`Generating weekly analytics for week: ${weekStart.toISOString().split('T')[0]} to ${weekEnd.toISOString().split('T')[0]}`);

    // Get all users who have email addresses and have opted in to weekly analytics
    const allUsers = await storage.getAllUsers();
    const usersWithEmail = allUsers.filter(user => user.email && user.weeklyAnalyticsEnabled !== false);

    console.log(`Found ${usersWithEmail.length} users with email addresses`);

    for (const user of usersWithEmail) {
      try {
        console.log(`Generating analytics for user ${user.id} (${user.email})`);
        const stats = await generateWeeklyAnalytics(user.id, weekStart, weekEnd);
        
        if (stats) {
          const emailSent = await sendWeeklyAnalyticsEmail(stats);
          if (emailSent) {
            console.log(`Weekly analytics email sent successfully to ${user.email}`);
          } else {
            console.error(`Failed to send weekly analytics email to ${user.email}`);
          }
        }
        
        // Add small delay to avoid overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error processing weekly analytics for user ${user.id}:`, error);
      }
    }

    console.log('Weekly analytics generation completed');
  } catch (error) {
    console.error('Error in sendWeeklyAnalyticsToAllUsers:', error);
  }
}