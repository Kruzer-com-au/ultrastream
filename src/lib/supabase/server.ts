import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_SUPABASE_PROJECT_URL!;
const supabaseServiceKey = process.env.NEXT_SUPABASE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase env vars: NEXT_SUPABASE_PROJECT_URL and NEXT_SUPABASE_ROLE_KEY are required");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});
