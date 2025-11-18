
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../constants';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client with provided configuration
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Helper to get or create a client-side anonymous ID
const getAnonId = (): string => {
  let anonId = localStorage.getItem('star_anon_id');
  if (!anonId) {
    anonId = uuidv4();
    localStorage.setItem('star_anon_id', anonId as string);
  }
  return anonId as string;
};

/**
 * Uploads a data URL image to Supabase Storage, inserts a record into the DB,
 * and returns the public URL.
 */
export const uploadToSupabase = async (dataUrl: string): Promise<string> => {
  try {
    const anonId = getAnonId();
    const bucket = 'photos';
    const timestamp = Date.now();
    const fileName = `${anonId}/${timestamp}.jpg`;

    // 1. Convert Data URL to Blob
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    
    // 2. Upload to Storage (public bucket)
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase Storage Error:", uploadError);
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }

    // 3. Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
      
    const publicUrl = publicUrlData.publicUrl;

    // 4. Insert metadata into 'images' table
    const { error: dbError } = await supabase
      .from('images')
      .insert([
        {
          anon_id: anonId,
          storage_path: fileName,
          public_url: publicUrl
        }
      ]);

    if (dbError) {
        // Note: If DB insert fails, we might want to cleanup the storage file
        // But for now we'll just log it and throw
        console.error("Supabase DB Error:", dbError);
        throw new Error(`Database insert failed: ${dbError.message}`);
    }

    return publicUrl;
    
  } catch (error) {
    console.error("Star Link Service Error:", error);
    throw error;
  }
};
