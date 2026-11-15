"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { ART_STYLE_GROUPS, CATEGORIES, FINISHES, type ArtId, type FinishId, type Size } from "@/lib/data";
import type { ProductRow } from "@/lib/products";
import { getSupabase, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase";
import { inr } from "@/lib/site";
import { FramedPhoto, ratioOf } from "@/components/FramedPhoto";

export const ARTS: { id: ArtId; name: string }[] = [
  { id: "hills", name: "Hills" },
  { id: "dusk", name: "Dusk" },
  { id: "coast", name: "Coast" },
  { id: "bloom", name: "Bloom" },
  { id: "temple", name: "Temple" },
  { id: "petal", name: "Heart" },
  { id: "noir", name: "Noir" },
  { id: "meadow", name: "Meadow" },
];

export const PRESETS: Record<string, Size[]> = {
  "Table-top": [
    { label: "5×7", w: 5, h: 7, price: 449 },
    { label: "6×8", w: 6, h: 8, price: 549 },
    { label: "8×10", w: 8, h: 10, price: 749 },
  ],
  Wall: [
    { label: "8×10", w: 8, h: 10, price: 799 },
    { label: "12×16", w: 12, h: 16, price: 1299 },
    { label: "16×20", w: 16, h: 20, price: 1899 },
    { label: "20×30", w: 20, h: 30, price: 2799 },
  ],
  Square: [
    { label: "8×8", w: 8, h: 8, price: 699 },
    { label: "12×12", w: 12, h: 12, price: 1199 },
    { label: "16×16", w: 16, h: 16, price: 1699 },
  ],
};

export const emptyProduct = (): ProductRow => ({
  slug: "",
  name: "",
  category: CATEGORIES[0].slug,
  kind: "custom",
  description: "",
  finishes: ["black"],
  sizes: PRESETS.Wall.map((s) => ({ ...s })),
  art: "hills",
  image_url: null,
  mat: true,
  badge: null,
  style: null,
  orientation: "portrait",
  sort: 100,
  active: true,
  featured: false,
});

export const toSlug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Resize big photos before upload so pages stay fast (max 2000px, JPEG).
export function compress(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const max = 2000;
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not process image"))), "image/jpeg", 0.88);
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error("Couldn't read that image."));
    img.src = URL.createObjectURL(file);
  });
}

