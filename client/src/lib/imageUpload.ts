
import { supabase } from './supabase';

export const uploadChirpImage = async (imageUri: string, userId: string): Promise<{
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
}> => {
  try {
    console.log('🔄 Uploading chirp image for user:', userId);
    console.log('🔄 Image URI:', imageUri.substring(0, 50) + '...');
    
    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create a unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().replace(/-/g, '').substring(0, 13);
    const fileName = `${timestamp}-${randomId}.jpg`;
    
    console.log('📤 Attempting storage upload with filename:', fileName);
    
    try {
      // Check if user is authenticated with Supabase Auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session found');
      }
      
      console.log('🔐 Using authenticated session for user:', session.user.id);
      
      // Try storage upload with authenticated Supabase client
      const { data, error } = await supabase.storage
        .from('chirp-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.log('❌ Storage upload error:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chirp-images')
        .getPublicUrl(fileName);
      
      console.log('✅ Storage upload successful:', publicUrl);
      
      return {
        imageUrl: publicUrl,
        imageWidth: 400,
        imageHeight: 300
      };
      
    } catch (storageError) {
      console.log('⚠️ Storage upload failed:', storageError);
      console.log('🔄 Falling back to base64 storage method...');
      
      // Fallback to base64
      try {
        const base64 = await blobToBase64(blob);
        const dataUrl = `data:image/jpeg;base64,${base64}`;
        
        console.log('✅ Base64 fallback successful - using data URL');
        console.log('📝 Note: Image stored as base64. Storage bucket may need to be created.');
        
        return {
          imageUrl: dataUrl,
          imageWidth: 400,
          imageHeight: 300
        };
      } catch (base64Error) {
        console.error('❌ Base64 fallback also failed:', base64Error);
        throw storageError; // Throw the original storage error
      }
    }
  } catch (error) {
    console.error('❌ Error uploading chirp image:', error);
    throw error;
  }
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
