import { PostgrestError } from '@supabase/supabase-js';

export const quoted = (table: string): string => `"${table}"`;

export const handleSupabaseError = (error: PostgrestError | null) => {
  if (error) {
    throw new Error(`Supabase error: ${error.message}`);
  }
};
