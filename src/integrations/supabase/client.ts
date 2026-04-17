import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Please check your .env file or environment configuration.');
}

export const supabase = createClient(
    supabaseUrl || 'https://zjlgabnvhkryknrbnlho.supabase.co',
    supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqbGdhYm52aGtyeWtucmJubGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MjExMzEsImV4cCI6MjA4NzM5NzEzMX0.vpQwd0qHgfh6ctcvidlr0G9jA5Vx20ZI1JE_eJYuBno'
);
