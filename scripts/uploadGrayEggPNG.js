#!/usr/bin/env node

/**
 * Upload Gray Egg PNG to Supabase Storage
 * 
 * This script uploads the Gray Egg PFP.png file to Supabase storage
 * and updates the Obsidian bot's profile image URL.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadGrayEggPNG() {
  try {
    console.log('🥚 Uploading Gray Egg PFP.png to Supabase storage...');
    
    // Read the PNG file
    const pngPath = path.join(__dirname, '../public/assets/Gray Egg PFP.png');
    console.log('📁 Reading PNG file from:', pngPath);
    
    if (!fs.existsSync(pngPath)) {
      console.error('❌ Gray Egg PFP.png file not found at:', pngPath);
      return;
    }
    
    const pngBuffer = fs.readFileSync(pngPath);
    console.log('✅ PNG file read successfully, size:', pngBuffer.length, 'bytes');
    
    // Upload via REST API (following the pattern from uploadRedBirdPFP.ts)
    const fileName = `gray-egg-pfp-${Date.now()}.png`;
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
      console.log('✅ Gray egg PNG uploaded successfully:', data);
      
      // Get public URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/assets/${fileName}`;
      console.log('🌐 Public URL:', publicUrl);
      
      console.log('\n🎉 Gray egg profile picture upload complete!');
      console.log('===============================================');
      console.log('You can now use this URL in the Obsidian bot configuration:');
      console.log(publicUrl);

    } else {
      const error = await response.text();
      console.error('❌ Error uploading file:', response.status, error);
    }
    
  } catch (error) {
    console.error('❌ Error uploading gray egg PNG:', error);
  }
}

// Run the upload
if (require.main === module) {
  uploadGrayEggPNG();
}

module.exports = { uploadGrayEggPNG };
