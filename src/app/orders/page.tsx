"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { orderHref } from "@/lib/data";
import { inr } from "@/lib/site";
import { StatusPill } from "@/components/StatusPill";
import { ItemThumb } from "@/components/ItemThumb";

export default function Orders() {
  const { orders, ready } = useStore();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const mine = orders.filter((o) => !o.demo);

  const find = (e: React.FormEvent) => {
    e.preventDefault();
    const id = q.trim().toUpperCase();
    if (orders.some((o) => o.id === id)) router.push(orderHref(id));
    else setErr("We couldn't find that order. Check the ID in your confirmation message.");
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pt-10 md:px-8 md:pt-16">
      <h1 className="display text-5xl md:text-6xl">Track your order</h1>
      <form onSubmit={find} className="border-line focus-within:border-ink mt-8 flex items-center gap-3 rounded-full border py-2 pl-5 pr-2 transition-colors">
        <Search size={18} className="text-muted" />
        <input value={q} onChange={(e) => { setQ(e.target.value); setErr(""); }} placeholder="Enter order ID, e.g. FR10244" className="flex-1 bg-transparent py-2 outline-none" />
        <button className="bg-ink text-paper hover:bg-clay rounded-full px-6 py-2.5 text-sm font-semibold transition-colors">Track</button>
      </form>
      {err && <p className="text-clay mt-3 text-sm">{err}</p>}

      <h2 className="mb-5 mt-16 text-sm font-semibold uppercase tracking-[0.12em]">My orders</h2>
      {ready && mine.length === 0 && <p className="text-muted">No orders yet on this device. Try tracking a demo order: <b>FR10244</b>.</p>}
      <ul className="space-y-4">
        {mine.map((o) => (
          <li key={o.id}>
            <Link href={orderHref(o.id)} className="border-line hover:bg-cream group flex items-center gap-5 rounded-2xl border p-4 transition-colors duration-500">
              <ItemThumb item={o.items[0]} className="w-20" />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-semibold">#{o.id}</span>
                  <StatusPill s={o.status} />
                </div>
                <p className="text-muted mt-1 text-sm">
                  {o.items.length} item{o.items.length > 1 ? "s" : ""} · {inr(o.total)} · {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </p>
              </div>
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
