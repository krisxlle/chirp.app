const cron = require('node-cron');
import { notificationService } from './notificationService';

class SchedulerService {
  init() {
    console.log('Initializing notification scheduler...');
    
    // Schedule weekly summary notifications for Saturday at noon (12:00 PM)
    // Format: minute hour day month dayOfWeek
    // 0 12 * * 6 = Every Saturday at 12:00 PM
    cron.schedule('0 12 * * 6', async () => {
      console.log('Scheduled task: Sending weekly summary notifications...');
      
      try {
        await notificationService.sendWeeklySummaryNotifications();
        console.log('Weekly summary notifications sent successfully');
      } catch (error) {
        console.error('Error sending scheduled weekly summary notifications:', error);
      }
    }, {
      scheduled: true,
      timezone: "America/New_York" // Adjust timezone as needed
    });

    console.log('Notification scheduler initialized - Weekly summaries will be sent every Saturday at 12:00 PM');
  }
}

const scheduler = new SchedulerService();

export function initializeNotificationScheduler() {
  scheduler.init();
}