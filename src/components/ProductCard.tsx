import Link from "next/link";
import type { Frame } from "@/lib/data";
import { FINISHES, fromPrice, productHref } from "@/lib/data";
import { inr } from "@/lib/site";
import { FramedPhoto, ratioOf } from "./FramedPhoto";

export function ProductCard({ f }: { f: Frame }) {
  return (
    <Link href={productHref(f.slug)} className="group block">
      <div className="bg-cream relative grid aspect-[4/5] place-items-center overflow-hidden rounded-sm transition-colors duration-700 group-hover:bg-sand">
        {f.badge && (
          <span className="bg-paper/90 absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide">{f.badge}</span>
        )}
        <div
          className="transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:-translate-y-1 group-hover:scale-[1.04]"
          style={{ width: f.orientation === "landscape" ? "72%" : f.orientation === "square" ? "60%" : "54%" }}
        >
          <FramedPhoto finish={f.finishes[0]} art={f.art} photo={f.image} mat={f.mat} ratio={ratioOf(f.orientation)} frameWidth={f.finishes[0] === "acrylic" ? 4 : 10} />
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="display text-lg leading-tight">{f.name}</h3>
          <div className="mt-2 flex gap-1.5">
            {f.finishes.map((id) => (
              <span key={id} title={FINISHES[id].name} className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: FINISHES[id].swatch }} />
            ))}
          </div>
        </div>
        <p className="text-muted whitespace-nowrap text-sm">
          from <span className="text-ink font-semibold">{inr(fromPrice(f))}</span>
        </p>
      </div>
    </Link>
  );
}
