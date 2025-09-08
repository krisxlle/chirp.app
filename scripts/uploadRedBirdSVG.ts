#!/usr/bin/env ts-node

/**
 * Upload Red Bird SVG to Supabase Storage
 * 
 * This script uploads the red-bird.svg file to Supabase storage for use as CrimsonTalon's profile photo.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Supabase client
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadRedBirdSVG() {
  try {
    console.log('📸 Uploading red-bird.svg to Supabase storage...');
    
    // Skip bucket check and try direct upload
    console.log('🚀 Attempting direct upload to assets bucket...');
    
    // Read the SVG file
    const svgPath = path.join(process.cwd(), 'public', 'assets', 'red-bird.svg');
    
    if (!fs.existsSync(svgPath)) {
      console.error('❌ red-bird.svg file not found at:', svgPath);
      return;
    }
    
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    console.log('✅ SVG file read successfully, size:', svgContent.length, 'bytes');
    
    // Upload to Supabase storage
    const fileName = `red-bird-${Date.now()}.svg`;
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(fileName, svgContent, {
        contentType: 'image/svg+xml',
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('❌ Error uploading to storage:', error);
      return;
    }
    
    console.log('✅ File uploaded successfully:', data.path);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(data.path);
    
    console.log('🌐 Public URL:', urlData.publicUrl);
    
    // Update CrimsonTalon's profile photo
    console.log('🤖 Updating CrimsonTalon profile photo...');
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        profile_image_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('custom_handle', 'CrimsonTalon');

    if (updateError) {
      console.error('❌ Error updating CrimsonTalon profile photo:', updateError);
      return;
    }

    console.log('✅ CrimsonTalon profile photo updated successfully!');
    console.log('📸 New profile photo URL:', urlData.publicUrl);

  } catch (error) {
    console.error('❌ Error uploading red-bird.svg:', error);
  }
}

// Run the upload
if (require.main === module) {
  uploadRedBirdSVG();
}

export { uploadRedBirdSVG };
