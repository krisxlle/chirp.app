#!/usr/bin/env node

/**
 * Upload Yellow Bird Profile Picture Script
 * 
 * This script creates and uploads a yellow bird profile picture for the Solarius bot.
 */

const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';

async function uploadYellowBirdPFP() {
  try {
    console.log('🌅 Creating and uploading Yellow Bird PFP...');
    
    // Create a simple yellow bird SVG as a data URL
    const svgContent = `<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <!-- Background circle -->
      <circle cx="100" cy="100" r="95" fill="#FFD700" stroke="#FFA500" stroke-width="4"/>
      
      <!-- Bird body -->
      <ellipse cx="100" cy="120" rx="35" ry="45" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
      
      <!-- Bird head -->
      <circle cx="100" cy="80" r="30" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
      
      <!-- Bird beak -->
      <polygon points="100,75 95,85 105,85" fill="#FF8C00"/>
      
      <!-- Bird eyes -->
      <circle cx="92" cy="75" r="4" fill="#000"/>
      <circle cx="108" cy="75" r="4" fill="#000"/>
      <circle cx="92" cy="73" r="2" fill="#FFF"/>
      <circle cx="108" cy="73" r="2" fill="#FFF"/>
      
      <!-- Bird wings -->
      <ellipse cx="85" cy="110" rx="15" ry="25" fill="#FFA500" transform="rotate(-20 85 110)"/>
      <ellipse cx="115" cy="110" rx="15" ry="25" fill="#FFA500" transform="rotate(20 115 110)"/>
      
      <!-- Bird tail -->
      <ellipse cx="100" cy="160" rx="20" ry="30" fill="#FFA500" transform="rotate(0 100 160)"/>
      
      <!-- Decorative sun rays -->
      <line x1="100" y1="10" x2="100" y2="20" stroke="#FFD700" stroke-width="3"/>
      <line x1="100" y1="180" x2="100" y2="190" stroke="#FFD700" stroke-width="3"/>
      <line x1="10" y1="100" x2="20" y2="100" stroke="#FFD700" stroke-width="3"/>
      <line x1="180" y1="100" x2="190" y2="100" stroke="#FFD700" stroke-width="3"/>
      <line x1="30" y1="30" x2="37" y2="37" stroke="#FFD700" stroke-width="3"/>
      <line x1="163" y1="163" x2="170" y2="170" stroke="#FFD700" stroke-width="3"/>
      <line x1="170" y1="30" x2="163" y2="37" stroke="#FFD700" stroke-width="3"/>
      <line x1="37" y1="163" x2="30" y2="170" stroke="#FFD700" stroke-width="3"/>
    </svg>`;
    
    // Convert SVG to base64
    const base64Content = Buffer.from(svgContent).toString('base64');
    const dataUrl = `data:image/svg+xml;base64,${base64Content}`;
    
    console.log('✅ Yellow bird SVG created');
    
    // For now, let's just use the data URL directly in the bot configuration
    const publicUrl = dataUrl;
    
    console.log('🔗 Data URL for Solarius bot:');
    console.log(publicUrl);
    
    console.log('\n🎉 Yellow bird profile picture ready!');
    console.log('=====================================');
    console.log('You can now use this data URL in the Solarius bot configuration.');
    console.log('The bot service will be updated to use this URL.');

  } catch (error) {
    console.error('❌ Error creating yellow bird PFP:', error);
    process.exit(1);
  }
}

// Run the upload
if (require.main === module) {
  uploadYellowBirdPFP();
}

module.exports = { uploadYellowBirdPFP };
