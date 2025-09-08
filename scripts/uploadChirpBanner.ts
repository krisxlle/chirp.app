#!/usr/bin/env ts-node

/**
 * Upload Chirp Banner as Default
 * 
 * This script uploads the chirp-banner.png file to Supabase storage to be used as the default banner.
 */

import * as fs from 'fs';
import * as path from 'path';

// Supabase configuration
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

async function uploadChirpBanner() {
  try {
    console.log('📸 Uploading chirp-banner.png to Supabase storage...');
    
    // Read the PNG file
    const pngPath = path.join(process.cwd(), 'public', 'assets', 'chirp-banner.png');
    
    if (!fs.existsSync(pngPath)) {
      console.error('❌ chirp-banner.png file not found at:', pngPath);
      return;
    }
    
    const pngBuffer = fs.readFileSync(pngPath);
    console.log('✅ PNG file read successfully, size:', pngBuffer.length, 'bytes');
    
    // Upload via REST API
    const fileName = `chirp-banner-default.png`;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/assets/${fileName}`;
    
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
      console.log('✅ Chirp banner uploaded successfully:', data);
      
      // Get public URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/assets/${fileName}`;
      console.log('🌐 Public URL:', publicUrl);
      console.log('📋 Use this URL as the default banner fallback in your components');
      
    } else {
      const error = await response.text();
      console.error('❌ Error uploading file:', response.status, error);
    }
    
  } catch (error) {
    console.error('❌ Error uploading chirp banner:', error);
  }
}

// Run the upload
if (require.main === module) {
  uploadChirpBanner();
}

export { uploadChirpBanner };
