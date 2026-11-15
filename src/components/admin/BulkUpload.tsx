"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, Check, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { ART_STYLE_GROUPS, CATEGORIES, FINISHES, type FinishId, type Size } from "@/lib/data";
import type { ProductRow } from "@/lib/products";
import { getSupabase, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase";
import { FramedPhoto, ratioOf } from "@/components/FramedPhoto";
import { Card, Field, PRESETS, Segmented, compress, inputCls, toSlug } from "./ProductForm";

type Shape = ProductRow["orientation"];
type Status = "ready" | "saving" | "done" | "error";
type Item = { id: string; file: File; url: string; name: string; shape: Shape; status: Status; error?: string };

// Shared details applied to every photo in the batch.
type Shared = {
  category: string;
  style: string | null;
  kind: ProductRow["kind"];
  badge: string;
  description: string;
  finishes: FinishId[];
  shape: Shape | "auto";
  mat: boolean;
  sizes: Size[];
  active: boolean;
  featured: boolean;
  sort: number;
};

// "madhubani_peacock-01.jpg" → "Madhubani Peacock 01"
const nameFromFile = (f: string) =>
  f
    .replace(/\.[^.]+$/, "")
    .replace(/[_\-.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

function detectShape(url: string): Promise<Shape> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const r = img.width / img.height;
      resolve(r > 1.1 ? "landscape" : r < 0.9 ? "portrait" : "square");
    };
    img.onerror = () => resolve("portrait");
    img.src = url;
  });
}

const uid = () => Math.random().toString(36).slice(2, 10);

