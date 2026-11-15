"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Images, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { FRAMES, FINISHES, getArtStyle, getCategory, productHref, type Frame } from "@/lib/data";
import { rowToFrame, type ProductRow } from "@/lib/products";
import { getSupabase, PRODUCT_IMAGES_BUCKET, supabaseConfigured } from "@/lib/supabase";
import { inr } from "@/lib/site";
import { FramedPhoto, ratioOf } from "@/components/FramedPhoto";
import { ProductForm, emptyProduct } from "@/components/admin/ProductForm";
import { BulkUpload } from "@/components/admin/BulkUpload";

type Editing = { row: ProductRow; isNew: boolean } | null;

export default function AdminProducts() {
  const [rows, setRows] = useState<ProductRow[] | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [editing, setEditing] = useState<Editing>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [bulk, setBulk] = useState(false);

  const load = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data, error } = await sb.from("products").select("*").order("sort").order("created_at");
    if (error) setLoadErr(error.message);
    else setRows(data as ProductRow[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!supabaseConfigured) return <NotConnected />;

  if (bulk)
    return (
      <BulkUpload
        existingSlugs={rows?.map((r) => r.slug) ?? []}
        onCancel={() => setBulk(false)}
        onDone={() => {
          setBulk(false);
          load();
        }}
      />
    );

  if (editing)
    return (
      <ProductForm
        key={editing.row.slug || "new"}
        initial={editing.row}
        isNew={editing.isNew}
        onCancel={() => setEditing(null)}
        onDone={() => {
          setEditing(null);
          load();
        }}
      />
    );

  const toggleActive = async (r: ProductRow) => {
    setBusy(r.slug);
    const { error } = await getSupabase()!.from("products").update({ active: !r.active }).eq("slug", r.slug);
    setBusy(null);
    if (error) return alert(error.message);
    load();
  };

  const toggleFeatured = async (r: ProductRow) => {
    setBusy(r.slug);
    const { error } = await getSupabase()!.from("products").update({ featured: !r.featured }).eq("slug", r.slug);
    setBusy(null);
    if (error) return alert(error.message);
    load();
  };

  const remove = async (r: ProductRow) => {
    if (!confirm(`Delete "${r.name}" permanently?\n\nTip: use Hide instead if you might sell it again.`)) return;
    setBusy(r.slug);
    const sb = getSupabase()!;
    const { error } = await sb.from("products").delete().eq("slug", r.slug);
    if (!error && r.image_url) {
      // Also remove the uploaded photo if it lives in our bucket.
      const marker = `/${PRODUCT_IMAGES_BUCKET}/`;
      const i = r.image_url.indexOf(marker);
      if (i >= 0) await sb.storage.from(PRODUCT_IMAGES_BUCKET).remove([decodeURIComponent(r.image_url.slice(i + marker.length))]);
    }
    setBusy(null);
    if (error) return alert(error.message);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="display text-4xl">Products</h1>
          <p className="text-muted mt-1 text-sm">Changes appear on the website straight away.</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button onClick={() => setBulk(true)} disabled={!rows} className="border-ink hover:bg-ink hover:text-paper flex items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50">
            <Images size={16} /> Upload many
          </button>
          <button onClick={() => setEditing({ row: emptyProduct(), isNew: true })} className="bg-ink text-paper flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold">
            <Plus size={16} /> Add product
          </button>
        </div>
      </div>

      {loadErr && <p className="text-clay mt-6 text-sm">Couldn&apos;t load products: {loadErr}</p>}
      {!rows && !loadErr && (
        <div className="text-muted mt-16 flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
      )}
      {rows?.length === 0 && <p className="text-muted mt-16 text-center">No products yet — add your first one.</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows?.map((r) => (
          <ProductTile key={r.slug} f={rowToFrame(r)} hidden={!r.active}>
            <div className="mt-3 flex gap-1">
              <IconBtn label="Edit" onClick={() => setEditing({ row: r, isNew: false })}>
                <Pencil size={15} />
              </IconBtn>
              <IconBtn label={r.featured ? "Remove from home page" : "Show on home page"} onClick={() => toggleFeatured(r)} disabled={busy === r.slug} active={r.featured}>
                <Star size={15} fill={r.featured ? "currentColor" : "none"} />
              </IconBtn>
              <IconBtn label={r.active ? "Hide from website" : "Show on website"} onClick={() => toggleActive(r)} disabled={busy === r.slug}>
                {r.active ? <EyeOff size={15} /> : <Eye size={15} />}
              </IconBtn>
              <IconBtn label="Delete" onClick={() => remove(r)} disabled={busy === r.slug} danger>
                <Trash2 size={15} />
              </IconBtn>
            </div>
          </ProductTile>
        ))}
      </div>
    </div>
  );
}

function ProductTile({ f, hidden, children }: { f: Frame; hidden?: boolean; children?: React.ReactNode }) {
  const from = Math.min(...f.sizes.map((s) => s.price));
  return (
    <div className={`border-line flex gap-4 rounded-2xl border bg-white p-4 ${hidden ? "opacity-60" : ""}`}>
      <div className="bg-cream grid w-24 shrink-0 place-items-center self-start rounded-xl p-3">
        <div className="w-full">
          <FramedPhoto finish={f.finishes[0]} art={f.art} photo={f.image} mat={f.mat} ratio={ratioOf(f.orientation)} frameWidth={5} />
        </div>
      </div>
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">
          {f.featured && <Star size={13} className="mr-1 inline -translate-y-px text-amber-500" fill="currentColor" aria-label="On home page" />}
          {f.name} {hidden && <span className="bg-cream text-muted ml-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase">Hidden</span>}
        </p>
        <p className="text-muted text-xs">
          {getCategory(f.category)?.name ?? f.category} · {f.kind === "custom" ? "Custom photo" : "Ready-made"}
          {f.style && ` · ${getArtStyle(f.style)?.name ?? f.style}`}
        </p>
        <p className="mt-2">
          from <b>{inr(from)}</b> · {f.sizes.length} sizes
        </p>
        <p className="text-muted mt-1 truncate text-xs">{f.finishes.map((x) => FINISHES[x]?.name ?? x).join(", ")}</p>
        {!hidden && (
          <Link href={productHref(f.slug)} target="_blank" className="link-underline text-muted mt-1 inline-block text-xs">
            View on site
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, disabled, danger, active, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`border-line grid h-8 w-8 place-items-center rounded-full border transition-colors disabled:opacity-40 ${danger ? "hover:border-clay hover:text-clay" : "hover:border-ink"} ${active ? "border-amber-400 text-amber-500" : ""}`}
    >
      {children}
    </button>
  );
}

function NotConnected() {
  return (
    <div>
      <h1 className="display text-4xl">Products</h1>
      <div className="border-line mt-6 max-w-2xl rounded-2xl border bg-white p-6 text-sm">
        <p className="font-semibold">Connect Supabase to add and edit products here.</p>
        <p className="text-muted mt-1">
          Until then the website shows the built-in products below (from <code className="bg-cream px-1">src/lib/data.ts</code>). Setup takes about 10 minutes — see <b>README → Connect Supabase</b>.
        </p>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {FRAMES.map((f) => (
          <ProductTile key={f.slug} f={f} />
        ))}
      </div>
    </div>
  );
}
