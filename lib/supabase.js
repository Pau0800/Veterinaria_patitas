import { createClient, isSupabaseConfigured as checkConfigured } from "@/lib/supabase/client";

export const isSupabaseConfigured = checkConfigured();
export const supabase = createClient();
