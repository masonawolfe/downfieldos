import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create client if credentials are configured
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Save user preferences to Supabase.
 * Falls back to localStorage if Supabase is not configured.
 */
export async function saveUserPreference(userId, key, value) {
  if (!supabase || !userId) {
    localStorage.setItem(`dfos-${key}`, JSON.stringify(value));
    return;
  }

  const { error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: userId, key, value: JSON.stringify(value) }, { onConflict: 'user_id,key' });

  if (error) {
    console.warn('Supabase save failed, using localStorage:', error.message);
    localStorage.setItem(`dfos-${key}`, JSON.stringify(value));
  }
}

/**
 * Load user preferences from Supabase.
 * Falls back to localStorage if Supabase is not configured.
 */
export async function loadUserPreference(userId, key, defaultValue = null) {
  if (!supabase || !userId) {
    const stored = localStorage.getItem(`dfos-${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('value')
    .eq('user_id', userId)
    .eq('key', key)
    .single();

  if (error || !data) {
    const stored = localStorage.getItem(`dfos-${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  }

  return JSON.parse(data.value);
}
