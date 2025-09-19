import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { storage } from './storage';

// Create images directory if it doesn't exist
const IMAGES_DIR = path.join(process.cwd(), 'dist', 'generated-images');

// Initialize the images directory immediately when this module is loaded
ensureImagesDirectory().catch(console.error);

async function ensureImagesDirectory() {
  // Skip directory creation in production to avoid permission issues
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping directory creation in production');
    return;
  }
  
  try {
    await fs.access(IMAGES_DIR);
    console.log('Images directory already exists');
  } catch (error) {
    // Directory doesn't exist, create it
    console.log('Creating images directory:', IMAGES_DIR);
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    console.log('Images directory created successfully');
  }
}

export async function downloadAndSaveImage(imageUrl: string, userId: string, imageType: 'avatar' | 'banner'): Promise<string> {
  try {
    await ensureImagesDirectory();
    
    // Create a unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    const filename = `${imageType}_${userId}_${timestamp}_${randomId}.png`;
    const filePath = path.join(IMAGES_DIR, filename);
    const publicUrl = `/generated-images/${filename}`;
    
    console.log('Downloading image from:', imageUrl);
    console.log('Saving to:', filePath);
    
    // Download the image
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
    });
    
    // Save the image to disk
    await fs.writeFile(filePath, Buffer.from(response.data));
    
    console.log('Image saved successfully:', publicUrl);
    
    // Update user profile with the new URL
    if (imageType === 'avatar') {
      await storage.updateUserProfile(userId, { avatarUrl: publicUrl });
    } else if (imageType === 'banner') {
      await storage.updateUserProfile(userId, { bannerImageUrl: publicUrl });
    }
    
    return publicUrl;
  } catch (error) {
    console.error(`Error downloading and saving ${imageType} image:`, error);
    throw error;
  }
}

export async function cleanupOldImages() {
  // Skip cleanup in production to avoid permission issues
  if (process.env.NODE_ENV === 'production') {
    console.log('Skipping image cleanup in production');
    return;
  }
  
  try {
    // Ensure directory exists before trying to read it
    await ensureImagesDirectory();
    const files = await fs.readdir(IMAGES_DIR);
    const now = Date.now();
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    
    for (const file of files) {
      const filePath = path.join(IMAGES_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        await fs.unlink(filePath);
        console.log('Cleaned up old image:', file);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old images:', error);
  }
}

// Clean up old images on startup
cleanupOldImages();