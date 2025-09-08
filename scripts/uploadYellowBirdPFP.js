#!/usr/bin/env node

/**
 * Upload Yellow Bird Profile Picture Script
 * 
 * This script uploads the yellow bird SVG profile picture to Supabase storage
 * for use with the Solarius bot account.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadYellowBirdPFP() {
  try {
    console.log('🌅 Starting yellow bird profile picture upload...');
    console.log('===============================================');

    // Read the SVG file
    const svgPath = path.join(__dirname, '../assets/yellow-bird-pfp.svg');
    console.log('📁 Reading SVG file from:', svgPath);
    
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    console.log('✅ SVG file read successfully');

    // Upload to Supabase storage
    const fileName = 'yellow-bird-pfp.svg';
    const bucketName = 'public';
    
    console.log('📤 Uploading to Supabase storage...');
    console.log(`   Bucket: ${bucketName}`);
    console.log(`   File: ${fileName}`);

    // Create a File object from the SVG content
    const file = new File([svgContent], fileName, { type: 'image/svg+xml' });
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: 'image/svg+xml',
        upsert: true // Overwrite if exists
      });

    if (error) {
      console.error('❌ Error uploading to Supabase storage:', error);
      throw error;
    }

    console.log('✅ Upload successful!');
    console.log('📊 Upload Details:');
    console.log(`   File Path: ${data.path}`);
    console.log(`   Full URL: ${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`);

    // Test the URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${fileName}`;
    console.log('\n🔗 Public URL for Solarius bot:');
    console.log(publicUrl);

    console.log('\n🎉 Yellow bird profile picture upload complete!');
    console.log('===============================================');
    console.log('You can now use this URL in the Solarius bot configuration.');

  } catch (error) {
    console.error('❌ Error during upload:', error);
    process.exit(1);
  }
}

// Run the upload
if (require.main === module) {
  uploadYellowBirdPFP();
}

module.exports = { uploadYellowBirdPFP };
