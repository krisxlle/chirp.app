export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, userId } = req.body;

    if (!content || !Array.isArray(content) || content.length === 0) {
      return res.status(400).json({ error: 'Content array is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Mock thread creation
    // In a real implementation, you'd create multiple chirps in your database
    const threadId = `thread_${Date.now()}`;
    const createdChirps = content.map((chirpContent, index) => ({
      id: `${threadId}_${index + 1}`,
      content: chirpContent,
      author: {
        id: userId,
        firstName: 'User',
        lastName: '',
        email: 'user@example.com',
        customHandle: 'user',
        handle: 'user',
        profileImageUrl: null,
        avatarUrl: null,
        bio: '',
        isVerified: false,
        isChirpPlus: false,
        followersCount: 0,
        followingCount: 0,
        chirpsCount: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 0,
      repliesCount: 0,
      repostsCount: 0,
      sharesCount: 0,
      reactionCounts: { '❤️': 0, '👍': 0, '😂': 0, '😢': 0, '😡': 0 },
      userReaction: null,
      replies: [],
      repostOf: null,
      isAiGenerated: false,
      isWeeklySummary: false,
      threadId: threadId,
      threadOrder: index + 1,
      isThreadStarter: index === 0,
      imageUrl: null,
      imageAltText: null,
      imageWidth: null,
      imageHeight: null
    }));

    res.status(200).json(createdChirps);
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
