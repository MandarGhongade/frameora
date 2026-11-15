import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { ShopBody, ShopView } from "./ShopView";

// Built once (static site). Filters come from the address and products load live in the browser.
export default async function Page() {
  const initial = await getProducts();
  return (
    <Suspense fallback={<ShopBody products={initial} />}>
      <ShopView initial={initial} />
    </Suspense>
  );
}
