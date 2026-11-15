import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Set these in .env.local (see .env.example). Both are safe to expose to the browser:
// what visitors can read or change is enforced by the database's row-level security.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && key);

let browserClient: SupabaseClient | null = null;

/** Shared client. In the browser it keeps the admin's login session. Returns null until Supabase is configured. */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (typeof window === "undefined") {
    // Server: a fresh, session-less client per call (public reads only).
    return createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  browserClient ??= createClient(url!, key!);
  return browserClient;
}

export const PRODUCT_IMAGES_BUCKET = "product-images";
