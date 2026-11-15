"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useStore, STATUSES } from "@/lib/store";
import { OrdersTable } from "@/components/admin/OrdersTable";

export default function AdminOrders() {
  const { orders, ready } = useStore();
  const [tab, setTab] = useState<string>("All");
  const [q, setQ] = useState("");
  if (!ready) return null;

  const list = orders.filter(
    (o) =>
      (tab === "All" || o.status === tab) &&
      (!q || `${o.id} ${o.address.name} ${o.address.city} ${o.address.phone}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <h1 className="display text-4xl">Orders</h1>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {["All", ...STATUSES, "Cancelled"].map((s) => {
            const n = s === "All" ? orders.length : orders.filter((o) => o.status === s).length;
            return (
              <button key={s} onClick={() => setTab(s)} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${tab === s ? "bg-ink text-paper border-ink" : "border-line bg-white hover:border-ink"}`}>
                {s} <span className="opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
        <label className="border-line flex items-center gap-2 rounded-full border bg-white px-4 py-2">
          <Search size={16} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, city, ID" className="w-48 bg-transparent text-sm outline-none" />
        </label>
      </div>
      <div className="mt-6">
        <OrdersTable orders={list} />
      </div>
    </div>
  );
}
