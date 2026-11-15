import { Suspense } from "react";
import { getProducts } from "@/lib/products";
import { FrameLoading, FrameView } from "./FrameView";

// Built once (static site). The product is chosen by the address (?p=slug) in the browser.
export default async function Page() {
  const initial = await getProducts();
  return (
    <Suspense fallback={<FrameLoading />}>
      <FrameView initial={initial} />
    </Suspense>
  );
}
