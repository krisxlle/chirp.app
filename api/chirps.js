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
        profileImageUrl: null,
        isChirpPlus: true,
        showChirpPlusBadge: true
      },
      createdAt: new Date().toISOString(),
      likes: 42,
      replies: 5,
      reposts: 3,
      isLiked: false,
      isReposted: false,
      reactionCounts: {
        '👍': 15,
        '❤️': 20,
        '😂': 7
      },
      userReaction: null,
      replies: [],
      repostOf: null,
      isAiGenerated: false,
      isWeeklySummary: false,
      threadId: null,
      threadOrder: null,
      isThreadStarter: true
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
        profileImageUrl: null,
        isChirpPlus: true,
        showChirpPlusBadge: true
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      likes: 28,
      replies: 2,
      reposts: 1,
      isLiked: false,
      isReposted: false,
      reactionCounts: {
        '👍': 10,
        '❤️': 15,
        '😂': 3
      },
      userReaction: null,
      replies: [],
      repostOf: null,
      isAiGenerated: false,
      isWeeklySummary: false,
      threadId: null,
      threadOrder: null,
      isThreadStarter: true
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
        profileImageUrl: null,
        isChirpPlus: false,
        showChirpPlusBadge: false
      },
      createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      likes: 15,
      replies: 1,
      reposts: 0,
      isLiked: true,
      isReposted: false,
      reactionCounts: {
        '👍': 8,
        '❤️': 5,
        '😂': 2
      },
      userReaction: '❤️',
      replies: [],
      repostOf: null,
      isAiGenerated: false,
      isWeeklySummary: false,
      threadId: null,
      threadOrder: null,
      isThreadStarter: true
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
      // For trending, sort by likes
      filteredChirps = mockChirps.sort((a, b) => b.likes - a.likes);
    }

    res.status(200).json(filteredChirps);
    return;
  }

  // Handle POST /api/chirps (create new chirp)
  if (req.method === 'POST') {
    const { content } = req.body;
    
    if (!content) {
      res.status(400).json({
        error: 'Content is required',
        message: 'Please provide content for your chirp'
      });
      return;
    }

    const newChirp = {
      id: Date.now().toString(),
      content,
      author: {
        id: '2', // Mock user ID
        name: 'Kriselle',
        handle: 'kriselle',
        profileImageUrl: 'https://via.placeholder.com/150'
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      replies: 0,
      reposts: 0,
      isLiked: false,
      isReposted: false
    };

    res.status(201).json({
      chirp: newChirp,
      message: 'Chirp created successfully!',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Handle other methods
  res.status(405).json({
    error: 'Method not allowed',
    message: `Method ${req.method} not supported for this endpoint`
  });
}
