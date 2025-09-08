#!/usr/bin/env node

/**
 * Upload Blue Bird PNG to Supabase Storage
 * 
 * This script uploads the Blue Bird PFP.png file to Supabase storage
 * and updates the Skye bot's profile image URL.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadBlueBirdPNG() {
  try {
    console.log('💼 Uploading Blue Bird PFP.png to Supabase storage...');
    
    // Read the PNG file
    const pngPath = path.join(__dirname, '../public/assets/Blue Bird PFP.png');
    console.log('📁 Reading PNG file from:', pngPath);
    
    if (!fs.existsSync(pngPath)) {
      console.error('❌ Blue Bird PFP.png file not found at:', pngPath);
      return;
    }
    
    const pngBuffer = fs.readFileSync(pngPath);
    console.log('✅ PNG file read successfully, size:', pngBuffer.length, 'bytes');
    
    // Upload via REST API (following the pattern from uploadRedBirdPFP.ts)
    const fileName = `blue-bird-pfp-${Date.now()}.png`;
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
      console.log('✅ Blue bird PNG uploaded successfully:', data);
      
      // Get public URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/assets/${fileName}`;
      console.log('🌐 Public URL:', publicUrl);
      
      console.log('\n🎉 Blue bird profile picture upload complete!');
      console.log('===============================================');
      console.log('You can now use this URL in the Skye bot configuration:');
      console.log(publicUrl);

    } else {
      const error = await response.text();
      console.error('❌ Error uploading file:', response.status, error);
    }
    
  } catch (error) {
    console.error('❌ Error uploading blue bird PNG:', error);
  }
}

// Run the upload
if (require.main === module) {
  uploadBlueBirdPNG();
}

module.exports = { uploadBlueBirdPNG };
