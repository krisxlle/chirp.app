#!/usr/bin/env ts-node

/**
 * Create Supabase Storage Bucket via API
 * 
 * This script attempts to create a storage bucket using the Supabase REST API directly.
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://qrzbtituxxilnbgocdge.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFyemJ0aXR1eHhpbG5iZ29jZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDcxNDMsImV4cCI6MjA2NzgyMzE0M30.P-o5ND8qoiIpA1W-9WkM7RUOaGTjRtkEmPbCXGbrEI8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucketViaAPI() {
  try {
    console.log('🪣 Attempting to create assets bucket via REST API...');
    
    // Try to create bucket using REST API
    const response = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        id: 'assets',
        name: 'assets',
        public: true,
        file_size_limit: 5242880,
        allowed_mime_types: ['image/*', 'image/svg+xml']
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Bucket created successfully via API:', data);
    } else {
      const error = await response.text();
      console.log('❌ API Error:', response.status, error);
      
      // If bucket already exists, that's okay
      if (response.status === 409) {
        console.log('✅ Bucket already exists (409 error)');
      }
    }
    
    // Check if bucket now exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    console.log('📋 Current buckets:', buckets?.map(b => b.name) || []);
    
  } catch (error) {
    console.error('❌ Error creating bucket:', error);
  }
}

// Run the creation
if (require.main === module) {
  createBucketViaAPI();
}

export { createBucketViaAPI };
