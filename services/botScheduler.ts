// Scheduler configuration
const SCHEDULER_CONFIG = {
  checkInterval: 60000, // Check every minute
  timezone: 'UTC'
};

// Simple bot service stub for production
class BotServiceStub {
  shouldPostNow(): boolean {
    return false; // Disable automatic posting in production
  }

  async postNewsChirp(): Promise<boolean> {
    console.log('🤖 Bot posting disabled in production');
    return false;
  }

  getBotConfig() {
    return {
      postingSchedule: {
        morning: '09:00',
        evening: '18:00'
      }
    };
  }
}

export class BotScheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private botService: BotServiceStub;
  private isRunning = false;
  private lastPostTimes: { [key: string]: Date } = {};

  constructor() {
    this.botService = new BotServiceStub();
  }

  // Start the scheduler
  start(): void {
    if (this.isRunning) {
      console.log('🤖 Bot scheduler is already running');
      return;
    }

    console.log('🤖 Starting bot scheduler...');
    this.isRunning = true;

    // Check immediately on start
    this.checkAndPost();

    // Set up interval to check every minute
    this.intervalId = setInterval(() => {
      this.checkAndPost();
    }, SCHEDULER_CONFIG.checkInterval);

    console.log('✅ Bot scheduler started successfully');
  }

  // Stop the scheduler
  stop(): void {
    if (!this.isRunning) {
      console.log('🤖 Bot scheduler is not running');
      return;
    }

    console.log('🤖 Stopping bot scheduler...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId as any);
      this.intervalId = null;
    }

    console.log('✅ Bot scheduler stopped successfully');
  }

  // Check if it's time to post and post if needed
  private async checkAndPost(): Promise<void> {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
      
      console.log(`🤖 Checking posting schedule at ${currentTime}`);

      // Check if it's time to post
      if (this.botService.shouldPostNow()) {
        const timeKey = currentTime;
        
        // Check if we already posted at this time today
        const lastPostTime = this.lastPostTimes[timeKey];
        const today = new Date().toDateString();
        
        if (!lastPostTime || lastPostTime.toDateString() !== today) {
          console.log(`🤖 Time to post at ${currentTime}!`);
          
          const success = await this.botService.postNewsChirp();
          
          if (success) {
            this.lastPostTimes[timeKey] = now;
            console.log(`✅ Bot posted successfully at ${currentTime}`);
          } else {
            console.log(`❌ Bot failed to post at ${currentTime}`);
          }
        } else {
          console.log(`🤖 Already posted at ${currentTime} today`);
        }
      }
    } catch (error) {
      console.error('❌ Error in bot scheduler check:', error);
    }
  }

  // Force a post (for testing)
  async forcePost(): Promise<boolean> {
    console.log('🤖 Force posting bot chirp...');
    return await this.botService.postNewsChirp();
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastPostTimes: this.lastPostTimes,
      config: SCHEDULER_CONFIG
    };
  }

  // Get next posting times
  getNextPostingTimes(): { morning: string; evening: string } {
    const config = this.botService.getBotConfig();
    return config.postingSchedule;
  }
}

// Export singleton instance
export const botScheduler = new BotScheduler();
