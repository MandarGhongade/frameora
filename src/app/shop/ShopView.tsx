"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ART_STYLE_GROUPS, CATEGORIES, getArtStyle, getCategory, getStyleGroup, type Frame } from "@/lib/data";
import { useLiveProducts } from "@/lib/useLiveProducts";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";

/** Reads the filters from the address (?c= / ?g= / ?s=) and the live products. */
export function ShopView({ initial }: { initial: Frame[] }) {
  const sp = useSearchParams();
  const { products } = useLiveProducts(initial);
  return <ShopBody products={products} c={sp.get("c") ?? undefined} g={sp.get("g") ?? undefined} s={sp.get("s") ?? undefined} />;
}

export function ShopBody({ products: FRAMES, c, g, s }: { products: Frame[]; c?: string; g?: string; s?: string }) {
  const cat = c ? getCategory(c) : undefined;
  const style = !cat && s ? getArtStyle(s) : undefined;
  const group = style ? getStyleGroup(style.slug) : !cat && g ? ART_STYLE_GROUPS.find((x) => x.slug === g) : undefined;
  const groupSlugs = group ? new Set(group.styles.map((x) => x.slug)) : undefined;
  const list = cat
    ? FRAMES.filter((f) => f.category === cat.slug)
    : style
      ? FRAMES.filter((f) => f.style === style.slug)
      : groupSlugs
        ? FRAMES.filter((f) => f.style && groupSlugs.has(f.style))
        : FRAMES;
  const title = cat?.name ?? style?.name ?? group?.name ?? "All frames";
  const blurb = cat?.blurb ?? (style ? `${group?.name} — framed and ready to hang.` : group?.blurb) ?? "Every style, every size — printed and framed to order.";
  const nothingActive = !cat && !group;

  return (
    <div className="mx-auto max-w-7xl px-5 pt-10 md:px-8 md:pt-16">
      <Reveal>
        <p className="text-muted text-sm">
          <Link href="/" className="link-underline">Home</Link> / <Link href="/shop" className="link-underline">Shop</Link>
          {group && (
            <>
              {" "}/ <Link href={`/shop?g=${group.slug}`} className="link-underline">{group.name}</Link>
            </>
          )}
        </p>
        <h1 className="display mt-4 text-5xl md:text-7xl">{title}</h1>
        <p className="text-muted mt-4 max-w-lg text-lg">{blurb}</p>
      </Reveal>

      <div className="no-scrollbar bg-paper/85 sticky top-16 z-30 -mx-5 mt-10 flex gap-2 overflow-x-auto px-5 py-3 backdrop-blur md:top-20 md:mx-0 md:px-0">
        <Chip href="/shop" active={nothingActive}>All</Chip>
        {CATEGORIES.map((k) => (
          <Chip key={k.slug} href={`/shop?c=${k.slug}`} active={cat?.slug === k.slug}>
            {k.name}
          </Chip>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-muted mb-3 text-xs font-semibold uppercase tracking-[0.2em]">Art style</p>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
          {ART_STYLE_GROUPS.map((x) => (
            <Chip key={x.slug} href={`/shop?g=${x.slug}`} active={group?.slug === x.slug && !style}>
              {x.name}
            </Chip>
          ))}
        </div>
        {group && (
          <div className="border-line mt-3 flex flex-wrap gap-2 rounded-2xl border p-3">
            {group.styles.map((x) => (
              <Chip key={x.slug} href={`/shop?s=${x.slug}`} active={style?.slug === x.slug} small>
                {x.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 lg:grid-cols-4">
        {list.map((f, i) => (
          <Reveal key={f.slug} delay={(i % 4) * 0.06}>
            <ProductCard f={f} />
          </Reveal>
        ))}
      </div>
      {list.length === 0 && <p className="text-muted py-20 text-center">New designs arriving soon.</p>}
    </div>
  );
}

function Chip({ href, active, small, children }: { href: string; active: boolean; small?: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`shrink-0 rounded-full border text-sm transition-all ${small ? "px-4 py-1.5" : "px-5 py-2"} duration-300 ${
        active ? "bg-ink border-ink text-paper" : "border-line hover:border-ink"
      }`}
    >
      {children}
    </Link>
  );
}
