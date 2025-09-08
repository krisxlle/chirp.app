#!/usr/bin/env node

/**
 * Upload Yellow Bird SVG to Supabase Storage
 * 
 * This script uploads the yellow-bird.svg file to Supabase storage
 * and updates the Solarius bot's profile image URL.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadYellowBirdSVG() {
  try {
    console.log('🌅 Uploading yellow-bird.svg to Supabase storage...');
    
    // Read the SVG file
    const svgPath = path.join(__dirname, '../public/assets/yellow-bird.svg');
    console.log('📁 Reading SVG file from:', svgPath);
    
    if (!fs.existsSync(svgPath)) {
      console.error('❌ yellow-bird.svg file not found at:', svgPath);
      return;
    }
    
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    console.log('✅ SVG file read successfully, size:', svgContent.length, 'characters');
    
    // Upload via REST API (following the pattern from uploadRedBirdPFP.ts)
    const fileName = `yellow-bird-pfp-${Date.now()}.svg`;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/assets/${fileName}`;
    
    console.log('📤 Uploading to:', uploadUrl);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'image/svg+xml',
        'apikey': supabaseKey
      },
      body: svgContent
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Yellow bird SVG uploaded successfully:', data);
      
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
    console.error('❌ Error uploading yellow bird SVG:', error);
  }
}

// Run the upload
if (require.main === module) {
  uploadYellowBirdSVG();
}

module.exports = { uploadYellowBirdSVG };
