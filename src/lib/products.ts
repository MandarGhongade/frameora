import { FRAMES, type ArtId, type FinishId, type Frame, type Size } from "./data";
import { getSupabase } from "./supabase";

/** Row shape of public.products (see supabase/setup.sql). */
export type ProductRow = {
  slug: string;
  name: string;
  category: string;
  kind: "custom" | "ready";
  description: string;
  finishes: FinishId[];
  sizes: Size[];
  art: ArtId;
  image_url: string | null;
  mat: boolean;
  badge: string | null;
  style: string | null;
  orientation: Frame["orientation"];
  sort: number;
  active: boolean;
  featured: boolean;
};

export const rowToFrame = (r: ProductRow): Frame => ({
  slug: r.slug,
  name: r.name,
  category: r.category,
  kind: r.kind,
  description: r.description,
  finishes: r.finishes,
  sizes: r.sizes,
  art: r.art,
  image: r.image_url ?? undefined,
  mat: r.mat,
  badge: r.badge ?? undefined,
  style: r.style ?? undefined,
  orientation: r.orientation,
  featured: r.featured ?? false,
});

/** Visible products from Supabase, or null when it isn't configured / can't be reached. */
export async function fetchProducts(): Promise<Frame[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb.from("products").select("*").eq("active", true).order("sort").order("created_at");
  if (error) {
    console.error("[products] Supabase read failed:", error.message);
    return null;
  }
  return (data as ProductRow[]).map(rowToFrame);
}

/**
 * All products visible on the store. Reads Supabase when it's configured;
 * otherwise (or if the database can't be reached) falls back to the built-in list in data.ts.
 */
export async function getProducts(): Promise<Frame[]> {
  return (await fetchProducts()) ?? FRAMES;
}