export function ProductForm({ initial, isNew, onDone, onCancel }: { initial: ProductRow; isNew: boolean; onDone: () => void; onCancel: () => void }) {
  const [p, setP] = useState<ProductRow>(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductRow>(k: K, v: ProductRow[K]) => setP((x) => ({ ...x, [k]: v }));
  const setSize = (i: number, patch: Partial<Size>) =>
    setP((x) => ({
      ...x,
      sizes: x.sizes.map((s, j) => {
        if (j !== i) return s;
        const n = { ...s, ...patch };
        return { ...n, label: `${n.w}×${n.h}` };
      }),
    }));

  const upload = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setErr("Please choose an image file (JPG, PNG or WebP).");
    const sb = getSupabase()!;
    setErr("");
    setUploading(true);
    try {
      const blob = await compress(file);
      const path = `${toSlug(p.slug || p.name) || "product"}-${Date.now()}.jpg`;
      const { error } = await sb.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      set("image_url", sb.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl);
    } catch (e) {
      setErr(`Upload failed: ${(e as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const row: ProductRow = {
      ...p,
      name: p.name.trim(),
      slug: toSlug(p.slug),
      description: p.description.trim(),
      badge: p.badge?.trim() || null,
      style: p.style || null,
      sizes: p.sizes.filter((s) => s.w > 0 && s.h > 0 && s.price > 0),
    };
    if (!row.name) return setErr("Give the product a name.");
    if (!row.slug) return setErr("The web address can only use letters, numbers and dashes.");
    if (!row.finishes.length) return setErr("Pick at least one finish.");
    if (!row.sizes.length) return setErr("Add at least one size with width, height and price.");

    setSaving(true);
    setErr("");
    const sb = getSupabase()!;
    const { error } = isNew ? await sb.from("products").insert(row) : await sb.from("products").update(row).eq("slug", initial.slug);
    setSaving(false);
    if (error) {
      if (error.code === "23505") return setErr(`A product with the address "/frame/${row.slug}" already exists. Change the web address.`);
      if (error.code === "42501") return setErr("Not allowed — this account isn't in the admins list.");
      return setErr(error.message);
    }
    onDone();
  };

  const fromPrice = Math.min(...p.sizes.filter((s) => s.price > 0).map((s) => s.price));

  return (
    <form onSubmit={save}>
      <button type="button" onClick={onCancel} className="text-muted hover:text-ink mb-4 flex items-center gap-1.5 text-sm">
        <ArrowLeft size={16} /> All products
      </button>
      <h1 className="display text-4xl">{isNew ? "Add product" : `Edit — ${initial.name}`}</h1>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Basics */}
          <Card title="Basics">
            <Field label="Product name">
              <input
                className={inputCls}
                value={p.name}
                placeholder="e.g. Madhubani Peacock"
                onChange={(e) => {
                  const name = e.target.value;
                  setP((x) => ({ ...x, name, slug: slugTouched ? x.slug : toSlug(name) }));
                }}
              />
            </Field>
            <Field label="Web address" hint={isNew ? "Auto-filled from the name. Can't be changed later." : "Can't be changed after the product is created."}>
              <div className="border-line flex items-center overflow-hidden rounded-xl border bg-white text-sm focus-within:border-ink">
                <span className="text-muted bg-cream px-3 py-2.5">/frame/</span>
                <input
                  className="w-full px-3 py-2.5 outline-none disabled:opacity-60"
                  value={p.slug}
                  disabled={!isNew}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                  }}
                />
              </div>
            </Field>
            <Field label="Description">
              <textarea className={`${inputCls} min-h-24 resize-y`} value={p.description} onChange={(e) => set("description", e.target.value)} placeholder="What makes it special — shown on the product page." />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select className={inputCls} value={p.category} onChange={(e) => set("category", e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Art style" hint="Optional — lets customers find it under Shop by art style.">
                <select className={inputCls} value={p.style ?? ""} onChange={(e) => set("style", e.target.value || null)}>
                  <option value="">None</option>
                  {ART_STYLE_GROUPS.map((g) => (
                    <optgroup key={g.slug} label={g.name}>
                      {g.styles.map((s) => (
                        <option key={s.slug} value={s.slug}>{s.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                <Segmented
                  value={p.kind}
                  onChange={(v) => set("kind", v)}
                  options={[
                    { v: "custom", l: "Customer's photo" },
                    { v: "ready", l: "Ready-made art" },
                  ]}
                />
              </Field>
              <Field label="Badge" hint="Optional, e.g. New, Bestseller">
                <input className={inputCls} value={p.badge ?? ""} onChange={(e) => set("badge", e.target.value)} />
              </Field>
            </div>
          </Card>

          {/* Photo */}
          <Card title="Product photo">
            <p className="text-muted -mt-2 mb-4 text-xs">
              {p.kind === "ready" ? "The artwork customers will receive." : "A sample photo shown until the customer uploads their own."} It&apos;s shown inside the frame everywhere on the site.
            </p>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => upload(e.target.files?.[0])} />
            <div className="flex flex-wrap items-center gap-4">
              {p.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image_url} alt="" className="border-line h-24 w-24 rounded-xl border object-cover" />
              ) : (
                <div className="border-line text-muted grid h-24 w-24 place-items-center rounded-xl border border-dashed text-xs">No photo</div>
              )}
              <button type="button" disabled={uploading} onClick={() => fileInput.current?.click()} className="border-ink hover:bg-ink hover:text-paper flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-60">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />} {p.image_url ? "Replace photo" : "Upload photo"}
              </button>
              {p.image_url && (
                <button type="button" onClick={() => set("image_url", null)} className="text-muted hover:text-clay flex items-center gap-1 text-sm">
                  <X size={14} /> Remove
                </button>
              )}
            </div>
            {!p.image_url && (
              <Field label="Without a photo, show this illustration" className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {ARTS.map((a) => (
                    <button key={a.id} type="button" onClick={() => set("art", a.id)} className={`rounded-full border px-3 py-1 text-xs ${p.art === a.id ? "bg-ink border-ink text-paper" : "border-line hover:border-ink"}`}>
                      {a.name}
                    </button>
                  ))}
                </div>
              </Field>
            )}
          </Card>

          {/* Frame */}
          <Card title="Frame">
            <Field label="Finishes customers can choose">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(FINISHES) as FinishId[]).map((id) => {
                  const on = p.finishes.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => set("finishes", on ? p.finishes.filter((x) => x !== id) : [...p.finishes, id])}
                      className={`flex items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3.5 text-sm transition-colors ${on ? "border-ink bg-cream" : "border-line text-muted hover:border-ink"}`}
                    >
                      <span className="h-6 w-6 rounded-full ring-1 ring-black/10" style={{ background: FINISHES[id].swatch }} />
                      {FINISHES[id].name}
                    </button>
                  );
                })}
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Shape">
                <Segmented
                  value={p.orientation}
                  onChange={(v) => set("orientation", v)}
                  options={[
                    { v: "portrait", l: "Portrait" },
                    { v: "landscape", l: "Landscape" },
                    { v: "square", l: "Square" },
                  ]}
                />
              </Field>
              <Field label="Default border" hint="Customers can still switch on the product page.">
                <Segmented
                  value={p.mat ? "mat" : "full"}
                  onChange={(v) => set("mat", v === "mat")}
                  options={[
                    { v: "mat", l: "White border" },
                    { v: "full", l: "Full frame" },
                  ]}
                />
              </Field>
            </div>
          </Card>

          {/* Sizes */}
          <Card title="Sizes & prices">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted">Start from:</span>
              {Object.keys(PRESETS).map((k) => (
                <button key={k} type="button" onClick={() => set("sizes", PRESETS[k].map((s) => ({ ...s })))} className="border-line hover:border-ink rounded-full border px-3 py-1">
                  {k} sizes
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-muted grid grid-cols-[1fr_1fr_1.4fr_auto] gap-2 px-1 text-xs">
                <span>Width (in)</span>
                <span>Height (in)</span>
                <span>Price (₹, incl. GST)</span>
                <span className="w-8" />
              </div>
              {p.sizes.map((s, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1.4fr_auto] items-center gap-2">
                  <input type="number" min={1} className={inputCls} value={s.w || ""} onChange={(e) => setSize(i, { w: Number(e.target.value) })} />
                  <input type="number" min={1} className={inputCls} value={s.h || ""} onChange={(e) => setSize(i, { h: Number(e.target.value) })} />
                  <input type="number" min={1} className={inputCls} value={s.price || ""} onChange={(e) => setSize(i, { price: Number(e.target.value) })} />
                  <button type="button" aria-label="Remove size" onClick={() => set("sizes", p.sizes.filter((_, j) => j !== i))} className="text-muted hover:text-clay grid h-8 w-8 place-items-center">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => set("sizes", [...p.sizes, { label: "", w: 0, h: 0, price: 0 }])} className="text-ink mt-3 flex items-center gap-1.5 text-sm font-semibold">
              <Plus size={16} /> Add size
            </button>
          </Card>

          {/* Visibility */}
          <Card title="On the website">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Visibility">
                <Segmented
                  value={p.active ? "on" : "off"}
                  onChange={(v) => set("active", v === "on")}
                  options={[
                    { v: "on", l: "Shown" },
                    { v: "off", l: "Hidden" },
                  ]}
                />
              </Field>
              <Field label="Position" hint="Lower numbers show first.">
                <input type="number" className={inputCls} value={p.sort} onChange={(e) => set("sort", Number(e.target.value))} />
              </Field>
              <Field label="Show on home page" hint="Starred products' photos are used on the home page." className="sm:col-span-2">
                <Segmented
                  value={p.featured ? "yes" : "no"}
                  onChange={(v) => set("featured", v === "yes")}
                  options={[
                    { v: "yes", l: "★ Yes" },
                    { v: "no", l: "No" },
                  ]}
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* Preview + save */}
        <div className="xl:sticky xl:top-10 xl:self-start">
          <div className="border-line rounded-2xl border bg-white p-5">
            <p className="text-muted mb-3 text-xs font-semibold uppercase tracking-[0.15em]">Preview</p>
            <div className="bg-cream grid aspect-[4/5] place-items-center rounded-xl">
              <div style={{ width: p.orientation === "landscape" ? "78%" : p.orientation === "square" ? "66%" : "60%" }}>
                <FramedPhoto finish={p.finishes[0] ?? "black"} art={p.art} photo={p.image_url} mat={p.mat} ratio={ratioOf(p.orientation)} frameWidth={p.finishes[0] === "acrylic" ? 4 : 10} />
              </div>
            </div>
            <p className="display mt-4 text-lg leading-tight">{p.name || "Product name"}</p>
            <p className="text-muted mt-1 text-sm">{Number.isFinite(fromPrice) ? <>from <b className="text-ink">{inr(fromPrice)}</b></> : "Add a price"}</p>

            {err && <p className="text-clay mt-4 text-sm">{err}</p>}
            <button disabled={saving || uploading} className="bg-ink text-paper mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold disabled:opacity-60">
              {saving && <Loader2 size={16} className="animate-spin" />} {isNew ? "Add product" : "Save changes"}
            </button>
            <button type="button" onClick={onCancel} className="text-muted hover:text-ink mt-2 w-full py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export const inputCls = "border-line focus:border-ink w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none";

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-line space-y-4 rounded-2xl border bg-white p-5 md:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">{title}</h2>
      {children}
    </section>
  );
}

export function Field({ label, hint, className = "", children }: { label: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      {children}
      {hint && <p className="text-muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; l: string }[] }) {
  return (
    <div className="border-line flex rounded-xl border bg-white p-1">
      {options.map((o) => (
        <button key={o.v} type="button" onClick={() => onChange(o.v)} className={`flex-1 rounded-lg px-2 py-1.5 text-sm transition-colors ${value === o.v ? "bg-ink text-paper" : "text-muted hover:text-ink"}`}>
          {o.l}
        </button>
      ))}
    </div>
  );
}
