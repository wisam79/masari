import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/Database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ncffmgqqyxvggqhlhgmz.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jZmZtZ3F5eHZnZ3FobGhtbXoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcxNDQ2NjY1NSwiZXhwIjoyMDMwMDQyNjU1fQ.0';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables, using defaults for testing');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
