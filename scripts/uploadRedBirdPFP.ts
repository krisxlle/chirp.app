#!/usr/bin/env ts-node

/**
 * Upload Red Bird PFP PNG
 * 
 * This script uploads the Red Bird PFP.png file to Supabase storage and updates CrimsonTalon's profile photo.
 */

import * as fs from 'fs';
import * as path from 'path';

// Supabase configuration
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

async function uploadRedBirdPFP() {
  try {
    console.log('📸 Uploading Red Bird PFP.png to Supabase storage...');
    
    // Read the PNG file
    const pngPath = path.join(process.cwd(), 'public', 'assets', 'Red Bird PFP.png');
    
    if (!fs.existsSync(pngPath)) {
      console.error('❌ Red Bird PFP.png file not found at:', pngPath);
      return;
    }
    
    const pngBuffer = fs.readFileSync(pngPath);
    console.log('✅ PNG file read successfully, size:', pngBuffer.length, 'bytes');
    
    // Upload via REST API
    const fileName = `red-bird-pfp-${Date.now()}.png`;
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
      console.log('✅ Red Bird PFP uploaded successfully:', data);
      
      // Get public URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/assets/${fileName}`;
      console.log('🌐 Public URL:', publicUrl);
      
      // Update CrimsonTalon's profile photo
      console.log('🤖 Updating CrimsonTalon profile photo...');
      
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?custom_handle=eq.CrimsonTalon`, {
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
        console.log('✅ CrimsonTalon profile photo updated successfully!');
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
    console.error('❌ Error uploading Red Bird PFP:', error);
  }
}

// Run the upload
if (require.main === module) {
  uploadRedBirdPFP();
}

export { uploadRedBirdPFP };
