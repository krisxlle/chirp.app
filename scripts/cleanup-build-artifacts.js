#!/usr/bin/env node

/**
 * Build Artifact Cleanup Script
 * 
 * This script removes all generated build files that should not be tracked in git
 * and could cause CodeQL security issues.
 */

import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const buildPaths = [
  'ios/App/App/public',
  'ios/App/App/www',
  'android/app/src/main/assets/public',
  'android/app/src/main/assets/www',
  'dist',
  'web-build',
  '.expo',
  'build',
  'coverage',
  '.nyc_output'
];

function cleanupBuildArtifacts() {
  console.log('🧹 Cleaning up build artifacts...\n');
  
  let cleanedCount = 0;
  
  for (const path of buildPaths) {
    if (existsSync(path)) {
      try {
        rmSync(path, { recursive: true, force: true });
        console.log(`✅ Removed: ${path}`);
        cleanedCount++;
      } catch (error) {
        console.log(`❌ Failed to remove: ${path} - ${error.message}`);
      }
    } else {
      console.log(`⏭️  Skipped: ${path} (not found)`);
    }
  }
  
  console.log(`\n🎉 Cleanup complete! Removed ${cleanedCount} build artifact directories.`);
  console.log('\n📝 Note: These files will be regenerated when you build your app.');
}

function main() {
  console.log('🔒 Build Artifact Cleanup Tool');
  console.log('==============================\n');
  
  cleanupBuildArtifacts();
  
  console.log('\n🚀 Next steps:');
  console.log('1. Commit your changes');
  console.log('2. Push to GitHub');
  console.log('3. CodeQL security issues should be resolved');
}

if (require.main === module) {
  main();
}
