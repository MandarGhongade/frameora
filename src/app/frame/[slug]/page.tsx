import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategory } from "@/lib/data";
import { getProducts } from "@/lib/products";
import { Configurator } from "./Configurator";
import { ProductCard } from "@/components/ProductCard";

// Products come from the database, so render on each request (admin changes show immediately).
export const dynamic = "force-dynamic";

export default async function FramePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const FRAMES = await getProducts();
  const f = FRAMES.find((x) => x.slug === slug);
  if (!f) notFound();
  const cat = getCategory(f.category);
  const related = FRAMES.filter((x) => x.slug !== f.slug).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-5 pt-6 md:px-8 md:pt-10">
      <p className="text-muted mb-6 text-sm">
        <Link href="/" className="link-underline">Home</Link> / <Link href={`/shop?c=${cat?.slug}`} className="link-underline">{cat?.name}</Link> / {f.name}
      </p>
      <Configurator frame={f} />

      <section className="mt-32">
        <h2 className="display mb-10 text-3xl md:text-4xl">You may also love</h2>
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {related.map((r) => (
            <ProductCard key={r.slug} f={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
