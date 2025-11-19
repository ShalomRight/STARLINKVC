
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../constants';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

/**
 * Uploads a data URL image to Supabase Storage and returns the public URL.
 */
export const uploadToSupabase = async (dataUrl: string): Promise<string> => {
  try {
    const bucket = 'starpics';
    const timestamp = Date.now();
    // Path format from your fix: uploads/TIMESTAMP_filename
    const path = `uploads/${timestamp}_star_photo.jpg`;

    // 1. Convert Data URL to Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], 'star_photo.jpg', { type: 'image/jpeg' });
    
    // 2. Upload to Storage (public bucket)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    // 3. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
      
    return publicUrlData.publicUrl;
    
  } catch (error) {
    console.error("Star Link Service Error:", error);
    throw error;
  }
};
