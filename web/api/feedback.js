// Vercel serverless function for feedback API
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

  // Handle POST /api/feedback
  if (req.method === 'POST') {
    const { message, category, email } = req.body;
    
    if (!message) {
      res.status(400).json({
        error: 'Message is required',
        message: 'Please provide feedback message'
      });
      return;
    }

    // Mock feedback submission
    const feedback = {
      id: Date.now().toString(),
      message,
      category: category || 'general',
      email: email || 'anonymous@example.com',
      createdAt: new Date().toISOString(),
      status: 'received'
    };

    res.status(201).json({
      feedback,
      message: 'Thank you for your feedback! We appreciate your input.',
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
