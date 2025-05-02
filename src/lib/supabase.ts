
import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://ouwyiehmxmvxxnzpdumb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91d3lpZWhteG12eHhuenBkdW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxOTIzODYsImV4cCI6MjA2MTc2ODM4Nn0.-fqLvl-NHSPWOegsiQa916Le55a4Hk8N54LRsWyptDg';

// Create Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);
