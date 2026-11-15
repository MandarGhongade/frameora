"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, ImagePlus, Minus, Plus, RefreshCw, AlertTriangle, BadgeCheck, Truck, ShieldCheck, MessageCircle } from "lucide-react";
import { ADDONS, FINISHES, type AddonId, type Frame } from "@/lib/data";
import { inr } from "@/lib/site";
import { useStore } from "@/lib/store";
import { FramedPhoto, ratioOf } from "@/components/FramedPhoto";

// Darken a #rrggbb colour by `amt` (0–1) — used for the soft top-to-bottom wall shading.
function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.round(v * (1 - amt)).toString(16).padStart(2, "0");
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`;
}
const wallBg = (hex: string) => `linear-gradient(180deg,${hex},${shade(hex, 0.08)})`;

type Wall = { id: string; name: string; color: string };
const WALLS: Wall[] = [
  { id: "light", name: "Warm white", color: "#f4efe7" },
  { id: "ivory", name: "Ivory", color: "#f6f0dc" },
  { id: "greige", name: "Greige", color: "#d9d1c4" },
  { id: "sand", name: "Sand", color: "#e3cfae" },
  { id: "blush", name: "Blush", color: "#f0d9cf" },
  { id: "terracotta", name: "Terracotta", color: "#c8775a" },
  { id: "mustard", name: "Mustard", color: "#d9a845" },
  { id: "sage", name: "Sage", color: "#c9cfbe" },
  { id: "olive", name: "Olive", color: "#7d8360" },
  { id: "teal", name: "Teal", color: "#3f6f6c" },
  { id: "sky", name: "Powder blue", color: "#c8d8e2" },
  { id: "navy", name: "Navy", color: "#2b3a55" },
  { id: "lavender", name: "Lavender", color: "#d8cfe2" },
  { id: "dark", name: "Charcoal", color: "#3a3633" },
];

// Downscale for preview/storage and report the original resolution.
function readPhoto(file: File): Promise<{ url: string; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 900;
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        resolve({ url: c.toDataURL("image/jpeg", 0.82), w: img.width, h: img.height });
      };
      img.onerror = reject;
      img.src = r.result as string;
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function Configurator({ frame: f }: { frame: Frame }) {
  const router = useRouter();
  const { addToCart } = useStore();
  const [finish, setFinish] = useState(f.finishes[0]);
  const [sizeIdx, setSizeIdx] = useState(Math.min(1, f.sizes.length - 1));
  const [wall, setWall] = useState<Wall>(WALLS[0]);
  const [customWall, setCustomWall] = useState("#b9a48c");
  const [mat, setMat] = useState(f.mat);
  const [photo, setPhoto] = useState<{ url: string; w: number; h: number } | null>(null);
  const [addons, setAddons] = useState<AddonId[]>(f.kind === "custom" ? ["photofix"] : []);
  const [message, setMessage] = useState("");
  const [qty, setQty] = useState(1);
  const [drag, setDrag] = useState(false);
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const size = f.sizes[sizeIdx];
  const addonCost = ADDONS.filter((a) => addons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const unit = size.price + addonCost;
  const isCustom = f.kind === "custom";

  // 150 DPI is a good minimum for photo prints
  const needPx = Math.max(size.w, size.h) * 150;
  const lowRes = photo ? Math.max(photo.w, photo.h) < needPx : false;

  const onFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErr("Please choose an image file (JPG, PNG or HEIC exported as JPG).");
    setErr("");
    try {
      setPhoto(await readPhoto(file));
    } catch {
      setErr("Couldn't read that image. Try another photo.");
    }
  };

  const toggle = (id: AddonId) => setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const add = (goToCart: boolean) => {
    if (isCustom && !photo) {
      setErr("Upload your photo to continue.");
      input.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    addToCart({ slug: f.slug, name: f.name, finish, size: size.label, unitPrice: unit, qty, addons, mat, photo: photo?.url ?? null, image: f.image, art: f.art, orientation: f.orientation, message: message || undefined });
    if (goToCart) router.push("/cart");
    else {
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    }
  };

  const ratio = ratioOf(f.orientation, size.w, size.h);
  const scale = 0.45 + (sizeIdx / Math.max(1, f.sizes.length - 1)) * 0.3; // bigger size → bigger on wall
  const step = isCustom ? 1 : 0; // section numbering shifts when there's a photo upload step

  return (
    <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
      {/* PREVIEW */}
      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-[1.75rem] transition-[background] duration-700 md:aspect-[5/5]" style={{ background: wallBg(wall.color) }}>
          <div className="absolute inset-x-0 bottom-0 h-[14%] bg-gradient-to-t from-black/10 to-transparent" />
          <motion.div layout transition={{ type: "spring", stiffness: 120, damping: 20 }} style={{ width: `${(f.orientation === "landscape" ? 1.25 : 1) * scale * 100}%` }}>
            <FramedPhoto finish={finish} art={f.art} photo={photo?.url ?? f.image} mat={mat} ratio={ratio} frameWidth={finish === "acrylic" ? 5 : 16} />
          </motion.div>
          <span className="bg-paper/80 absolute left-4 top-4 rounded-full px-3 py-1 text-xs backdrop-blur">Live preview · {size.label}&quot;</span>
        </div>

        {/* Wall colour */}
        <div className="mt-4">
          <p className="text-muted mb-2.5 text-xs">
            Wall colour — <span className="text-ink font-semibold">{wall.name}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            {WALLS.map((w) => (
              <button
                key={w.id}
                onClick={() => setWall(w)}
                title={`${w.name} wall`}
                aria-label={`${w.name} wall`}
                className={`h-8 w-8 rounded-full ring-1 ring-black/10 transition-transform duration-300 ${wall.id === w.id ? "ring-ink scale-110 ring-2 ring-offset-2" : "hover:scale-110"}`}
                style={{ background: wallBg(w.color) }}
              />
            ))}
            {/* Custom colour: the swatch is a label wrapping a native colour picker */}
            <label
              title="Pick your own wall colour"
              className={`relative grid h-8 w-8 cursor-pointer place-items-center rounded-full ring-1 ring-black/10 transition-transform duration-300 ${wall.id === "custom" ? "ring-ink scale-110 ring-2 ring-offset-2" : "hover:scale-110"}`}
              style={{
                background:
                  wall.id === "custom"
                    ? wallBg(customWall)
                    : "conic-gradient(#e46b5d,#e8b44a,#9cc178,#55a7b5,#6f7ccf,#c27ac0,#e46b5d)",
              }}
            >
              <Plus size={14} strokeWidth={3} className={wall.id === "custom" ? "hidden" : "text-white drop-shadow"} />
              <input
                type="color"
                value={customWall}
                aria-label="Custom wall colour"
                onClick={() => setWall({ id: "custom", name: "Your colour", color: customWall })}
                onChange={(e) => {
                  setCustomWall(e.target.value);
                  setWall({ id: "custom", name: "Your colour", color: e.target.value });
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </label>
          </div>
        </div>
      </div>

      {/* OPTIONS */}
      <div>
        {f.badge && <span className="text-clay text-xs font-semibold uppercase tracking-[0.2em]">{f.badge}</span>}
        <h1 className="display mt-2 text-4xl leading-tight md:text-5xl">{f.name}</h1>
        <div className="mt-4 flex items-baseline gap-3">
          <motion.span key={unit * qty} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="display text-3xl">
            {inr(unit * qty)}
          </motion.span>
          <span className="text-muted text-sm">incl. GST</span>
        </div>
        <p className="text-muted mt-5 leading-relaxed">{f.description}</p>

        {/* Upload */}
        {isCustom && (
          <Section title="1. Your photo">
            <input ref={input} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
            {!photo ? (
              <button
                onClick={() => input.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrag(true);
                }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDrag(false);
                  onFile(e.dataTransfer.files?.[0]);
                }}
                className={`flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition-all duration-300 ${
                  drag ? "border-clay bg-clay/5" : "border-line hover:border-ink hover:bg-cream"
                }`}
              >
                <ImagePlus size={30} strokeWidth={1.4} />
                <span className="font-semibold">Upload or drop your photo</span>
                <span className="text-muted text-xs">JPG or PNG · Original photos give the best print</span>
              </button>
            ) : (
              <div className="border-line flex items-center gap-4 rounded-2xl border p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" className="h-16 w-16 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  {lowRes ? (
                    <p className="flex items-start gap-1.5 text-amber-700">
                      <AlertTriangle size={16} className="mt-0.5 shrink-0" /> This photo ({photo.w}×{photo.h}px) may look soft at {size.label}&quot;. Try a smaller size or the original photo.
                    </p>
                  ) : (
                    <p className="text-sage flex items-center gap-1.5 font-medium">
                      <BadgeCheck size={16} /> Great quality for {size.label}&quot;
                    </p>
                  )}
                </div>
                <button onClick={() => input.current?.click()} className="text-muted hover:text-ink flex items-center gap-1 text-sm">
                  <RefreshCw size={14} /> Change
                </button>
              </div>
            )}
            <AnimatePresence>
              {err && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-clay mt-2 text-sm">
                  {err}
                </motion.p>
              )}
            </AnimatePresence>
          </Section>
        )}

        <Section title={`${step + 1}. Finish — ${FINISHES[finish].name}`}>
          <div className="flex flex-wrap gap-3">
            {f.finishes.map((id) => (
              <button
                key={id}
                onClick={() => setFinish(id)}
                title={FINISHES[id].name}
                className={`relative h-11 w-11 rounded-full ring-1 ring-black/10 transition-all duration-300 ${finish === id ? "ring-ink scale-105 ring-2 ring-offset-[3px]" : "hover:scale-105"}`}
                style={{ background: FINISHES[id].swatch }}
              />
            ))}
          </div>
        </Section>

        <Section title={`${step + 2}. Border`}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { on: true, name: "White border", note: "Gallery-style mount" },
              { on: false, name: "Full frame", note: "Photo edge to edge" },
            ].map((o) => (
              <button
                key={o.name}
                onClick={() => setMat(o.on)}
                className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-300 ${mat === o.on ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
              >
                {/* mini frame icon */}
                <span className="grid h-11 w-9 shrink-0 place-items-center rounded-[3px] border-[3px] border-current bg-[#f8f5ef]" style={{ padding: o.on ? 4 : 0 }}>
                  <span className="h-full w-full bg-[linear-gradient(160deg,#e9b9a6,#c8775a)]" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{o.name}</span>
                  <span className={`block text-xs ${mat === o.on ? "text-paper/70" : "text-muted"}`}>{o.note}</span>
                </span>
              </button>
            ))}
          </div>
        </Section>

        <Section title={`${step + 3}. Size (inches)`}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {f.sizes.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setSizeIdx(i)}
                className={`rounded-xl border px-3 py-3 text-left transition-all duration-300 ${i === sizeIdx ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
              >
                <div className="font-semibold">{s.label}</div>
                <div className={`text-xs ${i === sizeIdx ? "text-paper/70" : "text-muted"}`}>{inr(s.price)}</div>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Make it special">
          <div className="space-y-2">
            {ADDONS.filter((a) => isCustom || a.id !== "photofix").map((a) => {
              const on = addons.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggle(a.id)}
                  className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${on ? "border-ink bg-cream" : "border-line hover:border-ink/40"}`}
                >
                  <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors ${on ? "bg-ink border-ink text-paper" : "border-muted/50"}`}>
                    {on && <Check size={13} strokeWidth={3} />}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{a.name}</span>
                    <span className="text-muted block text-xs">{a.note}</span>
                  </span>
                  <span className="text-sm font-semibold">{a.price ? `+${inr(a.price)}` : "Free"}</span>
                </button>
              );
            })}
          </div>
          <AnimatePresence>
            {(addons.includes("gift") || addons.includes("qr")) && (
              <motion.textarea
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 88 }}
                exit={{ opacity: 0, height: 0 }}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your gift note (any language). For QR, we'll WhatsApp you a link to record your message."
                className="border-line focus:border-ink mt-3 w-full resize-none rounded-xl border bg-transparent p-3 text-sm outline-none"
              />
            )}
          </AnimatePresence>
        </Section>

        {/* Buy */}
        <div className="mt-8 flex gap-3">
          <div className="border-line flex items-center rounded-full border">
            <button className="px-4 py-4" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">
              <Minus size={16} />
            </button>
            <span className="w-6 text-center font-semibold">{qty}</span>
            <button className="px-4 py-4" onClick={() => setQty((q) => q + 1)} aria-label="Increase">
              <Plus size={16} />
            </button>
          </div>
          <button onClick={() => add(false)} className="border-ink hover:bg-ink hover:text-paper relative flex-1 overflow-hidden rounded-full border font-semibold transition-colors duration-500">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={added ? "y" : "n"} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="flex items-center justify-center gap-2">
                {added ? (
                  <>
                    <Check size={18} /> Added
                  </>
                ) : (
                  "Add to cart"
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
        <button onClick={() => add(true)} className="bg-clay hover:bg-clay-dark mt-3 w-full rounded-full py-4 font-semibold text-white transition-colors duration-500">
          Buy now
        </button>

        <div className="text-muted mt-8 grid gap-3 text-sm">
          <p className="flex items-center gap-3"><MessageCircle size={18} /> Free design proof on WhatsApp before printing</p>
          <p className="flex items-center gap-3"><Truck size={18} /> Ships in 2–3 days · tracked delivery across India</p>
          <p className="flex items-center gap-3"><ShieldCheck size={18} /> Free replacement if damaged in transit</p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-line mt-8 border-t pt-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em]">{title}</h3>
      {children}
    </div>
  );
}
