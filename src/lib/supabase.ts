
import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate that the necessary environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create a mock client for development when credentials are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Using mock Supabase client. Authentication features will not work.');
}

// Use a placeholder URL and key if not provided to prevent immediate errors
// This allows the app to at least load, though auth features won't work
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
