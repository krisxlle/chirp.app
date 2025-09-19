import { Express } from 'express';
import { botScheduler } from '../services/botScheduler';

// Simple bot service stub for production
const botService = {
  async initialize() {
    console.log('🤖 Bot service initialization disabled in production');
    return true;
  },
  
  getBotUserId() {
    return null; // No bot user ID in production
  },
  
  getBotConfig() {
    return {
      postingSchedule: {
        morning: '09:00',
        evening: '18:00'
      },
      isEnabled: false
    };
  }
};

export function registerBotRoutes(app: Express): void {
  // Initialize bot endpoint
  app.post('/api/bot/initialize', async (req, res) => {
    try {
      console.log('🤖 Initializing bot service...');
      await botService.initialize();
      
      res.json({ 
        success: true, 
        message: 'Bot service initialized successfully',
        botUserId: botService.getBotUserId()
      });
    } catch (error) {
      console.error('❌ Error initializing bot:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to initialize bot service',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Start scheduler endpoint
  app.post('/api/bot/start-scheduler', async (req, res) => {
    try {
      console.log('🤖 Starting bot scheduler...');
      botScheduler.start();
      
      res.json({ 
        success: true, 
        message: 'Bot scheduler started successfully'
      });
    } catch (error) {
      console.error('❌ Error starting scheduler:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to start bot scheduler',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Stop scheduler endpoint
  app.post('/api/bot/stop-scheduler', async (req, res) => {
    try {
      console.log('🤖 Stopping bot scheduler...');
      botScheduler.stop();
      
      res.json({ 
        success: true, 
        message: 'Bot scheduler stopped successfully'
      });
    } catch (error) {
      console.error('❌ Error stopping scheduler:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to stop bot scheduler',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Force post endpoint (for testing)
  app.post('/api/bot/force-post', async (req, res) => {
    try {
      console.log('🤖 Force posting bot chirp...');
      const success = await botScheduler.forcePost();
      
      if (success) {
        res.json({ 
          success: true, 
          message: 'Bot chirp posted successfully'
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Failed to post bot chirp'
        });
      }
    } catch (error) {
      console.error('❌ Error force posting:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to force post bot chirp',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get bot status endpoint
  app.get('/api/bot/status', async (req, res) => {
    try {
      const schedulerStatus = botScheduler.getStatus();
      const botConfig = botService.getBotConfig();
      const nextPostingTimes = botScheduler.getNextPostingTimes();
      
      res.json({
        success: true,
        bot: {
          userId: botService.getBotUserId(),
          username: botConfig.username,
          isInitialized: !!botService.getBotUserId()
        },
        scheduler: schedulerStatus,
        nextPostingTimes
      });
    } catch (error) {
      console.error('❌ Error getting bot status:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get bot status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get bot config endpoint
  app.get('/api/bot/config', async (req, res) => {
    try {
      const config = botService.getBotConfig();
      
      res.json({
        success: true,
        config: {
          username: config.username,
          firstName: config.firstName,
          lastName: config.lastName,
          bio: config.bio,
          postingSchedule: config.postingSchedule
        }
      });
    } catch (error) {
      console.error('❌ Error getting bot config:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get bot config',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
