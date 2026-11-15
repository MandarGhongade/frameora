"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getCategory, type Frame } from "@/lib/data";
import { useLiveProducts } from "@/lib/useLiveProducts";
import { Configurator } from "./Configurator";
import { ProductCard } from "@/components/ProductCard";

/** Product page. The product comes from the address (?p=slug) and the live product list. */
export function FrameView({ initial }: { initial: Frame[] }) {
  const slug = useSearchParams().get("p") ?? "";
  const { products, loaded } = useLiveProducts(initial);
  const f = products.find((x) => x.slug === slug);

  // A product added after the site was built isn't in the snapshot — wait for the live list.
  if (!f) return loaded ? <NotFound /> : <FrameLoading />;

  const cat = getCategory(f.category);
  const related = products.filter((x) => x.slug !== f.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-6 md:px-8 md:pt-10">
      <p className="text-muted mb-6 text-sm">
        <Link href="/" className="link-underline">Home</Link> /{" "}
        <Link href={`/shop?c=${cat?.slug ?? ""}`} className="link-underline">{cat?.name ?? "Shop"}</Link> / {f.name}
      </p>
      {/* key: switching to another product resets the chosen finish/size/photo */}
      <Configurator key={f.slug} frame={f} />

      {related.length > 0 && (
        <section className="mt-32">
          <h2 className="display mb-10 text-3xl md:text-4xl">You may also love</h2>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
            {related.map((r) => (
              <ProductCard key={r.slug} f={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function FrameLoading() {
  return (
    <div className="text-muted grid min-h-[60vh] place-items-center">
      <Loader2 className="animate-spin" />
    </div>
  );
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 py-32 text-center">
      <p className="display text-3xl">This frame isn&apos;t available</p>
      <p className="text-muted mt-3">It may have been removed or renamed.</p>
      <Link href="/shop" className="bg-ink text-paper mt-8 inline-block rounded-full px-8 py-3.5 font-semibold">
        Browse all frames
      </Link>
    </div>
  );
}
