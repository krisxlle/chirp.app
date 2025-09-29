// Vercel serverless function for gacha API
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { method } = req;

  // Mock profile frames data
  const mockFrames = [
    {
      id: 1,
      name: 'Golden Aura',
      rarity: 'legendary',
      imageUrl: '/assets/Legendary Frame.png',
      dropRate: 0.01, // 1%
      seasonId: 1
    },
    {
      id: 2,
      name: 'Crystal Shard',
      rarity: 'epic',
      imageUrl: '/assets/Epic Frame.png',
      dropRate: 0.05, // 5%
      seasonId: 1
    },
    {
      id: 3,
      name: 'Silver Lining',
      rarity: 'rare',
      imageUrl: '/assets/Rare Frame.png',
      dropRate: 0.15, // 15%
      seasonId: 1
    },
    {
      id: 4,
      name: 'Bronze Edge',
      rarity: 'uncommon',
      imageUrl: '/assets/Uncommon Frame.png',
      dropRate: 0.30, // 30%
      seasonId: 1
    },
    {
      id: 5,
      name: 'Iron Core',
      rarity: 'common',
      imageUrl: '/assets/Common Frame.png',
      dropRate: 0.49, // 49%
      seasonId: 1
    }
  ];

  if (method === 'POST') {
    const { action, userId } = req.body;

    if (action === 'roll') {
      // Simulate rolling for a frame
      const randomRoll = Math.random();
      let cumulativeRate = 0;
      let selectedFrame = null;

      // Find frame based on drop rates (cumulative probability)
      for (const frame of mockFrames) {
        cumulativeRate += frame.dropRate;
        if (randomRoll <= cumulativeRate) {
          selectedFrame = frame;
          break;
        }
      }

      // Fallback to rarest frame if no frame found
      if (!selectedFrame) {
        selectedFrame = mockFrames[0]; // Golden Aura (legendary)
      }

      // Mock adding to user collection
      const result = {
        frameId: selectedFrame.id,
        frameName: selectedFrame.name,
        frameRarity: selectedFrame.rarity,
        frameImageUrl: selectedFrame.imageUrl,
        isNew: true, // For now, always show as new
        obtainedAt: new Date().toISOString()
      };

      console.log('🎲 Gacha roll result:', result);
      
      res.status(200).json({
        success: true,
        data: result
      });
      return;
    }

    if (action === 'getCollection') {
      // Mock user collection data
      const mockCollection = [
        {
          collectionId: 1,
          frameId: 1,
          frameName: 'Golden Aura',
          frameRarity: 'legendary',
          frameImageUrl: '/assets/Legendary Frame.png',
          quantity: 1,
          obtainedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          isEquipped: true
        },
        {
          collectionId: 2,
          frameId: 3,
          frameName: 'Silver Lining',
          frameRarity: 'rare',
          frameImageUrl: '/assets/Rare Frame.png',
          quantity: 2,
          obtainedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          isEquipped: false
        }
      ];

      res.status(200).json({
        success: true,
        data: mockCollection
      });
      return;
    }

    if (action === 'equip') {
      const { frameId } = req.body;
      
      // Mock equipping frame
      console.log(`🎯 Equipping frame ${frameId} for user ${userId}`);
      
      res.status(200).json({
        success: true,
        message: 'Frame equipped successfully'
      });
      return;
    }
  }

  if (method === 'GET') {
    // Get available frames
    res.status(200).json({
      success: true,
      data: mockFrames
    });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}

