// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vdvjkftsfkbzpjfkmism.supabase.co';
const supabaseAnonKey = 'sb_publishable_4Ony3HexgvLjipCvrrS0ng_6r3DO7f-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);