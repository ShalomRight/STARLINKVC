
import { type Frame } from './types';

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: "dac3tqyuj",
  // This is a DEMO preset from the Cloudinary documentation example.
  // It allows the upload to succeed but creates a restricted image that cannot be shared.
  //
  // IMPORTANT: For the "Share" feature to work, you MUST create your own
  // UNSIGNED upload preset in your Cloudinary dashboard and replace the value below.
  // Go to: Settings > Upload > Upload Presets > Add Upload Preset (set Signing Mode to "Unsigned").
  uploadPreset: "ml_default"
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: "https://coyenoqcklgybiebsfsv.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNveWVub3Fja2xneWJpZWJzZnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTI0MTIsImV4cCI6MjA3OTAyODQxMn0.ctxchj8KOMPw95Xdit1cmqE4IqRN2lxV0j5sKQH6WaM"
};

// Frame data - these PNG files should be in public/frames/
export const FRAMES: Frame[] = [
  { id: 'default-1', name: 'Classic Border', category: 'minimal', url: 'public/frames/default-1.png' },
  { id: 'default-2', name: 'Elegant Frame', category: 'minimal', url: 'public/frames/default-2.png' },
  { id: 'default-3', name: 'Party Vibes', category: 'fun', url: 'public/frames/default-3.png' },
  { id: 'default-4', name: 'Event Special', category: 'events', url: 'public/frames/default-4.png' },
  { id: 'default-5', name: 'Celebration', category: 'events', url: 'public/frames/default-5.png' },
];

export const CATEGORIES = ['All Frames', 'Minimal', 'Events', 'Fun'];