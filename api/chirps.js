// Vercel serverless function for chirps API
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

  // Mock chirps data for now
  const mockChirps = [
    {
      id: '1',
      content: 'Welcome to Chirp! This is your first chirp. 🐦',
      author: {
        id: '1',
        firstName: 'Chirp',
        lastName: 'Team',
        email: 'team@chirp.com',
        handle: 'chirpteam',
        customHandle: 'chirpteam',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isChirpPlus: true,
        showChirpPlusBadge: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likesCount: 42,
      repliesCount: 5,
      repostsCount: 3,
      sharesCount: 0,
      reactionCounts: {
        '👍': 15,
        '❤️': 20,
        '😂': 7,
        '😢': 0,
        '😡': 0
      },
      userReaction: null,
      replies: [],
      repostOf: null,
      isAiGenerated: false,
      isWeeklySummary: false,
      threadId: null,
      threadOrder: null,
      isThreadStarter: true,
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      imageAltText: 'Beautiful mountain landscape',
      imageWidth: 600,
      imageHeight: 400
    },
    {
      id: '2',
      content: 'Chirp is now live! Share your thoughts with the world. ✨',
      author: {
        id: '1',
        firstName: 'Chirp',
        lastName: 'Team',
        email: 'team@chirp.com',
        handle: 'chirpteam',
        customHandle: 'chirpteam',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        isChirpPlus: true,
        showChirpPlusBadge: true
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      likesCount: 28,
      repliesCount: 2,
      repostsCount: 1,
      sharesCount: 0,
      reactionCounts: {
        '👍': 10,
        '❤️': 15,
        '😂': 3,
        '😢': 0,
        '😡': 0
      },
      userReaction: null,
      replies: [],
      repostOf: null,
      isAiGenerated: false,
      isWeeklySummary: false,
      threadId: null,
      threadOrder: null,
      isThreadStarter: true,
      imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
      imageAltText: 'Peaceful forest path',
      imageWidth: 600,
      imageHeight: 400
    },
    {
      id: '3',
      content: 'Building something amazing with Chirp! The future of social media is here. 🚀',
      author: {
        id: '2',
        firstName: 'Kriselle',
        lastName: 'Tan',
        email: 'kriselle.t@gmail.com',
        handle: 'kriselle',
        customHandle: 'kriselle',
        profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        isChirpPlus: false,
        showChirpPlusBadge: false
      },
      createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      likesCount: 15,
      repliesCount: 1,
      repostsCount: 0,
      sharesCount: 0,
      reactionCounts: {
        '👍': 8,
        '❤️': 5,
        '😂': 2,
        '😢': 0,
        '😡': 0
      },
      userReaction: '❤️',
      replies: [],
      repostOf: null,
      isAiGenerated: false,
      isWeeklySummary: false,
      threadId: null,
      threadOrder: null,
      isThreadStarter: true,
      imageUrl: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&h=400&fit=crop',
      imageAltText: 'Modern city skyline',
      imageWidth: 600,
      imageHeight: 400
    }
  ];

  // Handle GET /api/chirps
  if (req.method === 'GET') {
    const { personalized, trending } = req.query;
    
    // Filter chirps based on query parameters
    let filteredChirps = [...mockChirps];
    
    if (personalized === 'true') {
      // For personalized feed, show chirps from followed users
      filteredChirps = mockChirps.filter(chirp => chirp.author.id === '1'); // Show team chirps
    }
    
    if (trending === 'true') {
      // For trending, sort by likesCount
      filteredChirps = mockChirps.sort((a, b) => b.likesCount - a.likesCount);
    }

    res.status(200).json(filteredChirps);
    return;
  }

  // Handle POST /api/chirps (create new chirp or reply)
  if (req.method === 'POST') {
    const { content, userId, author_id, reply_to_id, imageData } = req.body;
    
    if (!content) {
      res.status(400).json({
        success: false,
        error: 'Content is required',
        message: 'Please provide content for your chirp'
      });
      return;
    }

    // Use author_id if provided (for replies), otherwise use userId
    const authorId = author_id || userId || '1';
    const isReply = !!reply_to_id;

    const newChirp = {
      id: Date.now().toString(),
      content,
      author: {
        id: authorId,
        firstName: 'User',
        lastName: '',
        email: 'user@example.com',
        customHandle: 'user',
        handle: 'user',
        profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
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
      threadId: isReply ? reply_to_id : null,
      threadOrder: isReply ? 1 : null,
      isThreadStarter: !isReply,
      imageUrl: imageData?.imageUrl || null,
      imageAltText: imageData?.imageAltText || null,
      imageWidth: imageData?.imageWidth || null,
      imageHeight: imageData?.imageHeight || null,
      replyToId: reply_to_id || null
    };

    console.log('✅ Created chirp/reply:', {
      id: newChirp.id,
      content: newChirp.content,
      authorId: newChirp.author.id,
      isReply,
      replyToId: reply_to_id
    });

    res.status(201).json({
      success: true,
      chirp: newChirp
    });
    return;
  }

  // Handle other methods
  res.status(405).json({
    error: 'Method not allowed',
    message: `Method ${req.method} not supported for this endpoint`
  });
}
