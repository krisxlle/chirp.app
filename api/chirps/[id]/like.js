// Vercel serverless function for chirp like API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
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

  try {
    // Handle POST /api/chirps/[id]/like (like/unlike chirp)
    if (req.method === 'POST') {
      console.log('🔴 Like request:', { chirpId: id, userId });

      // Check if the user has already liked the chirp
      const { data: existingReaction, error: checkError } = await supabase
        .from('reactions')
        .select('id')
        .eq('chirp_id', id)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Error checking existing reaction:', checkError);
        res.status(500).json({
          success: false,
          error: 'Database error',
          message: 'Failed to check like status'
        });
        return;
      }

      const hasLiked = !!existingReaction;

      if (hasLiked) {
        // Unlike: remove the reaction
        const { error: deleteError } = await supabase
          .from('reactions')
          .delete()
          .eq('chirp_id', id)
          .eq('user_id', userId);

        if (deleteError) {
          console.error('❌ Error removing reaction:', deleteError);
          res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Failed to unlike chirp'
          });
          return;
        }

        // Get updated like count
        const { count: likesCount, error: countError } = await supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('chirp_id', id);

        if (countError) {
          console.error('❌ Error getting like count after unlike:', countError);
        }

        console.log('✅ Chirp unliked successfully');
        res.status(200).json({
          success: true,
          liked: false,
          likesCount: likesCount || 0,
          message: 'Chirp unliked successfully'
        });
      } else {
        // Like: add the reaction
        const { error: insertError } = await supabase
          .from('reactions')
          .insert({
            chirp_id: parseInt(id),
            user_id: userId
          });

        if (insertError) {
          console.error('❌ Error adding reaction:', insertError);
          res.status(500).json({
            success: false,
            error: 'Database error',
            message: 'Failed to like chirp'
          });
          return;
        }

        // Get updated like count
        const { count: likesCount, error: countError } = await supabase
          .from('reactions')
          .select('*', { count: 'exact', head: true })
          .eq('chirp_id', id);

        if (countError) {
          console.error('❌ Error getting like count after like:', countError);
        }

        console.log('✅ Chirp liked successfully');
        res.status(200).json({
          success: true,
          liked: true,
          likesCount: likesCount || 0,
          message: 'Chirp liked successfully'
        });
      }
      return;
    }

    // Handle GET /api/chirps/[id]/like (check like status)
    if (req.method === 'GET') {
      console.log('🔍 Check like status:', { chirpId: id, userId });

      // Check if the user has liked the chirp
      const { data: existingReaction, error: checkError } = await supabase
        .from('reactions')
        .select('id')
        .eq('chirp_id', id)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ Error checking like status:', checkError);
        res.status(500).json({
          success: false,
          error: 'Database error',
          message: 'Failed to check like status'
        });
        return;
      }

      const hasLiked = !!existingReaction;

      // Get total like count for this chirp
      const { count: likesCount, error: countError } = await supabase
        .from('reactions')
        .select('*', { count: 'exact', head: true })
        .eq('chirp_id', id);

      if (countError) {
        console.error('❌ Error getting like count:', countError);
        res.status(500).json({
          success: false,
          error: 'Database error',
          message: 'Failed to get like count'
        });
        return;
      }

      console.log('✅ Like status retrieved:', { hasLiked, likesCount });
      res.status(200).json({
        success: true,
        liked: hasLiked,
        likesCount: likesCount || 0,
        message: 'Like status retrieved'
      });
      return;
    }

    // Handle other methods
    res.status(405).json({
      error: 'Method not allowed',
      message: `Method ${req.method} not supported for this endpoint`
    });

  } catch (error) {
    console.error('❌ Unexpected error in like API:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}
