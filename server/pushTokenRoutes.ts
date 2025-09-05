import { insertPushTokenSchema } from '@shared/schema';
import { Router } from 'express';
import { storage } from './storage';

const router = Router();

// Register a push token
router.post('/push-tokens', async (req, res) => {
  try {
    // For now, we'll use a default user ID for demo purposes
    // In production, this would come from authenticated session
    const userId = 'chirp-preview-001'; // Default to @chirp account
    
    const validatedData = insertPushTokenSchema.parse({
      userId,
      token: req.body.token,
      platform: req.body.platform,
    });

    await storage.addPushToken(validatedData.userId, validatedData.token, validatedData.platform);
    
    console.log('Push token registered successfully:', validatedData.token ? `${validatedData.token.substring(0, 20)}...${validatedData.token.substring(validatedData.token.length - 10)}` : 'null');
    res.json({ success: true, message: 'Push token registered' });
  } catch (error) {
    console.error('Error registering push token:', error);
    res.status(500).json({ error: 'Failed to register push token' });
  }
});

// Remove a push token
router.delete('/push-tokens/:token', async (req, res) => {
  try {
    await storage.removePushToken(req.params.token);
    
    console.log('Push token removed successfully:', req.params.token ? `${req.params.token.substring(0, 20)}...${req.params.token.substring(req.params.token.length - 10)}` : 'null');
    res.json({ success: true, message: 'Push token removed' });
  } catch (error) {
    console.error('Error removing push token:', error);
    res.status(500).json({ error: 'Failed to remove push token' });
  }
});

// Get user's push tokens (for debugging)
router.get('/push-tokens/:userId', async (req, res) => {
  try {
    const tokens = await storage.getUserPushTokens(req.params.userId);
    res.json({ tokens });
  } catch (error) {
    console.error('Error getting push tokens:', error);
    res.status(500).json({ error: 'Failed to get push tokens' });
  }
});

export default router;