export function BulkUpload({ existingSlugs, onDone, onCancel }: { existingSlugs: string[]; onDone: () => void; onCancel: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [s, setS] = useState<Shared>({
    category: CATEGORIES.find((c) => c.slug === "ready-made")?.slug ?? CATEGORIES[0].slug,
    style: null,
    kind: "ready",
    badge: "",
    description: "",
    finishes: ["black", "white"],
    shape: "auto",
    mat: true,
    sizes: PRESETS.Wall.map((x) => ({ ...x })),
    active: true,
    featured: false,
    sort: 100,
  });
  const [running, setRunning] = useState(false);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);

  // Free the preview URLs when leaving the screen.
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  const set = <K extends keyof Shared>(k: K, v: Shared[K]) => setS((x) => ({ ...x, [k]: v }));
  const patch = (id: string, p: Partial<Item>) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...p } : x)));
  const setSize = (i: number, p: Partial<Size>) =>
    set(
      "sizes",
      s.sizes.map((z, j) => {
        if (j !== i) return z;
        const n = { ...z, ...p };
        return { ...n, label: `${n.w}×${n.h}` };
      }),
    );

  const addFiles = async (list: FileList | null) => {
    if (!list) return;
    const files = Array.from(list).filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type));
    const skipped = list.length - files.length;
    setErr(skipped ? `${skipped} file${skipped > 1 ? "s were" : " was"} skipped — only JPG, PNG and WebP photos can be uploaded.` : "");
    const added = await Promise.all(
      files.map(async (file) => {
        const url = URL.createObjectURL(file);
        urls.current.push(url);
        return { id: uid(), file, url, name: nameFromFile(file.name), shape: await detectShape(url), status: "ready" as Status };
      }),
    );
    setItems((xs) => [...xs, ...added]);
  };

  const remove = (id: string) => setItems((xs) => xs.filter((x) => x.id !== id));

  const pending = items.filter((x) => x.status !== "done");
  const doneCount = items.length - pending.length;

  const run = async () => {
    const valid = s.sizes.filter((z) => z.w > 0 && z.h > 0 && z.price > 0);
    if (!pending.length) return setErr("Add some photos first.");
    if (pending.some((x) => !toSlug(x.name))) return setErr("Every photo needs a name (letters or numbers).");
    if (!s.finishes.length) return setErr("Pick at least one finish.");
    if (!valid.length) return setErr("Add at least one size with width, height and price.");
    setErr("");
    setRunning(true);

    const sb = getSupabase()!;
    const taken = new Set(existingSlugs);
    const uniqueSlug = (name: string) => {
      const base = toSlug(name);
      let slug = base;
      for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
      taken.add(slug);
      return slug;
    };

    // One at a time keeps uploads reliable on slower connections.
    for (const it of pending) {
      patch(it.id, { status: "saving", error: undefined });
      try {
        let slug = uniqueSlug(it.name);
        const blob = await compress(it.file);
        const path = `${slug}-${Date.now()}.jpg`;
        const up = await sb.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
        if (up.error) throw up.error;
        const image_url = sb.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;

        const row = (): ProductRow => ({
          slug,
          name: it.name.trim(),
          category: s.category,
          kind: s.kind,
          description: s.description.trim(),
          finishes: s.finishes,
          sizes: valid,
          art: "hills",
          image_url,
          mat: s.mat,
          badge: s.badge.trim() || null,
          style: s.style,
          orientation: s.shape === "auto" ? it.shape : s.shape,
          sort: s.sort,
          active: s.active,
          featured: s.featured,
        });
        let res = await sb.from("products").insert(row());
        // Someone else may have taken the address meanwhile — try the next free one.
        for (let tries = 0; res.error?.code === "23505" && tries < 5; tries++) {
          slug = uniqueSlug(it.name);
          res = await sb.from("products").insert(row());
        }
        if (res.error) {
          await sb.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
          throw res.error;
        }
        patch(it.id, { status: "done" });
      } catch (e) {
        const m = (e as { code?: string; message?: string }).code === "42501" ? "Not allowed — this account isn't an admin." : (e as Error).message;
        patch(it.id, { status: "error", error: m });
      }
    }
    setRunning(false);
  };

  const finished = items.length > 0 && pending.length === 0;

  return (
    <div>
      <button type="button" onClick={finished ? onDone : onCancel} disabled={running} className="text-muted hover:text-ink mb-4 flex items-center gap-1.5 text-sm disabled:opacity-50">
        <ArrowLeft size={16} /> All products
      </button>
      <h1 className="display text-4xl">Upload many</h1>
      <p className="text-muted mt-1 text-sm">Each photo becomes its own product. The details you choose below are applied to every photo.</p>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* Photos */}
          <Card title={`Photos${items.length ? ` (${items.length})` : ""}`}>
            <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => (addFiles(e.target.files), (e.target.value = ""))} />
            <button
              type="button"
              disabled={running}
              onClick={() => input.current?.click()}
              onDragOver={(e) => (e.preventDefault(), setDrag(true))}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                if (!running) addFiles(e.dataTransfer.files);
              }}
              className={`flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 transition-colors disabled:opacity-50 ${drag ? "border-clay bg-clay/5" : "border-line hover:border-ink hover:bg-cream"}`}
            >
              <ImagePlus size={28} strokeWidth={1.4} />
              <span className="font-semibold">{items.length ? "Add more photos" : "Select or drop photos"}</span>
              <span className="text-muted text-xs">Select many at once (Ctrl/Shift + click) · JPG, PNG or WebP</span>
            </button>

            {items.length > 0 && (
              <ul className="divide-line divide-y">
                {items.map((it) => (
                  <li key={it.id} className="flex items-center gap-3 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.url} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <input
                        className={`${inputCls} py-2`}
                        value={it.name}
                        disabled={running || it.status === "done"}
                        aria-label="Product name"
                        onChange={(e) => patch(it.id, { name: e.target.value, status: it.status === "error" ? "ready" : it.status })}
                      />
                      <p className="text-muted mt-1 truncate text-xs">
                        {s.shape === "auto" ? it.shape[0].toUpperCase() + it.shape.slice(1) : "Shape from settings"} · {it.file.name}
                      </p>
                      {it.status === "error" && (
                        <p className="text-clay mt-1 flex items-center gap-1 text-xs">
                          <AlertTriangle size={12} /> {it.error}
                        </p>
                      )}
                    </div>
                    <div className="grid w-8 place-items-center">
                      {it.status === "saving" && <Loader2 size={18} className="text-muted animate-spin" />}
                      {it.status === "done" && <Check size={18} className="text-sage" />}
                      {(it.status === "ready" || it.status === "error") && !running && (
                        <button type="button" aria-label="Remove photo" onClick={() => remove(it.id)} className="text-muted hover:text-clay">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Shared details */}
          <fieldset disabled={running} className="space-y-6 disabled:opacity-60">
            <Card title="Details for every photo">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <select className={inputCls} value={s.category} onChange={(e) => set("category", e.target.value)}>
                    {CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Art style" hint="Optional">
                  <select className={inputCls} value={s.style ?? ""} onChange={(e) => set("style", e.target.value || null)}>
                    <option value="">None</option>
                    {ART_STYLE_GROUPS.map((g) => (
                      <optgroup key={g.slug} label={g.name}>
                        {g.styles.map((x) => (
                          <option key={x.slug} value={x.slug}>{x.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </Field>
                <Field label="Type">
                  <Segmented
                    value={s.kind}
                    onChange={(v) => set("kind", v)}
                    options={[
                      { v: "ready", l: "Ready-made art" },
                      { v: "custom", l: "Customer's photo" },
                    ]}
                  />
                </Field>
                <Field label="Badge" hint="Optional, e.g. New">
                  <input className={inputCls} value={s.badge} onChange={(e) => set("badge", e.target.value)} />
                </Field>
              </div>
              <Field label="Description" hint="Optional — the same text is used for every photo. You can edit each product later.">
                <textarea className={`${inputCls} min-h-20 resize-y`} value={s.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
            </Card>

            <Card title="Frame">
              <Field label="Finishes customers can choose">
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(FINISHES) as FinishId[]).map((id) => {
                    const on = s.finishes.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => set("finishes", on ? s.finishes.filter((x) => x !== id) : [...s.finishes, id])}
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
                <Field label="Shape" hint={s.shape === "auto" ? "Detected from each photo." : undefined}>
                  <Segmented
                    value={s.shape}
                    onChange={(v) => set("shape", v)}
                    options={[
                      { v: "auto", l: "Auto" },
                      { v: "portrait", l: "Portrait" },
                      { v: "landscape", l: "Landscape" },
                      { v: "square", l: "Square" },
                    ]}
                  />
                </Field>
                <Field label="Default border">
                  <Segmented
                    value={s.mat ? "mat" : "full"}
                    onChange={(v) => set("mat", v === "mat")}
                    options={[
                      { v: "mat", l: "White border" },
                      { v: "full", l: "Full frame" },
                    ]}
                  />
                </Field>
              </div>
            </Card>

            <Card title="Sizes & prices">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted">Start from:</span>
                {Object.keys(PRESETS).map((k) => (
                  <button key={k} type="button" onClick={() => set("sizes", PRESETS[k].map((x) => ({ ...x })))} className="border-line hover:border-ink rounded-full border px-3 py-1">
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
                {s.sizes.map((z, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_1.4fr_auto] items-center gap-2">
                    <input type="number" min={1} className={inputCls} value={z.w || ""} onChange={(e) => setSize(i, { w: Number(e.target.value) })} />
                    <input type="number" min={1} className={inputCls} value={z.h || ""} onChange={(e) => setSize(i, { h: Number(e.target.value) })} />
                    <input type="number" min={1} className={inputCls} value={z.price || ""} onChange={(e) => setSize(i, { price: Number(e.target.value) })} />
                    <button type="button" aria-label="Remove size" onClick={() => set("sizes", s.sizes.filter((_, j) => j !== i))} className="text-muted hover:text-clay grid h-8 w-8 place-items-center">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => set("sizes", [...s.sizes, { label: "", w: 0, h: 0, price: 0 }])} className="mt-3 flex items-center gap-1.5 text-sm font-semibold">
                <Plus size={16} /> Add size
              </button>
            </Card>

            <Card title="On the website">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Visibility">
                  <Segmented
                    value={s.active ? "on" : "off"}
                    onChange={(v) => set("active", v === "on")}
                    options={[
                      { v: "on", l: "Shown" },
                      { v: "off", l: "Hidden" },
                    ]}
                  />
                </Field>
                <Field label="Position" hint="Lower numbers show first.">
                  <input type="number" className={inputCls} value={s.sort} onChange={(e) => set("sort", Number(e.target.value))} />
                </Field>
                <Field label="Show on home page" className="sm:col-span-2">
                  <Segmented
                    value={s.featured ? "yes" : "no"}
                    onChange={(v) => set("featured", v === "yes")}
                    options={[
                      { v: "yes", l: "★ Yes" },
                      { v: "no", l: "No" },
                    ]}
                  />
                </Field>
              </div>
            </Card>
          </fieldset>
        </div>

        {/* Preview + action */}
        <div className="xl:sticky xl:top-10 xl:self-start">
          <div className="border-line rounded-2xl border bg-white p-5">
            <p className="text-muted mb-3 text-xs font-semibold uppercase tracking-[0.15em]">Preview</p>
            {items.length ? (
              <div className="bg-cream grid grid-cols-3 gap-3 rounded-xl p-4">
                {items.slice(0, 9).map((it) => {
                  const shape = s.shape === "auto" ? it.shape : s.shape;
                  return (
                    <div key={it.id} className="grid place-items-center">
                      <div style={{ width: shape === "landscape" ? "100%" : shape === "square" ? "86%" : "76%" }}>
                        <FramedPhoto finish={s.finishes[0] ?? "black"} photo={it.url} mat={s.mat} ratio={ratioOf(shape)} frameWidth={s.finishes[0] === "acrylic" ? 2 : 4} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-cream text-muted grid aspect-[4/3] place-items-center rounded-xl text-sm">Your photos appear here</div>
            )}
            {items.length > 9 && <p className="text-muted mt-2 text-xs">+ {items.length - 9} more</p>}

            {doneCount > 0 && (
              <p className="text-sage mt-4 text-sm font-medium">
                {doneCount} of {items.length} added to the website{s.active ? "" : " (hidden)"}.
              </p>
            )}
            {err && <p className="text-clay mt-4 text-sm">{err}</p>}

            {finished ? (
              <button type="button" onClick={onDone} className="bg-ink text-paper mt-5 w-full rounded-full py-3 text-sm font-semibold">
                Done — view products
              </button>
            ) : (
              <button type="button" onClick={run} disabled={running || !pending.length} className="bg-ink text-paper mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold disabled:opacity-60">
                {running && <Loader2 size={16} className="animate-spin" />}
                {running
                  ? `Adding ${doneCount + 1} of ${items.length}…`
                  : pending.some((x) => x.status === "error")
                    ? `Retry ${pending.length} failed`
                    : `Add ${pending.length || ""} product${pending.length === 1 ? "" : "s"}`}
              </button>
            )}
            {!finished && (
              <button type="button" onClick={doneCount ? onDone : onCancel} disabled={running} className="text-muted hover:text-ink mt-2 w-full py-2 text-sm disabled:opacity-50">
                {doneCount ? "Finish later" : "Cancel"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
