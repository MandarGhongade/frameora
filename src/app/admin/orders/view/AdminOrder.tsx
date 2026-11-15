"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Download, MessageCircle, Printer } from "lucide-react";
import { useStore, STATUSES } from "@/lib/store";
import { ADDONS, FINISHES, borderLabel } from "@/lib/data";
import { inr } from "@/lib/site";
import { StatusPill } from "@/components/StatusPill";
import { ItemThumb } from "@/components/ItemThumb";

export function AdminOrder() {
  const id = useSearchParams().get("id") ?? "";
  const { orders, setStatus, ready } = useStore();
  if (!ready) return null;
  const o = orders.find((x) => x.id === id);
  if (!o) return <p>Order not found. <Link href="/admin/orders" className="underline">Back</Link></p>;
  const step = STATUSES.indexOf(o.status as (typeof STATUSES)[number]);
  const next = step >= 0 && step < STATUSES.length - 1 ? STATUSES[step + 1] : null;

  return (
    <div className="max-w-5xl">
      <Link href="/admin/orders" className="text-muted hover:text-ink flex items-center gap-2 text-sm"><ArrowLeft size={16} /> Orders</Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h1 className="display text-4xl">#{o.id}</h1>
          <StatusPill s={o.status} />
        </div>
        <div className="flex gap-2">
          {o.status !== "Cancelled" && o.status !== "Delivered" && (
            <button onClick={() => setStatus(o.id, "Cancelled")} className="border-line hover:border-ink rounded-full border bg-white px-4 py-2 text-sm">Cancel</button>
          )}
          {next && (
            <button onClick={() => setStatus(o.id, next)} className="bg-ink text-paper hover:bg-clay rounded-full px-5 py-2 text-sm font-semibold transition-colors">
              Mark as {next} →
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="border-line rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em]">Print job</h2>
          <ul className="divide-line divide-y">
            {o.items.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-4 py-4">
                <ItemThumb item={i} className="w-24" />
                <div className="min-w-[180px] flex-1 text-sm">
                  <p className="text-base font-semibold">{i.name}</p>
                  <p className="text-muted">{FINISHES[i.finish].name} · {i.size}&quot;{borderLabel(i.mat)} · Qty {i.qty}</p>
                  {i.addons.length > 0 && <p className="text-muted mt-1 text-xs">Add-ons: {i.addons.map((a) => ADDONS.find((x) => x.id === a)?.name).join(", ")}</p>}
                  {i.message && <p className="bg-cream mt-2 rounded-lg p-2 text-xs">“{i.message}”</p>}
                </div>
                {i.photo ? (
                  <a href={i.photo} download={`${o.id}-${i.slug}.jpg`} className="border-line hover:border-ink flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                    <Download size={15} /> Photo
                  </a>
                ) : (
                  <span className="text-muted text-xs">Ready-made / demo</span>
                )}
              </li>
            ))}
          </ul>
          <div className="border-line mt-2 flex justify-between border-t pt-4 font-semibold">
            <span>Total · {o.payment === "COD" ? "Collect on delivery" : "Paid online"}</span>
            <span>{inr(o.total)}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-line rounded-2xl border bg-white p-6 text-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em]">Ship to</h2>
            <p className="font-semibold">{o.address.name}</p>
            <p className="text-muted mt-1 leading-relaxed">
              {o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ""}<br />
              {o.address.city}, {o.address.state} {o.address.pin}<br />
              {o.address.phone} · {o.address.email}
            </p>
            {o.awb && <p className="mt-3">AWB: <b>{o.awb}</b></p>}
            <div className="mt-4 flex gap-2">
              <button className="border-line hover:border-ink flex items-center gap-2 rounded-full border px-4 py-2"><MessageCircle size={15} /> Send proof</button>
              <button onClick={() => window.print()} className="border-line hover:border-ink flex items-center gap-2 rounded-full border px-4 py-2"><Printer size={15} /> Print slip</button>
            </div>
          </div>
          <div className="border-line rounded-2xl border bg-white p-6 text-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em]">History</h2>
            <ol className="space-y-3">
              {[...o.history].reverse().map((h, k) => (
                <li key={k} className="flex justify-between gap-3">
                  <span className="font-medium">{h.status}</span>
                  <span className="text-muted">{new Date(h.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
