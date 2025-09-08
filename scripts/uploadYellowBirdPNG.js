#!/usr/bin/env node

/**
 * Upload Yellow Bird PNG to Supabase Storage
 * 
 * This script uploads the Yellow Bird PFP.png file to Supabase storage
 * and updates the Solarius bot's profile image URL.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadYellowBirdPNG() {
  try {
    console.log('🌅 Uploading Yellow Bird PFP.png to Supabase storage...');
    
    // Read the PNG file
    const pngPath = path.join(__dirname, '../public/assets/Yellow Bird PFP.png');
    console.log('📁 Reading PNG file from:', pngPath);
    
    if (!fs.existsSync(pngPath)) {
      console.error('❌ Yellow Bird PFP.png file not found at:', pngPath);
      return;
    }
    
    const pngBuffer = fs.readFileSync(pngPath);
    console.log('✅ PNG file read successfully, size:', pngBuffer.length, 'bytes');
    
    // Upload via REST API (following the pattern from uploadRedBirdPFP.ts)
    const fileName = `yellow-bird-pfp-${Date.now()}.png`;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/assets/${fileName}`;
    
    console.log('📤 Uploading to:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'image/png',
        'apikey': supabaseKey
      },
      body: pngBuffer
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Yellow bird PNG uploaded successfully:', data);
      
      // Get public URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/assets/${fileName}`;
      console.log('🌐 Public URL:', publicUrl);
      
      // Update Solarius bot's profile photo
      console.log('🤖 Updating Solarius profile photo...');
      
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?custom_handle=eq.solarius`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          profile_image_url: publicUrl,
          updated_at: new Date().toISOString()
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Solarius profile photo updated successfully!');
        console.log('📸 New profile photo URL:', publicUrl);
      } else {
        const error = await updateResponse.text();
        console.error('❌ Error updating profile photo:', updateResponse.status, error);
      }
      
    } else {
      const error = await response.text();
      console.error('❌ Error uploading file:', response.status, error);
    }
    
  } catch (error) {
    console.error('❌ Error uploading yellow bird PNG:', error);
  }
}

// Run the upload
if (require.main === module) {
  uploadYellowBirdPNG();
}

module.exports = { uploadYellowBirdPNG };
