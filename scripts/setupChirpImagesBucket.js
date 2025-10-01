#!/usr/bin/env node

/**
 * Setup Chirp Images Storage Bucket
 * 
 * This script creates the chirp-images storage bucket in Supabase.
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupChirpImagesBucket() {
  try {
    console.log('🪣 Setting up chirp-images storage bucket...');
    
    // List existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    console.log('📋 Existing buckets:', buckets?.map(b => b.name) || []);
    
    // Check if 'chirp-images' bucket already exists
    const chirpImagesBucket = buckets?.find(bucket => bucket.name === 'chirp-images');
    
    if (chirpImagesBucket) {
      console.log('✅ chirp-images bucket already exists!');
      return;
    }
    
    // Create the chirp-images bucket
    console.log('🆕 Creating chirp-images bucket...');
    const { data, error } = await supabase.storage.createBucket('chirp-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      console.error('❌ Error creating bucket:', error);
      return;
    }
    
    console.log('✅ chirp-images bucket created successfully!');
    console.log('📊 Bucket details:', data);
    
  } catch (error) {
    console.error('❌ Error setting up storage bucket:', error);
  }
}

// Run the setup
setupChirpImagesBucket();
