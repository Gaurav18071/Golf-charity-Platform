import { createClient } from "@supabase/supabase-js";

console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log(
  "SUPABASE_KEY_EXISTS:",
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
console.log(
  "SUPABASE_KEY_PREFIX:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 20)
);

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);