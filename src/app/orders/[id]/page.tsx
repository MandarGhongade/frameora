"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import { Check, PartyPopper, MessageCircle, Printer, Frame as FrameIcon, Truck, Home, ClipboardCheck } from "lucide-react";
import { useStore, STATUSES } from "@/lib/store";
import { FINISHES, borderLabel } from "@/lib/data";
import { inr } from "@/lib/site";
import { ItemThumb } from "@/components/ItemThumb";
import { useEffect, useState } from "react";

const ICONS = [ClipboardCheck, Printer, FrameIcon, Truck, Home];
const COPY = [
  "We've received your order. Your design proof will arrive on WhatsApp shortly.",
  "Your photo is touched up and printing on archival paper.",
  "Your print is being framed, checked and packed with care.",
  "On its way! Track it with your courier below.",
  "Delivered. We hope it looks beautiful on your wall.",
];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { orders, ready } = useStore();
  const [isNew, setIsNew] = useState(false);
  useEffect(() => setIsNew(new URLSearchParams(window.location.search).has("new")), []);

  if (!ready) return <div className="min-h-[60vh]" />;
  const o = orders.find((x) => x.id === id);
  if (!o)
    return (
      <div className="mx-auto max-w-md px-5 py-32 text-center">
        <p className="display text-3xl">Order not found</p>
        <Link href="/orders" className="link-underline mt-4 inline-block font-semibold">Back to tracking</Link>
      </div>
    );

  const step = STATUSES.indexOf(o.status as (typeof STATUSES)[number]);
  const when = (s: string) => o.history.find((h) => h.status === s)?.at;

  return (
    <div className="mx-auto max-w-5xl px-5 pt-10 md:px-8 md:pt-16">
      {isNew && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-sage/15 mb-10 flex items-start gap-4 rounded-2xl p-6">
          <PartyPopper className="text-sage shrink-0" />
          <div>
            <p className="display text-2xl">Thank you, {o.address.name.split(" ")[0]}! Your order is confirmed.</p>
            <p className="text-muted mt-1 text-sm">
              We&apos;ll WhatsApp your design proof to {o.address.phone}. Nothing is printed until you approve it.
            </p>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted text-sm">Order #{o.id} · {new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
          <h1 className="display mt-2 text-4xl md:text-5xl">{o.status === "Cancelled" ? "Order cancelled" : o.status === "Delivered" ? "Delivered" : `Currently: ${o.status}`}</h1>
        </div>
        <a href="#" className="border-line hover:border-ink flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors">
          <MessageCircle size={16} /> Help on WhatsApp
        </a>
      </div>

      {/* Timeline */}
      {o.status !== "Cancelled" && (
        <div className="relative mt-12">
          <div className="bg-line absolute left-[19px] top-0 h-full w-[2px] md:left-0 md:top-[19px] md:h-[2px] md:w-[81%]" />
          <motion.div
            className="bg-clay absolute left-[19px] top-0 w-[2px] md:hidden"
            initial={{ height: 0 }}
            animate={{ height: `${(step / 4) * 100}%` }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="bg-clay absolute left-0 top-[19px] hidden h-[2px] md:block"
            initial={{ width: 0 }}
            animate={{ width: `${step * 20.3}%` }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <ol className="relative grid gap-8 md:grid-cols-5 md:gap-4">
            {STATUSES.map((s, i) => {
              const Icon = ICONS[i];
              const done = i <= step;
              const at = when(s);
              return (
                <motion.li key={s} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 * i }} className="flex gap-4 md:flex-col md:gap-3">
                  <span className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-colors ${done ? "bg-clay border-clay text-white" : "bg-paper border-line text-muted"} ${i === step ? "ring-clay/20 ring-8" : ""}`}>
                    {done && i < step ? <Check size={18} /> : <Icon size={18} />}
                  </span>
                  <div>
                    <p className={`font-semibold ${done ? "" : "text-muted"}`}>{s}</p>
                    {at && <p className="text-muted text-xs">{new Date(at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</p>}
                    {i === step && <p className="text-muted mt-1 max-w-[220px] text-sm leading-snug">{COPY[i]}</p>}
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      )}

      {o.awb && (
        <div className="bg-cream mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
          <div>
            <p className="text-muted text-xs uppercase tracking-[0.15em]">Courier tracking</p>
            <p className="mt-1 font-semibold">AWB {o.awb}</p>
          </div>
          <span className="text-muted text-sm">Live courier tracking via Shiprocket (coming in Phase 2)</span>
        </div>
      )}

      <div className="mt-12 grid gap-10 md:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em]">Items</h2>
          <ul className="space-y-4">
            {o.items.map((i) => (
              <li key={i.id} className="flex items-center gap-4">
                <ItemThumb item={i} className="w-20" />
                <div className="flex-1">
                  <p className="font-semibold">{i.name}</p>
                  <p className="text-muted text-sm">{FINISHES[i.finish].name} · {i.size}&quot;{borderLabel(i.mat)} × {i.qty}</p>
                </div>
                <p className="font-semibold">{inr(i.unitPrice * i.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="border-line mt-6 flex justify-between border-t pt-4 font-semibold">
            <span>Total ({o.payment === "COD" ? "Cash on delivery" : "Paid online"})</span>
            <span>{inr(o.total)}</span>
          </div>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em]">Delivering to</h2>
          <p className="font-semibold">{o.address.name}</p>
          <p className="text-muted mt-1 text-sm leading-relaxed">
            {o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ""}<br />
            {o.address.city}, {o.address.state} {o.address.pin}<br />
            {o.address.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
