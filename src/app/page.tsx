import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkles, MessageCircle, QrCode, Camera, Languages, ShieldCheck, Upload, Palette, Truck } from "lucide-react";
import { ART_STYLE_GROUPS, CATEGORIES, type ArtId, type FinishId, type Frame } from "@/lib/data";
import { getProducts } from "@/lib/products";
import { FramedPhoto } from "@/components/FramedPhoto";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Art } from "@/components/Art";

// Products come from the database, so render on each request (admin changes show immediately).
export const dynamic = "force-dynamic";

// The three frames hanging in the hero. Each slot keeps its own size/tilt; photos come from starred products.
const HERO_SLOTS: { cls: string; r: string; delay: string; ratio: number; fw: number; finish: FinishId; art: ArtId; mat?: boolean }[] = [
  { cls: "left-[8%] top-[10%] w-[44%]", r: "-2deg", delay: "0s", ratio: 3 / 4, fw: 14, finish: "walnut", art: "dusk" },
  { cls: "right-[8%] top-[6%] w-[34%]", r: "2deg", delay: "-2s", ratio: 4 / 5, fw: 12, finish: "gold", art: "petal" },
  { cls: "bottom-[10%] right-[12%] w-[40%]", r: "1deg", delay: "-4s", ratio: 4 / 3, fw: 10, finish: "white", art: "coast", mat: false },
];

/** Products with photos, starred (featured) ones first. */
const showcase = (list: Frame[]) => {
  const withImg = list.filter((f) => f.image);
  return [...withImg.filter((f) => f.featured), ...withImg.filter((f) => !f.featured)];
};

/** Card background: a product photo when there is one, otherwise the built-in illustration. */
function Cover({ product, art }: { product?: Frame; art: ArtId }) {
  if (!product?.image) return <Art id={art} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={product.image} alt="" className="h-full w-full object-cover" />;
}

