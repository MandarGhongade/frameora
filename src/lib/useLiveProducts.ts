"use client";

import { useEffect, useState } from "react";
import type { Frame } from "./data";
import { fetchProducts } from "./products";
import { supabaseConfigured } from "./supabase";

/**
 * The site is static (GitHub Pages), so pages are built with a snapshot of the products.
 * This hook shows that snapshot instantly, then swaps in the live list from Supabase,
 * so anything the admin adds or edits appears without rebuilding the site.
 */
export function useLiveProducts(initial: Frame[]) {
  const [products, setProducts] = useState(initial);
  const [loaded, setLoaded] = useState(!supabaseConfigured);

  useEffect(() => {
    let alive = true;
    fetchProducts().then((live) => {
      if (!alive) return;
      if (live) setProducts(live);
      setLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  return { products, loaded };
}
