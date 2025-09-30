// Vercel serverless function for chirp like API
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

  const { id } = req.query;
  const { userId } = req.body;

  console.log('🔍 Like API Debug:', {
    method: req.method,
    url: req.url,
    query: req.query,
    body: req.body,
    extractedId: id
  });

  if (!id) {
    console.log('❌ No chirp ID found in request');
    res.status(400).json({
      success: false,
      error: 'Chirp ID is required',
      message: 'Please provide a valid chirp ID',
      debug: {
        query: req.query,
        url: req.url
      }
    });
    return;
  }

  if (!userId) {
    res.status(400).json({
      success: false,
      error: 'User ID is required',
      message: 'Please provide a valid user ID'
    });
    return;
  }

  // Handle POST /api/chirps/[id]/like (like/unlike chirp)
  if (req.method === 'POST') {
    console.log('🔴 Like request:', { chirpId: id, userId });

    // For now, return a mock success response
    // In a real implementation, this would:
    // 1. Check if the user has already liked the chirp
    // 2. If not liked, add a like record to the database
    // 3. If already liked, remove the like record
    // 4. Update the chirp's like count
    // 5. Return the updated like status

    const mockResponse = {
      success: true,
      liked: true, // Mock: assume we're liking (not unliking)
      likesCount: Math.floor(Math.random() * 100) + 1, // Mock: random like count
      message: 'Chirp liked successfully'
    };

    console.log('✅ Like response:', mockResponse);

    res.status(200).json(mockResponse);
    return;
  }

  // Handle GET /api/chirps/[id]/like (check like status)
  if (req.method === 'GET') {
    console.log('🔍 Check like status:', { chirpId: id, userId });

    // Mock response for checking like status
    const mockResponse = {
      success: true,
      liked: Math.random() > 0.5, // Mock: random like status
      likesCount: Math.floor(Math.random() * 100) + 1, // Mock: random like count
      message: 'Like status retrieved'
    };

    console.log('✅ Like status response:', mockResponse);

    res.status(200).json(mockResponse);
    return;
  }

  // Handle other methods
  res.status(405).json({
    error: 'Method not allowed',
    message: `Method ${req.method} not supported for this endpoint`
  });
}