export default async function Home() {
  const FRAMES = await getProducts();
  const photos = showcase(FRAMES);
  const coverFor = (match: (f: Frame) => boolean) => photos.find(match);
  const favourites = [...FRAMES.filter((f) => f.featured), ...FRAMES.filter((f) => !f.featured)].slice(0, 4);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-10 md:grid-cols-[1.05fr_1fr] md:px-8 md:pb-28 md:pt-16">
          <Reveal>
            <p className="text-clay mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em]">
              <span className="bg-clay h-px w-8" /> Custom framing · Pan-India delivery
            </p>
            <h1 className="display text-[3.2rem] leading-[0.95] md:text-[5.6rem]">
              Your moments,
              <br />
              <em className="text-clay font-light">beautifully</em> framed.
            </h1>
            <p className="text-muted mt-7 max-w-md text-lg leading-relaxed">
              Upload a photo, choose your frame, and watch it come to life. We touch it up, send you a preview on WhatsApp, then print, frame and deliver it to your door.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/shop" className="bg-ink text-paper hover:bg-clay group inline-flex items-center gap-3 rounded-full px-8 py-4 text-[15px] font-semibold transition-colors duration-500">
                Frame a photo
                <ArrowRight size={18} className="transition-transform duration-500 group-hover:translate-x-1" />
              </Link>
              <Link href="/shop?c=ready-made" className="link-underline text-[15px] font-semibold">
                Browse ready-made art
              </Link>
            </div>
            <div className="text-muted mt-12 flex gap-8 text-sm">
              <div>
                <div className="display text-ink text-2xl">All India</div>delivery
              </div>
              <div>
                <div className="display text-ink text-2xl">COD</div>available
              </div>
              <div>
                <div className="display text-ink text-2xl">Free</div>photo touch-up
              </div>
            </div>
          </Reveal>

          {/* gallery wall */}
          <Reveal delay={0.15} className="relative h-[460px] md:h-[600px]">
            <div className="bg-cream absolute inset-0 rounded-[2rem]" />
            <div className="absolute bottom-0 left-0 right-0 h-24 rounded-b-[2rem] bg-gradient-to-t from-sand/80 to-transparent" />
            {HERO_SLOTS.map((slot, i) => {
              const p = photos[i];
              const frame = p ? (
                <FramedPhoto finish={p.finishes[0]} photo={p.image} mat={p.mat} ratio={slot.ratio} frameWidth={p.finishes[0] === "acrylic" ? 4 : slot.fw} />
              ) : (
                <FramedPhoto finish={slot.finish} art={slot.art} ratio={slot.ratio} frameWidth={slot.fw} mat={slot.mat} />
              );
              return (
                <div key={i} className={`float absolute ${slot.cls}`} style={{ ["--r" as string]: slot.r, animationDelay: slot.delay }}>
                  {p ? (
                    <Link href={`/frame/${p.slug}`} title={p.name} className="block transition-transform duration-500 hover:scale-[1.03]">
                      {frame}
                    </Link>
                  ) : (
                    frame
                  )}
                </div>
              );
            })}
            <div className="bg-paper/90 absolute bottom-[8%] left-[6%] flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl backdrop-blur">
              <span className="bg-sage/15 text-sage grid h-9 w-9 place-items-center rounded-full">
                <MessageCircle size={18} />
              </span>
              <div className="text-sm">
                <div className="font-semibold">Preview sent on WhatsApp</div>
                <div className="text-muted text-xs">Reply OK and we start printing</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mb-10 flex items-end justify-between">
          <h2 className="display text-4xl md:text-5xl">Shop by occasion</h2>
          <Link href="/shop" className="link-underline hidden text-sm font-semibold sm:block">
            View all frames
          </Link>
        </Reveal>
        <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-4 md:gap-5 md:overflow-visible md:px-0">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.05} className="w-[62%] shrink-0 snap-start sm:w-[40%] md:w-auto">
              <Link href={`/shop?c=${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl">
                <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110">
                  <Cover product={coverFor((f) => f.category === c.slug)} art={c.art} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                  <div>
                    <h3 className="display text-2xl">{c.name}</h3>
                    <p className="mt-1 text-xs text-white/80">{c.blurb}</p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur transition-all duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-black">
                    <ArrowUpRight size={16} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ART STYLES */}
      <section className="mx-auto mt-32 max-w-7xl px-5 md:px-8">
        <Reveal className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-clay text-xs font-semibold uppercase tracking-[0.25em]">40 styles</p>
            <h2 className="display mt-3 text-4xl md:text-5xl">Shop by art style</h2>
          </div>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-2">
          {ART_STYLE_GROUPS.map((g, i) => (
            <Reveal key={g.slug} delay={i * 0.06}>
              <div className="border-line flex h-full flex-col overflow-hidden rounded-2xl border bg-white">
                <Link href={`/shop?g=${g.slug}`} className="group relative block h-36 overflow-hidden">
                  <div className="absolute inset-0 transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110">
                    <Cover product={coverFor((f) => !!f.style && g.styles.some((st) => st.slug === f.style))} art={g.art} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
                    <div>
                      <h3 className="display text-2xl">{g.name}</h3>
                      <p className="mt-1 text-xs text-white/80">{g.blurb}</p>
                    </div>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 backdrop-blur transition-all duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-black">
                      <ArrowUpRight size={16} />
                    </span>
                  </div>
                </Link>
                <div className="flex flex-wrap gap-2 p-5">
                  {g.styles.map((st) => (
                    <Link
                      key={st.slug}
                      href={`/shop?s=${st.slug}`}
                      className="border-line hover:border-ink hover:bg-ink hover:text-paper rounded-full border px-3.5 py-1.5 text-xs transition-colors duration-300"
                    >
                      {st.name}
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto mt-32 max-w-7xl px-5 md:px-8">
        <Reveal className="mb-10">
          <p className="text-clay text-xs font-semibold uppercase tracking-[0.25em]">Loved by customers</p>
          <h2 className="display mt-3 text-4xl md:text-5xl">This season&apos;s favourites</h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4">
          {favourites.map((f, i) => (
            <Reveal key={f.slug} delay={i * 0.07}>
              <ProductCard f={f} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto mt-32 max-w-7xl px-5 md:px-8">
        <div className="bg-cream rounded-[2rem] px-6 py-16 md:px-14 md:py-20">
          <Reveal>
            <h2 className="display max-w-xl text-4xl md:text-5xl">From your phone to your wall in four steps</h2>
          </Reveal>
          <div className="mt-14 grid gap-10 md:grid-cols-4">
            {[
              { icon: Palette, t: "Pick a frame", d: "Choose the style, finish and size you love." },
              { icon: Upload, t: "Upload your photo", d: "See a live preview inside your frame instantly." },
              { icon: MessageCircle, t: "Approve on WhatsApp", d: "We touch it up and send a final proof first." },
              { icon: Truck, t: "Delivered to you", d: "Safely packed and tracked to any PIN code." },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 0.08}>
                <div className="text-clay display text-sm">0{i + 1}</div>
                <s.icon className="mt-4" size={28} strokeWidth={1.4} />
                <h3 className="display mt-5 text-2xl">{s.t}</h3>
                <p className="text-muted mt-2 text-[15px] leading-relaxed">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ONLY HERE */}
      <section className="mx-auto mt-32 max-w-7xl px-5 md:px-8">
        <Reveal className="mb-12 max-w-2xl">
          <p className="text-clay text-xs font-semibold uppercase tracking-[0.25em]">Only at our studio</p>
          <h2 className="display mt-3 text-4xl md:text-5xl">More than a frame</h2>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Sparkles, t: "Free photo touch-up", d: "Old, dark or torn photo? Our editors brighten and restore it before printing — at no extra cost." },
            { icon: MessageCircle, t: "Proof before print", d: "We WhatsApp you the final design. Nothing is printed until you reply “OK”." },
            { icon: QrCode, t: "Frames that speak", d: "Add a QR on the back that plays your voice note or video message. Perfect for gifts." },
            { icon: Camera, t: "Watch it being made", d: "Get real photos of your frame while it's being printed and packed." },
            { icon: Languages, t: "Your language", d: "Add names and messages in Marathi, Hindi, Tamil, Bengali, Gujarati and more." },
            { icon: ShieldCheck, t: "Damage? Replaced.", d: "If it arrives damaged, send an unboxing photo and we'll ship a new one. No arguments." },
          ].map((f, i) => (
            <Reveal key={f.t} delay={(i % 3) * 0.08}>
              <div className="border-line hover:bg-cream group h-full rounded-2xl border p-8 transition-colors duration-500">
                <span className="bg-clay/10 text-clay group-hover:bg-clay grid h-12 w-12 place-items-center rounded-full transition-colors duration-500 group-hover:text-white">
                  <f.icon size={22} strokeWidth={1.6} />
                </span>
                <h3 className="display mt-6 text-2xl">{f.t}</h3>
                <p className="text-muted mt-3 leading-relaxed">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-32 max-w-7xl px-5 md:px-8">
        <Reveal>
          <div className="bg-ink text-paper relative overflow-hidden rounded-[2rem] px-8 py-20 text-center md:py-28">
            <div className="bg-clay/30 absolute -left-20 -top-20 h-72 w-72 rounded-full blur-3xl" />
            <div className="bg-gold/20 absolute -bottom-24 -right-10 h-80 w-80 rounded-full blur-3xl" />
            <h2 className="display relative mx-auto max-w-3xl text-4xl md:text-6xl">
              That photo on your phone deserves <em className="text-gold font-light">a wall.</em>
            </h2>
            <Link href="/shop" className="bg-paper text-ink hover:bg-clay hover:text-paper relative mt-10 inline-flex items-center gap-3 rounded-full px-8 py-4 font-semibold transition-colors duration-500">
              Start framing <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
